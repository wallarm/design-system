import fs from 'node:fs';
import path from 'node:path';
import { Node, type Project, type SourceFile } from 'ts-morph';
import { createProject, DS_PACKAGE, type JsxElementLike } from './jsx';
import type { ManualItem, Migration } from './types';

export interface FileChange {
  file: string;
  before: string;
  after: string;
}
export interface SkippedFile {
  file: string;
  error: string;
}
export interface RunResult {
  changed: FileChange[];
  manual: ManualItem[];
  skipped: SkippedFile[];
}

const SYNTAX_ERROR = 'syntax error, file left untouched';

function markerTarget(node: Node): JsxElementLike | undefined {
  return Node.isJsxOpeningElement(node) || Node.isJsxSelfClosingElement(node)
    ? node
    : node.getFirstAncestor(
        (a): a is JsxElementLike => Node.isJsxOpeningElement(a) || Node.isJsxSelfClosingElement(a),
      );
}

/** Text between the tag name and the first attribute (or tag end): where markers live. */
function markerRegion(el: JsxElementLike): string {
  const end = el.getAttributes()[0]?.getStart() ?? el.getEnd();
  return el.getSourceFile().getFullText().slice(el.getTagNameNode().getEnd(), end);
}

/**
 * Applies migrations to one file's text, no fs. Each report also gets an in-code
 * `@wds-migration(<id>): <message>` comment marker right after the element's tag name,
 * inserted after that migration's transform returns (transforms hold node references).
 * Throws on a syntax error or a failing transform.
 */
export function migrateSource(args: {
  text: string;
  fileName: string;
  migrations: Migration[];
  /** Reuse one Project across files: a fresh one reloads the TS lib files on every getProgram(). */
  project?: Project;
}): { code: string; manual: Omit<ManualItem, 'file'>[] } {
  const project = args.project ?? createProject();
  const sourceFile = project.createSourceFile(args.fileName, args.text, { overwrite: true });
  try {
    return applyMigrations(project, sourceFile, args.migrations);
  } finally {
    sourceFile.forget();
  }
}

function applyMigrations(
  project: Project,
  sourceFile: SourceFile,
  migrations: Migration[],
): { code: string; manual: Omit<ManualItem, 'file'>[] } {
  if (project.getProgram().getSyntacticDiagnostics(sourceFile).length > 0)
    throw new Error(SYNTAX_ERROR);

  const manual: Omit<ManualItem, 'file'>[] = [];
  for (const migration of migrations) {
    const token = `@wds-migration(${migration.id})`;
    const pending = new Map<JsxElementLike, string>(); // first message per element wins
    migration.transform(sourceFile, {
      report: (node, message) => {
        manual.push({ line: node.getStartLineNumber(), migrationId: migration.id, message });
        const el = markerTarget(node);
        if (el && !pending.has(el) && !markerRegion(el).includes(token)) pending.set(el, message);
      },
    });
    // Positions are read after the transform's edits; insert from the end so earlier ones stay valid.
    const inserts = [...pending]
      .map(([el, message]) => ({
        pos: el.getTagNameNode().getEnd(),
        text: ` /* ${token}: ${message.replaceAll('*/', '* /').replace(/[\r\n]+/g, ' ')} */`,
      }))
      .sort((x, y) => y.pos - x.pos);
    for (const { pos, text } of inserts) sourceFile.insertText(pos, text);
  }
  return { code: sourceFile.getFullText(), manual };
}

/** Reads files, applies migrations in memory, never writes. */
export function runMigrations(args: {
  files: string[];
  cwd: string;
  migrations: Migration[];
}): RunResult {
  const result: RunResult = { changed: [], manual: [], skipped: [] };
  const project = createProject();

  for (const abs of args.files) {
    const file = path.relative(args.cwd, abs).split(path.sep).join('/');
    try {
      const before = fs.readFileSync(abs, 'utf8');
      if (!before.includes(DS_PACKAGE)) continue;
      const { code: after, manual } = migrateSource({
        text: before,
        fileName: file,
        migrations: args.migrations,
        project,
      });
      result.manual.push(...manual.map(m => ({ file, ...m })));
      if (after !== before) result.changed.push({ file, before, after });
    } catch (e) {
      result.skipped.push({ file, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return result;
}

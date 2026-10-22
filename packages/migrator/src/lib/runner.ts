import { Node } from 'ts-morph';
import fs from 'node:fs';
import path from 'node:path';
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

/**
 * Applies migrations to one file's text, no fs. Each report also gets an in-code
 * `@wds-migration(<id>): <message>` comment marker right after the element's tag name,
 * inserted after that migration's transform returns (transforms hold node references).
 * Throws on a syntax error or a failing transform.
 */
export function migrateSource(args: { text: string; fileName: string; migrations: Migration[] }): {
  code: string;
  manual: Omit<ManualItem, 'file'>[];
} {
  const project = createProject();
  const sourceFile = project.createSourceFile(args.fileName, args.text);
  if (project.getProgram().getSyntacticDiagnostics(sourceFile).length > 0)
    throw new Error(SYNTAX_ERROR);

  const manual: Omit<ManualItem, 'file'>[] = [];
  for (const migration of args.migrations) {
    const token = `@wds-migration(${migration.id})`;
    const pending = new Map<JsxElementLike, string>(); // first message per element wins
    migration.transform(sourceFile, {
      report: (node, message) => {
        manual.push({ line: node.getStartLineNumber(), migrationId: migration.id, message });
        const el = markerTarget(node);
        if (el && !pending.has(el) && !el.getText().includes(token)) pending.set(el, message);
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

  for (const abs of args.files) {
    const file = path.relative(args.cwd, abs).split(path.sep).join('/');
    try {
      const before = fs.readFileSync(abs, 'utf8');
      if (!before.includes(DS_PACKAGE)) continue;
      const { code: after, manual } = migrateSource({
        text: before,
        fileName: file,
        migrations: args.migrations,
      });
      result.manual.push(...manual.map(m => ({ file, ...m })));
      if (after !== before) result.changed.push({ file, before, after });
    } catch (e) {
      result.skipped.push({ file, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return result;
}

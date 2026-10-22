import type { SourceFile } from 'ts-morph';
import fs from 'node:fs';
import path from 'node:path';
import { createProject, DS_PACKAGE } from './jsx';
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
    let sourceFile: SourceFile | undefined;
    try {
      const before = fs.readFileSync(abs, 'utf8');
      if (!before.includes(DS_PACKAGE)) continue;

      sourceFile = project.createSourceFile(file, before, { overwrite: true });
      if (project.getProgram().getSyntacticDiagnostics(sourceFile).length > 0) {
        result.skipped.push({ file, error: 'syntax error, file left untouched' });
        continue;
      }

      const manual: ManualItem[] = [];
      for (const migration of args.migrations) {
        migration.transform(sourceFile, {
          report: (node, message) =>
            manual.push({
              file,
              line: node.getStartLineNumber(),
              migrationId: migration.id,
              message,
            }),
        });
      }

      const after = sourceFile.getFullText();
      result.manual.push(...manual);
      if (after !== before) result.changed.push({ file, before, after });
    } catch (e) {
      result.skipped.push({ file, error: e instanceof Error ? e.message : String(e) });
    } finally {
      sourceFile?.forget();
    }
  }
  return result;
}

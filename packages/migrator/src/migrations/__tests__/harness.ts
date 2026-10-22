import { createTestFile } from '../../lib/jsx';
import type { Migration } from '../../lib/types';

export function apply(
  migration: Migration,
  code: string,
  name = 'test.tsx',
): { code: string; reports: string[] } {
  const file = createTestFile(code, name);
  const reports: string[] = [];
  migration.transform(file, {
    report: (node, msg) => reports.push(`${node.getStartLineNumber()}:${msg}`),
  });
  return { code: file.getFullText(), reports };
}

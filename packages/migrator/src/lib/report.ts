import type { SkippedFile } from './runner';
import type { ManualItem } from './types';

export const REPORT_FILE = 'wds-migration.md';

export function renderReport(args: {
  from: string;
  to: string;
  manual: ManualItem[];
  skipped: SkippedFile[];
}): string {
  const lines = [
    '# Design-system migration: manual steps',
    '',
    `The automatic migration from ${args.from} to ${args.to} left these items for you:`,
    '',
    ...args.manual.map(m => `- [ ] \`${m.file}:${m.line}\` — ${m.message} (${m.migrationId})`),
    '',
  ];
  if (args.skipped.length > 0) {
    lines.push(
      '## Files that could not be parsed',
      '',
      ...args.skipped.map(s => `- \`${s.file}\` — ${s.error}`),
      '',
    );
  }
  lines.push('Delete this file once every item is done.', '');
  return lines.join('\n');
}

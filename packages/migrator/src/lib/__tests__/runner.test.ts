import { afterEach, beforeEach, describe, expect, it } from '@rstest/core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { migrations } from '../../migrations';
import { renderReport } from '../report';
import { runMigrations } from '../runner';

const IMP = "import { Avatar } from '@wallarm-org/design-system';\n";
let cwd: string;

beforeEach(() => {
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'migrator-'));
});
afterEach(() => fs.rmSync(cwd, { recursive: true, force: true }));

function run(files: Record<string, string>) {
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(cwd, name), text);
  return runMigrations({
    files: Object.keys(files).map(f => path.join(cwd, f)),
    cwd,
    migrations,
  });
}

describe('runMigrations', () => {
  it('changes files, reports manual items and skips parse errors', () => {
    const r = run({
      'a.tsx': `${IMP}const a = <Avatar size='xs' />;\n`,
      'b.tsx': `${IMP}const b = <Avatar size={s} />;\n`,
      'c.tsx': `${IMP}const = ;\n`,
      'd.tsx': 'const = ;\n',
    });
    expect(r.changed).toHaveLength(1);
    expect(r.changed[0]?.file).toBe('a.tsx');
    expect(r.changed[0]?.after).toContain("size='md'");
    expect(r.manual[0]).toMatchObject({
      file: 'b.tsx',
      line: 2,
      migrationId: 'avatar-size-rename',
    });
    expect(r.skipped).toHaveLength(1);
    expect(r.skipped[0]?.file).toBe('c.tsx');
    expect(JSON.stringify(r)).not.toContain('d.tsx');
  });
});

describe('renderReport', () => {
  const manual = [
    { file: 'src/b.tsx', line: 3, migrationId: 'avatar-size-rename', message: 'check' },
  ];

  it('renders items and closing sentence', () => {
    const out = renderReport({ from: '2.9.0', to: '3.2.0', manual, skipped: [] });
    expect(out.startsWith('# Design-system migration: manual steps')).toBe(true);
    expect(out).toContain('from 2.9.0 to 3.2.0');
    expect(out).toContain('- [ ] `src/b.tsx:3` — check (avatar-size-rename)');
    expect(out).not.toContain('## Files that could not be parsed');
    expect(out.trimEnd().endsWith('Delete this file once every item is done.')).toBe(true);
  });

  it('lists skipped files', () => {
    const out = renderReport({
      from: '1.0.0',
      to: '2.0.0',
      manual: [],
      skipped: [{ file: 'c.tsx', error: 'bad' }],
    });
    expect(out).toContain('## Files that could not be parsed');
    expect(out).toContain('c.tsx');
  });
});

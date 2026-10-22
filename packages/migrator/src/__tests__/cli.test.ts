import { afterEach, beforeEach, describe, expect, it } from '@rstest/core';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import pkg from '../../package.json';
import versions from '../../versions.json';
import { main } from '../cli';

let dir: string;
let out: string[];
let err: string[];
const io = { log: (s: string) => out.push(s), error: (s: string) => err.push(s) };
const run = (...args: string[]) => main(args, dir, versions, io);
const read = (f: string) => fs.readFileSync(path.join(dir, f), 'utf8');
const write = (f: string, c: string) => {
  fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
  fs.writeFileSync(path.join(dir, f), c);
};
const git = (...a: string[]) => execFileSync('git', a, { cwd: dir, stdio: 'ignore' });
const A = `import { Avatar } from '@wallarm-org/design-system';\nexport const a = <Avatar size='xs' />;\n`;
const B = `import { Avatar } from '@wallarm-org/design-system';\nexport const b = <Avatar size={s} />;\n`;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'migrator-cli-'));
  out = [];
  err = [];
  git('init', '-q');
  write('package.json', '{}');
  write('node_modules/@wallarm-org/design-system/package.json', '{"version":"3.2.0"}');
  write('src/a.tsx', A);
  write('src/b.tsx', B);
  git('add', 'src');
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe('main', () => {
  it('rewrites and reports, defaulting --to from node_modules', async () => {
    expect(await run('--from', '2.9.0')).toBe(0);
    expect(read('src/a.tsx')).toContain("size='md'");
    expect(read('wds-migration.md')).toContain('src/b.tsx');
    expect(out.join('\n')).toMatch(/1 files? changed, 1 manual items?/);
  });

  it('--to equal to --from changes nothing', async () => {
    expect(await run('--from', '2.9.0', '--to', '2.9.0')).toBe(0);
    expect(read('src/a.tsx')).toBe(A);
  });

  it('--dry-run writes nothing', async () => {
    expect(await run('--from', '2.9.0', '--dry-run')).toBe(0);
    expect(read('src/a.tsx')).toBe(A);
    expect(fs.existsSync(path.join(dir, 'wds-migration.md'))).toBe(false);
    expect(out.join('\n')).toContain('src/a.tsx');
    expect(out.join('\n')).toContain('xs');
  });

  it('second run is a no-op', async () => {
    await run('--from', '2.9.0');
    const after = read('src/a.tsx');
    git('add', '-A');
    fs.rmSync(path.join(dir, 'wds-migration.md'));
    expect(await run('--from', '2.9.0')).toBe(0);
    expect(read('src/a.tsx')).toBe(after);
  });

  it('overwrites an existing report', async () => {
    write('wds-migration.md', 'old');
    await run('--from', '2.9.0');
    expect(read('wds-migration.md').startsWith('# Design-system migration')).toBe(true);
  });

  it('leaves an existing report when clean', async () => {
    git('rm', '-q', '--cached', 'src/b.tsx');
    fs.rmSync(path.join(dir, 'src/b.tsx'));
    write('wds-migration.md', 'old');
    await run('--from', '2.9.0');
    expect(read('wds-migration.md')).toBe('old');
  });

  it('lists unparseable files in the report and warns', async () => {
    write(
      'src/bad.tsx',
      `import { Avatar } from '@wallarm-org/design-system';\nconst x = <Avatar ;\n`,
    );
    git('add', 'src');
    expect(await run('--from', '2.9.0')).toBe(0);
    expect(read('wds-migration.md')).toContain('src/bad.tsx');
    expect(err.join('\n')).toContain('src/bad.tsx');
  });

  it('rejects bad arguments', async () => {
    expect(await run()).toBe(1);
    expect(await run('--from', '^2.9.0')).toBe(1);
    err = [];
    expect(await run('--from', '0.9.0')).toBe(1);
    expect(err.join('\n')).toContain('upgrade to 1.x manually first');
    err = [];
    expect(await run('--from', '2.9.0', '--to', '4.0.0')).toBe(1);
    expect(err.join('\n')).toContain('newer than this migrator knows');
    err = [];
    expect(await run('--from', '3.0.0-rc.avatar.1', '--to', '3.0.0')).toBe(1);
    expect(err.join('\n')).toContain('is a prerelease');
  });

  it('needs git or explicit paths', async () => {
    fs.rmSync(path.join(dir, '.git'), { recursive: true });
    expect(await run('--from', '2.9.0')).toBe(1);
    expect(await run('--from', '2.9.0', 'src')).toBe(0);
    expect(read('src/a.tsx')).toContain("size='md'");
  });

  it('ignores untracked files without paths', async () => {
    write('src/c.tsx', A);
    await run('--from', '2.9.0');
    expect(read('src/c.tsx')).toBe(A);
  });

  it('--help and --version', async () => {
    expect(await run('--help')).toBe(0);
    expect(out.join('\n')).toContain('--from');
    out = [];
    expect(await run('--version')).toBe(0);
    expect(out.join('\n')).toContain(pkg.version);
  });
});

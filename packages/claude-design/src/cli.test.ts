import { afterEach, beforeEach, describe, expect, it } from '@rstest/core';
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// A stand-in package: the real bin beside a tiny dist/ export.
let root: string;
let cwd: string;
const run = (...args: string[]) => {
  const result = spawnSync(process.execPath, [join(root, 'bin/claude-design.js'), ...args], {
    cwd,
    encoding: 'utf8',
  });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
};

beforeEach(() => {
  root = realpathSync(mkdtempSync(join(tmpdir(), 'claude-design-cli-')));
  cpSync(new URL('../bin', import.meta.url), join(root, 'bin'), { recursive: true });
  writeFileSync(join(root, 'package.json'), JSON.stringify({ version: '9.8.7', type: 'module' }));
  mkdirSync(join(root, 'dist/project/components'), { recursive: true });
  writeFileSync(join(root, 'dist/project/design-system.json'), '{}');
  writeFileSync(join(root, 'dist/project/components/index.d.ts'), 'export {};');
  writeFileSync(join(root, 'dist/SETUP.md'), '# Setup');
  writeFileSync(join(root, 'dist/wallarm-sampler.dc.html'), '<x-dc></x-dc>');
  cwd = join(root, 'work');
  mkdirSync(cwd);
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('claude-design export', () => {
  it('writes the export, SETUP, sampler and files.json into a fresh folder', () => {
    const { code, stdout } = run('export');
    expect(code).toBe(0);
    expect(stdout).toContain(
      'Exported Wallarm Design System 9.8.7: 2 files in wallarm-design-system/project.',
    );
    expect(stdout).toContain('Read wallarm-design-system/SETUP.md');
    const out = join(cwd, 'wallarm-design-system');
    expect(readFileSync(join(out, 'SETUP.md'), 'utf8')).toBe('# Setup');
    expect(existsSync(join(out, 'wallarm-sampler.dc.html'))).toBe(true);
    expect(existsSync(join(out, 'removed.json'))).toBe(false);
    expect(Object.keys(JSON.parse(readFileSync(join(out, 'files.json'), 'utf8')))).toEqual([
      'SETUP.md',
      'project/components/index.d.ts',
      'project/design-system.json',
      'wallarm-sampler.dc.html',
    ]);
  });

  it('refuses a folder with files unless --overwrite, naming the flag', () => {
    expect(run('export', '--dir', 'out').code).toBe(0);
    const again = run('export', '--dir', 'out');
    expect(again.code).toBe(2);
    expect(again.stderr).toContain('Pass --overwrite');
    writeFileSync(join(cwd, 'out/project/stale.md'), 'old');
    expect(run('export', '--dir', 'out', '--overwrite').code).toBe(0);
    expect(existsSync(join(cwd, 'out/project/stale.md'))).toBe(false);
  });

  it('lists what an update drops in removed.json and exits 3', () => {
    writeFileSync(
      join(cwd, 'current-files.json'),
      JSON.stringify([
        'project/design-system.json',
        'project/old.md',
        'project/manifest.json',
        'project/api/x.json',
      ]),
    );
    const { code, stdout } = run('export', '--existing', 'current-files.json');
    expect(code).toBe(3);
    expect(stdout).toContain('Remove the 1 files');
    expect(
      JSON.parse(readFileSync(join(cwd, 'wallarm-design-system/removed.json'), 'utf8')),
    ).toEqual(['project/old.md']);
  });

  it('prints {ok, exitCode, data|error} with --json', () => {
    const done = JSON.parse(run('export', '--json').stdout);
    expect(done).toEqual({
      ok: true,
      exitCode: 0,
      data: { version: '9.8.7', dir: join(cwd, 'wallarm-design-system'), files: 2, removed: [] },
    });
    writeFileSync(join(cwd, 'bad.json'), '{}');
    const failed = run('export', '--overwrite', '--existing', 'bad.json', '--json');
    expect(failed.code).toBe(2);
    expect(JSON.parse(failed.stdout)).toEqual({
      ok: false,
      exitCode: 2,
      error: expect.stringContaining('must be a JSON array'),
    });
  });

  it('exits 2 on an unknown command or flag', () => {
    expect(run('publish').code).toBe(2);
    expect(run('export', '--nope').stderr).toContain('Usage:');
  });
});

import { afterEach, beforeEach, describe, expect, it } from '@rstest/core';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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

const sha = (text: string) => createHash('sha256').update(text).digest('hex');
const asset = (group: string, name: string, svg: string) => ({
  group,
  name,
  path: `assets/${group}/${name}`,
  sha256: sha(svg),
  size: svg.length,
  type: 'image/svg+xml',
  svg,
});
// b.svg has a.svg's bytes, so one upload covers both.
const ASSETS = [
  asset('Icons', 'a.svg', '<svg id="a"/>'),
  asset('Icons', 'b.svg', '<svg id="a"/>'),
  asset('Logos', 'wallarm.svg', '<svg id="w"/>'),
];
const ID_A = '0123456789abcdef0123456789abcdef';
const ID_W = 'fedcba9876543210fedcba9876543210';

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
  writeFileSync(join(root, 'dist/project/design-system.json'), '{"createdOnFiles":{"v":1}}');
  mkdirSync(join(root, 'dist/assets/Icons'), { recursive: true });
  mkdirSync(join(root, 'dist/assets/Logos'), { recursive: true });
  for (const asset of ASSETS) writeFileSync(join(root, 'dist', asset.path), asset.svg);
  writeFileSync(
    join(root, 'dist/assets.json'),
    JSON.stringify(ASSETS.map(({ svg, ...asset }) => asset)),
  );
  writeFileSync(join(root, 'dist/project/components/index.d.ts'), 'export {};');
  writeFileSync(join(root, 'dist/SETUP.md'), '# Setup');
  writeFileSync(join(root, 'dist/UPDATE.md'), '# Update to 9.8.7');
  writeFileSync(join(root, 'dist/wallarm-sampler.dc.html'), '<x-dc></x-dc>');
  writeFileSync(join(root, 'dist/wallarm-app.dc.html'), '<x-dc></x-dc>');
  cwd = join(root, 'work');
  mkdirSync(cwd);
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('claude-design export', () => {
  it('writes the export, SETUP, sampler, skeleton and files.json into a fresh folder', () => {
    const { code, stdout } = run('export');
    expect(code).toBe(0);
    expect(stdout).toContain(
      'Exported Wallarm Design System 9.8.7: 2 files in wallarm-design-system/project and 3 icons and logos in wallarm-design-system/assets.',
    );
    expect(stdout).toContain('Read wallarm-design-system/SETUP.md');
    const out = join(cwd, 'wallarm-design-system');
    expect(readFileSync(join(out, 'SETUP.md'), 'utf8')).toBe('# Setup');
    expect(existsSync(join(out, 'wallarm-sampler.dc.html'))).toBe(true);
    expect(existsSync(join(out, 'wallarm-app.dc.html'))).toBe(true);
    expect(existsSync(join(out, 'removed.json'))).toBe(false);
    expect(Object.keys(JSON.parse(readFileSync(join(out, 'files.json'), 'utf8')))).toEqual([
      'SETUP.md',
      'UPDATE.md',
      'assets.json',
      'assets/Icons/a.svg',
      'assets/Icons/b.svg',
      'assets/Logos/wallarm.svg',
      'project/components/index.d.ts',
      'project/design-system.json',
      'wallarm-app.dc.html',
      'wallarm-sampler.dc.html',
    ]);
  });

  it('refuses a folder with files unless --overwrite, naming the flag', () => {
    expect(run('export', '--dir', 'out').code).toBe(0);
    const again = run('export', '--dir', 'out');
    expect(again.code).toBe(2);
    expect(again.stderr).toContain('Pass --overwrite');
    writeFileSync(join(cwd, 'out/project/stale.md'), 'old');
    const shaKey = sha('<svg id="a"/>');
    writeFileSync(
      join(cwd, 'out/blobs.json'),
      JSON.stringify({ [shaKey]: ID_A, 'assets/Icons/a.svg': ID_A }),
    );
    expect(run('export', '--dir', 'out', '--overwrite').code).toBe(0);
    expect(existsSync(join(cwd, 'out/project/stale.md'))).toBe(false);
    // Path keys may name changed SVGs; sha256 keys stay.
    expect(JSON.parse(readFileSync(join(cwd, 'out/blobs.json'), 'utf8'))).toEqual({
      [shaKey]: ID_A,
    });
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
    expect(stdout).toContain('Carry on with wallarm-design-system/UPDATE.md from step 3');
    expect(
      JSON.parse(readFileSync(join(cwd, 'wallarm-design-system/removed.json'), 'utf8')),
    ).toEqual(['project/old.md']);
  });

  it('merges the release keys into the current index with --index', () => {
    writeFileSync(
      join(root, 'dist/project/design-system.json'),
      JSON.stringify({
        title: 'New',
        groups: [],
        assetGroups: {},
        lastChange: { note: 'v9.8.7:' },
      }),
    );
    const current = { title: 'Old', sections: { a: 1 }, createdOnFiles: { at: 1 }, groups: ['x'] };
    writeFileSync(
      join(cwd, 'current-index.json'),
      JSON.stringify({ content: JSON.stringify(current) }),
    );
    const { code, stdout } = run('export', '--index', 'current-index.json');
    expect(code).toBe(0);
    // Mid-update or mid-install, never "Read SETUP.md": that would start a fresh install.
    expect(stdout).toContain('run the index command with --index');
    expect(stdout).not.toContain('SETUP.md');
    const out = join(cwd, 'wallarm-design-system');
    const index = readFileSync(join(out, 'project/design-system.json'), 'utf8');
    expect(JSON.parse(index)).toEqual({
      title: 'New',
      sections: { a: 1 },
      createdOnFiles: { at: 1 },
      groups: [],
      assetGroups: {},
      lastChange: { note: 'v9.8.7:' },
    });
    const hashes = JSON.parse(readFileSync(join(out, 'files.json'), 'utf8'));
    expect(hashes['project/design-system.json']).toBe(
      createHash('sha256').update(index).digest('hex'),
    );
  });

  it('prints {ok, exitCode, data|error} with --json', () => {
    const done = JSON.parse(run('export', '--json').stdout);
    expect(done).toEqual({
      ok: true,
      exitCode: 0,
      data: {
        version: '9.8.7',
        dir: join(cwd, 'wallarm-design-system'),
        files: 2,
        assets: 3,
        removed: [],
      },
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

describe('claude-design update', () => {
  it('writes UPDATE.md into a fresh folder and points at it', () => {
    const { code, stdout } = run('update');
    expect(code).toBe(0);
    expect(stdout).toBe(
      'Read wallarm-design-system/UPDATE.md and follow it to update the system to Wallarm Design System 9.8.7.\n',
    );
    expect(readFileSync(join(cwd, 'wallarm-design-system/UPDATE.md'), 'utf8')).toBe(
      '# Update to 9.8.7',
    );
  });

  it('replaces UPDATE.md and drops blobs.json and upload.json, and the export then takes --overwrite', () => {
    expect(run('export').code).toBe(0);
    const out = join(cwd, 'wallarm-design-system');
    writeFileSync(join(out, 'UPDATE.md'), 'old');
    // Ids from another artifact's asset store would break this system's gallery.
    writeFileSync(join(out, 'blobs.json'), '{}');
    writeFileSync(join(out, 'upload.json'), '[]');
    expect(run('update').code).toBe(0);
    expect(readFileSync(join(out, 'UPDATE.md'), 'utf8')).toBe('# Update to 9.8.7');
    expect(existsSync(join(out, 'project/design-system.json'))).toBe(true);
    expect(existsSync(join(out, 'blobs.json'))).toBe(false);
    expect(existsSync(join(out, 'upload.json'))).toBe(false);
    // UPDATE.md's export runs with --overwrite: without it the folder is refused, as for export.
    expect(run('export').code).toBe(2);
    expect(run('export', '--overwrite').code).toBe(0);
  });

  it('prints {ok, exitCode, data} with --json and --dir', () => {
    const { code, stdout } = run('update', '--dir', 'out', '--json');
    expect(code).toBe(0);
    expect(JSON.parse(stdout)).toEqual({
      ok: true,
      exitCode: 0,
      data: { version: '9.8.7', dir: join(cwd, 'out'), file: join(cwd, 'out/UPDATE.md') },
    });
  });

  it('exits 1 when the package has no UPDATE.md', () => {
    rmSync(join(root, 'dist/UPDATE.md'));
    const { code, stderr } = run('update');
    expect(code).toBe(1);
    expect(stderr).toContain('has no UPDATE.md');
  });
});

describe('claude-design index', () => {
  const out = () => join(cwd, 'wallarm-design-system');
  const writeBlobs = (blobs: Record<string, unknown>) =>
    writeFileSync(join(out(), 'blobs.json'), JSON.stringify(blobs));
  const readIndex = () =>
    JSON.parse(readFileSync(join(out(), 'project/design-system.json'), 'utf8'));
  beforeEach(() => {
    expect(run('export').code).toBe(0);
  });

  it('writes the asset groups with blob ids once every SVG has one', () => {
    writeBlobs({
      'assets/Icons/a.svg': ID_A,
      'assets/Logos/wallarm.svg': `https://claude.ai/_blob/${ID_W}?v=1`,
    });
    const { code, stdout } = run('index', '--blobs', 'wallarm-design-system/blobs.json');
    expect(code).toBe(0);
    expect(stdout).toContain('Wrote 3 assets in Icons, Logos');
    const record = (name: string, svg: string, blob: string) => ({
      name,
      blob,
      size: svg.length,
      type: 'image/svg+xml',
      sha256: sha(svg),
    });
    expect(readIndex()).toEqual({
      createdOnFiles: { v: 1 },
      groups: ['Icons', 'Logos'],
      assetGroups: {
        Icons: {
          name: 'Icons',
          order: ['a.svg', 'b.svg'],
          files: {
            'a.svg': record('a.svg', '<svg id="a"/>', ID_A),
            'b.svg': record('b.svg', '<svg id="a"/>', ID_A),
          },
        },
        Logos: {
          name: 'Logos',
          order: ['wallarm.svg'],
          files: { 'wallarm.svg': record('wallarm.svg', '<svg id="w"/>', ID_W) },
        },
      },
    });
    expect(existsSync(join(out(), 'upload.json'))).toBe(false);
    // Rewritten keyed by sha256.
    expect(JSON.parse(readFileSync(join(out(), 'blobs.json'), 'utf8'))).toEqual({
      [sha('<svg id="a"/>')]: ID_A,
      [sha('<svg id="w"/>')]: ID_W,
    });
  });

  it('accepts keys with a local prefix or a sha256', () => {
    writeBlobs({
      'wallarm-design-system/assets/Icons/a.svg': ID_A,
      [sha('<svg id="w"/>')]: ID_W,
    });
    expect(run('index').code).toBe(0);
    expect(readIndex().assetGroups.Logos.files['wallarm.svg'].blob).toBe(ID_W);
  });

  it('names keys that match no asset and values that are icon names, not ids', () => {
    writeBlobs({
      'assets/Icons/typo.svg': ID_A,
      'assets/Icons/a.svg': 'android-neutral',
      'assets/Logos/wallarm.svg': ID_W,
    });
    const { code, stdout } = run('index');
    expect(code).toBe(3);
    expect(stdout).toContain('2 blobs.json entries');
    expect(stdout).toContain('assets/Icons/typo.svg, assets/Icons/a.svg');
    // Invalid entries survive the rewrite so they can be fixed.
    expect(JSON.parse(readFileSync(join(out(), 'blobs.json'), 'utf8'))).toEqual({
      [sha('<svg id="w"/>')]: ID_W,
      'assets/Icons/typo.svg': ID_A,
      'assets/Icons/a.svg': 'android-neutral',
    });
  });

  it('exits 3 listing one path per missing SVG and leaves the index alone', () => {
    const { code, stdout } = run('index');
    expect(code).toBe(3);
    expect(stdout).toContain('2 of 3 assets have no blob id yet');
    expect(stdout).toContain('upload.json');
    expect(JSON.parse(readFileSync(join(out(), 'upload.json'), 'utf8'))).toEqual([
      'wallarm-design-system/assets/Icons/a.svg',
      'wallarm-design-system/assets/Logos/wallarm.svg',
    ]);
    expect(readIndex()).toEqual({ createdOnFiles: { v: 1 } });
  });

  it('rejects a value that is not a blob id or url', () => {
    writeBlobs({ 'assets/Icons/a.svg': ID_A, 'assets/Logos/wallarm.svg': 'see above' });
    const result = JSON.parse(run('index', '--json').stdout);
    expect(result).toEqual({
      ok: true,
      exitCode: 3,
      data: {
        assets: 3,
        missing: ['wallarm-design-system/assets/Logos/wallarm.svg'],
        invalid: ['assets/Logos/wallarm.svg'],
      },
    });
  });

  it('reuses blob ids for unchanged SVGs from --index', () => {
    const current = {
      assetGroups: {
        Logos: { files: { 'old.svg': { blob: ID_W, sha256: sha('<svg id="w"/>') } } },
      },
    };
    writeFileSync(
      join(cwd, 'current-index.json'),
      JSON.stringify({ content: JSON.stringify(current) }),
    );
    const first = run('index', '--index', 'current-index.json', '--json');
    expect(JSON.parse(first.stdout).data.missing).toEqual([
      'wallarm-design-system/assets/Icons/a.svg',
    ]);
    writeBlobs({ 'assets/Icons/a.svg': `/_blob/${ID_A}` });
    const { code, stdout } = run('index', '--index', 'current-index.json');
    expect(code).toBe(0);
    expect(stdout).toContain('(1 unchanged since the current index)');
    expect(readIndex().assetGroups.Logos.files['wallarm.svg'].blob).toBe(ID_W);
  });

  it('merges the release into the --index it is given, keeping the page keys', () => {
    writeBlobs({ 'assets/Icons/a.svg': ID_A, 'assets/Logos/wallarm.svg': ID_W });
    writeFileSync(
      join(cwd, 'current-index.json'),
      JSON.stringify({ sections: { saved: 'later' }, createdOnFiles: { at: 2 }, groups: ['x'] }),
    );
    expect(run('index', '--index', 'current-index.json').code).toBe(0);
    const index = readIndex();
    expect(index.sections).toEqual({ saved: 'later' });
    expect(index.createdOnFiles).toEqual({ at: 2 });
    expect(index.groups).toEqual(['Icons', 'Logos']);
  });
});

import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { afterEach, describe, expect, it } from '@rstest/core';

import { CLAUDE_DESIGN } from './config';
import { check, plan } from './publish-plan';

const sha = (text: string) => createHash('sha256').update(text).digest('hex');
const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

interface Fixture {
  files?: Record<string, string>;
  svgs?: number;
  remoteFiles?: { path: string; sha256: string; of_type?: boolean }[];
  assets?: { opaque_id: string; source_sha256: string }[];
  uploads?: unknown;
  title?: string;
  remoteIndex?: Record<string, unknown>;
}

const fixture = ({
  files = { 'README.md': '# DS\n' },
  svgs = 0,
  remoteFiles = [],
  assets = [],
  uploads,
  title = CLAUDE_DESIGN.title,
  remoteIndex = {},
}: Fixture) => {
  mkdirSync(resolve('.claude-design'), { recursive: true });
  const dir = mkdtempSync(resolve('.claude-design/test-'));
  dirs.push(dir);
  const write = (path: string, text: string) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  };
  const all: Record<string, string> = { ...files };
  const icons: Record<string, { name: string; size: number; type: string; sha256: string }> = {};
  for (let i = 0; i < svgs; i++) {
    const name = `i${String(i).padStart(3, '0')}.svg`;
    const text = `<svg id="${i}"/>`;
    all[`assets/Icons/${name}`] = text;
    icons[name] = { name, size: text.length, type: 'image/svg+xml', sha256: sha(text) };
  }
  const index = {
    v: 3,
    title: CLAUDE_DESIGN.title,
    namespace: CLAUDE_DESIGN.namespace,
    libraries: [],
    editing: 'code',
    groups: ['Icons'],
    assetGroups: { Icons: { name: 'Icons', order: Object.keys(icons), files: icons } },
    sections: {},
    lastChange: { at: 'local' },
  };
  all['design-system.json'] = `${JSON.stringify(index, null, 2)}\n`;
  const hashes: Record<string, string> = {};
  for (const [path, text] of Object.entries(all)) {
    write(`project/${path}`, text);
    hashes[path] = sha(text);
  }
  write('file-hashes.json', JSON.stringify(hashes));
  write('remote/artifact.json', JSON.stringify({ title, version: '1' }));
  write('remote/files.json', JSON.stringify({ files: remoteFiles }));
  write('remote/assets.json', JSON.stringify({ assets }));
  write(
    'remote/index.json',
    JSON.stringify({ ...index, sections: {}, lastChange: { at: 'remote' }, ...remoteIndex }),
  );
  if (uploads) write('remote/uploads/1.json', JSON.stringify(uploads));
  return { dir, hashes, write };
};

describe('publish plan', () => {
  it('chunks uploads by 10 and file batches by 256 entries', () => {
    const files: Record<string, string> = {};
    for (let i = 0; i < 300; i++) files[`components/C${i}/README.md`] = `# ${i}\n`;
    const { dir, write } = fixture({
      files,
      svgs: 23,
      remoteFiles: [{ path: 'project/gone.md', sha256: 'x' }],
    });
    write('remote/approved-stale.json', JSON.stringify(['project/gone.md']));
    const result = plan(dir);
    expect(result.phase).toBe('assets');
    expect(result.uploads.map(chunk => chunk.length)).toEqual([10, 10, 3]);
    expect(result.uploads[0]?.[0]).toBe('project/assets/Icons/i000.svg');
    expect(result.batches.map(b => b.files.length + b.remove.length)).toEqual([256, 45]);
    expect(result.batches.flatMap(b => b.files)).not.toContain('project/design-system.json');
    expect(result.batches.flatMap(b => b.files).some(path => path.endsWith('.svg'))).toBe(false);
    expect(result.batches.flatMap(b => b.remove)).toEqual(['project/gone.md']);
    expect(JSON.parse(readFileSync(join(dir, 'publish/plan.json'), 'utf8')).phase).toBe('assets');
  });

  it('matches SVGs by source sha256 and fills index blobs', () => {
    const { dir } = fixture({
      svgs: 2,
      assets: [{ opaque_id: 'a0', source_sha256: sha('<svg id="0"/>') }],
      uploads: { result: [{ files: [{ opaque_id: 'a1', source_sha256: sha('<svg id="1"/>') }] }] },
    });
    const result = plan(dir);
    expect(result.uploads).toEqual([]);
    expect(result.phase).toBe('files');
    const index = JSON.parse(readFileSync(result.indexPath, 'utf8'));
    expect(index.assetGroups.Icons.files['i000.svg'].blob).toBe('a0');
    expect(index.assetGroups.Icons.files['i001.svg'].blob).toBe('a1');
  });

  it('lists stale project paths but not type-owned or artifact-type ones', () => {
    const { dir, hashes } = fixture({
      remoteFiles: [
        { path: 'project/README.md', sha256: '' },
        { path: 'project/old/README.md', sha256: 'x' },
        { path: 'project/owned.md', sha256: 'x', of_type: true },
        { path: 'artifact-type/x', sha256: 'x' },
        { path: 'index.html', sha256: 'x', of_type: true },
      ],
    });
    const result = plan(dir);
    expect(result.stale).toEqual(['project/old/README.md']);
    expect(result.batches[0]?.files).toEqual(['project/README.md']);
    expect(hashes['README.md']).toBeTruthy();
  });

  it('removes only operator-approved stale paths but reports them all', () => {
    const { dir, write } = fixture({
      remoteFiles: [
        { path: 'project/a.md', sha256: 'x' },
        { path: 'project/b.md', sha256: 'x' },
      ],
    });
    expect(plan(dir).batches.flatMap(b => b.remove)).toEqual([]);
    write('remote/approved-stale.json', JSON.stringify(['project/b.md', 'project/README.md']));
    const result = plan(dir);
    expect(result.stale).toEqual(['project/a.md', 'project/b.md']);
    expect(result.batches.flatMap(b => b.remove)).toEqual(['project/b.md']);
    expect(check(dir)).toContain('stale path still published: project/a.md');
  });

  it('keeps page-owned index keys, replaces lastChange, and is byte-stable', () => {
    const { dir } = fixture({ remoteIndex: { sections: { custom: { a: 1 } }, extra: true } });
    const first = plan(dir);
    const bytes = readFileSync(first.indexPath, 'utf8');
    const index = JSON.parse(bytes);
    expect(index.sections).toEqual({ custom: { a: 1 } });
    expect(index.lastChange).toEqual({ at: 'local' });
    expect(index.extra).toBe(true);
    expect(Object.keys(index).at(-1)).toBe('extra');
    expect(bytes.endsWith('}\n')).toBe(true);
    const second = plan(dir);
    expect(readFileSync(second.indexPath, 'utf8')).toBe(bytes);
    expect(second.indexSha256).toBe(sha(bytes));
  });

  it('merges in remote key order, appends missing replaced keys, drops local-only keys', () => {
    const { dir, write } = fixture({});
    const local = JSON.parse(readFileSync(join(dir, 'project/design-system.json'), 'utf8'));
    write('project/design-system.json', JSON.stringify({ ...local, localOnly: 1 }));
    write(
      'remote/index.json',
      JSON.stringify({ lastChange: { at: 'remote' }, docs: { a: 1 }, namespace: 'WallarmDS' }),
    );
    const index = JSON.parse(readFileSync(plan(dir).indexPath, 'utf8'));
    expect(Object.keys(index)).toEqual([
      'lastChange',
      'docs',
      'namespace',
      'title',
      'libraries',
      'editing',
      'groups',
      'assetGroups',
    ]);
    expect(index.lastChange).toEqual({ at: 'local' });
    expect(index.docs).toEqual({ a: 1 });
  });

  it('uploads one file per unique hash, any .svg case', () => {
    const { dir } = fixture({
      files: { 'assets/Icons/a.svg': '<svg/>', 'assets/Icons/b.SVG': '<svg/>' },
    });
    expect(plan(dir).uploads).toEqual([['project/assets/Icons/a.svg']]);
  });

  it('throws on a truncated asset list or a manifest entry missing on disk', () => {
    const { dir, write } = fixture({});
    write('remote/assets.json', JSON.stringify({ assets: [], next: 'cursor' }));
    expect(() => plan(dir)).toThrow(/truncated/);
    const other = fixture({});
    rmSync(join(other.dir, 'project/README.md'));
    expect(() => plan(other.dir)).toThrow(/project\/README.md, which is missing/);
  });

  it('reports a title mismatch as identityOk false', () => {
    expect(plan(fixture({ title: 'Other' }).dir).identityOk).toBe(false);
    expect(plan(fixture({ remoteIndex: { namespace: 'X' } }).dir).identityOk).toBe(false);
  });

  it('is done when the remote matches', () => {
    const { dir, hashes, write } = fixture({});
    const indexSha = plan(dir).indexSha256;
    write(
      'remote/files.json',
      JSON.stringify({
        files: [
          { path: 'project/README.md', sha256: hashes['README.md'] },
          { path: 'project/design-system.json', sha256: indexSha },
        ],
      }),
    );
    expect(plan(dir).phase).toBe('done');
    expect(check(dir)).toEqual([]);
  });

  it('check reports a sha mismatch and a lingering stale path', () => {
    const { dir } = fixture({
      remoteFiles: [
        { path: 'project/README.md', sha256: 'wrong' },
        { path: 'project/old.md', sha256: 'x' },
      ],
    });
    const problems = check(dir);
    expect(problems).toContain('sha256 mismatch: project/README.md');
    expect(problems).toContain('stale path still published: project/old.md');
    expect(problems).toContain('sha256 mismatch: project/design-system.json');
  });

  it('check trusts only the listed asset store, not saved upload results', () => {
    const { dir } = fixture({
      svgs: 1,
      uploads: [{ opaque_id: 'a0', source_sha256: sha('<svg id="0"/>') }],
    });
    expect(plan(dir).uploads).toEqual([]);
    expect(check(dir)).toContain('asset not uploaded: project/assets/Icons/i000.svg');
  });
});

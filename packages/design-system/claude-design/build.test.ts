import { describe, expect, it } from '@rstest/core';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { CLAUDE_DESIGN } from './config';
import { previewGroups } from './previews/build-previews';

const out = resolve('.claude-design/project');
describe('complete Claude Design project', () => {
  it('includes nested-story previews and marked cards', async () => {
    for (const name of ['Copyable', 'FilterInput', 'Button', 'Cover']) {
      expect(await readFile(join(out, 'components', name, 'preview.html'), 'utf8')).toMatch(
        /^<!-- @dsCard group="[^"]+" height=\d+/,
      );
    }
    const paths = await readdir(join(out, 'components'), { recursive: true });
    for (const path of paths.filter(path => /\/preview(-\d+)?\.html$/.test(path)))
      expect(await readFile(join(out, 'components', path), 'utf8')).toMatch(/^<!-- @dsCard /);
  });
  it('previews every exported story across its preview parts', async () => {
    for (const { name, rows } of (await previewGroups()).groups) {
      const dir = join(out, 'components', name);
      const scripts = (await readdir(dir)).filter(file => /^stories(-\d+)?\.js$/.test(file));
      const code = (await Promise.all(scripts.map(file => readFile(join(dir, file), 'utf8')))).join(
        '',
      );
      const shipped = [...code.matchAll(/\{name:"((?:[^"\\]|\\.)*)",story:/g)].map(m => m[1]);
      expect(shipped.sort(), name).toEqual(rows.map(row => row.story).sort());
    }
  });
  it('ships all inked SVG icons and React18 code-editing metadata without local React', async () => {
    const icons = (await readdir(join(out, 'assets/Icons'))).filter(name => name.endsWith('.svg'));
    const source = await readFile(resolve('dist/icons/index.js'), 'utf8');
    const exportCount = source.match(/^export\s/gm)?.length ?? 0;
    expect(exportCount).toBeGreaterThan(0);
    expect(icons).toHaveLength(exportCount);
    for (const icon of icons)
      expect(await readFile(join(out, 'assets/Icons', icon), 'utf8')).not.toContain('currentColor');
    const index = JSON.parse(await readFile(join(out, 'design-system.json'), 'utf8'));
    expect(index.editing).toBe('code');
    expect(index.lastChange.by).toBe('Wallarm');
    for (const [group, value] of Object.entries(index.assetGroups) as [
      string,
      { name: string; order: string[]; files: Record<string, unknown> },
    ][]) {
      expect(value.name).toBe(group);
      expect(value.order).toEqual(Object.keys(value.files).sort());
    }
    expect(index.libraries).toEqual([
      { name: 'react', version: '18' },
      { name: 'react-dom', version: '18' },
    ]);
    expect(await readdir(join(out, 'components'))).not.toContain('lib');
  });
  it('stays within artifact file and byte caps with a complete hash manifest', async () => {
    const files = (await readdir(out, { recursive: true, withFileTypes: true })).filter(file =>
      file.isFile(),
    );
    const inAssets = (file: { parentPath: string }) =>
      file.parentPath.startsWith(join(out, 'assets'));
    expect(files.filter(file => !inAssets(file)).length).toBeLessThanOrEqual(1008);
    expect(files.filter(inAssets).length).toBeLessThanOrEqual(5000);
    const hashes: Record<string, string> = {};
    for (const file of files) {
      const path = join(file.parentPath, file.name);
      const bytes = await readFile(path);
      expect(bytes.length, path).toBeLessThanOrEqual(
        path.endsWith('/bundle.js')
          ? CLAUDE_DESIGN.bundleBudgetBytes
          : path.endsWith('/bundle.css')
            ? CLAUDE_DESIGN.cssCapBytes
            : path.endsWith('/index.d.ts')
              ? 1_500_000
              : 512_000,
      );
      hashes[path.slice(out.length + 1)] = createHash('sha256').update(bytes).digest('hex');
    }
    const manifest = JSON.parse(await readFile(resolve('.claude-design/file-hashes.json'), 'utf8'));
    expect(hashes).toEqual(manifest);
  });
});

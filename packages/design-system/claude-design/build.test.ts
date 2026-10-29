import { describe, expect, it } from '@rstest/core';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const out = resolve('.claude-design/project');
describe('complete Claude Design project', () => {
  it('includes nested-story previews and marked cards', async () => {
    for (const name of ['Copyable', 'FilterInput', 'Button', 'Cover']) {
      expect(await readFile(join(out, 'components', name, 'preview.html'), 'utf8')).toMatch(
        /^<!-- @dsCard group="[^"]+" height=\d+/,
      );
    }
    const paths = await readdir(join(out, 'components'), { recursive: true });
    for (const path of paths.filter(path => path.endsWith('/preview.html')))
      expect(await readFile(join(out, 'components', path), 'utf8')).toMatch(/^<!-- @dsCard /);
  });
  it('ships 582 inked SVG icons and React18 code-editing metadata without local React', async () => {
    const icons = (await readdir(join(out, 'assets/Icons'))).filter(name => name.endsWith('.svg'));
    expect(icons).toHaveLength(582);
    for (const icon of icons)
      expect(await readFile(join(out, 'assets/Icons', icon), 'utf8')).not.toContain('currentColor');
    const index = JSON.parse(await readFile(join(out, 'design-system.json'), 'utf8'));
    expect(index.editing).toBe('code');
    expect(index.libraries).toEqual([
      { name: 'react', version: '18' },
      { name: 'react-dom', version: '18' },
    ]);
    expect(await readdir(join(out, 'components'))).not.toContain('lib');
  });
  it('stays within artifact file and byte caps with stable hashes', async () => {
    const files = (await readdir(out, { recursive: true, withFileTypes: true })).filter(file =>
      file.isFile(),
    );
    expect(files.length).toBeLessThanOrEqual(1008);
    const hashes: Record<string, string> = {};
    for (const file of files) {
      const path = join(file.parentPath, file.name);
      const bytes = await readFile(path);
      expect(bytes.length, path).toBeLessThanOrEqual(
        path.endsWith('/bundle.js')
          ? 5_700_000
          : path.endsWith('/bundle.css')
            ? 2_000_000
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

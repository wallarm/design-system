import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CLAUDE_DESIGN, PACKAGE_DIR } from '../config';
import { buildCanvasScripts, readInlineScript } from './rslib-build';

async function canvasEntry(): Promise<{ source: string; exports: string[] }> {
  const root = (await import(pathToFileURL(resolve(PACKAGE_DIR, 'dist/index.js')).href)) as Record<
    string,
    unknown
  >;
  const exported = new Set([...Object.keys(root), 'Root', 'TableCells', 'Icons']);
  const lines = [await readFile(resolve(PACKAGE_DIR, 'claude-design/bundle/entry.ts'), 'utf8')];
  // The package supports public component subpaths as well as its root barrel.
  for (const dir of (await readdir(resolve(PACKAGE_DIR, 'src/components'))).sort()) {
    const file = resolve(PACKAGE_DIR, 'dist/components', dir, 'index.js');
    if (!existsSync(file)) continue;
    const module = (await import(pathToFileURL(file).href)) as Record<string, unknown>;
    const names = Object.keys(module)
      .filter(name => name !== 'default' && !exported.has(name))
      .sort();
    if (names.length)
      lines.push(`export {${names.join(',')}} from '../../src/components/${dir}/index';`);
    for (const name of names) exported.add(name);
  }
  return { source: lines.join('\n'), exports: [...exported].sort() };
}

export async function buildBundle({ outDir }: { outDir: string }) {
  const runtimeDir = resolve(PACKAGE_DIR, '.claude-design/runtime');
  await mkdir(runtimeDir, { recursive: true });
  const { source, exports } = await canvasEntry();
  // Keep relative source imports anchored at their original entry location.
  await writeFile(
    resolve(runtimeDir, 'public-api.ts'),
    source.replace("'./helpers'", "'../../claude-design/bundle/helpers'"),
  );
  const entry = resolve(runtimeDir, 'bundle.ts');
  await writeFile(entry, `import * as WallarmDS from './public-api'; window.WallarmDS=WallarmDS;`);
  const stats = await buildCanvasScripts({
    entries: { bundle: entry },
    outDir: join(outDir, 'components'),
  });
  const components = exports.filter(
    name => /^[A-Z]/.test(name) && !['Icons', 'TableCells'].includes(name),
  );
  const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: CLAUDE_DESIGN.namespace, components: components.map(name => ({ name })) })} */`;
  const code = `${header}\n${await readInlineScript(join(outDir, 'components/bundle.js'))}\n`;
  const bytes = Buffer.byteLength(code);
  if (bytes > CLAUDE_DESIGN.bundleBudgetBytes)
    throw new Error(`bundle.js ${bytes} bytes exceeds ${CLAUDE_DESIGN.bundleBudgetBytes}`);
  if (/<\/script|<!--|(?:import|fetch)\s*\(\s*['"]https?:/i.test(code))
    throw new Error('Bundle is unsafe to inline');
  await mkdir(join(outDir, 'components'), { recursive: true });
  await writeFile(join(outDir, 'components/bundle.js'), code);
  await mkdir(resolve(PACKAGE_DIR, '.claude-design'), { recursive: true });
  const statistics = stats.toJson({ all: false, assets: true, modules: true, children: true });
  await writeFile(
    resolve(PACKAGE_DIR, '.claude-design/meta.json'),
    `${JSON.stringify({ exports, stats: statistics }, null, 2)}\n`,
  );
  process.stdout.write(`bundle.js: ${bytes} bytes; ${exports.length} exports\n`);
  return { bytes, components };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]))
  await buildBundle({ outDir: CLAUDE_DESIGN.outDir });

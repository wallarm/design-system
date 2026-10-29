import { build, transform } from 'esbuild';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CLAUDE_DESIGN, PACKAGE_DIR } from '../config';
import { browserPlugins } from './esbuild-plugins';

async function canvasEntry(): Promise<string> {
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
  return lines.join('\n');
}

export async function buildBundle({ outDir }: { outDir: string }) {
  const bundled = await build({
    absWorkingDir: PACKAGE_DIR,
    stdin: {
      contents: await canvasEntry(),
      loader: 'ts',
      resolveDir: resolve(PACKAGE_DIR, 'claude-design/bundle'),
      sourcefile: 'canvas-entry.ts',
    },
    outfile: 'bundle.js',
    bundle: true,
    format: 'esm',
    platform: 'browser',
    minify: true,
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    supported: { 'inline-script': true },
    loader: { '.css': 'empty' },
    metafile: true,
    write: false,
    logLevel: 'silent',
    plugins: browserPlugins(),
  });
  const exports = Object.values(bundled.metafile.outputs)
    .flatMap(output => output.exports)
    .sort();
  const components = exports.filter(
    name => /^[A-Z]/.test(name) && !['Icons', 'TableCells'].includes(name),
  );
  const script = await transform(bundled.outputFiles[0]!.text, {
    format: 'iife',
    globalName: CLAUDE_DESIGN.namespace,
    minify: true,
    supported: { 'inline-script': true },
  });
  const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: CLAUDE_DESIGN.namespace, components: components.map(name => ({ name })) })} */`;
  const code = `${header}\n${script.code}\nwindow.WallarmDS=WallarmDS;\n`.replaceAll(
    '<!--',
    '<\\!--',
  );
  const bytes = Buffer.byteLength(code);
  if (bytes > CLAUDE_DESIGN.bundleBudgetBytes)
    throw new Error(`bundle.js ${bytes} bytes exceeds ${CLAUDE_DESIGN.bundleBudgetBytes}`);
  if (/<\/script|<!--|(?:import|fetch)\s*\(\s*['"]https?:/i.test(code))
    throw new Error('Bundle is unsafe to inline');
  await mkdir(join(outDir, 'components'), { recursive: true });
  await writeFile(join(outDir, 'components/bundle.js'), code);
  await mkdir(resolve(PACKAGE_DIR, '.claude-design'), { recursive: true });
  await writeFile(
    resolve(PACKAGE_DIR, '.claude-design/meta.json'),
    `${JSON.stringify({ ...bundled.metafile, exports }, null, 2)}\n`,
  );
  const inputs = Object.values(bundled.metafile.outputs)
    .flatMap(output => Object.entries(output.inputs))
    .sort((a, b) => b[1].bytesInOutput - a[1].bytesInOutput)
    .slice(0, 15);
  process.stdout.write(
    `bundle.js: ${bytes} bytes; ${exports.length} exports\n${inputs.map(([path, info]) => `  ${info.bytesInOutput} ${path}`).join('\n')}\n`,
  );
  return { bytes, components };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]))
  await buildBundle({ outDir: CLAUDE_DESIGN.outDir });

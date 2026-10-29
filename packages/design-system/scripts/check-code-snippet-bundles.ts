import { type Rspack, rspack } from '@rsbuild/core';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

// Exercise published ESM and its export map, not TS source or a hand-written barrel.
// Run after `pnpm build`. All async output counts: remote prefetchers may fetch it.
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cases = [
  {
    exported: 'Button',
    subpath: '',
    forbidden: /shiki|highlight\.js|prismjs|prism-react-renderer/,
    maxFiles: 1,
    maxGzip: 100_000,
  },
  {
    exported: 'loadPrismAdapter',
    subpath: '/CodeSnippet',
    forbidden: /shiki|highlight\.js/,
    maxFiles: 10,
    maxGzip: 100_000,
  },
  {
    exported: 'loadHighlightJsAdapter',
    subpath: '/CodeSnippet',
    forbidden: /shiki|prismjs|prism-react-renderer/,
    maxFiles: 10,
    maxGzip: 400_000,
  },
  {
    exported: 'loadShikiAdapter',
    subpath: '/CodeSnippet',
    forbidden:
      /highlight\.js|prismjs|prism-react-renderer|langs\/dist\/fortran|themes\/dist\/github-dark|shiki\/dist\/bundle-full/,
    maxFiles: 50,
    maxGzip: 1_000_000,
  },
  {
    exported: 'plainAdapter',
    subpath: '/CodeSnippet',
    forbidden: /shiki|highlight\.js|prismjs|prism-react-renderer/,
    maxFiles: 1,
    maxGzip: 2_000,
  },
] as const;

function moduleNames(modules: Rspack.StatsModule[] = []): string[] {
  return modules.flatMap(module => [module.name ?? '', ...moduleNames(module.modules)]);
}

const temporaryRoot = await mkdtemp(join(tmpdir(), 'ds-code-snippet-bundles-'));
const failures: string[] = [];
try {
  const scope = join(temporaryRoot, 'node_modules', '@wallarm-org');
  await mkdir(scope, { recursive: true });
  await symlink(packageRoot, join(scope, 'design-system'), 'dir');
  for (const [index, testCase] of cases.entries()) {
    const name = `${testCase.exported}${testCase.subpath || '/root'}`;
    const directory = join(temporaryRoot, String(index));
    await mkdir(directory);
    await writeFile(
      join(directory, 'entry.js'),
      `import { ${testCase.exported} } from '@wallarm-org/design-system${testCase.subpath}'; globalThis.adapter = ${testCase.exported};`,
    );
    const compiler = rspack({
      mode: 'production',
      target: 'web',
      context: directory,
      entry: './entry.js',
      devtool: false,
      output: { path: join(directory, 'dist'), filename: 'entry.js', chunkFilename: '[id].js' },
      module: { rules: [{ test: /\.m?js$/, resolve: { fullySpecified: false } }] },
      externalsType: 'window',
      externals: [
        ({ request }, callback) =>
          /^react(?:-dom)?(?:\/|$)/.test(request ?? '')
            ? callback(null, '__reactBundleCheck')
            : callback(),
      ],
      optimization: { splitChunks: false, minimize: true },
      performance: { hints: false },
    });
    let stats: Rspack.Stats;
    try {
      stats = await new Promise<Rspack.Stats>((resolveStats, reject) =>
        compiler.run((error, result) => {
          if (error) reject(error);
          else if (!result) reject(new Error('Rspack returned no stats'));
          else resolveStats(result);
        }),
      );
    } finally {
      await new Promise<void>((resolveClose, reject) =>
        compiler.close(error => (error ? reject(error) : resolveClose())),
      );
    }
    assert(!stats.hasErrors(), stats.toString({ all: false, errors: true }));
    const data = stats.toJson({
      all: false,
      assets: true,
      chunks: true,
      chunkModules: true,
      nestedModules: true,
      chunkModulesSpace: Number.POSITIVE_INFINITY,
    });
    const assets = (data.assets ?? []).filter(asset => asset.name.endsWith('.js'));
    const gzipBytes = (
      await Promise.all(
        assets.map(
          async asset => gzipSync(await readFile(join(directory, 'dist', asset.name))).length,
        ),
      )
    ).reduce((sum, size) => sum + size, 0);
    const included = (data.chunks ?? []).flatMap(chunk => moduleNames(chunk.modules));
    const unwanted = included.filter(module => testCase.forbidden.test(module));
    // biome-ignore lint/suspicious/noConsole: CI reports production bundle measurements.
    console.log(
      JSON.stringify({
        name,
        jsFiles: assets.length,
        rawBytes: assets.reduce((sum, asset) => sum + asset.size, 0),
        gzipBytes,
        unwantedModules: unwanted.length,
      }),
    );
    try {
      assert(included.length > 0, `${name}: stats must include emitted modules`);
      assert.deepEqual(unwanted, [], `${name}: unrelated highlighter modules emitted`);
      assert(
        assets.length <= testCase.maxFiles,
        `${name}: ${assets.length} JS files exceeds ${testCase.maxFiles}`,
      );
      assert(
        gzipBytes <= testCase.maxGzip,
        `${name}: ${gzipBytes} gzip bytes exceeds ${testCase.maxGzip}`,
      );
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
  assert.equal(failures.length, 0, failures.join('\n'));
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

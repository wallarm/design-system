import { pluginReact } from '@rsbuild/plugin-react';
import { createRslib, type RslibConfig, type Rspack, rspack } from '@rslib/core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { PACKAGE_DIR } from '../config';

const require = createRequire(import.meta.url);
const runtimeDir = resolve(PACKAGE_DIR, '.claude-design/runtime');
const shim = resolve(PACKAGE_DIR, 'claude-design/bundle/react18-shim.ts');
const domExports = [
  'createPortal',
  'createRoot',
  'hydrateRoot',
  'flushSync',
  'findDOMNode',
  'render',
  'hydrate',
  'unmountComponentAtNode',
  'unstable_batchedUpdates',
  'version',
];

async function runtimeAliases(): Promise<Record<string, string>> {
  const reactExports = Object.keys(require('react18') as Record<string, unknown>).filter(
    key => key !== 'default',
  );
  // TanStack Router feature-detects React.use and falls back when React 18 returns undefined.
  // An explicit optional export keeps Rspack's strict ESM linker compatible with that check.
  reactExports.push('use');
  const files: Record<string, string> = {
    react: `import {createReactModule} from ${JSON.stringify(shim)}; const React=createReactModule(window.React); export default React; export const {${reactExports.join(',')}}=React;`,
    'react-dom': `const ReactDOM=window.ReactDOM; export default ReactDOM; export const {${domExports.join(',')}}=ReactDOM;`,
    jsx: `import {createJsxRuntime} from ${JSON.stringify(shim)}; export const {jsx,jsxs,jsxDEV,Fragment}=createJsxRuntime(window.React);`,
    bridge: `import {wrapCanvasComponent as wrap} from ${JSON.stringify(shim)}; export const wrapCanvasComponent=(component,name)=>wrap(window.React,component,name);`,
    empty: 'export {};',
    storybook: `
      export function fn(implementation=()=>{}) { const mock=(...args)=>implementation(...args); for(const name of ['mockName','mockReturnValue','mockResolvedValue','mockImplementation'])mock[name]=(value)=>{if(name==='mockImplementation')implementation=value;else if(name==='mockReturnValue')implementation=()=>value;else if(name==='mockResolvedValue')implementation=()=>Promise.resolve(value);return mock};return mock; }
      export const expect=()=>{}, within=()=>({}), userEvent={}, waitFor=async fn=>fn();
      export const useArgs=()=>[{},()=>{}], useGlobals=()=>[{},()=>{}];
    `,
  };
  for (const name of ['shiki', 'highlightjs']) {
    const exported = name === 'shiki' ? 'shikiAdapter' : 'highlightJsAdapter';
    files[name] =
      `export const ${exported} = new Proxy({}, {get(){throw new Error('This syntax adapter is not included in Claude Design. Use the Prism adapter.')}});`;
  }
  await mkdir(runtimeDir, { recursive: true });
  await Promise.all(
    Object.entries(files).map(([name, code]) => writeFile(resolve(runtimeDir, `${name}.js`), code)),
  );
  return {
    react$: resolve(runtimeDir, 'react.js'),
    'react-dom$': resolve(runtimeDir, 'react-dom.js'),
    'react-dom/client$': resolve(runtimeDir, 'react-dom.js'),
    'react/jsx-runtime$': resolve(runtimeDir, 'jsx.js'),
    'react/jsx-dev-runtime$': resolve(runtimeDir, 'jsx.js'),
    'react/compiler-runtime$': require.resolve('react-compiler-runtime'),
    'canvas-component-bridge$': resolve(runtimeDir, 'bridge.js'),
  };
}

export type CanvasBuildOptions = {
  entries: Record<string, string>;
  outDir: string;
  globalExports?: string[];
};

/** Both the public namespace and standalone story scripts use this configuration. */
export async function canvasRslibConfig(options: CanvasBuildOptions): Promise<RslibConfig> {
  const alias = await runtimeAliases();
  return {
    lib: [{ format: 'iife', bundle: true, dts: false }],
    source: {
      entry: options.entries,
      tsconfigPath: resolve(PACKAGE_DIR, 'tsconfig.app.json'),
      define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    },
    resolve: { alias },
    output: {
      target: 'web',
      autoExternal: false,
      cleanDistPath: false,
      distPath: { root: options.outDir },
      filename: { js: '[name].js' },
      minify: true,
      legalComments: 'inline',
      sourceMap: false,
    },
    performance: { printFileSize: false },
    plugins: [pluginReact({ reactCompiler: { target: '18' }, splitChunks: false })],
    tools: {
      rspack(config) {
        config.devtool = false;
        config.optimization = { ...config.optimization, splitChunks: false, runtimeChunk: false };
        config.module ??= {};
        config.module.parser = {
          ...config.module.parser,
          javascript: { ...config.module.parser?.javascript, dynamicImportMode: 'eager' },
        };
        config.module.rules ??= [];
        config.module.rules.push({
          test: /\.[jt]sx?$/,
          include: [
            resolve(PACKAGE_DIR, 'src'),
            resolve(PACKAGE_DIR, 'claude-design/bundle/helpers'),
          ],
          enforce: 'post',
          use: [
            {
              loader: resolve(PACKAGE_DIR, 'claude-design/bundle/compat-loader.cjs'),
              options: { globalExports: options.globalExports },
            },
          ],
        });
        config.plugins ??= [];
        config.plugins.push(
          new rspack.NormalModuleReplacementPlugin(
            /\.css(?:\?.*)?$/,
            resolve(runtimeDir, 'empty.js'),
          ),
          new rspack.NormalModuleReplacementPlugin(
            /^(?:storybook|@storybook)(?:\/|$)/,
            resolve(runtimeDir, 'storybook.js'),
          ),
          new rspack.NormalModuleReplacementPlugin(
            /(?:^|\/)adapters\/(?:shiki|highlightjs)$|^\.\/(?:shiki|highlightjs)$/,
            resource => {
              if (resource.context.includes('/CodeSnippet/adapters'))
                resource.request = resolve(
                  runtimeDir,
                  resource.request.includes('highlightjs') ? 'highlightjs.js' : 'shiki.js',
                );
            },
          ),
        );
      },
    },
  };
}

export async function buildCanvasScripts(
  options: CanvasBuildOptions,
): Promise<Rspack.Stats | Rspack.MultiStats> {
  const lib = await createRslib({ cwd: PACKAGE_DIR, config: await canvasRslibConfig(options) });
  const result = await lib.build();
  if (!result.stats) throw new Error('Rslib did not produce build statistics');
  const compilations = 'stats' in result.stats ? result.stats.stats : [result.stats];
  const emitted = compilations.flatMap(stats => stats.compilation.getAssets().map(a => a.name));
  const expected = new Set(Object.keys(options.entries).map(name => `${name}.js`));
  const unexpected = emitted.filter(name => !expected.has(name));
  const missing = [...expected].filter(name => !emitted.includes(name));
  if (unexpected.length || missing.length)
    throw new Error(
      `Canvas scripts must be standalone. Unexpected assets: ${unexpected.join(', ')}; missing entries: ${missing.join(', ')}`,
    );
  return result.stats;
}

/** Scripts are embedded directly in HTML by Claude Design. */
export async function readInlineScript(path: string): Promise<string> {
  const code = (await readFile(path, 'utf8'))
    .replaceAll(/<\/script/gi, match => match.replace('</', '<\\/'))
    .replaceAll('<!--', '<\\!--');
  if (/<\/script|<!--|(?:import|fetch)\s*\(\s*['"]https?:/i.test(code))
    throw new Error(`${path} is unsafe to inline`);
  return code;
}

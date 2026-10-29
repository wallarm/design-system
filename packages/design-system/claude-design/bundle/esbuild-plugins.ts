import { transformAsync } from '@babel/core';
import type { Plugin } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { PACKAGE_DIR } from '../config';
import { globalImportsPlugin } from '../previews/global-imports';
import { refComponentsPlugin } from './ref-components';

const require = createRequire(import.meta.url);
const shim = resolve(PACKAGE_DIR, 'claude-design/bundle/react18-shim.ts');
const reactExports = Object.keys(require('react18') as Record<string, unknown>).filter(
  key => key !== 'default',
);
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

export function browserPlugins(options: { globalExports?: Set<string> } = {}): Plugin[] {
  return [
    {
      name: 'canvas-react18',
      setup(build) {
        build.onResolve({ filter: /^canvas-component-bridge$/ }, () => ({
          path: 'bridge',
          namespace: 'canvas-bridge',
        }));
        build.onLoad({ filter: /.*/, namespace: 'canvas-bridge' }, () => ({
          contents: `import {wrapCanvasComponent as wrap} from ${JSON.stringify(shim)}; export const wrapCanvasComponent=(component,name)=>wrap(window.React,component,name);`,
          loader: 'js',
          resolveDir: PACKAGE_DIR,
        }));
        build.onResolve({ filter: /^(react|react-dom)(\/.*)?$/ }, args => {
          if (args.path === 'react/compiler-runtime')
            return { path: require.resolve('react-compiler-runtime') };
          return { path: args.path, namespace: 'canvas-runtime' };
        });
        build.onLoad({ filter: /.*/, namespace: 'canvas-runtime' }, args => {
          if (args.path.includes('jsx-runtime') || args.path.includes('jsx-dev-runtime'))
            return {
              contents: `import {createJsxRuntime} from ${JSON.stringify(shim)}; export const {jsx,jsxs,jsxDEV,Fragment}=createJsxRuntime(window.React);`,
              loader: 'js',
              resolveDir: PACKAGE_DIR,
            };
          if (args.path.startsWith('react-dom'))
            return {
              contents: `const ReactDOM=window.ReactDOM; export default ReactDOM; export const {${domExports.join(',')}}=ReactDOM;`,
              loader: 'js',
            };
          return {
            contents: `import {createReactModule} from ${JSON.stringify(shim)}; const React=createReactModule(window.React); export default React; export const {${reactExports.join(',')}}=React;`,
            loader: 'js',
            resolveDir: PACKAGE_DIR,
          };
        });
        build.onResolve(
          { filter: /(?:^|\/)adapters\/(?:shiki|highlightjs)$|^\.\/(?:shiki|highlightjs)$/ },
          args => {
            if (!args.importer.includes('/CodeSnippet/adapters/')) return;
            return {
              path: args.path.includes('highlightjs') ? 'highlightJsAdapter' : 'shikiAdapter',
              namespace: 'canvas-excluded',
            };
          },
        );
        build.onLoad({ filter: /.*/, namespace: 'canvas-excluded' }, args => ({
          contents: `export const ${args.path} = new Proxy({}, {get(){throw new Error('This syntax adapter is not included in Claude Design. Use the Prism adapter.')}});`,
          loader: 'js',
        }));
        build.onLoad({ filter: /\.(?:ts|tsx)$/ }, async args => {
          if (
            !args.path.startsWith(resolve(PACKAGE_DIR, 'src')) &&
            !args.path.includes('/claude-design/bundle/helpers/')
          )
            return;
          const code = await readFile(args.path, 'utf8');
          const result = await transformAsync(code, {
            filename: args.path,
            babelrc: false,
            configFile: false,
            plugins: [[require.resolve('babel-plugin-react-compiler'), { target: '18' }]],
            presets: [
              [
                require.resolve('@babel/preset-typescript'),
                { allExtensions: true, isTSX: args.path.endsWith('.tsx') },
              ],
            ],
          });
          if (!result?.code) throw new Error(`No compiler output for ${args.path}`);
          const bridged = await transformAsync(result.code, {
            filename: args.path,
            babelrc: false,
            configFile: false,
            parserOpts: { plugins: ['jsx'] },
            plugins: [
              ...(/\.stories\.|\/(?:stories|story-content)\//.test(args.path)
                ? []
                : [refComponentsPlugin]),
              ...(options.globalExports
                ? [globalImportsPlugin(args.path, options.globalExports)]
                : []),
            ],
          });
          return {
            contents: bridged?.code ?? result.code,
            loader: 'jsx',
            resolveDir: resolve(args.path, '..'),
          };
        });
      },
    },
  ];
}

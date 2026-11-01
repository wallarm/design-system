import type * as React from 'react';
import type * as ReactDOM from 'react-dom';
import { JSDOM } from 'jsdom';
import type * as ReactDOMClient from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
export function createReact18Window() {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: 'https://canvas.test/',
  });
  for (const [pkg, file] of [
    ['react18', 'react'],
    ['react-dom18', 'react-dom'],
  ] as const) {
    dom.window.eval(
      readFileSync(
        join(dirname(require.resolve(`${pkg}/package.json`)), `umd/${file}.development.js`),
        'utf8',
      ),
    );
  }
  const window = dom.window as typeof dom.window & {
    React: typeof React;
    ReactDOM: typeof ReactDOM & typeof ReactDOMClient;
    WallarmDS: Record<string, unknown>;
  };
  return { dom, window, React: window.React, ReactDOM: window.ReactDOM };
}

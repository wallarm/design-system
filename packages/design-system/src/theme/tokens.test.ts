import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from '@rstest/core';

// Tailwind v4 emits no CSS for a utility whose `--color-*` token does not exist, so a
// typo or a removed token renders nothing and fails nowhere. This test is that check.
const src = path.resolve(__dirname, '..');
const files = (dir: string, ext: RegExp): string[] =>
  readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter(f => ext.test(f))
    .map(f => path.join(dir, f));

const tokens = new Set(
  files(__dirname, /\.css$/).flatMap(f =>
    [...readFileSync(f, 'utf8').matchAll(/--color-([a-z0-9-]+)\s*:/g)].map(m => m[1] as string),
  ),
);
// Only names in a semantic namespace (`bg-…`, `text-…`, `badge-…`) are checked, so
// unrelated utilities like `text-sm` or `border-2` never match.
const semantic = readFileSync(path.join(__dirname, 'semantic.css'), 'utf8');
const namespaces = new Set([...semantic.matchAll(/--color-([a-z]+)-/g)].map(m => m[1] as string));

const UTILITY =
  /(?<![\w-])(?:bg|text|border(?:-[trblxyse])?|fill|stroke|ring(?:-offset)?|outline|divide|from|via|to|decoration|accent|caret|placeholder)-([a-z][a-z0-9-]*[a-z0-9])(?![\w-]|\$\{)/g;
const VAR = /var\(--color-([a-z0-9-]+)[,)]/g;

const unknownTokens = () =>
  files(src, /\.(tsx?|css|mdx)$/).flatMap(file => {
    const rel = path.relative(src, file);
    return readFileSync(file, 'utf8')
      .split('\n')
      .flatMap((line, i) =>
        /^\s*(\/\/|\*)/.test(line)
          ? []
          : [...line.matchAll(UTILITY), ...line.matchAll(VAR)]
              .map(m => m[1] as string)
              // A one-segment name (`text-badge`) is a plain string value, not a token
              .filter(
                name =>
                  name.includes('-') &&
                  namespaces.has(name.split('-')[0] as string) &&
                  !tokens.has(name),
              )
              .map(name => `${rel}:${i + 1} ${name}`),
      );
  });

describe('theme tokens', () => {
  it('every semantic color utility and var() resolves to a defined --color-* token', () => {
    expect(unknownTokens()).toEqual([]);
  });
});

import { describe, expect, it } from '@rstest/core';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

// A sub-component renders its derived `data-testid` before spreading props, so a
// consumer's own `data-testid` (and the metrics contract's consumer data-*) wins.
const components = path.resolve(__dirname, '../components');

const overriddenTestIds = () =>
  readdirSync(components, { recursive: true, encoding: 'utf8' })
    .filter(f => f.endsWith('.tsx') && !/\.(stories|test)\.tsx$/.test(f))
    .flatMap(file => {
      const source = readFileSync(path.join(components, file), 'utf8');
      return [...source.matchAll(/const (\w+) = useTestId\('[\w-]+'\);/g)].flatMap(([, name]) =>
        new RegExp(`\\{\\.\\.\\.\\w+\\}[^<>]*?data-testid=\\{${name}\\}`).test(source)
          ? [`${file}: data-testid={${name}} after a props spread`]
          : [],
      );
    });

describe('useTestId', () => {
  it('derived data-testid never overrides the one a consumer passes', () => {
    expect(overriddenTestIds()).toEqual([]);
  });
});

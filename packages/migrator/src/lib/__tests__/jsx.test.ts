import { describe, expect, it } from '@rstest/core';
import type { JsxAttribute } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';
import {
  createTestFile,
  findComponentElements,
  getAttribute,
  hasSpread,
  readStaticString,
  replaceStaticString,
} from '../jsx';

const DS = '@wallarm-org/design-system';

const attrOf = (src: string): JsxAttribute => {
  const file = createTestFile(`const x = <A ${src} />;`);
  return file.getFirstDescendantByKindOrThrow(SyntaxKind.JsxAttribute);
};

describe('findComponentElements', () => {
  it('finds named import usages (open + self-closing)', () => {
    const f = createTestFile(
      `import { Avatar } from '${DS}'; const x = <><Avatar /><Avatar></Avatar></>;`,
    );
    expect(findComponentElements(f, 'Avatar')).toHaveLength(2);
  });

  it('honours aliases', () => {
    const f = createTestFile(`import { Avatar as A } from '${DS}'; const x = <A />;`);
    const els = findComponentElements(f, 'Avatar');
    expect(els.map(e => e.getText())).toEqual(['<A />']);
  });

  it('supports subpath imports', () => {
    const f = createTestFile(`import { Avatar } from '${DS}/Avatar'; const x = <Avatar />;`);
    expect(findComponentElements(f, 'Avatar')).toHaveLength(1);
  });

  it('supports namespace imports', () => {
    const f = createTestFile(`import * as DS from '${DS}'; const x = <DS.Avatar />;`);
    expect(findComponentElements(f, 'Avatar')).toHaveLength(1);
  });

  it('supports namespace imports from the component subpath', () => {
    const f = createTestFile(`import * as Av from '${DS}/Avatar'; const x = <Av.Avatar />;`);
    expect(findComponentElements(f, 'Avatar')).toHaveLength(1);
  });

  it('ignores local components', () => {
    const f = createTestFile(
      `import { Avatar } from './Avatar'; import { Button } from '${DS}'; const x = <Avatar />;`,
    );
    expect(findComponentElements(f, 'Avatar')).toHaveLength(0);
  });

  it('ignores other subpaths', () => {
    const f = createTestFile(`import { Avatar } from '${DS}/Button'; const x = <Avatar />;`);
    expect(findComponentElements(f, 'Avatar')).toHaveLength(0);
  });

  it('parses .jsx files', () => {
    const f = createTestFile(`import { Avatar } from '${DS}'; const x = <Avatar />;`, 'a.jsx');
    expect(findComponentElements(f, 'Avatar')).toHaveLength(1);
  });
});

describe('getAttribute / hasSpread', () => {
  it('gets attributes and detects spread', () => {
    const f = createTestFile(
      `import { Avatar } from '${DS}'; const x = <Avatar size="xs" {...p} />;`,
    );
    const [el] = findComponentElements(f, 'Avatar');
    if (!el) throw new Error('element not found');
    expect(getAttribute(el, 'size')?.getText()).toBe('size="xs"');
    expect(getAttribute(el, 'nope')).toBeUndefined();
    expect(hasSpread(el)).toBe(true);
  });
});

describe('readStaticString', () => {
  it.each([
    ['size="xs"', 'xs'],
    ["size='xs'", 'xs'],
    ["size={'xs'}", 'xs'],
    ['size={"xs"}', 'xs'],
    ['size={`xs`}', 'xs'],
    ['size={s}', undefined],
    ['size={`${s}`}', undefined],
    ['size', undefined],
  ])('%s -> %s', (src, expected) => {
    expect(readStaticString(attrOf(src))).toBe(expected);
  });
});

describe('replaceStaticString', () => {
  it.each([
    ['size="xs"', 'size="md"'],
    ["size='xs'", "size='md'"],
    ["size={'xs'}", "size={'md'}"],
    ['size={`xs`}', 'size={`md`}'],
  ])('%s -> %s', (src, expected) => {
    const attr = attrOf(src);
    replaceStaticString(attr, 'md');
    expect(attr.getText()).toBe(expected);
  });
});

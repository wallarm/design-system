import { describe, expect, it } from '@rstest/core';
import { toSvgString } from '../svg';

describe('toSvgString', () => {
  it('writes attributes in order, self-closes leaves and nests children', () => {
    expect(
      toSvgString('g', { 'clip-path': 'url(#a)' }, [
        { tag: 'path', attrs: { d: 'M0 0Z', fill: '#fff', opacity: 0.5 } },
        { tag: 'rect', attrs: { x: 1, y: 2 } },
      ]),
    ).toBe(
      '<g clip-path="url(#a)"><path d="M0 0Z" fill="#fff" opacity="0.5"/><rect x="1" y="2"/></g>',
    );
  });
});

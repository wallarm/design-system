import { describe, expect, it } from '@rstest/core';
import { collectSlots } from '../collectSlots';

const html = (markup: string): Element => {
  const root = document.createElement('div');
  root.innerHTML = markup;
  return root.firstElementChild as Element;
};

describe('collectSlots', () => {
  it('returns distinct slots in DOM order, root included', () => {
    const root = html(
      "<div data-slot='a'><span data-slot='b'></span><span data-slot='a'></span></div>",
    );
    expect(collectSlots([root])).toEqual(['a', 'b']);
  });

  it('collectSlots includes portal roots', () => {
    const root = html(
      "<div data-slot='a'><span data-slot='b'></span><span data-slot='a'></span></div>",
    );
    const portal = html("<div><p data-slot='drawer-header'></p></div>");
    expect(collectSlots([root, portal])).toEqual(['a', 'b', 'drawer-header']);
  });

  it('returns nothing for an empty root', () => {
    expect(collectSlots([document.createElement('div')])).toEqual([]);
  });
});

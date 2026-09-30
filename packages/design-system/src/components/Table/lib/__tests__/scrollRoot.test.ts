import { afterEach, describe, expect, it } from 'vitest';
import { getScrollRoot } from '../scrollRoot';

const mount = (style: Partial<CSSStyleDeclaration>, size?: { client: number; scroll: number }) => {
  const box = document.createElement('div');
  Object.assign(box.style, style);
  if (size) {
    Object.defineProperties(box, {
      clientHeight: { value: size.client },
      scrollHeight: { value: size.scroll },
    });
  }
  const child = document.createElement('div');
  box.appendChild(child);
  document.body.appendChild(box);
  return { box, child };
};

describe('getScrollRoot', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('resolves to the window without a scrollable ancestor', () => {
    const { child } = mount({});
    expect(getScrollRoot(child)).toBe(window);
  });

  it('resolves to an ancestor whose content overflows it', () => {
    const { box, child } = mount({ overflowY: 'auto' }, { client: 100, scroll: 1000 });
    expect(getScrollRoot(child)).toBe(box);
  });

  it('skips an auto-overflow ancestor that grows with its content', () => {
    // An `overflow-x: hidden` wrapper computes `overflow-y` to `auto` too, but
    // never scrolls — the page around it does.
    const { child } = mount({ overflowY: 'auto' }, { client: 1000, scroll: 1000 });
    expect(getScrollRoot(child)).toBe(window);
  });
});

import { describe, expect, it } from '@rstest/core';
import { JSDOM } from 'jsdom';
import postcss from 'postcss';
import { tolerateCanvasWrappers } from './wrapper-css';

const selectorsOf = (css: string): string[] => {
  const selectors: string[] = [];
  postcss.parse(css).walkRules(rule => {
    selectors.push(rule.selector);
  });
  return selectors;
};

/** Whether the rewritten `selector` matches `#target` in `html`. */
const matches = (selector: string, html: string): boolean => {
  const [rewritten = ''] = selectorsOf(tolerateCanvasWrappers(`${selector}{color:red}`).css);
  const { document } = new JSDOM(`<body>${html}</body>`).window;
  return document.querySelector('#target')?.matches(rewritten) ?? false;
};
const wrap = (inner: string) => `<div class="sc-host-x" style="display:contents">${inner}</div>`;

describe('tolerateCanvasWrappers', () => {
  it('reaches a `>` child through canvas wrappers, and still matches unwrapped', () => {
    const selector = '.group > .item';
    expect(matches(selector, `<div class="group"><i class="item" id="target"></i></div>`)).toBe(
      true,
    );
    expect(
      matches(
        selector,
        `<div class="group">${wrap(wrap('<i class="item" id="target"></i>'))}</div>`,
      ),
    ).toBe(true);
    // A wrapper that is itself inside another element of the child is not a child relation.
    expect(
      matches(
        selector,
        `<div class="group">${wrap('<p><i class="item" id="target"></i></p>')}</div>`,
      ),
    ).toBe(false);
  });

  it('moves first/last positions to the outermost wrapper', () => {
    const selector = '.last\\:pb-0:last-child';
    const item = (id = '') => `<i class="last:pb-0" ${id}></i>`;
    expect(matches(selector, `<div>${wrap(item())}${wrap(item('id="target"'))}</div>`)).toBe(true);
    expect(matches(selector, `<div>${wrap(item('id="target"'))}${wrap(item())}</div>`)).toBe(false);
  });

  it('keeps specificity, skips keyframes and reports forms it cannot rewrite', () => {
    const { css, skipped } = tolerateCanvasWrappers(
      '.a > .b{color:red} @keyframes k{from{opacity:0}} .c:nth-last-child(2){color:red}',
    );
    expect(selectorsOf(css)).toContain('.c:nth-last-child(2)');
    expect(selectorsOf(css)).toContain('from');
    expect(skipped).toEqual([
      expect.stringContaining(':nth-last-child has no wrapper-tolerant form'),
    ]);
    expect(css).toContain(':where(.sc-host-x) { border-radius: inherit; }');
  });
});

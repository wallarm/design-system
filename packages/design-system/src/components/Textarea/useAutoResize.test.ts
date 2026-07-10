import { describe, expect, it, vi } from 'vitest';
import { adjustTextareaHeight } from './useAutoResize';

function makeTextarea({
  lineHeight = '20px',
  paddingTop = '4px',
  paddingBottom = '4px',
  borderTopWidth = '1px',
  borderBottomWidth = '1px',
  scrollHeight = 60,
}: {
  lineHeight?: string;
  paddingTop?: string;
  paddingBottom?: string;
  borderTopWidth?: string;
  borderBottomWidth?: string;
  scrollHeight?: number;
} = {}) {
  const textarea = document.createElement('textarea');
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    lineHeight,
    paddingTop,
    paddingBottom,
    borderTopWidth,
    borderBottomWidth,
  } as CSSStyleDeclaration);
  // jsdom never lays out content, so scrollHeight must be stubbed per case.
  Object.defineProperty(textarea, 'scrollHeight', { value: scrollHeight, configurable: true });
  return textarea;
}

describe('adjustTextareaHeight', () => {
  it('includes the border width in the assigned height (border-box sizing)', () => {
    // Regression: scrollHeight excludes border by spec, but the element is
    // box-sizing:border-box, so assigning scrollHeight straight to
    // style.height steals border-width pixels from the content area —
    // rendering 2px shorter than the content actually needs.
    const textarea = makeTextarea({ scrollHeight: 68 });
    adjustTextareaHeight(textarea, 2, 6);
    expect(textarea.style.height).toBe('70px'); // 68 (content+padding) + 2 (borderY)
  });

  it('adds the border width to the minRows floor too', () => {
    // minRows=2 * lineHeight=20 + paddingY=8 + borderY=2 = 50; content collapses below that.
    const textarea = makeTextarea({ scrollHeight: 12 });
    adjustTextareaHeight(textarea, 2, 6);
    expect(textarea.style.height).toBe('50px');
  });

  it('adds the border width to the maxRows ceiling too', () => {
    // maxRows=6 * lineHeight=20 + paddingY=8 + borderY=2 = 130; content exceeds that.
    const textarea = makeTextarea({ scrollHeight: 500 });
    adjustTextareaHeight(textarea, 2, 6);
    expect(textarea.style.height).toBe('130px');
    expect(textarea.style.overflowY).toBe('auto');
  });
});

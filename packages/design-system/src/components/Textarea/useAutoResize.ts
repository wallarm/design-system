import { useCallback, useLayoutEffect, useRef } from 'react';

// measures the natural content height of a textarea
// clamps it between `minRows` and `maxRows` line-heights

export function adjustTextareaHeight(
  textarea: HTMLTextAreaElement,
  minRows: number,
  maxRows: number,
) {
  const style = window.getComputedStyle(textarea);
  const lineHeight = Number.parseInt(style.lineHeight, 10) || 20;
  const paddingY =
    (Number.parseInt(style.paddingTop, 10) || 0) + (Number.parseInt(style.paddingBottom, 10) || 0);
  // scrollHeight excludes border by spec, but the element is box-sizing:
  // border-box — so a border-exclusive value assigned straight to
  // style.height steals border-width pixels from the content area,
  // rendering 2px shorter than the content needs (and shorter than
  // InlineEditPreview's own border-inclusive box, causing a preview/edit
  // row-height jump for multiline values). Fold it into every bound.
  const borderY =
    (Number.parseInt(style.borderTopWidth, 10) || 0) +
    (Number.parseInt(style.borderBottomWidth, 10) || 0);

  const minHeight = lineHeight * minRows + paddingY + borderY;
  const maxHeight = lineHeight * maxRows + paddingY + borderY;

  // collapse to measure true content height
  textarea.style.height = '0';
  const scrollHeight = textarea.scrollHeight + borderY;

  textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
  textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
}

export function useAutoResize(
  enabled: boolean,
  minRows: number,
  maxRows: number,
  value?: string | number | readonly string[],
) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    if (!enabled || !ref.current) return;
    adjustTextareaHeight(ref.current, minRows, maxRows);
  }, [enabled, minRows, maxRows]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: value triggers re-measurement even though adjustHeight reads from the DOM
  useLayoutEffect(() => {
    adjustHeight();
  }, [adjustHeight, value]);

  return { ref, adjustHeight };
}

import { useCallback, useLayoutEffect, useRef } from 'react';

// measures the natural content height of a textarea
// clamps it between `minRows` and `maxRows` line-heights

function adjustTextareaHeight(textarea: HTMLTextAreaElement, minRows: number, maxRows: number) {
  const style = window.getComputedStyle(textarea);
  const lineHeight = Number.parseInt(style.lineHeight, 10) || 20;
  const paddingY =
    (Number.parseInt(style.paddingTop, 10) || 0) + (Number.parseInt(style.paddingBottom, 10) || 0);

  const minHeight = lineHeight * minRows + paddingY;
  const maxHeight = lineHeight * maxRows + paddingY;

  // collapse to measure true content height
  textarea.style.height = '0';
  const scrollHeight = textarea.scrollHeight;

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

/**
 * Single shared ResizeObserver for all overflow lists. The browser drains
 * microtasks between separate observer callbacks, so per-instance observers
 * cannot share one read/write batch — one observer delivers every entry in a
 * single callback, letting all instances enqueue into the same flush. It also
 * fires pre-paint: a measurement scheduled here lands before the frame paints.
 */

/** Called when the observed element resizes (including display:none toggles). */
export interface OverflowResizeHandler {
  (): void;
}

const handlers = new Map<Element, OverflowResizeHandler>();
let observer: ResizeObserver | null = null;

export const observeOverflowResize = (
  element: Element,
  handler: OverflowResizeHandler,
): (() => void) => {
  observer ??= new ResizeObserver(entries => {
    for (const entry of entries) handlers.get(entry.target)?.();
  });
  handlers.set(element, handler);
  observer.observe(element);

  return () => {
    handlers.delete(element);
    observer?.unobserve(element);
  };
};

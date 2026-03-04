/**
 * Listens for a DOM `event` on the target element. Resolves only after
 * `delay` ms of silence following a predicate-passing event (debounce).
 *
 * Returns `[promise, cleanup]` — same shape as ark-ui `waitForEvent`.
 */
export const waitForDebouncedEvent = <T extends HTMLElement = HTMLElement>(
  target: (() => T | null) | undefined,
  event: string,
  delay: number,
  predicate?: (el: T) => boolean,
): [Promise<void>, VoidFunction] => {
  const el = target?.() as T | null;
  if (!el) {
    return [new Promise<void>(() => {}), () => {}];
  }

  let timer: ReturnType<typeof setTimeout>;
  let resolve: () => void;

  const handler = () => {
    // Predicate failed — reset the debounce and keep listening.
    if (predicate && !predicate(el)) {
      clearTimeout(timer);
      return;
    }

    // Predicate passed — (re)start the debounce timer.
    clearTimeout(timer);
    timer = setTimeout(() => {
      cleanup();
      resolve();
    }, delay);
  };

  const cleanup = () => {
    clearTimeout(timer);
    el.removeEventListener(event, handler);
  };

  const promise = new Promise<void>(r => {
    resolve = r;
  });

  el.addEventListener(event, handler);

  return [promise, cleanup];
};

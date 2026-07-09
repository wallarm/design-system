/**
 * Rate-limits `fn` to run at most once per `wait` ms: fires immediately on the
 * first call (leading edge), then defers any calls made before the window
 * elapses to fire once, with their latest arguments, when it does (trailing
 * edge). `.cancel()` drops a pending trailing call.
 */
export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number,
): ((...args: Args) => void) & { cancel: () => void } {
  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let pendingArgs: Args | undefined;

  const invoke = (args: Args) => {
    lastCallTime = Date.now();
    fn(...args);
  };

  const throttled = (...args: Args) => {
    const remaining = wait - (Date.now() - lastCallTime);

    if (remaining <= 0) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
      invoke(args);
      return;
    }

    pendingArgs = args;
    if (timeoutId === undefined) {
      timeoutId = setTimeout(() => {
        timeoutId = undefined;
        if (pendingArgs) invoke(pendingArgs);
      }, remaining);
    }
  };

  throttled.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = undefined;
    pendingArgs = undefined;
  };

  return throttled;
}

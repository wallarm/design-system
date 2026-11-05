// Story-only: the engine's frame meter for ManyOnScreen (excluded from the build). It reads the runtime's dev timing
// hook, which is not public API, through one dispatcher so meters can mount and unmount in any order.
import { getRuntime } from '../../../lib/agent-characters/runtime';

const meters = new Set<(jsMs: number) => void>();
const dispatch = (jsMs: number) => {
  for (const m of meters) m(jsMs);
};

/** Calls `fn` with the loop's JavaScript time on every engine frame; returns how to stop. */
export function subscribeFrames(fn: (jsMs: number) => void) {
  const rt = getRuntime();
  meters.add(fn);
  rt.onFrame = dispatch;
  return () => {
    meters.delete(fn);
    if (!meters.size && rt.onFrame === dispatch) rt.onFrame = undefined;
  };
}

import { useCallback, useEffect, useRef } from 'react';
import { useControlled } from '../../../../hooks';
import type { LineChartSeries } from '../LineChartContext';

interface UseLineChartActiveKeyResult {
  /**
   * Resolved active key after normalising stale values against the live
   * `seriesByKey` map. `null` whenever the controlled value points at a key
   * that no longer exists in `series`.
   */
  activeKey: string | null;
  /**
   * Setter that deduplicates per-pixel mousemove/hover events and forwards to
   * the controlled callback. Use this instead of writing state directly so
   * consumer callbacks don't fire with the same value frame after frame.
   */
  setActiveKey: (key: string | null) => void;
}

/**
 * Controlled/uncontrolled active-series key with two safety nets:
 *
 * 1. If the controlled key points at a series that has disappeared (filter,
 *    schema change, refresh) the hook pushes `null` back through
 *    `onActiveKeyChange` so sibling charts stop highlighting a stale key.
 * 2. The setter dedupes against a ref so per-pixel hover events don't keep
 *    firing the callback after `useState` already bailed out.
 *
 * Refs are synced during render so parent-driven external resets flow through
 * without a stale comparison.
 */
export const useLineChartActiveKey = ({
  controlledActiveKey,
  onActiveKeyChange,
  seriesByKey,
}: {
  controlledActiveKey: string | null | undefined;
  onActiveKeyChange: ((key: string | null) => void) | undefined;
  seriesByKey: Map<string, LineChartSeries>;
}): UseLineChartActiveKeyResult => {
  const [activeKeyValue, setInternalActiveKey] = useControlled<string | null>({
    controlled: controlledActiveKey,
    default: null,
  });
  const rawActiveKey = activeKeyValue ?? null;
  // Drop the highlight when the hovered series disappears (controlled sync,
  // schema change) so all lines don't dim mid-render.
  const activeKey = rawActiveKey !== null && seriesByKey.has(rawActiveKey) ? rawActiveKey : null;

  // Push the stale-key normalisation upstream so sibling charts sharing
  // controlled state stop referencing a key that no longer exists.
  useEffect(() => {
    if (
      controlledActiveKey !== undefined &&
      controlledActiveKey !== null &&
      !seriesByKey.has(controlledActiveKey)
    ) {
      onActiveKeyChange?.(null);
    }
  }, [controlledActiveKey, seriesByKey, onActiveKeyChange]);

  // Dedupe per-pixel mousemove/hover events so consumer callbacks don't fire
  // with the same value frame after frame (useState bails out, callbacks don't).
  // Refs are synced during render so parent-driven external resets flow through.
  const lastActiveKeyRef = useRef<string | null | undefined>(undefined);
  lastActiveKeyRef.current = activeKey;
  // Consumer callback held behind a ref so `setActiveKey` stays referentially
  // stable. Without this, an inline `onActiveKeyChange` from the caller
  // invalidates `setActiveKey`, which cascades into `LineChartDataContext`
  // and re-renders every chart consumer on every parent render.
  const onActiveKeyChangeRef = useRef(onActiveKeyChange);
  onActiveKeyChangeRef.current = onActiveKeyChange;
  const setActiveKey = useCallback(
    (key: string | null) => {
      if (lastActiveKeyRef.current === key) return;
      lastActiveKeyRef.current = key;
      setInternalActiveKey(key);
      onActiveKeyChangeRef.current?.(key);
    },
    [setInternalActiveKey],
  );

  return { activeKey, setActiveKey };
};

import { useCallback } from 'react';
import { useControlled } from '../../../hooks';

// ---------------------------------------------------------------------------
// Combined controlled/uncontrolled state + TanStack updater handler.
// Replaces separate useControlled + useStateHandler for each table feature.
// Returns [currentState, tanstackHandler] — ready to plug into useReactTable.
// ---------------------------------------------------------------------------
export function useTableState<S>(
  controlled: S | undefined,
  defaultValue: S,
  onChange?: (updater: S | ((prev: S) => S)) => void,
): [S | undefined, (updater: S | ((prev: S) => S)) => void] {
  const [state, setInternal] = useControlled<S>({
    controlled,
    default: defaultValue,
  });

  const handler = useCallback(
    (updater: S | ((prev: S) => S)) => {
      const newValue =
        typeof updater === 'function'
          ? (updater as (prev: S) => S)(state ?? defaultValue)
          : updater;
      setInternal(newValue);
      onChange?.(updater);
    },
    [state, defaultValue, setInternal, onChange],
  );

  return [state, handler];
}

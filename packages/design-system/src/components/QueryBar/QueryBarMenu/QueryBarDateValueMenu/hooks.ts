import { useCallback, useState } from 'react';

/**
 * Manages two-value selection for the "between" date operator.
 * First selection stores the "from" value, second completes the range.
 */
export const useDateRange = () => {
  const [fromValue, setFromValue] = useState<string | null>(null);

  /** Current selection index: 0 = selecting "from", 1 = selecting "to" */
  const currentIndex = fromValue === null ? 0 : 1;

  /**
   * Select a date value. Returns the complete [from, to] array when both
   * values are selected, or null if waiting for the second value.
   */
  const selectValue = useCallback((value: string): [string, string] | null => {
    if (fromValue === null) {
      setFromValue(value);
      return null;
    }
    const result: [string, string] = [fromValue, value];
    setFromValue(null);
    return result;
  }, [fromValue]);

  const reset = useCallback(() => {
    setFromValue(null);
  }, []);

  return { fromValue, currentIndex, selectValue, reset };
};

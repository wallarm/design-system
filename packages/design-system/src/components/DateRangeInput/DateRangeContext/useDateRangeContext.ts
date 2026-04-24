import { useContext } from 'react';
import { DateRangeContext } from './context';
import type { DateRangeContextValue } from './types';

/**
 * Access the nearest `DateRangeProvider` context.
 *
 * Throws when called outside a `DateRangeProvider` — this is a compound
 * component contract, so a missing provider is a programmer error, not a
 * recoverable state. Sub-components like `DateRangeStartValue` rely on this
 * to avoid silently rendering nothing.
 *
 * @example
 * const CustomRangeBody = () => {
 *   const { state, startFieldProps, endFieldProps } = useDateRangeContext();
 *   // ...
 * };
 */
export const useDateRangeContext = (): DateRangeContextValue => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error(
      'useDateRangeContext must be used within a <DateRangeProvider>. ' +
        'Did you forget to wrap the component tree, or are you rendering ' +
        'DateRangeStartValue / DateRangeEndValue / DateRangeSeparator outside it?',
    );
  }
  return context;
};

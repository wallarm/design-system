import { useContext } from 'react';
import { DateRangeContext } from './context';
import type { DateRangeContextValue } from './types';

/**
 * Hook to access DateRangeInput context.
 * Returns undefined if used outside DateRangeProvider.
 *
 * Provides access to date range state, refs, and field props for building
 * custom date range input components.
 *
 * @returns Context value with state and props, or undefined if not within provider
 *
 * @example
 * const CustomDateRangeComponent = () => {
 *   const context = useDateRangeContext();
 *
 *   if (!context) {
 *     return null;
 *   }
 *
 *   const { state, startFieldProps, endFieldProps } = context;
 *   // Use context to build custom UI
 * };
 */
export const useDateRangeContext = (): DateRangeContextValue | undefined => {
  return useContext(DateRangeContext);
};

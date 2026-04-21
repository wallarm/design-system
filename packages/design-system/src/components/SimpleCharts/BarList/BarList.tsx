import { type FC, type HTMLAttributes, type Ref, useEffect, useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import { BarListContext, type BarListContextValue } from './BarListContext';
import { barListRootClasses } from './classes';

export interface BarListProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /**
   * Value at which a bar reaches 100%. Required.
   * - Percent inputs → `max={100}`.
   * - Fractions → `max={1}`.
   * - Raw counts → `Math.max(...values)` or the total.
   *
   * Invalid values (non-finite, zero, negative) render every row empty with a 0% label
   * and log a single dev-only warning.
   */
  max: number;
}

export const BarList: FC<BarListProps> = ({
  max,
  className,
  children,
  ref,
  'data-testid': testId,
  ...props
}) => {
  const isValidMax = Number.isFinite(max) && max > 0;

  useEffect(() => {
    if (!isValidMax && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        `[BarList] \`max\` must be a finite positive number. Received: ${String(max)}. ` +
          'Every row will render empty with a 0% label.',
      );
    }
  }, [isValidMax, max]);

  const value = useMemo<BarListContextValue>(() => ({ max, isValidMax }), [max, isValidMax]);

  return (
    <BarListContext.Provider value={value}>
      <TestIdProvider value={testId}>
        <div
          {...props}
          ref={ref}
          data-slot='bar-list'
          data-testid={testId}
          className={cn(barListRootClasses, className)}
        >
          {children}
        </div>
      </TestIdProvider>
    </BarListContext.Provider>
  );
};

BarList.displayName = 'BarList';

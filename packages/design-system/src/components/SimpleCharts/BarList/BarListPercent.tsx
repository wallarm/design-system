import { type FC, type HTMLAttributes, type Ref, useContext } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { BarListItemContext } from './BarListContext';
import { barListPercentClasses } from './classes';

export interface BarListPercentProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  /** Number of fractional digits. Defaults to `0`. */
  digits?: number;
}

export const BarListPercent: FC<BarListPercentProps> = ({
  digits = 0,
  className,
  children,
  ref,
  ...props
}) => {
  const testId = useTestId('percent');
  const itemCtx = useContext(BarListItemContext);
  const percent = (itemCtx?.ratio ?? 0) * 100;

  return (
    <span
      {...props}
      ref={ref}
      data-slot='bar-list-percent'
      data-testid={testId}
      className={cn(barListPercentClasses, className)}
    >
      {children ?? `${percent.toFixed(digits)}%`}
    </span>
  );
};

BarListPercent.displayName = 'BarListPercent';

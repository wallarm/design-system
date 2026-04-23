import { type FC, type HTMLAttributes, type Ref, useContext } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { BarListItemContext } from './BarListContext';
import { barListPercentSymbolVariants, barListPercentVariants } from './classes';

export type BarListPercentVariant = 'split' | 'muted' | 'inherit';

export interface BarListPercentProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  /** Number of fractional digits. Defaults to `0`. */
  digits?: number;
  /**
   * Color treatment for the value and the `%` symbol.
   * - `split` (default, matches Figma) — value uses `text-text-primary`, symbol uses `text-text-secondary`.
   * - `muted` — both tokens use `text-text-secondary`.
   * - `inherit` — both tokens inherit the parent's color (e.g. match `BarListValue`).
   */
  variant?: BarListPercentVariant;
}

export const BarListPercent: FC<BarListPercentProps> = ({
  digits = 0,
  variant = 'split',
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
      className={cn(barListPercentVariants({ variant }), className)}
    >
      {children ?? (
        <>
          {percent.toFixed(digits)}
          <span
            data-slot='bar-list-percent-symbol'
            className={barListPercentSymbolVariants({ variant })}
          >
            %
          </span>
        </>
      )}
    </span>
  );
};

BarListPercent.displayName = 'BarListPercent';

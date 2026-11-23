import type {
  ButtonHTMLAttributes,
  FC,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../../utils/testId';
import { FormatNumber } from '../../FormatNumber';
import { funnelColumnClasses } from './classes';
import { sanitizeFunnelValue } from './lib/funnelGeometry';

const funnelStepCellVariants = cva(
  'relative flex flex-col gap-2 w-full h-100 pt-8 px-12 pb-12 text-left',
  {
    variants: {
      interactive: {
        true: [
          'enabled:cursor-pointer outline-none',
          'before:absolute before:inset-x-6 before:inset-y-2 before:rounded-10',
          'enabled:hover:before:bg-states-primary-hover',
          'focus-visible:before:bg-states-primary-hover',
          'focus-visible:before:ring-2 focus-visible:before:ring-inset focus-visible:before:ring-focus-primary',
        ].join(' '),
        false: '',
      },
    },
    defaultVariants: { interactive: false },
  },
);

export interface FunnelStepProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'name'>,
    TestableProps {
  /** Lands on the cell: `<button>` with `onClick`, `<div>` without. */
  ref?: Ref<HTMLElement>;
  /** Step name, one line with ellipsis. */
  name: ReactNode;
  /** Step count, ≥ 0 (negative / non-finite show as 0). Rendered with `FormatNumber`. */
  value: number;
  /** Up to two lines with ellipsis. */
  caption?: ReactNode;
  /** Slot for `<MetricDelta />`, shown right after the value. */
  delta?: ReactNode;
  /** Makes the step a real button. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

/** One stage of a `Funnel`: title cell (name, value, delta, caption). Must be a direct child of `Funnel`. */
export const FunnelStep: FC<FunnelStepProps> = ({
  ref,
  name,
  value,
  caption,
  delta,
  onClick,
  className,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('step', testIdProp);
  const shown = sanitizeFunnelValue(value);
  const interactive = onClick !== undefined;

  const content = (
    <TestIdProvider value={testId}>
      <span className='relative text-xs text-text-secondary truncate'>{name}</span>
      <span className='relative flex items-center gap-4 min-w-0'>
        <span className='font-sans-display text-xl leading-xl font-medium tracking-[-0.1px] text-text-primary truncate'>
          <FormatNumber value={shown} typography='inherit' />
        </span>
        {delta}
      </span>
      {caption != null && (
        <span className='relative text-xs text-text-secondary line-clamp-2'>{caption}</span>
      )}
    </TestIdProvider>
  );

  const cellClassName = cn(funnelStepCellVariants({ interactive }), className);

  return (
    <li
      data-slot='funnel-step'
      className={cn(
        funnelColumnClasses,
        // The border shifts this li's edge by < 1px from the ribbon seam; the seam always
        // falls inside the 1px hairline, which paints over the ribbon.
        'not-first:border-l not-first:border-border-primary-light',
      )}
    >
      {interactive ? (
        <button
          {...rest}
          ref={ref as Ref<HTMLButtonElement>}
          type='button'
          onClick={onClick}
          data-slot='funnel-step-cell'
          data-testid={testId}
          className={cellClassName}
        >
          {content}
        </button>
      ) : (
        <div
          // Button-only attributes (type, disabled, form…) are meaningless on a div; widen for the spread.
          {...(rest as HTMLAttributes<HTMLElement>)}
          ref={ref as Ref<HTMLDivElement>}
          data-slot='funnel-step-cell'
          data-testid={testId}
          className={cellClassName}
        >
          {content}
        </div>
      )}
    </li>
  );
};

FunnelStep.displayName = 'FunnelStep';

import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FC,
  type FocusEvent,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
  useContext,
} from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../../utils/testId';
import { FormatNumber } from '../../FormatNumber';
import { funnelCellContentClasses, funnelColumnClasses } from './classes';
import { FunnelStepContext } from './FunnelContext';
import { sanitizeFunnelValue } from './lib/funnelGeometry';

const funnelStepCellVariants = cva(
  [
    'relative flex flex-col gap-2 w-full h-100 pt-8 px-12 pb-12 text-left',
    'before:absolute before:inset-x-6 before:inset-y-2 before:rounded-10',
    // The whole column is the hover zone (`data-active`, set from the <li>); a disabled step shows no tint.
    'data-active:not-disabled:before:bg-states-primary-hover',
    funnelCellContentClasses,
  ].join(' '),
  {
    variants: {
      interactive: {
        true: [
          // outline-hidden (not outline-none): forced-colors mode turns it into a visible focus outline.
          'enabled:cursor-pointer focus-visible:outline-hidden focus-visible:-outline-offset-4',
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
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'name' | 'children'>,
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
  // Button-only attributes: kept on the button, dropped from the non-interactive div.
  disabled,
  form,
  formAction,
  formEncType,
  formMethod,
  formNoValidate,
  formTarget,
  type: _type,
  ...rest
}) => {
  const testId = useTestId('step', testIdProp);
  const shown = sanitizeFunnelValue(value);
  const interactive = onClick !== undefined;

  const ctx = useContext(FunnelStepContext);
  const index = ctx?.index ?? 0;
  const activeIndex = ctx?.activeIndex ?? null;
  const active = activeIndex === index;
  const dimmed = activeIndex !== null && !active;
  const handlePointerEnter = () => ctx?.onHover(index);
  // Keyboard focus only: a mouse click also focuses the button (Chromium), and that focus would
  // keep the other steps dimmed after the pointer leaves, with no ring to explain why.
  const handleFocus = (event: FocusEvent<HTMLLIElement>) => {
    if ((event.target as Element).matches(':focus-visible')) ctx?.onFocus(index);
  };
  const handleBlur = () => ctx?.onFocus(null);

  const content = (
    <TestIdProvider value={testId}>
      <span className='relative text-xs text-text-secondary truncate'>{name}</span>
      <span className='relative flex items-center gap-4 min-w-0'>
        <span
          data-testid={testId ? `${testId}--value` : undefined}
          className='font-sans-display text-xl leading-xl font-medium tracking-[-0.1px] text-text-primary truncate'
        >
          {/* No hint on abbreviated values (1.2K): the full number stays in aria-label only. */}
          <FormatNumber value={shown} typography='inherit' tooltip={false} />
        </span>
        {delta}
      </span>
      {caption != null && (
        <span className='relative text-xs text-text-secondary line-clamp-2'>{caption}</span>
      )}
    </TestIdProvider>
  );

  const cellClassName = cn(funnelStepCellVariants({ interactive }), className);
  const cellState = { 'data-active': active || undefined, 'data-dimmed': dimmed || undefined };

  return (
    <li
      data-slot='funnel-step'
      className={cn(
        funnelColumnClasses,
        // The border shifts this li's edge by < 1px from the ribbon seam; the seam always
        // falls inside the 1px hairline, which paints over the ribbon.
        'not-first:border-l not-first:border-border-primary-light',
      )}
      // Entrance stagger index for the labels (see `funnelCellContentClasses`).
      style={{ '--funnel-i': index } as CSSProperties}
      // Hover zone = the whole column: title, band and the space between the dividers.
      onPointerEnter={handlePointerEnter}
      // Focus bubbles from the button; a blur followed by focus on the next step lands on that step.
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {interactive ? (
        <button
          {...rest}
          disabled={disabled}
          form={form}
          formAction={formAction}
          formEncType={formEncType}
          formMethod={formMethod}
          formNoValidate={formNoValidate}
          formTarget={formTarget}
          ref={ref as Ref<HTMLButtonElement>}
          type='button'
          onClick={onClick}
          {...cellState}
          data-slot='funnel-step-cell'
          data-testid={testId}
          className={cellClassName}
        >
          {content}
        </button>
      ) : (
        <div
          {...(rest as HTMLAttributes<HTMLElement>)}
          ref={ref as Ref<HTMLDivElement>}
          {...cellState}
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

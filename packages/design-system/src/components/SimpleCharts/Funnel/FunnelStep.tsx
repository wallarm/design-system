import { type FC, type HTMLAttributes, type ReactNode, type Ref, useContext } from 'react';
import { abbreviateNumber } from '../../../utils/abbreviateNumber';
import { cn } from '../../../utils/cn';
import { type TestableProps, useTestId } from '../../../utils/testId';
import {
  funnelStepCaptionClasses,
  funnelStepClasses,
  funnelStepDeltaClasses,
  funnelStepNameClasses,
  funnelStepRibbonClasses,
  funnelStepTitleRowClasses,
  funnelStepTitleVariants,
  funnelStepValueClasses,
  funnelStepValueRowClasses,
} from './classes';
import { FUNNEL_BAND_HEIGHT, FUNNEL_BODY_MIN, FUNNEL_HALOS } from './constants';
import { FunnelContext, FunnelStepIndexContext } from './FunnelContext';
import { FUNNEL_COLUMN_UNITS, funnelColumnPath } from './lib/funnelGeometry';

export interface FunnelStepProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'>,
    TestableProps {
  /**
   * Lands on the title cell — the `<button>` when the step has an `onClick`, a `<div>`
   * otherwise. Every other native prop (`data-*`, `aria-*`, `id`, handlers) lands there too.
   */
  ref?: Ref<HTMLElement>;
  /** Stage name. One line, truncated. */
  name: ReactNode;
  /** The count at this stage. A number ≥ 0; it also drives the ribbon thickness. */
  value: number;
  /** Optional line under the value. Two lines at most. */
  caption?: ReactNode;
  /** Optional chip right after the value — pass a `MetricDelta`. */
  delta?: ReactNode;
}

/** Same rounding as the rest of the product: `1284` → `1.3k`, `59614283` → `59.6M`. */
const formatValue = (value: number): string =>
  Number.isFinite(value) ? abbreviateNumber(value) : '—';

/**
 * One stage of a `Funnel`: the title cell (name, value, optional delta and caption)
 * and its slice of the ribbon. With an `onClick` the title cell is a real button;
 * the ribbon is decorative and never interactive.
 */
export const FunnelStep: FC<FunnelStepProps> = ({
  name,
  value,
  caption,
  delta,
  className,
  ref,
  onClick,
  'data-testid': testIdProp,
  ...props
}) => {
  const funnel = useContext(FunnelContext);
  const index = useContext(FunnelStepIndexContext);
  const testId = useTestId('step', testIdProp);
  const ribbonTestId = useTestId('ribbon');

  const interactive = typeof onClick === 'function';

  const thickness = funnel?.thicknesses[index] ?? FUNNEL_BODY_MIN;
  // The last column is flat: it has no next step to run into.
  const nextThickness = funnel?.thicknesses[index + 1] ?? thickness;

  const title = (
    <>
      <span className={funnelStepNameClasses}>{name}</span>
      <span className={funnelStepValueRowClasses}>
        <span className={funnelStepValueClasses}>{formatValue(value)}</span>
        {delta != null && <span className={funnelStepDeltaClasses}>{delta}</span>}
      </span>
      {caption != null && <span className={funnelStepCaptionClasses}>{caption}</span>}
    </>
  );

  const titleClassName = cn(funnelStepTitleVariants({ interactive }), className);

  return (
    <div role='listitem' data-slot='funnel-step' className={funnelStepClasses}>
      <div className={funnelStepTitleRowClasses}>
        {interactive ? (
          <button
            {...props}
            ref={ref as Ref<HTMLButtonElement>}
            type='button'
            data-slot='funnel-step-title'
            data-testid={testId}
            onClick={onClick}
            className={titleClassName}
          >
            {title}
          </button>
        ) : (
          <div
            {...props}
            ref={ref as Ref<HTMLDivElement>}
            data-slot='funnel-step-title'
            data-testid={testId}
            className={titleClassName}
          >
            {title}
          </div>
        )}
      </div>
      <svg
        aria-hidden
        data-slot='funnel-step-ribbon'
        data-testid={ribbonTestId}
        viewBox={`0 0 ${FUNNEL_COLUMN_UNITS} ${FUNNEL_BAND_HEIGHT}`}
        preserveAspectRatio='none'
        className={funnelStepRibbonClasses}
      >
        <g data-slot='funnel-step-ribbon-fill' className={funnel?.fills[index]}>
          {FUNNEL_HALOS.map(halo => (
            <path
              key={halo.grow}
              d={funnelColumnPath(thickness, nextThickness, halo.grow)}
              fillOpacity={halo.opacity}
            />
          ))}
          <path d={funnelColumnPath(thickness, nextThickness)} />
        </g>
      </svg>
    </div>
  );
};

FunnelStep.displayName = 'FunnelStep';

import {
  Children,
  type FC,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type Ref,
  useEffect,
} from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import { ChartEmpty } from '../Chart';
import type { ChartColor } from '../types';
import { funnelEmptyClasses, funnelRootClasses } from './classes';
import { FUNNEL_MAX_STEPS, FUNNEL_MIN_STEPS } from './constants';
import { FunnelContext, FunnelStepIndexContext } from './FunnelContext';
import type { FunnelStepProps } from './FunnelStep';
import { type FunnelStart, resolveFunnelFills } from './lib/funnelColors';
import { funnelThicknesses } from './lib/funnelGeometry';

export interface FunnelProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /**
   * Hue of the ribbon. Not semantic — pick it like a `BarList` color. Blue, red, green,
   * amber and purple are the everyday set; the other hues are for rare cases.
   */
  color?: ChartColor;
  /**
   * How the ramp starts. `tint` (default) runs light to dark in the hue; `gray` draws
   * the first step in slate and every other step in the hue.
   */
  start?: FunnelStart;
}

/**
 * A horizontal step funnel: how a count narrows from stage to stage, left to right.
 * Renders the body only — compose the card with `Chart` / `ChartHeader` / `ChartTitle`.
 * Children are `FunnelStep` elements, 2 to 6 of them, as direct children.
 */
export const Funnel: FC<FunnelProps> = ({
  color = 'blue',
  start = 'tint',
  className,
  children,
  ref,
  'data-testid': testId,
  ...props
}) => {
  const steps = Children.toArray(children).filter((child): child is ReactElement<FunnelStepProps> =>
    isValidElement(child),
  );
  const count = steps.length;

  useEffect(() => {
    const outOfRange = count === 1 || count > FUNNEL_MAX_STEPS;
    if (outOfRange && process.env.NODE_ENV !== 'production') {
      // biome-ignore lint/suspicious/noConsole: dev-only warning about the step count
      console.warn(
        `[Funnel] expects ${FUNNEL_MIN_STEPS} to ${FUNNEL_MAX_STEPS} steps. Received: ${count}.`,
      );
    }
  }, [count]);

  if (count === 0) {
    return (
      <TestIdProvider value={testId}>
        <div
          {...props}
          ref={ref}
          data-slot='funnel'
          data-testid={testId}
          className={cn(funnelEmptyClasses, className)}
        >
          <ChartEmpty />
        </div>
      </TestIdProvider>
    );
  }

  const context = {
    thicknesses: funnelThicknesses(steps.map(step => step.props.value)),
    fills: resolveFunnelFills(color, count, start),
  };

  return (
    <FunnelContext.Provider value={context}>
      <TestIdProvider value={testId}>
        <div
          {...props}
          ref={ref}
          role='list'
          data-slot='funnel'
          data-testid={testId}
          className={cn(funnelRootClasses, className)}
        >
          {steps.map((step, index) => (
            <FunnelStepIndexContext.Provider key={step.key} value={index}>
              {step}
            </FunnelStepIndexContext.Provider>
          ))}
        </div>
      </TestIdProvider>
    </FunnelContext.Provider>
  );
};

Funnel.displayName = 'Funnel';

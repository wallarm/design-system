import type { CSSProperties, FC, HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import { Children, isValidElement } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import { funnelColumnClasses } from './classes';
import {
  FUNNEL_BAND_HEIGHT,
  FUNNEL_HALO_OPACITY,
  FUNNEL_HALOS,
  FUNNEL_MIN_BODY,
  type FunnelColor,
  type FunnelStart,
} from './constants';
import { FunnelContext } from './FunnelContext';
import { FunnelStep, type FunnelStepProps } from './FunnelStep';
import { funnelSegmentPath, funnelStepFills, funnelThicknesses } from './lib/funnelGeometry';

export interface FunnelProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Hue of the step ramp. Default `'blue'`. */
  color?: FunnelColor;
  /** `'tint'` ramps light → dark; `'gray'` starts with slate, the rest on `{hue}-600`. Default `'tint'`. */
  start?: FunnelStart;
  /** `FunnelStep` elements, as direct children. */
  children: ReactNode;
}

const warned = new Set<string>();
const warnOnce = (message: string) => {
  if (process.env.NODE_ENV === 'production' || warned.has(message)) return;
  warned.add(message);
  // biome-ignore lint/suspicious/noConsole: dev-only misuse warning, stripped in production
  console.warn(`[Funnel] ${message}`);
};

const isStep = (child: ReactNode): child is ReactElement<FunnelStepProps> =>
  isValidElement(child) && child.type === FunnelStep;

/** Horizontal step funnel: a title cell per `FunnelStep` above a smooth ribbon scaled to the largest step. */
export const Funnel: FC<FunnelProps> = ({
  ref,
  color = 'blue',
  start = 'tint',
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  const all = Children.toArray(children);
  const steps = all.filter(isStep);
  const count = steps.length;
  const values = steps.map(step => step.props.value);

  if (steps.length !== all.length) {
    warnOnce('Only FunnelStep elements are allowed as direct children; others are ignored.');
  }
  if (count === 1 || count > 6) warnOnce(`Funnel expects 2–6 steps, got ${count}.`);
  if (values.some(v => !(Number.isFinite(v) && v >= 0))) {
    warnOnce(
      'FunnelStep `value` must be a finite number ≥ 0; negative or non-finite values are drawn as 0.',
    );
  }

  if (count === 0) return null;

  const thicknesses = funnelThicknesses(values);
  const fills = funnelStepFills(count, color, start);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='funnel'
      data-testid={testId}
      className={cn('relative flex h-288 min-w-240', className)}
    >
      <div
        aria-hidden
        data-slot='funnel-ribbon'
        data-testid={testId ? `${testId}--ribbon` : undefined}
        className='absolute inset-x-0 top-100 flex h-172 pointer-events-none'
      >
        {fills.map((fill, i) => {
          const from = thicknesses[i] ?? FUNNEL_MIN_BODY;
          const to = thicknesses[i + 1] ?? from;
          return (
            <svg
              // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional
              key={i}
              viewBox={`0 0 1 ${FUNNEL_BAND_HEIGHT}`}
              preserveAspectRatio='none'
              className={cn(
                funnelColumnClasses,
                'h-full',
                '[--funnel-fill:var(--funnel-light)] in-data-[theme=dark]:[--funnel-fill:var(--funnel-dark)]',
              )}
              style={{ '--funnel-light': fill.light, '--funnel-dark': fill.dark } as CSSProperties}
            >
              {FUNNEL_HALOS.map(grow => (
                <path
                  key={grow}
                  d={funnelSegmentPath(from, to, grow)}
                  fill='var(--funnel-fill)'
                  fillOpacity={FUNNEL_HALO_OPACITY[grow]}
                />
              ))}
              <path d={funnelSegmentPath(from, to, 0)} fill='var(--funnel-fill)' fillOpacity={1} />
            </svg>
          );
        })}
      </div>
      {/* After the ribbon in the DOM so the step dividers paint over it. */}
      {/* min-w-0: without it the list grows to its long names' nowrap width and overflows. */}
      <ol className='relative flex flex-1 min-w-0'>
        <TestIdProvider value={testId}>
          {steps.map((step, index) => (
            <FunnelContext key={step.key} value={{ index, count }}>
              {step}
            </FunnelContext>
          ))}
        </TestIdProvider>
      </ol>
    </div>
  );
};

Funnel.displayName = 'Funnel';

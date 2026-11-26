import type { CSSProperties, FC, HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import { Children, isValidElement, useEffect, useState } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import type { FunnelColor, FunnelStart } from './constants';
import { FunnelStepContext } from './FunnelContext';
import { FunnelRibbon } from './FunnelRibbon';
import { FunnelStep, type FunnelStepProps } from './FunnelStep';
import { funnelStepFills, funnelThicknesses, sanitizeFunnelValue } from './lib/funnelGeometry';

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

/**
 * Horizontal step funnel: a title cell per `FunnelStep` above a smooth ribbon scaled to the
 * largest step. Hovering or focusing a step dims the others; on mount the bands grow in, left to right.
 */
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

  // Hover wins over focus: the pointer is where the eye is. Moving off the list clears hover,
  // leaving the focused step (if any) highlighted.
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  // Clamped: the steps can change under a resting pointer or a removed focused button (no blur
  // fires in Firefox / Safari), leaving an index that no longer names a step.
  const activeIndex = [hoverIndex, focusIndex].find(i => i !== null && i < count) ?? null;

  const hasStrayChildren = steps.length !== all.length;
  const hasBadValue = values.some(v => sanitizeFunnelValue(v) !== v);

  useEffect(() => {
    if (hasStrayChildren) {
      warnOnce(
        'only direct FunnelStep children are rendered — pass FunnelStep elements directly or as an array; fragments and wrapper components are ignored.',
      );
    }
    if (count === 1 || count > 6) warnOnce(`expects 2–6 steps, got ${count}.`);
    if (hasBadValue) {
      warnOnce(
        'FunnelStep `value` must be a finite number ≥ 0; negative or non-finite values are drawn as 0.',
      );
    }
  }, [hasStrayChildren, count, hasBadValue]);

  if (count === 0) return null;

  const thicknesses = funnelThicknesses(values);
  const fills = funnelStepFills(count, color, start);

  const handleListPointerLeave = () => setHoverIndex(null);

  return (
    // Scroll root: columns keep min-w-120, so a card too narrow for every step scrolls instead of
    // clipping the last steps. The track below carries the width so the ribbon spans all columns.
    <div
      {...props}
      ref={ref}
      data-slot='funnel'
      data-testid={testId}
      className={cn('overflow-x-auto overflow-y-hidden', className)}
    >
      <div
        className='relative flex h-288 min-w-[max(240px,calc(var(--funnel-steps)*120px))]'
        style={{ '--funnel-steps': count } as CSSProperties}
      >
        <FunnelRibbon
          thicknesses={thicknesses}
          fills={fills}
          activeIndex={activeIndex}
          testId={testId}
        />
        {/* After the ribbon in the DOM so the step dividers paint over it. */}
        {/* min-w-0: without it the list grows to its long names' nowrap width and overflows. */}
        <ol
          // biome-ignore lint/a11y/noRedundantRoles: Safari/VoiceOver drops list semantics from lists styled with `list-style: none` (Tailwind preflight); role='list' restores it
          role='list'
          className='relative flex flex-1 min-w-0'
          onPointerLeave={handleListPointerLeave}
        >
          <TestIdProvider value={testId}>
            {steps.map((step, index) => (
              <FunnelStepContext
                key={step.key}
                value={{ index, activeIndex, onHover: setHoverIndex, onFocus: setFocusIndex }}
              >
                {step}
              </FunnelStepContext>
            ))}
          </TestIdProvider>
        </ol>
      </div>
    </div>
  );
};

Funnel.displayName = 'Funnel';

import type { FC, FocusEvent, HTMLAttributes, KeyboardEvent, MouseEvent, Ref } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useControlled } from '../../../hooks';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import type { ChartDeltaProps } from '../internal/ChartDelta';
import { resolveChartColor } from '../lib/chartPalette';
import { makeIsHoverSyncTarget } from '../lib/hoverSync';
import { MetricDelta, MetricHeader, MetricValue } from '../Metric';
import type { ChartColor } from '../types';
import {
  horizontalBarStackBarClasses,
  horizontalBarStackBarWrapperClasses,
  horizontalBarStackLegendClasses,
  horizontalBarStackLegendDotClasses,
  horizontalBarStackLegendItemVariants,
  horizontalBarStackLegendLabelClasses,
  horizontalBarStackRemainderClasses,
  horizontalBarStackRootClasses,
  horizontalBarStackSegmentVariants,
  horizontalBarStackTooltipClasses,
} from './classes';
import { resolveSegments } from './lib/resolveSegments';

// Legend item ⇄ segment hover sync: skip the mouseleave/blur null-clear when the pointer or
// focus is moving to another hover-syncing sibling, so we never commit an intermediate
// `activeName = null` frame (which would flicker the dim). Mirrors PieChart.
const isHoverSyncTarget = makeIsHoverSyncTarget([
  'horizontal-bar-stack-segment',
  'horizontal-bar-stack-legend-item',
]);

const EMPTY_SELECTION: Set<string> = new Set();

export interface HorizontalBarStackDatum {
  /** Legend label, React key, and `data-name` hook. */
  name: string;
  /** Segment size; proportional to the bar total. */
  value: number;
  /** Built-in palette; resolves via `resolveChartColor`. Omitted → auto-assigned by index. */
  color?: ChartColor;
  /** Tailwind `bg-*` escape hatch; wins over `color` (inline fill is skipped). */
  className?: string;
}

export interface HorizontalBarStackProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Segments + legend. One array drives both, so colors stay in sync. */
  data: HorizontalBarStackDatum[];
  /** Headline number, rendered as `value.toLocaleString('en-US')`. Omitted → header hidden. */
  value?: number;
  /**
   * Trend chip — the shared `ChartDelta` (rendered via `MetricDelta`). `sentiment` sets the
   * colour (positive → green, negative → red, neutral → slate; default neutral), `trend` sets
   * the arrow — independent axes. Omitted → no chip.
   */
  delta?: Pick<ChartDeltaProps, 'value' | 'trend' | 'sentiment'>;
  /** Bar denominator. `> sum(data.value)` → grey remainder tail. Default: `sum(data.value)`. */
  total?: number;
  /** Show/hide the legend. Default: true. */
  legend?: boolean;
  /**
   * Controlled hover target, joined by `name`. Omitted → managed internally. Set together
   * with `onActiveNameChange` to sync hover across charts (e.g. a sibling highlights the
   * same series). Mirrors `PieChart`.
   */
  activeName?: string | null;
  onActiveNameChange?: (name: string | null) => void;
  /**
   * Names to emphasise. When non-empty, non-selected segments + legend items fade. Hover
   * (`activeName`) wins — while a series is hovered, only it stays bright. Names not in
   * `data` are ignored.
   */
  selectedNames?: string[];
  /**
   * Click-to-filter. When provided, legend items become interactive (`role='button'`,
   * `tabIndex=0`, Enter/Space) and fire with the clicked datum's `name`. The caller owns
   * the filter (typically: drive `selectedNames`, or filter `data`).
   */
  onSelect?: (name: string) => void;
}

const formatNumber = (n: number): string => n.toLocaleString('en-US');

export const HorizontalBarStack: FC<HorizontalBarStackProps> = ({
  data,
  value,
  delta,
  total,
  legend = true,
  activeName: controlledActiveName,
  onActiveNameChange,
  selectedNames,
  onSelect,
  className,
  ref,
  'data-testid': testId,
  ...props
}) => {
  const segments = useMemo(() => resolveSegments(data, total), [data, total]);
  // Slot testids derive from this component's own `data-testid`, not a parent
  // `TestIdProvider` — all slots render inline, so `useTestId` would resolve a wrapping
  // provider's base (e.g. a `Chart`) instead of this component's own.
  const slotTestId = (slot: string): string | undefined =>
    testId ? `${testId}--${slot}` : undefined;
  const legendSegments = useMemo(() => segments.filter(s => !s.isRemainder), [segments]);

  const byName = useMemo(() => {
    const set = new Set<string>();
    for (const d of data) set.add(d.name);
    return set;
  }, [data]);

  const [activeNameValue, setInternalActiveName] = useControlled<string | null>({
    controlled: controlledActiveName,
    default: null,
  });
  // Normalise against the current data: if the hovered series disappears (filter/refresh),
  // drop the highlight rather than dimming every segment.
  const rawActiveName = activeNameValue ?? null;
  const activeName = rawActiveName !== null && byName.has(rawActiveName) ? rawActiveName : null;

  const setActive = useCallback(
    (name: string | null) => {
      setInternalActiveName(name);
      onActiveNameChange?.(name);
    },
    [setInternalActiveName, onActiveNameChange],
  );

  // In controlled mode, push the normalisation upstream so a sibling chart sharing the
  // state doesn't keep highlighting a name that no longer exists.
  useEffect(() => {
    if (
      controlledActiveName !== undefined &&
      controlledActiveName !== null &&
      !byName.has(controlledActiveName)
    ) {
      onActiveNameChange?.(null);
    }
  }, [controlledActiveName, byName, onActiveNameChange]);

  const selectedSet = useMemo<Set<string>>(() => {
    if (!selectedNames?.length) return EMPTY_SELECTION;
    const set = new Set<string>();
    for (const name of selectedNames) if (byName.has(name)) set.add(name);
    return set.size > 0 ? set : EMPTY_SELECTION;
  }, [selectedNames, byName]);

  const interactive = typeof onSelect === 'function';

  const barAriaLabel = useMemo(
    () =>
      legend
        ? undefined
        : legendSegments.length
          ? legendSegments.map(s => `${s.key} ${formatNumber(s.value)}`).join(', ')
          : undefined,
    [legend, legendSegments],
  );
  const hasDuplicateNames = useMemo(() => {
    const seen = new Set<string>();
    for (const d of data) {
      if (seen.has(d.name)) return true;
      seen.add(d.name);
    }
    return false;
  }, [data]);

  useEffect(() => {
    if (hasDuplicateNames && process.env.NODE_ENV !== 'production') {
      // biome-ignore lint/suspicious/noConsole: dev-only misuse warning, stripped in production
      console.warn(
        '[HorizontalBarStack] `data` contains duplicate `name` values. Names are used as the React key ' +
          'and the `data-name` hook — duplicates cause key collisions and ambiguous selectors. Provide unique names.',
      );
    }
  }, [hasDuplicateNames]);

  const hasBar = data.length > 0;
  const hasValue = typeof value === 'number';
  const hasDelta = !!delta;

  // Only the active series stays bright; the rest fade. Hover wins over selection.
  const isDimmed = (key: string): boolean =>
    activeName !== null ? key !== activeName : selectedSet.size > 0 ? !selectedSet.has(key) : false;

  const handleMouseLeave = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (isHoverSyncTarget(event.relatedTarget)) return;
      setActive(null);
    },
    [setActive],
  );
  const handleBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (isHoverSyncTarget(event.relatedTarget)) return;
      setActive(null);
    },
    [setActive],
  );
  const handleKeyDown = useCallback(
    (name: string) => (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect?.(name);
      }
    },
    [onSelect],
  );

  return (
    <div
      {...props}
      ref={ref}
      data-slot='horizontal-bar-stack'
      data-testid={testId}
      className={cn(horizontalBarStackRootClasses, className)}
    >
      {(hasValue || hasDelta) && (
        <TestIdProvider value={testId}>
          <MetricHeader className='px-16 pt-8'>
            {hasValue && <MetricValue>{value}</MetricValue>}
            {delta && <MetricDelta {...delta} />}
          </MetricHeader>
        </TestIdProvider>
      )}
      {hasBar && (
        <div
          data-slot='horizontal-bar-stack-bar-wrapper'
          className={horizontalBarStackBarWrapperClasses}
        >
          <div
            data-slot='horizontal-bar-stack-bar'
            data-testid={slotTestId('bar')}
            aria-hidden={legend ? 'true' : undefined}
            // `aria-label` is ignored on generic elements — `role='img'` makes the
            // summary announceable when the legend (the readable form) is hidden.
            role={barAriaLabel ? 'img' : undefined}
            aria-label={barAriaLabel}
            className={horizontalBarStackBarClasses}
          >
            {segments.map(seg => {
              const seriesSegment = !seg.isRemainder;
              const segment = (
                <div
                  key={seg.key}
                  data-slot='horizontal-bar-stack-segment'
                  data-testid={slotTestId('segment')}
                  data-name={seg.isRemainder ? undefined : seg.key}
                  data-remainder={seg.isRemainder ? 'true' : undefined}
                  data-active={seriesSegment && activeName === seg.key ? 'true' : undefined}
                  onMouseEnter={seriesSegment ? () => setActive(seg.key) : undefined}
                  onMouseLeave={seriesSegment ? handleMouseLeave : undefined}
                  className={cn(
                    horizontalBarStackSegmentVariants({ dimmed: isDimmed(seg.key) }),
                    seg.isRemainder && horizontalBarStackRemainderClasses,
                    seg.className,
                  )}
                  style={{
                    flexGrow: seg.value,
                    flexBasis: 0,
                    backgroundColor:
                      seg.isRemainder || seg.className ? undefined : resolveChartColor(seg.color),
                  }}
                />
              );
              // The remainder has no name/value → no tooltip. Series segments show a
              // `name · value` popover on hover (the value isn't shown elsewhere on the bar).
              if (!seriesSegment) return segment;
              return (
                <Tooltip key={seg.key} openDelay={150} closeDelay={100}>
                  <TooltipTrigger asChild>{segment}</TooltipTrigger>
                  <TooltipContent>
                    <span className={horizontalBarStackTooltipClasses}>
                      <span
                        aria-hidden='true'
                        className={cn(horizontalBarStackLegendDotClasses, seg.className)}
                        style={{
                          backgroundColor: seg.className ? undefined : resolveChartColor(seg.color),
                        }}
                      />
                      {seg.key} · {formatNumber(seg.value)}
                    </span>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      )}
      {legend && legendSegments.length > 0 && (
        <div
          data-slot='horizontal-bar-stack-legend'
          data-testid={slotTestId('legend')}
          className={horizontalBarStackLegendClasses}
        >
          {legendSegments.map(seg => {
            const active = activeName === seg.key;
            const selected = selectedSet.has(seg.key);
            const dimmed = !selected && !active && selectedSet.size > 0;
            return (
              <div
                key={seg.key}
                data-slot='horizontal-bar-stack-legend-item'
                data-testid={slotTestId('legend-item')}
                data-name={seg.key}
                data-active={active ? 'true' : undefined}
                data-selected={selected ? 'true' : undefined}
                role={interactive ? 'button' : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-current={selected ? 'true' : undefined}
                onClick={interactive ? () => onSelect?.(seg.key) : undefined}
                onKeyDown={interactive ? handleKeyDown(seg.key) : undefined}
                onMouseEnter={() => setActive(seg.key)}
                onMouseLeave={handleMouseLeave}
                onFocus={() => setActive(seg.key)}
                onBlur={handleBlur}
                className={horizontalBarStackLegendItemVariants({
                  interactive,
                  active,
                  selected,
                  dimmed,
                })}
              >
                <span
                  data-slot='horizontal-bar-stack-legend-dot'
                  data-testid={slotTestId('legend-dot')}
                  aria-hidden='true'
                  className={cn(horizontalBarStackLegendDotClasses, seg.className)}
                  style={{
                    backgroundColor: seg.className ? undefined : resolveChartColor(seg.color),
                  }}
                />
                <span className={horizontalBarStackLegendLabelClasses}>{seg.key}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

HorizontalBarStack.displayName = 'HorizontalBarStack';

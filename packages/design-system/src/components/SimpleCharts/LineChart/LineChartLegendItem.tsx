import {
  type FC,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { lineChartLegendItemVariants } from './classes';
import {
  isHoverSyncTarget,
  LineChartActiveContext,
  LineChartDataContext,
  LineChartItemContext,
  type LineChartItemContextValue,
  LineChartSelectionContext,
} from './LineChartContext';

export interface LineChartLegendItemProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Joins to `LineChartSeries.key`. Drives hover sync, dim, and `aria-current`. */
  seriesKey: string;
  /**
   * Explicit selection state. When omitted, falls back to "not in `filteredKeys`".
   * `true` = row is on (line drawn); `false` = row is off (line hidden, dimmed).
   * Passing this prop fully overrides the context — useful when the legend
   * renders rows that are not part of the chart's filter set.
   */
  selected?: boolean;
}

export const LineChartLegendItem: FC<LineChartLegendItemProps> = ({
  seriesKey,
  selected: selectedProp,
  className,
  children,
  ref,
  onClick,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}) => {
  const testId = useTestId('legend-item');
  const dataCtx = useContext(LineChartDataContext);
  const { activeKey } = useContext(LineChartActiveContext);
  const { hiddenSet } = useContext(LineChartSelectionContext);

  const series = dataCtx?.seriesByKey.get(seriesKey);
  const interactive = typeof onClick === 'function';
  const active = activeKey === seriesKey;
  const selected = selectedProp ?? !hiddenSet.has(seriesKey);
  const dimmed = !selected && !active && hiddenSet.size > 0;

  const color = series?.color;
  const label = series?.label;
  const itemValue = useMemo<LineChartItemContextValue>(
    () => ({ seriesKey, selected, interactive, active, color, label }),
    [seriesKey, selected, interactive, active, color, label],
  );

  const setActive = dataCtx?.setActiveKey;

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      onMouseEnter?.(event);
      if (event.defaultPrevented) return;
      setActive?.(seriesKey);
    },
    [onMouseEnter, setActive, seriesKey],
  );

  const handleMouseLeave = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(event);
      if (event.defaultPrevented) return;
      // See `isHoverSyncTarget` in LineChartContext for the flicker rationale.
      if (isHoverSyncTarget(event.relatedTarget)) return;
      setActive?.(null);
    },
    [onMouseLeave, setActive],
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      onFocus?.(event);
      if (event.defaultPrevented) return;
      setActive?.(seriesKey);
    },
    [onFocus, setActive, seriesKey],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      onBlur?.(event);
      if (event.defaultPrevented) return;
      if (isHoverSyncTarget(event.relatedTarget)) return;
      setActive?.(null);
    },
    [onBlur, setActive],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (!interactive || event.defaultPrevented) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.currentTarget.click();
      }
    },
    [interactive, onKeyDown],
  );

  return (
    <LineChartItemContext.Provider value={itemValue}>
      <div
        {...props}
        ref={ref}
        data-slot='line-chart-legend-item'
        data-testid={testId}
        data-key={seriesKey}
        data-active={active ? 'true' : undefined}
        data-selected={selected ? 'true' : undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-current={selected ? 'true' : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          lineChartLegendItemVariants({ interactive, active, selected, dimmed }),
          className,
        )}
      >
        {children}
      </div>
    </LineChartItemContext.Provider>
  );
};

LineChartLegendItem.displayName = 'LineChartLegendItem';

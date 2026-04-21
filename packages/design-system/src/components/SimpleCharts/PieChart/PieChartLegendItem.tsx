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
import { clamp01 } from '../lib/clamp01';
import { pieChartLegendItemVariants } from './classes';
import {
  PieChartActiveContext,
  PieChartDataContext,
  PieChartItemContext,
  PieChartSelectionContext,
} from './PieChartContext';

export interface PieChartLegendItemProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /**
   * Identifier matching a `PieChartDatum.name` from the root `data` prop.
   * Drives both the percent calculation and the bidirectional hover sync with the donut slice.
   */
  name: string;
  /**
   * Optional override for the value used in the percent calculation. Defaults to looking
   * the value up from the root `data` array by `name`. Pass an explicit value when the
   * legend renders entries that are not part of the donut (e.g. a synthetic "Other" row).
   */
  value?: number;
  /**
   * Visually marks the row as the selected/filtered datum — applies `bg-states-primary-active`
   * and `aria-current`. When omitted, the row falls back to membership in the root's
   * `selectedNames` set (if provided). When passed explicitly (`true` or `false`) it
   * fully overrides the context — useful when the legend renders rows that aren't part
   * of the chart's multi-selection (e.g. a single filtered view). The resolved value
   * also feeds the dim calculation: a row resolved to `selected=false` while *some*
   * peer is selected will fade like any other non-selected row.
   */
  selected?: boolean;
}

export const PieChartLegendItem: FC<PieChartLegendItemProps> = ({
  name,
  value,
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
  const dataCtx = useContext(PieChartDataContext);
  const { activeName } = useContext(PieChartActiveContext);
  const { selectedSet } = useContext(PieChartSelectionContext);

  const interactive = typeof onClick === 'function';
  const active = activeName === name;
  const selected = selectedProp ?? selectedSet.has(name);
  const dimmed = !selected && !active && selectedSet.size > 0;

  const ratio = useMemo(() => {
    if (!dataCtx?.isValidTotal) return 0;
    const lookupValue = value ?? dataCtx.byName.get(name)?.value ?? 0;
    if (!Number.isFinite(lookupValue)) return 0;
    return clamp01(lookupValue / dataCtx.total);
  }, [dataCtx, name, value]);

  const itemValue = useMemo(
    () => ({ ratio, selected, interactive, name, active }),
    [ratio, selected, interactive, name, active],
  );

  const setActive = dataCtx?.setActive;

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      onMouseEnter?.(event);
      if (event.defaultPrevented) return;
      setActive?.(name);
    },
    [onMouseEnter, setActive, name],
  );

  const handleMouseLeave = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(event);
      if (event.defaultPrevented) return;
      setActive?.(null);
    },
    [onMouseLeave, setActive],
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      onFocus?.(event);
      if (event.defaultPrevented) return;
      setActive?.(name);
    },
    [onFocus, setActive, name],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      onBlur?.(event);
      if (event.defaultPrevented) return;
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
    <PieChartItemContext.Provider value={itemValue}>
      <div
        {...props}
        ref={ref}
        data-slot='pie-chart-legend-item'
        data-testid={testId}
        data-name={name}
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
          pieChartLegendItemVariants({ interactive, active, selected, dimmed }),
          className,
        )}
      >
        {children}
      </div>
    </PieChartItemContext.Provider>
  );
};

PieChartLegendItem.displayName = 'PieChartLegendItem';

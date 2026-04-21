import { type FC, type HTMLAttributes, type Ref, useCallback, useEffect, useMemo } from 'react';
import { useControlled } from '../../../hooks';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import { pieChartRootClasses } from './classes';
import {
  EMPTY_SELECTION,
  PieChartActiveContext,
  type PieChartActiveContextValue,
  PieChartDataContext,
  type PieChartDataContextValue,
  type PieChartDatum,
  PieChartSelectionContext,
  type PieChartSelectionContextValue,
} from './PieChartContext';

export interface PieChartProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /**
   * Each datum's `name` is the join key used by `PieChartLegendItem` to sync hover/active state.
   * Non-finite or negative `value`s are coerced to 0 so recharts can draw them.
   */
  data: PieChartDatum[];
  /**
   * Override for the value used to compute percentages and the centre total.
   * Defaults to `sum(data.value)`. Pass an explicit value when the centre label
   * should reflect a different denominator — e.g. the unfiltered total while
   * the chart shows a filtered view.
   */
  total?: number;
  /**
   * Controlled active slice. When provided, the component does not manage hover state
   * internally — the parent must update it via `onActiveNameChange`.
   */
  activeName?: string | null;
  onActiveNameChange?: (name: string | null) => void;
  /**
   * Multi-selection set. When non-empty, donut slices and legend rows whose `name`
   * is not in the set fade so emphasis lands on the chosen group. Hover
   * (`activeName`) wins — while the user points at a specific slice, only that one
   * stays bright. Names not present in `data` are ignored.
   *
   * Pass a stable reference (`useMemo`/state) — an inline array literal recreates
   * on every parent render and invalidates the internal Set memo.
   */
  selectedNames?: string[];
}

const sanitizeValue = (n: unknown): number => {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) return 0;
  return n;
};

export const PieChart: FC<PieChartProps> = ({
  data,
  total,
  activeName: controlledActiveName,
  onActiveNameChange,
  selectedNames,
  className,
  children,
  ref,
  'data-testid': testId,
  ...props
}) => {
  const sanitizedData = useMemo<PieChartDatum[]>(
    () => data.map(d => ({ ...d, value: sanitizeValue(d.value) })),
    [data],
  );

  const { byName, computedTotal, hasDuplicateNames } = useMemo(() => {
    const map = new Map<string, PieChartDatum>();
    let sum = 0;
    let duplicates = false;
    for (const d of sanitizedData) {
      if (map.has(d.name)) duplicates = true;
      map.set(d.name, d);
      sum += d.value;
    }
    return { byName: map, computedTotal: sum, hasDuplicateNames: duplicates };
  }, [sanitizedData]);

  useEffect(() => {
    if (hasDuplicateNames && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        '[PieChart] `data` contains duplicate `name` values. Names are used as the join key for ' +
          'percent lookup, hover sync, and React reconciliation — duplicates will produce ' +
          'incorrect percentages, ambiguous hover, and unstable rendering. Provide unique names.',
      );
    }
  }, [hasDuplicateNames]);

  const resolvedTotal = typeof total === 'number' && Number.isFinite(total) ? total : computedTotal;
  const isValidTotal = resolvedTotal > 0;

  const [activeNameValue, setInternalActiveName] = useControlled<string | null>({
    controlled: controlledActiveName,
    default: null,
  });
  const rawActiveName = activeNameValue ?? null;
  // Normalize hover state against the current dataset: if the previously hovered slice
  // disappears (filter, refresh, controlled cross-chart sync), drop the highlight rather
  // than dimming every slice. The internal state can stay stale — the next hover
  // overwrites it; this just prevents the "all slices dimmed" failure mode.
  const activeName = rawActiveName !== null && byName.has(rawActiveName) ? rawActiveName : null;

  // In controlled mode, push the normalization upstream so sibling charts sharing
  // the same `activeName` state don't keep highlighting a name that no longer exists.
  // Uncontrolled mode is fine via the in-render mask above — there's no consumer to sync.
  useEffect(() => {
    if (
      controlledActiveName !== undefined &&
      controlledActiveName !== null &&
      !byName.has(controlledActiveName)
    ) {
      onActiveNameChange?.(null);
    }
  }, [controlledActiveName, byName, onActiveNameChange]);

  const setActive = useCallback(
    (name: string | null) => {
      setInternalActiveName(name);
      onActiveNameChange?.(name);
    },
    [setInternalActiveName, onActiveNameChange],
  );

  const selectedSet = useMemo<Set<string>>(() => {
    if (!selectedNames?.length) return EMPTY_SELECTION;
    const set = new Set<string>();
    for (const name of selectedNames) {
      if (byName.has(name)) set.add(name);
    }
    return set.size > 0 ? set : EMPTY_SELECTION;
  }, [selectedNames, byName]);

  const dataValue = useMemo<PieChartDataContextValue>(
    () => ({
      data: sanitizedData,
      byName,
      total: resolvedTotal,
      isValidTotal,
      setActive,
    }),
    [sanitizedData, byName, resolvedTotal, isValidTotal, setActive],
  );

  const activeValue = useMemo<PieChartActiveContextValue>(() => ({ activeName }), [activeName]);

  const selectionValue = useMemo<PieChartSelectionContextValue>(
    () => ({ selectedSet }),
    [selectedSet],
  );

  return (
    <PieChartDataContext.Provider value={dataValue}>
      <PieChartActiveContext.Provider value={activeValue}>
        <PieChartSelectionContext.Provider value={selectionValue}>
          <TestIdProvider value={testId}>
            <div
              {...props}
              ref={ref}
              data-slot='pie-chart'
              data-testid={testId}
              className={cn(pieChartRootClasses, className)}
            >
              {children}
            </div>
          </TestIdProvider>
        </PieChartSelectionContext.Provider>
      </PieChartActiveContext.Provider>
    </PieChartDataContext.Provider>
  );
};

PieChart.displayName = 'PieChart';

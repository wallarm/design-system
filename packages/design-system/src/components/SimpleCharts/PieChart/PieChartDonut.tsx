import {
  type FC,
  type HTMLAttributes,
  type ReactElement,
  type MouseEvent as ReactMouseEvent,
  type Ref,
  useCallback,
  useContext,
} from 'react';
import { Pie, type PieSectorShapeProps, PieChart as RechartsPieChart, Sector } from 'recharts';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { pieChartDonutClasses } from './classes';
import {
  PIE_DONUT_ANIMATION_BEGIN,
  PIE_DONUT_ANIMATION_DURATION,
  PIE_DONUT_CORNER_RADIUS,
  PIE_DONUT_INNER_RADIUS,
  PIE_DONUT_OUTER_RADIUS,
  PIE_DONUT_PADDING_ANGLE,
  PIE_DONUT_SIZE,
  PIE_SLICE_FILL,
} from './constants';
import {
  isHoverSyncTarget,
  PieChartActiveContext,
  PieChartDataContext,
  type PieChartDatum,
  PieChartSelectionContext,
} from './PieChartContext';

export interface PieChartDonutProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /**
   * Opacity applied to slices that are not currently hovered. Defaults to `0.3`.
   * Set to `1` to disable the hover-dim effect.
   */
  inactiveOpacity?: number;
  /**
   * Disable the recharts mount/transition animation. Defaults to `false`.
   * Set `true` in test/screenshot environments where deterministic frames matter.
   */
  disableAnimation?: boolean;
}

const PLACEHOLDER_DATA: PieChartDatum[] = [{ name: '', value: 1 }];

export const PieChartDonut: FC<PieChartDonutProps> = ({
  inactiveOpacity = 0.3,
  disableAnimation = false,
  className,
  children,
  ref,
  ...props
}) => {
  const testId = useTestId('donut');
  const dataCtx = useContext(PieChartDataContext);
  const { activeName } = useContext(PieChartActiveContext);
  const { selectedSet } = useContext(PieChartSelectionContext);

  const handleEnter = useCallback(
    (_payload: unknown, index: number) => {
      // When total <= 0 the donut renders PLACEHOLDER_DATA, but recharts still
      // fires hover events whose index would resolve to a real datum and activate
      // an arbitrary legend row. Bail out so the placeholder ring stays inert.
      if (!dataCtx?.isValidTotal) return;
      const datum = dataCtx.data[index];
      if (datum) dataCtx.setActive(datum.name);
    },
    [dataCtx],
  );

  const handleLeave = useCallback(
    // Recharts passes (data, index, event) on Pie's leave; we only need
    // `relatedTarget`. See `isHoverSyncTarget` in PieChartContext for the
    // flicker rationale.
    (_data: unknown, _index: number, event?: ReactMouseEvent) => {
      if (event && isHoverSyncTarget(event.relatedTarget)) return;
      dataCtx?.setActive(null);
    },
    [dataCtx],
  );

  const isValidTotal = !!dataCtx?.isValidTotal;
  const isMultiSlice = isValidTotal && dataCtx.data.length > 1;

  // Recharts 3.x deprecated <Cell>; the migration path is the `shape` prop, which
  // receives the per-sector geometry plus the original datum (as `payload`) and
  // returns the SVG element to render. We use it to apply our palette fill, the
  // hover-dim opacity, and the data-* hooks E2E selectors rely on.
  const renderSlice = useCallback(
    (sectorProps: PieSectorShapeProps): ReactElement => {
      // `isActive` and `index` are recharts-only flags; strip before spreading to <Sector>.
      const { isActive: _isActive, index: _index, payload, ...sectorRest } = sectorProps;

      if (!isValidTotal) {
        return (
          <Sector
            {...sectorRest}
            fill='var(--color-border-primary-light)'
            opacity={1}
            stroke='none'
          />
        );
      }

      const datum = payload as PieChartDatum | undefined;
      const name = datum?.name ?? '';
      const fill = datum?.className ? undefined : PIE_SLICE_FILL[datum?.color ?? 'slate'];
      const isActive = activeName === name;
      const isSelected = selectedSet.has(name);

      let opacity = 1;
      if (activeName !== null) opacity = isActive ? 1 : inactiveOpacity;
      else if (selectedSet.size > 0) opacity = isSelected ? 1 : inactiveOpacity;

      return (
        <Sector
          {...sectorRest}
          fill={fill}
          opacity={opacity}
          stroke='none'
          className={cn('outline-none transition-opacity duration-150 ease-out', datum?.className)}
          data-slot='pie-chart-slice'
          data-name={name}
          data-active={isActive ? 'true' : undefined}
        />
      );
    },
    [isValidTotal, activeName, inactiveOpacity, selectedSet],
  );

  const pieData = isValidTotal ? dataCtx.data : PLACEHOLDER_DATA;

  return (
    <div
      {...props}
      ref={ref}
      data-slot='pie-chart-donut'
      data-testid={testId}
      aria-hidden='true'
      className={cn(pieChartDonutClasses, className)}
    >
      <RechartsPieChart
        width={PIE_DONUT_SIZE}
        height={PIE_DONUT_SIZE}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        // Disable recharts' built-in keyboard a11y layer — it puts `tabindex=0` on
        // the SVG (`role="application"`), which contradicts our `aria-hidden` on the
        // wrapper. The legend rows are the canonical accessible representation.
        accessibilityLayer={false}
      >
        <Pie
          data={pieData}
          dataKey='value'
          nameKey='name'
          cx='50%'
          cy='50%'
          innerRadius={PIE_DONUT_INNER_RADIUS}
          outerRadius={PIE_DONUT_OUTER_RADIUS}
          startAngle={90}
          endAngle={-270}
          cornerRadius={isMultiSlice ? PIE_DONUT_CORNER_RADIUS : 0}
          paddingAngle={isMultiSlice ? PIE_DONUT_PADDING_ANGLE : 0}
          stroke='none'
          isAnimationActive={disableAnimation ? false : 'auto'}
          animationBegin={PIE_DONUT_ANIMATION_BEGIN}
          animationDuration={PIE_DONUT_ANIMATION_DURATION}
          animationEasing='ease-out'
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          shape={renderSlice}
        />
      </RechartsPieChart>
      {children}
    </div>
  );
};

PieChartDonut.displayName = 'PieChartDonut';

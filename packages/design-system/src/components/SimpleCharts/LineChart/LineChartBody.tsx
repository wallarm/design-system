import {
  type FC,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
} from 'react';
import { LineChart as RechartsLineChart, ResponsiveContainer } from 'recharts';
import type { CategoricalChartFunc } from 'recharts/types/chart/types';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { lineChartBodyClasses, lineChartBodyZoomEnabledClasses } from './classes';
import { LINE_CARD_HEIGHT, LINE_DEFAULT_BODY_MARGIN, LINE_HEADER_HEIGHT } from './constants';
import { LineChartDataContext, LineChartZoomContext } from './LineChartContext';

const DEFAULT_BODY_HEIGHT = LINE_CARD_HEIGHT - LINE_HEADER_HEIGHT;

type RechartsMouseHandler = CategoricalChartFunc<ReactMouseEvent<SVGGraphicsElement>>;

// Recharts returns `activeTooltipIndex` as a stringified integer at runtime
// (`combineActiveTooltipIndex` → `String(clampedIndex)`). Coerce so the public
// API stays `number | null`.
const toTooltipIndex = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export interface LineChartBodyProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Recharts subcomponents — `<XAxis>`, `<YAxis>`, `<CartesianGrid>`, `<Line>`, `<Tooltip>`, `<Brush>`. */
  children?: ReactNode;
  /**
   * Body height passed to recharts' `<ResponsiveContainer>`. Defaults to the
   * Figma single-line plot height (`LINE_CARD_HEIGHT - LINE_HEADER_HEIGHT`).
   */
  height?: number;
}

export const LineChartBody: FC<LineChartBodyProps> = ({
  height = DEFAULT_BODY_HEIGHT,
  className,
  ref,
  children,
  ...props
}) => {
  const testId = useTestId('body');
  const dataCtx = useContext(LineChartDataContext);
  const zoomCtx = useContext(LineChartZoomContext);
  const isZoomEnabled = zoomCtx?.enabled ?? false;
  const isZoomDragging = zoomCtx?.drag != null;

  const handleMouseDown = useCallback<RechartsMouseHandler>(
    (state, event) => {
      if (!zoomCtx?.enabled) return;
      const index = toTooltipIndex(state.activeTooltipIndex);
      if (index === null) return;
      // Suppress recharts' own text selection of axis ticks during a zoom drag.
      event.preventDefault();
      zoomCtx.startDrag(index, event.clientX, event.clientY);
    },
    [zoomCtx],
  );

  // Tracks the in-progress zoom selection; tooltip and `syncId` are owned by recharts.
  const handleMouseMove = useCallback<RechartsMouseHandler>(
    (state, event) => {
      if (!zoomCtx?.drag) return;
      const next = toTooltipIndex(state.activeTooltipIndex);
      if (next === null) return;
      zoomCtx.updateDrag(next, event.clientX, event.clientY);
    },
    [zoomCtx],
  );

  return (
    <div
      {...props}
      ref={ref}
      data-slot='line-chart-body'
      data-testid={testId}
      aria-hidden='true'
      data-zoom-active={isZoomDragging ? 'true' : undefined}
      className={cn(
        lineChartBodyClasses,
        isZoomEnabled && lineChartBodyZoomEnabledClasses,
        className,
      )}
    >
      <ResponsiveContainer width='100%' height={height}>
        <RechartsLineChart
          data={dataCtx?.data ?? []}
          margin={LINE_DEFAULT_BODY_MARGIN}
          // Recharts' default a11y layer puts `tabindex=0`/`role='application'`
          // on the SVG, conflicting with this wrapper's `aria-hidden`. Legend
          // rows are the canonical accessible surface.
          accessibilityLayer={false}
          syncId={dataCtx?.syncId}
          syncMethod={dataCtx?.syncMethod}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          {children}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

LineChartBody.displayName = 'LineChartBody';

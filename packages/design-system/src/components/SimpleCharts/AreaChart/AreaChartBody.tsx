import {
  type FC,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
} from 'react';
import { AreaChart as RechartsAreaChart, ResponsiveContainer } from 'recharts';
import type { CategoricalChartFunc } from 'recharts/types/chart/types';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { LineChartDataContext, LineChartZoomContext } from '../LineChart/LineChartContext';
import { areaChartBodyClasses, areaChartBodyZoomEnabledClasses } from './classes';
import { AREA_CARD_HEIGHT, AREA_DEFAULT_BODY_MARGIN, AREA_HEADER_HEIGHT } from './constants';

const DEFAULT_BODY_HEIGHT = AREA_CARD_HEIGHT - AREA_HEADER_HEIGHT;

type RechartsMouseHandler = CategoricalChartFunc<ReactMouseEvent<SVGGraphicsElement>>;

const toTooltipIndex = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export interface AreaChartBodyProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Recharts subcomponents — `<XAxis>`, `<YAxis>`, `<CartesianGrid>`, `<Area>`, `<Tooltip>`, `<Brush>`. */
  children?: ReactNode;
  /** Body height passed to recharts' `<ResponsiveContainer>`. */
  height?: number;
}

export const AreaChartBody: FC<AreaChartBodyProps> = ({
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
      event.preventDefault();
      zoomCtx.startDrag(index, event.clientX, event.clientY);
    },
    [zoomCtx],
  );

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
      data-slot='area-chart-body'
      data-testid={testId}
      aria-hidden='true'
      data-zoom-active={isZoomDragging ? 'true' : undefined}
      className={cn(
        areaChartBodyClasses,
        isZoomEnabled && areaChartBodyZoomEnabledClasses,
        className,
      )}
    >
      <ResponsiveContainer width='100%' height={height}>
        <RechartsAreaChart
          data={dataCtx?.data ?? []}
          margin={AREA_DEFAULT_BODY_MARGIN}
          accessibilityLayer={false}
          syncId={dataCtx?.syncId}
          syncMethod={dataCtx?.syncMethod}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          {children}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

AreaChartBody.displayName = 'AreaChartBody';

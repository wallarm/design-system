import {
  type FC,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useContext,
  useState,
} from 'react';
import { ComposedChart, ResponsiveContainer } from 'recharts';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { LineChartDataContext } from '../LineChart/LineChartContext';
import { BarChartTotalContext, type BarChartTotalPlacement } from './BarChartContext';
import { BarChartRowHover } from './BarChartRowHover';
import { barChartBodyClasses } from './classes';
import {
  BAR_RESIZE_DEBOUNCE_MS,
  BAR_ROW_HEIGHT,
  BAR_ROW_INSET,
  BAR_TOTAL_WIDTH,
} from './constants';

// The row inset on both sides, plus the total column when it sits on the right.
const BODY_MARGIN = { top: 0, right: BAR_ROW_INSET, bottom: 0, left: BAR_ROW_INSET };
const BODY_MARGIN_TOTAL_END = { ...BODY_MARGIN, right: BAR_ROW_INSET + BAR_TOTAL_WIDTH };

export interface BarChartBodyProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Plot slots — `<BarChartXAxis>`, `<BarChartYAxis>`, `<BarChartStack>`, `<BarChartTooltip>`. */
  children?: ReactNode;
  /**
   * Fixed plot height in pixels. Leave it unset and the plot grows with the data: one 32px row
   * per category.
   */
  height?: number;
  /**
   * Where the row total sits: `'end'` (default) — a column on the right edge, `'start'` —
   * between the label and the bar, `false` — no total.
   */
  total?: BarChartTotalPlacement;
}

export const BarChartBody: FC<BarChartBodyProps> = ({
  height,
  total = 'end',
  className,
  ref,
  children,
  onMouseMove,
  onMouseLeave,
  ...props
}) => {
  const testId = useTestId('body');
  const dataCtx = useContext(LineChartDataContext);
  const rows = dataCtx?.data.length ?? 0;
  const plotHeight = height ?? rows * BAR_ROW_HEIGHT;

  // The row hover covers the whole row — label, bar and total — so the pointer is tracked on
  // the body, not through recharts (its tooltip only knows the plot area).
  const [pointerY, setPointerY] = useState<number | null>(null);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    onMouseMove?.(event);
    setPointerY(event.clientY - event.currentTarget.getBoundingClientRect().top);
  };

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(event);
    setPointerY(null);
  };

  return (
    <div
      {...props}
      ref={ref}
      data-slot='bar-chart-body'
      data-testid={testId}
      aria-hidden='true'
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(barChartBodyClasses, className)}
    >
      <BarChartTotalContext.Provider value={total}>
        <ResponsiveContainer width='100%' height={plotHeight} debounce={BAR_RESIZE_DEBOUNCE_MS}>
          <ComposedChart
            layout='vertical'
            data={dataCtx?.data ?? []}
            margin={total === 'end' ? BODY_MARGIN_TOTAL_END : BODY_MARGIN}
            // Same as `LineChartBody`: the legend is the accessible surface, the plot is `aria-hidden`.
            accessibilityLayer={false}
          >
            <BarChartRowHover pointerY={pointerY} rows={rows} />
            {children}
          </ComposedChart>
        </ResponsiveContainer>
      </BarChartTotalContext.Provider>
    </div>
  );
};

BarChartBody.displayName = 'BarChartBody';

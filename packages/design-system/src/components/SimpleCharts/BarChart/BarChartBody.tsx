import { type FC, type HTMLAttributes, type ReactNode, type Ref, useContext } from 'react';
import { ComposedChart, ResponsiveContainer } from 'recharts';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { LineChartDataContext } from '../LineChart/LineChartContext';
import { barChartBodyClasses } from './classes';
import {
  BAR_DEFAULT_BODY_MARGIN,
  BAR_RESIZE_DEBOUNCE_MS,
  BAR_ROW_HEIGHT,
  BAR_VALUE_LABEL_HEIGHT,
} from './constants';

export interface BarChartBodyProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Plot slots — `<BarChartGrid>`, `<BarChartXAxis>`, `<BarChartYAxis>`, `<BarChartStack>`, `<BarChartTooltip>`. */
  children?: ReactNode;
  /**
   * Fixed plot height in pixels. Leave it unset and the plot grows with the data: one 28px row
   * per category plus the 16px value-label band.
   */
  height?: number;
}

export const BarChartBody: FC<BarChartBodyProps> = ({
  height,
  className,
  ref,
  children,
  ...props
}) => {
  const testId = useTestId('body');
  const dataCtx = useContext(LineChartDataContext);
  const rows = dataCtx?.data.length ?? 0;
  const plotHeight = height ?? rows * BAR_ROW_HEIGHT + BAR_VALUE_LABEL_HEIGHT;

  return (
    <div
      {...props}
      ref={ref}
      data-slot='bar-chart-body'
      data-testid={testId}
      aria-hidden='true'
      className={cn(barChartBodyClasses, className)}
    >
      <ResponsiveContainer width='100%' height={plotHeight} debounce={BAR_RESIZE_DEBOUNCE_MS}>
        {/* `ComposedChart`, not `BarChart`: recharts draws a band-wide rectangle cursor for its
            `BarChart` and a line for every other chart, and the hover ruler is a line. In the
            vertical layout that line runs through the middle of the hovered bar. */}
        <ComposedChart
          layout='vertical'
          data={dataCtx?.data ?? []}
          margin={BAR_DEFAULT_BODY_MARGIN}
          // Same as `LineChartBody`: the legend is the accessible surface, the plot is `aria-hidden`.
          accessibilityLayer={false}
        >
          {children}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

BarChartBody.displayName = 'BarChartBody';

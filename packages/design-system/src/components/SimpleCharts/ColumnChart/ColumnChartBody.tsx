import { type FC, type HTMLAttributes, type ReactNode, type Ref, useContext } from 'react';
import { ComposedChart, ResponsiveContainer } from 'recharts';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { LineChartDataContext } from '../LineChart/LineChartContext';
import { columnChartBodyClasses } from './classes';
import { COLUMN_CARD_HEIGHT, COLUMN_DEFAULT_BODY_MARGIN, COLUMN_HEADER_HEIGHT } from './constants';

const DEFAULT_BODY_HEIGHT = COLUMN_CARD_HEIGHT - COLUMN_HEADER_HEIGHT;

export interface ColumnChartBodyProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Plot slots — `<LineChartGrid>`, `<ColumnChartXAxis>`, `<LineChartYAxis>`, `<ColumnChartStack>`, `<LineChartTooltip>`. */
  children?: ReactNode;
  /** Plot height passed to recharts' `<ResponsiveContainer>`. Defaults to the Figma 164px. */
  height?: number;
}

export const ColumnChartBody: FC<ColumnChartBodyProps> = ({
  height = DEFAULT_BODY_HEIGHT,
  className,
  ref,
  children,
  ...props
}) => {
  const testId = useTestId('body');
  const dataCtx = useContext(LineChartDataContext);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='column-chart-body'
      data-testid={testId}
      aria-hidden='true'
      className={cn(columnChartBodyClasses, className)}
    >
      <ResponsiveContainer width='100%' height={height}>
        {/* `ComposedChart`, not `BarChart`: recharts draws a rectangle cursor for `BarChart` and
            a line for every other chart, and the hover ruler is a line. The bars still sit on a
            band scale, so the `LineChartTooltip` cursor lands on each column's centre. */}
        <ComposedChart
          data={dataCtx?.data ?? []}
          margin={COLUMN_DEFAULT_BODY_MARGIN}
          // Same as `LineChartBody`: the legend is the accessible surface, the plot is `aria-hidden`.
          accessibilityLayer={false}
        >
          {children}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

ColumnChartBody.displayName = 'ColumnChartBody';

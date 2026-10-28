import { type FC, type HTMLAttributes, type ReactNode, type Ref, useContext } from 'react';

import { ComposedChart, ResponsiveContainer } from 'recharts';

import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { LineChartDataContext } from '../LineChart/LineChartContext';
import {
  columnChartBodyClasses,
  columnChartBodyFillClasses,
  columnChartContainerFillClasses,
} from './classes';
import { COLUMN_DEFAULT_BODY_MARGIN } from './constants';

export interface ColumnChartBodyProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Plot slots — `<LineChartGrid>`, `<ColumnChartXAxis>`, `<LineChartYAxis>`, `<ColumnChartStack>`, `<LineChartTooltip>`. */
  children?: ReactNode;
  /**
   * Fixed plot height in pixels. Leave it unset to follow the card: the plot starts at the
   * Figma 164px (card 220) and grows or shrinks with the `<Chart>` height, down to a 128px card.
   */
  height?: number;
}

export const ColumnChartBody: FC<ColumnChartBodyProps> = ({
  height,
  className,
  ref,
  children,
  ...props
}) => {
  const testId = useTestId('body');
  const dataCtx = useContext(LineChartDataContext);
  const fill = height === undefined;

  return (
    <div
      {...props}
      ref={ref}
      data-slot='column-chart-body'
      data-testid={testId}
      aria-hidden='true'
      className={cn(columnChartBodyClasses, fill && columnChartBodyFillClasses, className)}
    >
      <ResponsiveContainer
        width='100%'
        height={height ?? '100%'}
        className={fill ? columnChartContainerFillClasses : undefined}
      >
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

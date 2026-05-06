import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import {
  lineChartEmptyMessageClasses,
  lineChartEmptyMessageTextClasses,
  lineChartEmptyRootClasses,
} from './classes';
import {
  LINE_CARD_HEIGHT,
  LINE_DEFAULT_BODY_MARGIN,
  LINE_GRID_DASHARRAY,
  LINE_HEADER_HEIGHT,
  LINE_X_LABEL_HEIGHT,
  LINE_Y_LABEL_WIDTH,
} from './constants';

const DEFAULT_BODY_HEIGHT = LINE_CARD_HEIGHT - LINE_HEADER_HEIGHT;

// Three dashed grid lines + one solid x-axis line per Figma `8670-2594`.
const EMPTY_GRID_LINES = 3;

export interface LineChartEmptyProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Body height override. Defaults to the standard plot height. */
  height?: number;
  /**
   * Empty-state message. Pass the copy you want to render (`"No data"`, a
   * localised string, or richer JSX). Omit (or pass `null`) to render only
   * the dashed grid frame — the idiom for loading skeletons. There is no
   * default text.
   */
  children?: ReactNode;
}

export const LineChartEmpty: FC<LineChartEmptyProps> = ({
  height = DEFAULT_BODY_HEIGHT,
  className,
  children,
  ref,
  'data-testid': testId,
  ...props
}) => {
  // Axis sits at the top of the x-label area — same position as in a populated
  // chart, where recharts reserves `LINE_X_LABEL_HEIGHT` of vertical space for
  // tick labels below the plot. Grid lines are distributed inside the plot
  // area, above the axis.
  const axisY = Math.max(0, height - LINE_X_LABEL_HEIGHT);
  const lines = Array.from(
    { length: EMPTY_GRID_LINES },
    (_, i) => (axisY * (i + 1)) / (EMPTY_GRID_LINES + 1),
  );

  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-slot='line-chart-empty'
        data-testid={testId}
        className={cn(lineChartEmptyRootClasses, className)}
        style={{ height }}
      >
        <svg
          height={height}
          preserveAspectRatio='none'
          aria-hidden='true'
          className='absolute top-0'
          // Inset matches a populated chart's plot area: left = y-axis label
          // width, right = body margin. Lines stay clear of the card's rounded
          // corners and read as the same rails consumers see with data.
          style={{
            left: LINE_Y_LABEL_WIDTH,
            width: `calc(100% - ${LINE_Y_LABEL_WIDTH + LINE_DEFAULT_BODY_MARGIN.right}px)`,
          }}
          data-slot='line-chart-empty-grid'
        >
          {lines.map((y, i) => (
            <line
              key={i}
              x1='0'
              x2='100%'
              y1={y}
              y2={y}
              stroke='var(--color-border-primary-light)'
              strokeDasharray={LINE_GRID_DASHARRAY}
              strokeWidth={1}
            />
          ))}
          <line
            x1='0'
            x2='100%'
            y1={axisY}
            y2={axisY}
            stroke='var(--color-border-primary-light)'
            strokeWidth={1}
            data-slot='line-chart-empty-axis'
          />
        </svg>
        {children != null && (
          <div
            className={lineChartEmptyMessageClasses}
            // Align the message to the plot area (above the axis), matching
            // where the chart's mid-grid line sits when there is data.
            style={{ height: axisY }}
          >
            <span className={lineChartEmptyMessageTextClasses}>{children}</span>
          </div>
        )}
      </div>
    </TestIdProvider>
  );
};

LineChartEmpty.displayName = 'LineChartEmpty';

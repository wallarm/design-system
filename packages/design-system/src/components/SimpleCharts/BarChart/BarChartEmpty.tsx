import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import {
  lineChartEmptyMessageClasses,
  lineChartEmptyMessageTextClasses,
  lineChartEmptyRootClasses,
} from '../LineChart/classes';
import { LINE_GRID_DASHARRAY } from '../LineChart/constants';
import {
  BAR_CATEGORY_LABEL_WIDTH,
  BAR_DEFAULT_BODY_MARGIN,
  BAR_ROW_HEIGHT,
  BAR_VALUE_LABEL_HEIGHT,
} from './constants';

// `LineChartEmpty` turned on its side: three dashed value lines and the solid category axis.
const EMPTY_GRID_LINES = 3;

/** Rows the empty frame is sized for when neither `rows` nor `height` is given. */
const DEFAULT_ROWS = 5;

export interface BarChartEmptyProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /**
   * Size the frame for this many bars (28px each, plus the value-label band) — pass the row
   * count the loaded chart will have, so the card does not jump when data arrives. Default 5.
   */
  rows?: number;
  /** Fixed frame height in pixels. Overrides `rows`. */
  height?: number;
  /** Width of the category label gutter. Match the chart's `BarChartYAxis width`. Default 96px. */
  labelWidth?: number;
  /**
   * Empty-state message, centred in the plot. Omit it for a bare frame — the loading
   * skeleton idiom. There is no default text.
   */
  children?: ReactNode;
}

/**
 * The bar chart's empty / loading frame: the plot's dashed vertical grid and solid category axis
 * with no bars, and an optional message in the middle. Compose it in place of `<BarChart>`.
 */
export const BarChartEmpty: FC<BarChartEmptyProps> = ({
  rows = DEFAULT_ROWS,
  height,
  labelWidth = BAR_CATEGORY_LABEL_WIDTH,
  className,
  children,
  ref,
  'data-testid': testId,
  ...props
}) => {
  const frameHeight = height ?? rows * BAR_ROW_HEIGHT + BAR_VALUE_LABEL_HEIGHT;
  // The axis runs down to the value-label band, as in a populated chart.
  const plotHeight = Math.max(0, frameHeight - BAR_VALUE_LABEL_HEIGHT);
  const lines = Array.from(
    { length: EMPTY_GRID_LINES },
    (_, i) => `${((i + 1) * 100) / (EMPTY_GRID_LINES + 1)}%`,
  );
  // Inset matches a populated chart's plot area: left = label gutter, right = body margin.
  const plotInset = { left: labelWidth, right: BAR_DEFAULT_BODY_MARGIN.right };

  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-slot='bar-chart-empty'
        data-testid={testId}
        className={cn(lineChartEmptyRootClasses, className)}
        style={{ height: frameHeight }}
      >
        <svg
          height={plotHeight}
          aria-hidden='true'
          className='absolute top-0'
          style={{
            ...plotInset,
            width: `calc(100% - ${plotInset.left + plotInset.right}px)`,
          }}
          data-slot='bar-chart-empty-grid'
        >
          {lines.map(x => (
            <line
              key={x}
              x1={x}
              x2={x}
              y1={0}
              y2={plotHeight}
              stroke='var(--color-border-primary-light)'
              strokeDasharray={LINE_GRID_DASHARRAY}
              strokeWidth={1}
            />
          ))}
          {/* Half a pixel in, so the 1px axis is not cut in half by the SVG edge. */}
          <line
            x1={0.5}
            x2={0.5}
            y1={0}
            y2={plotHeight}
            stroke='var(--color-border-primary-light)'
            strokeWidth={1}
            data-slot='bar-chart-empty-axis'
          />
        </svg>
        {children != null && (
          <div
            className={lineChartEmptyMessageClasses}
            // Centre the message on the plot, not on the whole card with its label gutter.
            style={{ ...plotInset, height: plotHeight }}
          >
            <span className={lineChartEmptyMessageTextClasses}>{children}</span>
          </div>
        )}
      </div>
    </TestIdProvider>
  );
};

BarChartEmpty.displayName = 'BarChartEmpty';

import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import { Skeleton } from '../../Skeleton';
import {
  barChartEmptyMessageClasses,
  barChartEmptyRootClasses,
  barChartEmptyRowClasses,
} from './classes';
import {
  BAR_BODY_BOTTOM_PADDING,
  BAR_CATEGORY_LABEL_GAP,
  BAR_CATEGORY_LABEL_WIDTH,
  BAR_ROW_HEIGHT,
  BAR_THICKNESS,
} from './constants';

/** Rows the frame is sized for when neither `rows` nor `height` is given. */
const DEFAULT_ROWS = 5;

export interface BarChartEmptyProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /**
   * Size the frame for this many rows (32px each) — pass the row count the loaded chart will
   * have, so the card does not jump when data arrives. Default 5.
   */
  rows?: number;
  /** Fixed frame height in pixels. Overrides `rows`. */
  height?: number;
  /** Width of the label column. Match the chart's `BarChartYAxis width`. Default 144px. */
  labelWidth?: number;
  /**
   * Empty-state message, centred in the frame. Omit it for the loading state: a skeleton
   * label and bar per row. There is no default text.
   */
  children?: ReactNode;
}

/**
 * The bar chart's empty / loading frame, sized like the loaded plot. With a message it is the
 * empty state; bare, it draws a skeleton row per category — the `BarListSkeleton` idiom.
 * Compose it in place of `<BarChart>`.
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
  const frameHeight = height ?? rows * BAR_ROW_HEIGHT + BAR_BODY_BOTTOM_PADDING;
  const loading = children == null;

  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-slot='bar-chart-empty'
        data-testid={testId}
        className={cn(barChartEmptyRootClasses, className)}
        style={{ height: frameHeight }}
      >
        {loading ? (
          Array.from({ length: rows }, (_, i) => (
            <div key={i} data-slot='bar-chart-empty-row' className={barChartEmptyRowClasses}>
              <Skeleton
                width={`${labelWidth - BAR_CATEGORY_LABEL_GAP}px`}
                height={`${BAR_THICKNESS}px`}
                rounded={4}
              />
              <div className='flex-1 min-w-0'>
                <Skeleton width='100%' height={`${BAR_THICKNESS}px`} rounded={4} />
              </div>
            </div>
          ))
        ) : (
          <div className={barChartEmptyMessageClasses}>{children}</div>
        )}
      </div>
    </TestIdProvider>
  );
};

BarChartEmpty.displayName = 'BarChartEmpty';

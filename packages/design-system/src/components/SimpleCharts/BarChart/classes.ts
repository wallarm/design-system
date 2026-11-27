import { lineChartBodyClasses, lineChartRootClasses } from '../LineChart/classes';

export const barChartRootClasses = lineChartRootClasses;

// Same fade-in as the column/line/area plots (keyframe in `theme/components/chart.css`),
// applied to the bar layer instead of recharts' grow-from-the-axis animation.
export const barChartBodyClasses = [
  lineChartBodyClasses,
  'flex-none pb-8',
  '[&_.recharts-bar]:animate-[ds-chart-fade-in_400ms_ease-out]',
  'motion-reduce:[&_.recharts-bar]:animate-none',
].join(' ');

export const barChartEmptyRootClasses = ['relative w-full overflow-hidden'].join(' ');

// A loading row: the `BarList` row box (32px, 12px inset) with a label and a bar placeholder.
export const barChartEmptyRowClasses = ['flex items-center h-32 px-12 gap-12'].join(' ');

export const barChartEmptyMessageClasses = [
  'absolute inset-0 flex items-center justify-center',
  'text-xs font-mono text-text-secondary',
].join(' ');

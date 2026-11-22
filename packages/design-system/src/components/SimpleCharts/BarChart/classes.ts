import { lineChartBodyClasses, lineChartRootClasses } from '../LineChart/classes';

export const barChartRootClasses = lineChartRootClasses;

// Same fade-in as the column/line/area plots (keyframe in `theme/components/chart.css`),
// applied to the bar layer instead of recharts' grow-from-the-axis animation.
export const barChartBodyClasses = [
  lineChartBodyClasses,
  'flex-none',
  '[&_.recharts-bar]:animate-[ds-chart-fade-in_400ms_ease-out]',
  'motion-reduce:[&_.recharts-bar]:animate-none',
].join(' ');

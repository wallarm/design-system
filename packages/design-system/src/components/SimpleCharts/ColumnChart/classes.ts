import { lineChartBodyClasses } from '../LineChart/classes';

export { lineChartRootClasses as columnChartRootClasses } from '../LineChart/classes';

// Same fade-in as the line/area plots (keyframe in `theme/components/chart.css`),
// applied to the bar layer instead of recharts' grow-from-the-axis animation.
export const columnChartBodyClasses = [
  lineChartBodyClasses,
  '[&_.recharts-bar]:animate-[ds-chart-fade-in_400ms_ease-out]',
  'motion-reduce:[&_.recharts-bar]:animate-none',
].join(' ');

import { lineChartBodyClasses, lineChartRootClasses } from '../LineChart/classes';

// `flex-1` takes the card's height: a taller or shorter `<Chart>` resizes the plot.
export const columnChartRootClasses = [lineChartRootClasses, 'flex-1'].join(' ');

// Without a fixed `height` the body starts at Figma's 164px plot and follows the card, and
// the recharts container is pinned over it — a `100%` height would not resolve inside a
// content-sized flex column.
export const columnChartBodyFillClasses = 'basis-164';
export const columnChartContainerFillClasses = 'absolute inset-0';

// Same fade-in as the line/area plots (keyframe in `theme/components/chart.css`),
// applied to the bar layer instead of recharts' grow-from-the-axis animation.
export const columnChartBodyClasses = [
  lineChartBodyClasses,
  '[&_.recharts-bar]:animate-[ds-chart-fade-in_400ms_ease-out]',
  'motion-reduce:[&_.recharts-bar]:animate-none',
].join(' ');

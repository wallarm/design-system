// `mt-auto` pins the metric (and a sparkline after it) to the bottom of a card stretched taller
// than its content, e.g. by a grid row.
export const metricRootClasses = 'mt-auto flex flex-col items-start px-16 py-8 w-full';

// Baseline row: value + optional total + optional delta. Value↔total read as one unit
// (MetricTotal tucks in via `-ml-2` → 6px), delta sits 8px off the group.
export const metricHeaderClasses = 'flex items-baseline gap-8';

// The headline number: display font, 30px. Matches Figma `heading/3xl/medium` (Font/Sans-display).
export const metricValueClasses =
  'font-sans-display text-3xl font-medium leading-3xl text-text-primary';

// The denominator, one size down from the value; the connector words ("of" / "total") are muted.
// gap-6 inside matches the effective 6px between value and total (header gap-8 minus -ml-2),
// so the whole "91 of 120" run reads with one uniform rhythm (Figma item-spacing/6).
export const metricTotalClasses = '-ml-2 flex items-baseline gap-6';
export const metricTotalValueClasses = 'font-sans-display text-lg font-medium text-text-primary';
export const metricTotalWordClasses = 'text-xs font-normal text-text-secondary';

// The subline under the header.
export const metricCaptionClasses = 'text-xs text-text-secondary';

// Skeleton: the thin caption-line placeholder under the value block.
export const metricSkeletonLineClasses = 'w-full py-4';

// Sparkline: a sibling right after `Metric` inside `Chart`; the metric's `mt-auto` already pins
// both to the card's bottom edge. `px-px` is the Figma 1px inset from the card border.
export const metricSparklineClasses = 'w-full px-px';
export const metricSparklinePlotClasses = 'relative h-48';
// The ruler is an <svg>: `h-full`, since `inset-y-0` leaves a replaced element at its 150px default.
export const metricSparklineRulerClasses =
  'pointer-events-none absolute top-0 h-full w-px -translate-x-1/2 overflow-visible';
// Portalled to `body` so the card's `overflow-clip` doesn't cut it; top-tier like Tooltip.
export const metricSparklinePopoverClasses = 'pointer-events-none fixed z-(--tooltip-z-index)';

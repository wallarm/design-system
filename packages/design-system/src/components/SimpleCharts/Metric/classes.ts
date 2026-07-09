export const metricRootClasses = 'flex flex-col items-start px-16 py-8 w-full';

// Baseline row: value + optional total + optional delta. Value↔total read as one unit
// (MetricTotal tucks in via `-ml-2` → 6px), delta sits 8px off the group.
export const metricHeaderClasses = 'flex items-baseline gap-8';

// The headline number: display font, 30px. Matches Figma `heading/3xl/medium` (Font/Sans-display).
export const metricValueClasses =
  'font-sans-display text-3xl font-medium leading-3xl text-text-primary';

// The denominator, one size down from the value; the connector words ("of" / "total") are muted.
export const metricTotalClasses = '-ml-2 flex items-baseline gap-2';
export const metricTotalValueClasses = 'font-sans-display text-lg font-medium text-text-primary';
export const metricTotalWordClasses = 'text-xs font-normal text-text-secondary';

// The subline under the header.
export const metricCaptionClasses = 'text-xs text-text-secondary';

// Skeleton: the thin caption-line placeholder under the value block.
export const metricSkeletonLineClasses = 'w-full py-4';

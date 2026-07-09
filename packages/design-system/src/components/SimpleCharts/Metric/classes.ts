export const metricRootClasses = 'flex flex-col items-start px-16 py-8 w-full';

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

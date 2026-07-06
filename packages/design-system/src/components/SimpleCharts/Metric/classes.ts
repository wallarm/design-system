export const metricRootClasses = ['flex flex-col items-start px-16 py-8 w-full'].join(' ');

export const metricHeaderClasses = ['flex items-baseline gap-8'].join(' ');

export const metricValueGroupClasses = ['flex items-baseline gap-6'].join(' ');

export const metricValueClasses = [
  'text-3xl font-medium leading-3xl text-text-primary',
].join(' ');

// The `/N` denominator: smaller than the headline value, but still primary text.
export const metricTotalClasses = ['text-lg font-medium text-text-primary'].join(' ');

// The literal "total" word + the caption line: muted secondary text.
export const metricTotalLabelClasses = ['text-xs text-text-secondary'].join(' ');

export const metricCaptionClasses = ['text-xs text-text-secondary'].join(' ');

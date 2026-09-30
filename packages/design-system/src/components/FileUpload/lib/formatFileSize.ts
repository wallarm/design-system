const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/** Binary units, at most one decimal, trailing `.0` dropped: `32 MB`, `40.5 MB`, `512 B`. */
export const formatFileSize = (bytes: number): string => {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  let rounded = unit === 0 ? value : Math.round(value * 10) / 10;
  // 1023.96 KB rounds to 1024 KB — promote to the next unit instead.
  if (rounded >= 1024 && unit < UNITS.length - 1) {
    rounded = Math.round((rounded / 1024) * 10) / 10;
    unit += 1;
  }
  return `${rounded} ${UNITS[unit]}`;
};

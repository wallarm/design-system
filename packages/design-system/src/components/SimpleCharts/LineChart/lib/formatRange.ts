/** Higher-order range formatter — joins `format(from)` and `format(to)` with `→`. */
export const formatRange =
  (format: (value: unknown) => string) =>
  (range: { from: unknown; to: unknown }): string =>
    `${format(range.from)} → ${format(range.to)}`;

/** Stable virtualizer item key: the row id, or the index as fallback. */
export const getRowKey = (rows: { id: string }[], index: number): string | number =>
  rows[index]?.id ?? index;

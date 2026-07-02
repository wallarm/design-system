/** Classifies a data change by comparing the previous first/last row ids to the new rows. */
export const detectDataChange = (
  prevFirstRowId: string | undefined,
  rows: { id: string }[],
  prevLastRowId?: string,
): 'prepend' | 'replace' | 'none' => {
  const currentFirstId = rows[0]?.id;
  if (prevFirstRowId === undefined) return 'none';
  if (currentFirstId === prevFirstRowId) return 'none';
  if (!rows.some(r => r.id === prevFirstRowId)) return 'replace';
  // A true prepend only inserts rows above the old first row, so the old last
  // row is still the last one. A dataset swap that keeps the old first row —
  // e.g. removing a filter restores the superset — grows the tail as well;
  // classifying it as a prepend made the scroll compensation fling the
  // viewport by the row's new depth (AS-1208).
  if (prevLastRowId !== undefined && rows[rows.length - 1]?.id !== prevLastRowId) {
    return 'replace';
  }
  return 'prepend';
};

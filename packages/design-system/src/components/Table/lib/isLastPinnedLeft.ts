/**
 * Checks if a column is the last pinned column on the left side.
 */
export const isLastPinnedLeft = (
  column: { getIsPinned: () => false | 'start' | 'end' },
  allColumns: { getIsPinned: () => false | 'start' | 'end'; id: string }[],
  columnId: string,
): boolean => {
  if (column.getIsPinned() !== 'start') return false;
  const leftPinned = allColumns.filter(c => c.getIsPinned() === 'start');
  return leftPinned[leftPinned.length - 1]?.id === columnId;
};

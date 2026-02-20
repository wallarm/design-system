/**
 * Checks if a column is the last pinned column on the left side.
 */
export function isLastPinnedLeft(
  column: { getIsPinned: () => false | 'left' | 'right' },
  allColumns: { getIsPinned: () => false | 'left' | 'right'; id: string }[],
  columnId: string,
): boolean {
  if (column.getIsPinned() !== 'left') return false;
  const leftPinned = allColumns.filter(c => c.getIsPinned() === 'left');
  return leftPinned[leftPinned.length - 1]?.id === columnId;
}

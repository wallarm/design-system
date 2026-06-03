/** Classifies a data change by comparing the previous first row id to the new rows. */
export const detectDataChange = (
  prevFirstRowId: string | undefined,
  rows: { id: string }[],
): 'prepend' | 'replace' | 'none' => {
  const currentFirstId = rows[0]?.id;
  if (prevFirstRowId === undefined) return 'none';
  if (currentFirstId === prevFirstRowId) return 'none';
  return rows.some(r => r.id === prevFirstRowId) ? 'prepend' : 'replace';
};

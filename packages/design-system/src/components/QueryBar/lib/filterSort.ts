/**
 * Filter items by query and sort: startsWith matches first, then includes.
 * Works with any item type — provide a getText function to extract searchable strings.
 */
export const filterAndSort = <T>(
  items: T[],
  query: string,
  getText: (item: T) => string[],
): T[] => {
  if (!query) return items;
  const q = query.toLowerCase();
  const matches = items.filter(item => getText(item).some(t => t.toLowerCase().includes(q)));
  return matches.sort((a, b) => {
    const aStarts = getText(a).some(t => t.toLowerCase().startsWith(q));
    const bStarts = getText(b).some(t => t.toLowerCase().startsWith(q));
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return 0;
  });
};

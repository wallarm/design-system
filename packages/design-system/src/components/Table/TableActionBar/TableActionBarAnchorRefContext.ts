import { createContext, type RefObject, useContext } from 'react';

/**
 * Shares the DOM node rendered by `TableActionBarAnchor` with
 * `TableActionBarProvider`, which sits above it in the tree (as a parent of
 * `children`, not a direct renderer) and needs the anchor's live
 * `getBoundingClientRect()` to horizontally align the action bar with the
 * table.
 */
export const TableActionBarAnchorRefContext = createContext<RefObject<HTMLDivElement | null> | null>(
  null,
);

export const useTableActionBarAnchorRef = (): RefObject<HTMLDivElement | null> => {
  const ref = useContext(TableActionBarAnchorRefContext);

  if (!ref) {
    throw new Error('useTableActionBarAnchorRef must be used within a TableActionBarProvider');
  }

  return ref;
};

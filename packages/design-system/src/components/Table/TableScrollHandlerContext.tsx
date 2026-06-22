import { createContext, type FC, type ReactNode, useContext, useMemo, useState } from 'react';

interface TableScrollHandlerContextValue {
  anchorNode: HTMLElement | null;
  setAnchorNode: (node: HTMLElement | null) => void;
  /** Whether the consumer rendered their own <TableScrollHandler> in Table children. */
  hasConsumerScrollHandler: boolean;
}

const TableScrollHandlerContext = createContext<TableScrollHandlerContextValue>({
  anchorNode: null,
  setAnchorNode: () => {},
  hasConsumerScrollHandler: false,
});

/**
 * Holds the DOM node of the internal scroll-controls anchor slot (in the master
 * column header) so a consumer-rendered `<TableScrollHandler>` (declared in
 * `Table` children) can portal into the correct location. Mirrors
 * `TableSettingsMenuProvider`.
 */
export const TableScrollHandlerProvider: FC<{
  hasConsumerScrollHandler: boolean;
  children: ReactNode;
}> = ({ hasConsumerScrollHandler, children }) => {
  const [anchorNode, setAnchorNode] = useState<HTMLElement | null>(null);
  const value = useMemo(
    () => ({ anchorNode, setAnchorNode, hasConsumerScrollHandler }),
    [anchorNode, hasConsumerScrollHandler],
  );

  return (
    <TableScrollHandlerContext.Provider value={value}>
      {children}
    </TableScrollHandlerContext.Provider>
  );
};

export const useTableScrollHandlerContext = (): TableScrollHandlerContextValue =>
  useContext(TableScrollHandlerContext);

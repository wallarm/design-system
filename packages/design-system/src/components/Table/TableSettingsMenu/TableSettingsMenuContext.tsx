import { createContext, type FC, type ReactNode, useContext, useMemo, useState } from 'react';

interface TableSettingsMenuContextValue {
  anchorNode: HTMLElement | null;
  setAnchorNode: (node: HTMLElement | null) => void;
}

const TableSettingsMenuContext = createContext<TableSettingsMenuContextValue>({
  anchorNode: null,
  setAnchorNode: () => {},
});

/**
 * Holds the DOM node of the internal settings-menu anchor slot so a
 * consumer-rendered `<TableSettingsMenu>` (declared in `Table` children) can
 * portal its trigger into the correct absolutely-positioned location.
 */
export const TableSettingsMenuProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [anchorNode, setAnchorNode] = useState<HTMLElement | null>(null);
  const value = useMemo(() => ({ anchorNode, setAnchorNode }), [anchorNode]);

  return (
    <TableSettingsMenuContext.Provider value={value}>{children}</TableSettingsMenuContext.Provider>
  );
};

export const useTableSettingsMenuContext = (): TableSettingsMenuContextValue =>
  useContext(TableSettingsMenuContext);

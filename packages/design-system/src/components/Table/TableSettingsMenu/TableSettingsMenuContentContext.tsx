import { createContext, useContext } from 'react';

interface TableSettingsMenuContentContextValue {
  search: string;
  setSearch: (value: string) => void;
}

const TableSettingsMenuContentContext = createContext<TableSettingsMenuContentContextValue | null>(
  null,
);

export const TableSettingsMenuContentProvider = TableSettingsMenuContentContext.Provider;

export const useTableSettingsMenuContentContext = (): TableSettingsMenuContentContextValue => {
  const ctx = useContext(TableSettingsMenuContentContext);
  if (!ctx) {
    throw new Error(
      'TableSettingsMenu item components must be rendered inside <TableSettingsMenu>',
    );
  }
  return ctx;
};

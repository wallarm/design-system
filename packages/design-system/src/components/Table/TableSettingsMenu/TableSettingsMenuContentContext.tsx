import { createContext, useContext } from 'react';

interface TableSettingsMenuContentContextValue {
  search: string;
  setSearch: (value: string) => void;
  /**
   * Visibility held while the menu is open (`deferColumnVisibility`), applied
   * to the table on close. Untouched when not deferring.
   */
  visibilityDraft: VisibilityDraft;
  setVisibilityDraft: (draft: VisibilityDraft) => void;
}

export interface VisibilityDraft {
  /** "Reset to default" was pressed: the draft starts from the default, not the table. */
  fromDefault: boolean;
  /** Per-column toggles on top of that base. */
  toggles: Record<string, boolean>;
}

export const EMPTY_VISIBILITY_DRAFT: VisibilityDraft = { fromDefault: false, toggles: {} };

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

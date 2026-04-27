import { useContext } from 'react';
import { SelectionContext, type SelectionContextValue } from './SelectionContext';

export const useSelectionContext = (): SelectionContextValue => {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error(
      'Selection sub-components (SelectionItem, SelectionAll, SelectionBulkBar) must be used inside <Selection>.',
    );
  }
  return ctx;
};

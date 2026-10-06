import { createContext, type RefObject, useContext } from 'react';
import type * as cascadeSelect from '@zag-js/cascade-select';
import type { PropTypes } from '@zag-js/react';
import type { FilterCascadeNode } from './lib';

export interface FilterCascadeContextValue {
  api: cascadeSelect.Api<PropTypes, FilterCascadeNode>;
  /** Attribute name: the trigger text, its aria-label, «Clear {label}». */
  label: string;
  /** The picked path's nodes, root first; `[]` while unset. */
  path: FilterCascadeNode[];
  clear: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export const FilterCascadeContext = createContext<FilterCascadeContextValue | null>(null);

export const useFilterCascadeContext = (): FilterCascadeContextValue => {
  const context = useContext(FilterCascadeContext);
  if (!context) throw new Error('FilterCascade parts must be rendered inside <FilterCascade>');
  return context;
};

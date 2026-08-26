import type { FC, RefObject } from 'react';
import type { BadgeColor } from '../../../Badge';
import { isValueGroup } from '../../lib';
import { FlatValueMenu } from './FlatValueMenu';
import { NestedValueMenu } from './NestedValueMenu';

export interface ValueOption {
  /**
   * Committable value — present on **leaf** options only. Group options (those
   * with `children`) omit it; they are presentational and never committed.
   */
  value?: string | number | boolean;
  label: string;
  badge?: { color: BadgeColor; text: string };
  /** Muted secondary line rendered beneath the bold `label`. Display-only. */
  description?: string;
  /**
   * Nested sub-values. When present this option is a group: a section header at
   * the top level, or a submenu trigger when nested. Only leaves are committed.
   */
  children?: ValueOption[];
  /** Optional section-header label to bucket top-level options under a heading. */
  section?: string;
  /** @deprecated superseded by `children`; kept for back-compat. */
  hasSubmenu?: boolean;
}

type ConditionValue = string | number | boolean;

export interface FilterInputValueMenuProps {
  values: ValueOption[];
  // Only committable leaf values fire onSelect — never a group (which has no value).
  onSelect: (value: ConditionValue) => void;
  onCommit?: (values: ConditionValue[]) => void;
  /** Live checked set on each user toggle (multi-select) — lets an editing chip
   *  commit in place instead of only on menu close (AS-1064). */
  onCheckedValuesChange?: (values: ConditionValue[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  multiSelect?: boolean;
  initialValues?: ConditionValue[];
  highlightValue?: ConditionValue;
  onEscape?: () => void;
  width?: 'standard' | 'compact' | number;
  positioning?: Record<string, unknown>;
  onBuildingValueChange?: (preview: string | undefined) => void;
  /** Fires only on user-initiated multi-select toggle (not on init). */
  onItemToggle?: () => void;
  /** Query bar input — ArrowUp on first item returns focus here. */
  inputRef?: RefObject<HTMLInputElement | null>;
  /** Filter values by label. */
  filterText?: string;
  /** Options are still loading — show a loading indicator instead of the list. */
  loading?: boolean;
  /** Menu content ref (shared across menus for focus management). */
  menuRef?: RefObject<HTMLDivElement | null>;
  /** Set here so blur handler can commit multi-select values. */
  blurCommitRef?: RefObject<(() => boolean) | null>;
  className?: string;
}

/**
 * Value dropdown (third autocomplete step). Dispatches to the nested menu
 * (sections + submenu) when the field's values contain groups or `section`
 * tags, otherwise to the flat single-list menu. Owns no hooks itself so each
 * variant's hooks mount/unmount cleanly.
 */
export const FilterInputValueMenu: FC<FilterInputValueMenuProps> = props => {
  const isNested = props.values.some(v => isValueGroup(v) || v.section != null);
  return isNested ? <NestedValueMenu {...props} /> : <FlatValueMenu {...props} />;
};

FilterInputValueMenu.displayName = 'FilterInputValueMenu';

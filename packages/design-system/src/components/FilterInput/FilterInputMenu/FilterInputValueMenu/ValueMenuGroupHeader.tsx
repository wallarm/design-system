import type { FC } from 'react';
import type { CheckboxCheckedState } from '@ark-ui/react/checkbox';
import { Checkmark } from '../../../Checkmark';
import { DropdownMenuItem, DropdownMenuLabel } from '../../../DropdownMenu';

/**
 * Prefix for a group row's synthetic keyboard-nav id, keeping it clear of the
 * real value keys that share the same id space. Only the id space needs this —
 * select routing discriminates on the item's payload (`isGroupNavItem`), so a
 * value that literally equals a prefixed string still selects correctly.
 */
export const GROUP_ITEM_ID_PREFIX = '__vg__:';

export const toGroupItemId = (label: string): string => `${GROUP_ITEM_ID_PREFIX}${label}`;

interface ValueMenuGroupHeaderProps {
  label: string;
  /** false = no member selected, 'indeterminate' = some, true = all. */
  checkedState: CheckboxCheckedState;
  /**
   * When false the header renders as a plain non-interactive label (the field
   * menu's treatment) — used when the field forbids any multi-select operator,
   * so there is no operator to switch into.
   */
  selectable: boolean;
  isPending?: boolean;
  onSelect?: () => void;
  registerItem?: (id: string) => (el: HTMLElement | null) => void;
}

export const ValueMenuGroupHeader: FC<ValueMenuGroupHeaderProps> = ({
  label,
  checkedState,
  selectable,
  isPending,
  onSelect,
  registerItem,
}) => {
  if (!selectable) {
    return <DropdownMenuLabel data-slot='value-menu-group-header'>{label}</DropdownMenuLabel>;
  }

  const id = toGroupItemId(label);

  return (
    <DropdownMenuItem
      value={id}
      ref={registerItem?.(id)}
      onSelect={onSelect}
      // Mirrors dropdownMenuLabelVariants typography so a selectable header still
      // reads as a header rather than as another value row.
      className={isPending ? 'text-xs font-medium bg-states-primary-hover' : 'text-xs font-medium'}
      data-slot='value-menu-group-header'
    >
      <div className='min-w-0 text-text-secondary truncate'>{label}</div>
      <div className='flex shrink-0 items-start justify-end py-2 ml-auto'>
        <Checkmark checkedState={checkedState} />
      </div>
    </DropdownMenuItem>
  );
};

ValueMenuGroupHeader.displayName = 'ValueMenuGroupHeader';

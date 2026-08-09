import type { FC } from 'react';
import type { CheckboxCheckedState } from '@ark-ui/react/checkbox';
import { ChevronRight } from '../../../../icons/ChevronRight';
import { cn } from '../../../../utils/cn';
import { Badge } from '../../../Badge';
import { Checkmark } from '../../../Checkmark';
import { DropdownMenuItem } from '../../../DropdownMenu';
import { Text } from '../../../Text';
import type { ValueOption } from './FilterInputValueMenu';
import { highlightMatch } from './highlightMatch';

interface NestedValueMenuItemProps {
  id: string;
  option: ValueOption;
  /** Whether this row is a group (parent category → opens a submenu on hover). */
  isGroup: boolean;
  checkedState: CheckboxCheckedState;
  isPending: boolean;
  multiSelect: boolean;
  onSelect: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  registerRef?: (el: HTMLElement | null) => void;
  /** For group rows: whether its submenu is currently open. */
  expanded?: boolean;
  /**
   * True for the synthetic "All {group}" bulk-select row: its label renders in a
   * medium weight to read as a section-level control rather than a plain option.
   */
  selectAll?: boolean;
  /** Active search query — its matched substring is emphasized in flat search. */
  highlight?: string;
}

/**
 * A single row in the nested value menu — a committable leaf, a group (parent
 * category), or the "All {group}" bulk-select row. Parent categories show a
 * right-side chevron and open a submenu on hover; a checked row is highlighted
 * with a persistent background. Selection is driven by the (tri-state, for
 * groups) checkbox.
 */
export const NestedValueMenuItem: FC<NestedValueMenuItemProps> = ({
  id,
  option,
  isGroup,
  checkedState,
  isPending,
  multiSelect,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  registerRef,
  expanded,
  selectAll,
  highlight,
}) => {
  const isChecked = checkedState === true;
  const checkmark =
    multiSelect || (!isGroup && checkedState) ? (
      <Checkmark checkedState={multiSelect ? checkedState : true} />
    ) : null;

  return (
    <DropdownMenuItem
      value={id}
      ref={registerRef}
      onSelect={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        // Clear the sticky group header when scrolled into view via keyboard.
        'scroll-mt-32',
        // A selected row stays highlighted; an active keyboard/pending row wins.
        isChecked && 'bg-states-primary-active',
        isPending && 'bg-states-primary-hover',
      )}
      aria-checked={
        multiSelect ? (checkedState === 'indeterminate' ? 'mixed' : !!checkedState) : undefined
      }
      {...(isGroup && { 'aria-haspopup': 'menu', 'aria-expanded': !!expanded })}
    >
      {option.badge ? (
        <Badge color={option.badge.color} type='secondary' variant='default'>
          {option.badge.text}
        </Badge>
      ) : (
        <div className='min-w-0'>
          <Text size='sm' weight={selectAll ? 'medium' : 'regular'} truncate>
            {highlightMatch(option.label, highlight)}
          </Text>
          {option.description && (
            <Text size='xs' color='secondary' truncate>
              {highlightMatch(option.description, highlight)}
            </Text>
          )}
        </div>
      )}

      {/* Right rail: a parent category's submenu chevron sits before the
          (tri-state, for groups) checkbox / single-select checkmark. The
          checkbox brings its own vertical rhythm (Checkmark's `my-2`), so the
          rail adds none — keeping the row at the 32px spec height. */}
      <div className='flex shrink-0 items-center justify-end gap-8 ml-auto'>
        {isGroup && (
          <span className='flex text-text-secondary'>
            <ChevronRight />
          </span>
        )}
        {checkmark}
      </div>
    </DropdownMenuItem>
  );
};

NestedValueMenuItem.displayName = 'NestedValueMenuItem';

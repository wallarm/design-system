import type { FC } from 'react';
import type { CheckboxCheckedState } from '@ark-ui/react/checkbox';
import { Badge } from '../../../Badge';
import { Checkmark } from '../../../Checkmark';
import { DropdownMenuItem } from '../../../DropdownMenu';
import { Text } from '../../../Text';
import type { ValueOption } from './FilterInputValueMenu';

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
}

/**
 * A single row in the nested value menu — a committable leaf or a group
 * (parent category). Both render a (tri-state, for groups) checkbox; a group's
 * submenu opens on hover. No chevron: selection and bulk-selection are driven
 * entirely by the checkbox.
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
}) => (
  <DropdownMenuItem
    value={id}
    ref={registerRef}
    onSelect={onSelect}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={isPending ? 'bg-states-primary-hover' : undefined}
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
        <Text size='sm' truncate>
          {option.label}
        </Text>
        {option.description && (
          <Text size='xs' color='secondary' truncate>
            {option.description}
          </Text>
        )}
      </div>
    )}

    {/* Multi-select: always a (tri-state, for groups) checkbox. Single-select
        leaf: a checkmark only when selected. */}
    {multiSelect ? (
      <div className='flex shrink-0 items-start justify-end py-2 ml-auto'>
        <Checkmark checkedState={checkedState} />
      </div>
    ) : !isGroup && checkedState ? (
      <div className='flex shrink-0 items-start justify-end py-2 ml-auto'>
        <Checkmark checkedState={true} />
      </div>
    ) : null}
  </DropdownMenuItem>
);

NestedValueMenuItem.displayName = 'NestedValueMenuItem';

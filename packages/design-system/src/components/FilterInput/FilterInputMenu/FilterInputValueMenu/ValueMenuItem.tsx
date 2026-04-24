import type { FC } from 'react';
import { ChevronRight } from '../../../../icons/ChevronRight';
import { Badge } from '../../../Badge';
import { Checkmark } from '../../../Checkmark';
import { DropdownMenuItem } from '../../../DropdownMenu';
import { Text } from '../../../Text';
import type { ValueOption } from './FilterInputValueMenu';

interface ValueMenuItemProps {
  option: ValueOption;
  isChecked: boolean;
  isPending: boolean;
  multiSelect: boolean;
  onSelect: () => void;
  registerItem?: (id: string) => (el: HTMLElement | null) => void;
}

export const ValueMenuItem: FC<ValueMenuItemProps> = ({
  option,
  isChecked,
  isPending,
  multiSelect,
  onSelect,
  registerItem,
}) => (
  <DropdownMenuItem
    key={String(option.value)}
    value={String(option.value)}
    ref={registerItem?.(String(option.value))}
    onSelect={onSelect}
    className={isPending ? 'bg-states-primary-hover' : undefined}
  >
    {/* Badge */}
    {option.badge ? (
      <Badge color={option.badge.color} type='secondary' variant='default'>
        {option.badge.text}
      </Badge>
    ) : (
      <div className='min-w-0'>
        <Text size='sm' truncate>
          {option.label}
        </Text>
      </div>
    )}

    {/* Checkbox for multi-select, checkmark for single-select */}
    {multiSelect ? (
      <div className='flex shrink-0 items-start justify-end py-2 ml-auto'>
        <Checkmark checkedState={isChecked} />
      </div>
    ) : isChecked ? (
      <div className='flex shrink-0 items-start justify-end py-2 ml-auto'>
        <Checkmark checkedState={true} />
      </div>
    ) : null}

    {/* Submenu arrow */}
    {option.hasSubmenu && !multiSelect && (
      <div className='flex items-center text-text-secondary ml-auto'>
        <ChevronRight />
      </div>
    )}
  </DropdownMenuItem>
);

ValueMenuItem.displayName = 'ValueMenuItem';

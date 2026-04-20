import type { FC } from 'react';
import { ChevronRight } from '../../../../icons/ChevronRight';
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
}

export const ValueMenuItem: FC<ValueMenuItemProps> = ({
  option,
  isChecked,
  isPending,
  multiSelect,
  onSelect,
}) => (
  <DropdownMenuItem
    key={String(option.value)}
    value={String(option.value)}
    onSelect={onSelect}
    className={isPending ? 'bg-states-primary-hover' : undefined}
  >
    {/* Badge */}
    {option.badge ? (
      <div
        className='flex items-center gap-4 px-6 py-2 rounded-4 text-xs font-medium max-w-[320px] min-h-[20px] overflow-clip'
        style={{ backgroundColor: option.badge.color }}
      >
        <div className='size-6 rounded-full bg-current' />
        <span className='min-w-0 truncate leading-4'>{option.badge.text}</span>
      </div>
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

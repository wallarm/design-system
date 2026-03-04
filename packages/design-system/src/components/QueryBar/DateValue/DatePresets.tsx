import type { FC } from 'react';
import { ChevronRight } from '../../../icons/ChevronRight';
import {
  DropdownMenuFooter,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemText,
  DropdownMenuSeparator,
} from '../../DropdownMenu';
import { Kbd } from '../../Kbd/Kbd';
import { KbdGroup } from '../../Kbd/KbdGroup';
import { DATE_PRESETS } from './constants';

export interface DatePresetsProps {
  onSelect: (value: string) => void;
  onAbsoluteClick: () => void;
  betweenLabel?: string;
}

export const DatePresets: FC<DatePresetsProps> = ({ onSelect, onAbsoluteClick, betweenLabel }) => (
  <>
    {betweenLabel && (
      <div className='px-8 py-4 text-xs font-medium text-text-secondary'>
        {betweenLabel}
      </div>
    )}
    <DropdownMenuGroup>
      {DATE_PRESETS.map(preset => (
        <DropdownMenuItem
          key={preset.value}
          value={preset.value}
          onSelect={() => onSelect(preset.value)}
        >
          <DropdownMenuItemText>{preset.label}</DropdownMenuItemText>
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>

    <DropdownMenuSeparator />

    <DropdownMenuGroup>
      <DropdownMenuItem
        value='__absolute__'
        onSelect={onAbsoluteClick}
      >
        <DropdownMenuItemText>Absolute date</DropdownMenuItemText>
        <div className='flex items-center text-text-secondary ml-auto'>
          <ChevronRight />
        </div>
      </DropdownMenuItem>
    </DropdownMenuGroup>

    <DropdownMenuFooter>
      <span className='flex items-center gap-4'>
        <KbdGroup><Kbd>↵</Kbd></KbdGroup>
        to select
      </span>
    </DropdownMenuFooter>
  </>
);

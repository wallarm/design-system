import { type FC, useMemo } from 'react';
import { ChevronRight } from '../../../../icons/ChevronRight';
import {
  DropdownMenuFooter,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemText,
  DropdownMenuSeparator,
} from '../../../DropdownMenu';
import { Kbd } from '../../../Kbd/Kbd';
import { KbdGroup } from '../../../Kbd/KbdGroup';
import { MenuEmptyState } from '../MenuEmptyState';
import { DATE_PRESETS } from './constants';

export interface DatePresetsProps {
  onSelect: (value: string) => void;
  onAbsoluteClick: () => void;
  betweenLabel?: string;
  filterText?: string;
}

export const DatePresets: FC<DatePresetsProps> = ({
  onSelect,
  onAbsoluteClick,
  betweenLabel,
  filterText = '',
}) => {
  const query = filterText.toLowerCase();
  const filteredPresets = useMemo(
    () => (query ? DATE_PRESETS.filter(p => p.label.toLowerCase().includes(query)) : DATE_PRESETS),
    [query],
  );
  const showAbsolute = !query || 'absolute date'.includes(query);

  return (
    <>
      {betweenLabel && (
        <div className='px-8 py-4 text-xs font-medium text-text-secondary'>{betweenLabel}</div>
      )}
      {filteredPresets.length > 0 ? (
        <DropdownMenuGroup>
          {filteredPresets.map(preset => (
            <DropdownMenuItem
              key={preset.value}
              value={preset.value}
              onSelect={() => onSelect(preset.value)}
            >
              <DropdownMenuItemText>{preset.label}</DropdownMenuItemText>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      ) : !showAbsolute ? (
        <MenuEmptyState />
      ) : null}

      {showAbsolute && (
        <>
          {filteredPresets.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuGroup>
            <DropdownMenuItem value='__absolute__' onSelect={onAbsoluteClick}>
              <DropdownMenuItemText>Absolute date</DropdownMenuItemText>
              <div className='flex items-center text-text-secondary ml-auto'>
                <ChevronRight />
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </>
      )}

      <DropdownMenuFooter>
        <span className='flex items-center gap-4'>
          <KbdGroup>
            <Kbd>↵</Kbd>
          </KbdGroup>
          to select
        </span>
      </DropdownMenuFooter>
    </>
  );
};

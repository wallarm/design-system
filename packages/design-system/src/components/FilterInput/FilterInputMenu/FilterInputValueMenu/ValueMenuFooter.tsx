import type { FC } from 'react';
import { DropdownMenuFooter } from '../../../DropdownMenu';
import { Kbd } from '../../../Kbd/Kbd';
import { KbdGroup } from '../../../Kbd/KbdGroup';

interface ValueMenuFooterProps {
  multiSelect: boolean;
}

export const ValueMenuFooter: FC<ValueMenuFooterProps> = ({ multiSelect }) => (
  <DropdownMenuFooter>
    {multiSelect ? (
      <>
        <span className='flex items-center gap-4'>
          <KbdGroup>
            <Kbd>↵</Kbd>
          </KbdGroup>
          to select
        </span>
        <span className='flex items-center gap-4'>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
          </KbdGroup>
          to multi-select
        </span>
      </>
    ) : (
      <>
        <span className='flex items-center gap-4'>
          <KbdGroup>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
          </KbdGroup>
          to navigate
        </span>
        <span className='flex items-center gap-4'>
          <KbdGroup>
            <Kbd>↵</Kbd>
          </KbdGroup>
          to select
        </span>
      </>
    )}
  </DropdownMenuFooter>
);

ValueMenuFooter.displayName = 'ValueMenuFooter';

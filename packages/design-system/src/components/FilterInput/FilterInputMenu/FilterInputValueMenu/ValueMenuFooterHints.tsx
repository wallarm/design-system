import type { FC } from 'react';
import { Kbd } from '../../../Kbd/Kbd';
import { KbdGroup } from '../../../Kbd/KbdGroup';

interface ValueMenuFooterHintsProps {
  multiSelect: boolean;
}

/**
 * Keyboard-hint content for the value menu footer. Rendered *inside* a
 * `DropdownMenuFooter` at the call site (not a footer itself) so the footer
 * element stays a direct child of `DropdownMenuContent` and is pinned outside
 * the scrolling list instead of scrolling away with the options.
 */
export const ValueMenuFooterHints: FC<ValueMenuFooterHintsProps> = ({ multiSelect }) =>
  multiSelect ? (
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
  );

ValueMenuFooterHints.displayName = 'ValueMenuFooterHints';

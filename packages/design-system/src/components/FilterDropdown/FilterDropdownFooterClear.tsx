import type { FC, KeyboardEvent, MouseEvent } from 'react';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { useFilterDropdownContext } from './FilterDropdownContext';

export type FilterDropdownFooterClearProps = Omit<
  ButtonProps<'button'>,
  'variant' | 'color' | 'size' | 'as' | 'asChild'
> &
  TestableProps;

/**
 * Zag's content keydown turns Enter/Space into a pick of the highlighted row and prevents their
 * default; keep them on the button so its native activation (click → clear) happens.
 */
const BUTTON_OWNED_KEYS = new Set(['Enter', ' ']);

/**
 * The «Clear» button of the multi-mode footer. Keeps the menu open and moves focus back into it
 * (the search, or the list) before the footer disappears.
 */
export const FilterDropdownFooterClear: FC<FilterDropdownFooterClearProps> = ({
  children,
  onClick,
  onKeyDown,
  'data-testid': testIdProp,
  ...props
}) => {
  const { clear } = useFilterDropdownContext();
  const testId = useTestId('footer-clear', testIdProp);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (BUTTON_OWNED_KEYS.has(event.key)) event.stopPropagation();
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const content = event.currentTarget.closest<HTMLElement>(
      '[data-scope="select"][data-part="content"]',
    );
    const search = content?.querySelector<HTMLElement>(
      '[data-slot="filter-dropdown-search"] input',
    );
    (search ?? content)?.focus({ preventScroll: true });
    clear();
  };

  return (
    <Button
      {...props}
      data-slot='filter-dropdown-footer-clear'
      data-testid={testId}
      // Reachable with Tab, but never the initial focus of the menu.
      data-no-autofocus=''
      variant='ghost'
      color='neutral'
      size='small'
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children ?? 'Clear'}
    </Button>
  );
};

FilterDropdownFooterClear.displayName = 'FilterDropdownFooterClear';

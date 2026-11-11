import type { ReactNode } from 'react';

import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';

import { SearchModalProvider } from './SearchModalContext/SearchModalProvider';
import { useSearchModalContext } from './SearchModalContext/useSearchModalContext';
import { SearchModalItem } from './SearchModalItem';

const List = ({ children }: { children: ReactNode }) => {
  const { listRef } = useSearchModalContext();
  return <div ref={listRef}>{children}</div>;
};

describe('SearchModalItem', () => {
  it('marks the first enabled item active immediately after mount and after reordering', () => {
    const view = (reversed: boolean) => (
      <SearchModalProvider onClose={() => {}}>
        <List>
          <SearchModalItem disabled>Disabled</SearchModalItem>
          {(reversed ? ['Second', 'First'] : ['First', 'Second']).map(label => (
            <SearchModalItem key={label}>{label}</SearchModalItem>
          ))}
        </List>
      </SearchModalProvider>
    );
    const { rerender } = render(view(false));
    expect(screen.getByRole('option', { name: 'First' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Disabled' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    rerender(view(true));
    expect(screen.getByRole('option', { name: 'Second' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'First' })).toHaveAttribute('aria-selected', 'false');
  });
});

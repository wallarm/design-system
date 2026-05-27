import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TestIdProvider } from '../../../utils/testId';
import { SelectSeparator } from '../SelectSeparator';

describe('SelectSeparator', () => {
  // Regression guard: the previous implementation delegated to
  // DropdownMenuSeparator (ark-ui Menu.Separator), which reads from a Menu
  // context that does not exist outside a Menu.Root. Rendering it standalone —
  // as happens inside a Select — used to throw "Cannot read properties of
  // undefined (reading 'getSeparatorProps')". A plain <hr> must render anywhere.
  it('renders a horizontal separator without a Menu context', () => {
    render(<SelectSeparator />);
    const separator = screen.getByRole('separator');
    expect(separator.tagName).toBe('HR');
    expect(separator).toHaveAttribute('data-slot', 'select-separator');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('omits data-testid when no TestIdProvider is present', () => {
    render(<SelectSeparator />);
    expect(screen.getByRole('separator')).not.toHaveAttribute('data-testid');
  });

  it('derives a cascaded data-testid from the provider', () => {
    render(
      <TestIdProvider value='my-select'>
        <SelectSeparator />
      </TestIdProvider>,
    );
    expect(screen.getByRole('separator')).toHaveAttribute('data-testid', 'my-select--separator');
  });

  it('merges className and forwards extra props', () => {
    render(<SelectSeparator className='mt-0' id='sep-1' />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('mt-0', 'h-px');
    expect(separator).toHaveAttribute('id', 'sep-1');
  });
});

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterChip } from '../FilterChip/FilterChip';
import { FilterField } from './FilterField';

describe('FilterField', () => {
  describe('basic rendering', () => {
    it('renders with default placeholder', () => {
      render(<FilterField />);
      expect(screen.getByText('Search [object]...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(<FilterField placeholder='Search attacks...' />);
      expect(screen.getByText('Search attacks...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<FilterField className='custom-class' />);
      const field = container.querySelector('[data-slot="filter-field"]');
      expect(field).toHaveClass('custom-class');
    });

    it('has correct role and tabIndex', () => {
      const { container } = render(<FilterField />);
      const field = container.querySelector('[data-slot="filter-field"]');
      expect(field).toHaveAttribute('role', 'textbox');
      expect(field).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('chip management', () => {
    const mockChips = [
      {
        id: '1',
        content: <FilterChip variant='chip' attribute='IP' operator='is' value='192.168.1.1' />,
      },
      {
        id: '2',
        content: <FilterChip variant='chip' attribute='Country' operator='is' value='US' />,
      },
      {
        id: '3',
        content: <FilterChip variant='chip' attribute='Status' operator='is' value='Active' />,
      },
    ];

    it('displays chips when provided', () => {
      render(<FilterField chips={mockChips} />);

      expect(screen.getByText('IP')).toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('shows max 3 visible chips', () => {
      const manyChips = [
        ...mockChips,
        {
          id: '4',
          content: <FilterChip variant='chip' attribute='Port' operator='is' value='8080' />,
        },
      ];

      render(<FilterField chips={manyChips} />);

      // First 3 chips should be visible
      expect(screen.getByText('IP')).toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();

      // 4th chip should not be visible
      expect(screen.queryByText('Port')).not.toBeInTheDocument();
    });

    it('shows placeholder hint when more than 3 chips', () => {
      const manyChips = [
        ...mockChips,
        {
          id: '4',
          content: <FilterChip variant='chip' attribute='Port' operator='is' value='8080' />,
        },
      ];

      render(<FilterField chips={manyChips} placeholder='Search attacks...' />);

      // Placeholder should be shown as a hint
      expect(screen.getByText('Search attacks...')).toBeInTheDocument();
    });

    it('hides placeholder when chips are present (less than 4)', () => {
      render(<FilterField chips={mockChips.slice(0, 2)} placeholder='Search attacks...' />);

      // Placeholder should not be shown when we have 2 chips
      expect(screen.queryByText('Search attacks...')).not.toBeInTheDocument();
    });
  });

  describe('clear functionality', () => {
    const mockChips = [
      {
        id: '1',
        content: <FilterChip variant='chip' attribute='IP' operator='is' value='192.168.1.1' />,
      },
    ];

    it('shows clear button when chips exist and onClear is provided', () => {
      render(<FilterField chips={mockChips} onClear={vi.fn()} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('does not show clear button when no chips', () => {
      render(<FilterField chips={[]} onClear={vi.fn()} />);

      const clearButton = screen.queryByRole('button', { name: /clear all filters/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('does not show clear button when onClear is not provided', () => {
      render(<FilterField chips={mockChips} />);

      const clearButton = screen.queryByRole('button', { name: /clear all filters/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('calls onClear when clear button is clicked', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();

      render(<FilterField chips={mockChips} onClear={onClear} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      await user.click(clearButton);

      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('keyboard hint', () => {
    it('shows keyboard hint when showKeyboardHint is true', () => {
      render(<FilterField showKeyboardHint={true} />);

      expect(screen.getByText('⌘')).toBeInTheDocument();
      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('does not show keyboard hint by default', () => {
      render(<FilterField />);

      expect(screen.queryByText('⌘')).not.toBeInTheDocument();
      expect(screen.queryByText('K')).not.toBeInTheDocument();
    });
  });

  describe('left icon', () => {
    it('displays left icon when provided', () => {
      const Icon = () => <span data-testid='test-icon'>🔍</span>;
      render(<FilterField leftIcon={<Icon />} />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('does not display icon container when leftIcon is not provided', () => {
      const { container } = render(<FilterField />);
      const iconContainer = container.querySelector('.shrink-0:first-child');
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    const mockChips = [
      {
        id: '1',
        content: <FilterChip variant='chip' attribute='IP' operator='is' value='192.168.1.1' />,
      },
    ];

    it('applies error border when error is true', () => {
      const { container } = render(<FilterField error={true} />);
      const field = container.querySelector('[data-slot="filter-field"]');
      expect(field).toHaveClass('border-border-strong-danger');
    });

    it('sets aria-invalid when error is true', () => {
      const { container } = render(<FilterField error={true} />);
      const field = container.querySelector('[data-slot="filter-field"]');
      expect(field).toHaveAttribute('aria-invalid', 'true');
    });

    it('propagates error prop to chip content', () => {
      const { container } = render(<FilterField chips={mockChips} error={true} />);

      // Check if the chip has error styling (red background)
      const chip = container.querySelector('[data-slot="filter-chip"]');
      expect(chip).toHaveClass('bg-bg-light-danger', 'border-border-danger');
    });

    it('applies normal styling when error is false', () => {
      const { container } = render(<FilterField error={false} />);
      const field = container.querySelector('[data-slot="filter-field"]');
      expect(field).toHaveClass('border-border-primary');
      expect(field).not.toHaveClass('border-border-strong-danger');
    });
  });

  describe('focus and blur callbacks', () => {
    it('calls onFocus when field receives focus', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();

      const { container } = render(<FilterField onFocus={onFocus} />);
      const field = container.querySelector('[data-slot="filter-field"]');

      await user.click(field!);

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when field loses focus', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();

      const { container } = render(<FilterField onBlur={onBlur} />);
      const field = container.querySelector('[data-slot="filter-field"]');

      await user.click(field!);
      await user.tab(); // Move focus away

      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label for clear button', () => {
      const mockChips = [
        {
          id: '1',
          content: <FilterChip variant='chip' attribute='IP' operator='is' value='192.168.1.1' />,
        },
      ];

      render(<FilterField chips={mockChips} onClear={vi.fn()} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearButton).toHaveAttribute('aria-label', 'Clear all filters');
    });

    it('has correct role attribute', () => {
      const { container } = render(<FilterField />);
      const field = container.querySelector('[data-slot="filter-field"]');
      expect(field).toHaveAttribute('role', 'textbox');
    });
  });

  describe('styling', () => {
    it('has correct base styling', () => {
      const { container } = render(<FilterField />);
      const field = container.querySelector('[data-slot="filter-field"]');
      expect(field).toHaveClass('h-10', 'max-w-[800px]', 'rounded-lg');
    });

    it('applies hover border color when not in error state', () => {
      const { container } = render(<FilterField />);
      const field = container.querySelector('[data-slot="filter-field"]');
      expect(field).toHaveClass('hover:border-component-border-input-hover');
    });
  });
});

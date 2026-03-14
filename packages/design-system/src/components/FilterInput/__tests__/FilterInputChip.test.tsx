import type { ReactNode } from 'react';
import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterInputProvider } from '../FilterInputContext/FilterInputProvider';
import type { FilterInputContextValue } from '../FilterInputContext/types';
import { FilterInputChip, FilterInputConnectorChip } from '../FilterInputField';

const mockContextValue: FilterInputContextValue = {
  chips: [],
  buildingChipData: null,
  buildingChipRef: createRef(),
  inputText: '',
  inputRef: createRef(),
  placeholder: '',
  error: false,
  showKeyboardHint: false,
  menuOpen: false,
  insertIndex: 0,
  insertAfterConnector: false,
  onInputChange: vi.fn(),
  onInputKeyDown: vi.fn(),
  onInputClick: vi.fn(),
  onGapClick: vi.fn(),
  onChipClick: vi.fn(),
  onConnectorChange: vi.fn(),
  onChipRemove: vi.fn(),
  onClear: vi.fn(),
  editingChipId: null,
  editingSegment: null,
  segmentFilterText: '',
  onSegmentFilterChange: vi.fn(),
  onCancelSegmentEdit: vi.fn(),
  onCustomValueCommit: vi.fn(),
  onCustomAttributeCommit: vi.fn(),
  menuRef: createRef(),
  closeAutocompleteMenu: vi.fn(),
};

const FilterInputWrapper = ({ children }: { children: ReactNode }) => (
  <FilterInputProvider value={mockContextValue}>{children}</FilterInputProvider>
);

describe('FilterInputChip', () => {
  it('renders chip with attribute, operator, and value', () => {
    render(<FilterInputChip attribute='IP Address' operator='is' value='192.168.1.1' />);

    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('renders chip with only attribute', () => {
    render(<FilterInputChip attribute='Country' />);

    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<FilterInputChip attribute='Test' className='custom-class' />);

    const chip = container.querySelector('[data-slot="filter-input-condition-chip"]');
    expect(chip).toHaveClass('custom-class');
  });

  it('renders delete button when onRemove is provided', () => {
    const onRemove = vi.fn();
    render(<FilterInputChip attribute='Test' onRemove={onRemove} />);
    const deleteButton = screen.getByRole('button', { name: /remove filter/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('calls onRemove when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<FilterInputChip attribute='Test' onRemove={onRemove} />);
    const deleteButton = screen.getByRole('button', { name: /remove filter/i });
    await user.click(deleteButton);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not show delete button when onRemove is not provided', async () => {
    const user = userEvent.setup();

    const { container } = render(<FilterInputChip attribute='Test' />);

    const chip = container.querySelector('[data-slot="filter-input-condition-chip"]');
    await user.hover(chip!);

    const deleteButton = screen.queryByRole('button', { name: /remove filter/i });
    expect(deleteButton).not.toBeInTheDocument();
  });

  describe('error state', () => {
    it('applies error styling when error is true', () => {
      const { container } = render(<FilterInputChip attribute='Test' error={true} />);

      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]');
      expect(chip).toHaveClass('bg-bg-light-danger', 'border-border-danger');
    });

    it('applies normal styling when error is false', () => {
      const { container } = render(<FilterInputChip attribute='Test' error={false} />);

      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]');
      expect(chip).toHaveClass('bg-badge-badge-bg', 'border-border-primary');
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label for delete button', () => {
      const onRemove = vi.fn();
      render(<FilterInputChip attribute='Test' onRemove={onRemove} />);
      const deleteButton = screen.getByRole('button', { name: /remove filter/i });
      expect(deleteButton).toHaveAttribute('aria-label', 'Remove filter');
    });
  });
});

describe('FilterInputConnectorChip', () => {
  it('renders AND text', () => {
    render(<FilterInputConnectorChip variant='and' chipId='c-1' onChange={vi.fn()} />, {
      wrapper: FilterInputWrapper,
    });
    expect(screen.getByText('AND')).toBeInTheDocument();
  });

  it('renders OR text', () => {
    render(<FilterInputConnectorChip variant='or' chipId='c-1' onChange={vi.fn()} />, {
      wrapper: FilterInputWrapper,
    });
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it('applies normal styling', () => {
    const { container } = render(
      <FilterInputConnectorChip variant='and' chipId='c-1' onChange={vi.fn()} />,
      { wrapper: FilterInputWrapper },
    );
    const chip = container.querySelector('[data-slot="filter-input-connector-chip"]');
    expect(chip).toHaveClass('bg-badge-badge-bg', 'border-border-primary');
  });
});

describe('FilterInputChip building mode', () => {
  it('renders with only attribute', () => {
    render(<FilterInputChip building attribute='IP Address' />);
    expect(screen.getByText('IP Address')).toBeInTheDocument();
  });

  it('renders with attribute and operator', () => {
    render(<FilterInputChip building attribute='IP Address' operator='is' />);
    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
  });

  it('renders with attribute, operator, and value', () => {
    render(<FilterInputChip building attribute='IP Address' operator='is' value='192.168.1.1' />);
    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('does not have hover/remove functionality', () => {
    const { container } = render(<FilterInputChip building attribute='Test' />);
    const chip = container.querySelector('[data-slot="filter-input-condition-chip"]');
    fireEvent.mouseEnter(chip!);

    const deleteButton = screen.queryByRole('button', { name: /remove filter/i });
    expect(deleteButton).not.toBeInTheDocument();
  });
});

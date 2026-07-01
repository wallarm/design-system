import type { ReactNode } from 'react';
import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterInputProvider } from '../FilterInputContext/FilterInputProvider';
import type { FilterInputContextValue } from '../FilterInputContext/types';
import { FilterInputChip, FilterInputConnectorChip } from '../FilterInputField';
import { EditingProvider } from '../FilterInputField/FilterInputChip/context/EditingContext';

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

  // The delete button is opacity-0 but overlays the chip's right edge and the
  // field area next to it. Without pointer-events gating it silently eats clicks
  // meant for the chip/input and deletes the chip (AS-1179).
  it('does not capture pointer events while hidden (only on hover/focus)', () => {
    const onRemove = vi.fn();
    render(<FilterInputChip attribute='Test' onRemove={onRemove} />);
    const deleteButton = screen.getByRole('button', { name: /remove filter/i });
    expect(deleteButton.className).toContain('pointer-events-none');
    expect(deleteButton.className).toContain('group-hover/chip:pointer-events-auto');
    expect(deleteButton.className).toContain('focus:pointer-events-auto');
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

    // An errored chip is red when idle, but while the user is editing it (fixing
    // it) the red is suppressed so editing reads cleanly (AS-1179).
    it('suppresses error styling while the chip is being edited', () => {
      const { container, rerender } = render(
        <FilterInputChip chipId='chip-0' attribute='Status' operator='is' value='' error='value' />,
      );
      const chip = () => container.querySelector('[data-slot="filter-input-condition-chip"]');
      expect(chip()).toHaveClass('border-border-danger');

      rerender(
        <EditingProvider
          editingChipId='chip-0'
          editingSegment='value'
          editingSide={0}
          segmentFilterText=''
          onSegmentFilterChange={() => {}}
          onSegmentEditKeyDown={() => {}}
          onSegmentEditBlur={() => {}}
        >
          <FilterInputChip
            chipId='chip-0'
            attribute='Status'
            operator='is'
            value=''
            error='value'
          />
        </EditingProvider>,
      );
      expect(chip()).not.toHaveClass('border-border-danger');
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

  describe('paired chip (AS-1160)', () => {
    it('renders the second triplet and a ; separator', () => {
      render(
        <FilterInputChip
          attribute='Context Param'
          operator='is'
          value='xxx'
          pair={{ attribute: 'Value', operator: 'is', value: 'yyy' }}
        />,
      );
      expect(screen.getByText('Context Param')).toBeInTheDocument();
      expect(screen.getByText('xxx')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
      expect(screen.getByText('yyy')).toBeInTheDocument();
      expect(screen.getByText(';')).toBeInTheDocument();
    });

    it('caps a paired chip at 380px and a standalone chip at 320px (AS-1179)', () => {
      const { container, rerender } = render(
        <FilterInputChip attribute='Context Param' operator='is' value='header' />,
      );
      const chip = () => container.querySelector('[data-slot="filter-input-condition-chip"]');
      expect(chip()?.className).toContain('max-w-[320px]');

      rerender(
        <FilterInputChip
          attribute='Context Param'
          operator='is'
          value='header'
          pair={{ attribute: 'Value', operator: 'is', value: 'x' }}
        />,
      );
      expect(chip()?.className).toContain('max-w-[380px]');
    });

    it('caps the base value in a paired chip so a long key cannot hog the row (AS-1179)', () => {
      const { container } = render(
        <FilterInputChip
          attribute='Context Param'
          operator='is'
          value='averylongcontextparameterkey'
          pair={{ attribute: 'Value', operator: 'is', value: 'x' }}
        />,
      );
      // The first value segment is the base "key"; it is capped + non-shrinking
      // so the paired value keeps its share of the row.
      const baseValue = container.querySelector('[data-slot="segment-value"]');
      expect(baseValue?.className).toContain('max-w-[90px]');
      expect(baseValue?.className).toContain('shrink-0');
    });

    it('makes the fixed "Value" label clickable and resumes at the first missing pair segment (AS-1179/AS-1192)', async () => {
      const user = userEvent.setup();
      const onPairSegmentClick = vi.fn();
      const { container, rerender } = render(
        <FilterInputChip
          attribute='Context Param'
          operator='is'
          value='header'
          pair={{ attribute: 'Value', value: '', error: 'value' }}
          onPairSegmentClick={onPairSegmentClick}
        />,
      );
      // Second attribute segment = the paired "Value" label. With its operator/
      // value segments empty (unclickable), it must itself be interactive so the
      // user can resume the second part.
      const pairAttr = () => container.querySelectorAll('[data-slot="segment-attribute"]')[1]!;
      expect(pairAttr()).toHaveAttribute('role', 'button');
      // No pair operator yet → resume at the operator, not the value (AS-1192).
      await user.click(pairAttr());
      expect(onPairSegmentClick).toHaveBeenLastCalledWith('operator', expect.anything());

      // Operator chosen but value still missing → resume at the value (AS-1179).
      rerender(
        <FilterInputChip
          attribute='Context Param'
          operator='is'
          value='header'
          pair={{ attribute: 'Value', operator: 'is', value: '', error: 'value' }}
          onPairSegmentClick={onPairSegmentClick}
        />,
      );
      await user.click(pairAttr());
      expect(onPairSegmentClick).toHaveBeenLastCalledWith('value', expect.anything());

      // A complete pair keeps the label non-interactive.
      rerender(
        <FilterInputChip
          attribute='Context Param'
          operator='is'
          value='header'
          pair={{ attribute: 'Value', operator: 'is', value: 'yyy' }}
          onPairSegmentClick={onPairSegmentClick}
        />,
      );
      expect(pairAttr()).not.toHaveAttribute('role', 'button');
    });

    it('renders the whole chip as errored when only the paired triplet errors (AS-1179)', () => {
      const { container } = render(
        <FilterInputChip
          attribute='Context Param'
          operator='is'
          value='xxx'
          pair={{ attribute: 'Value', operator: 'is', value: '', error: 'value' }}
        />,
      );
      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]');
      // Container reflects the pair error even though the base triplet is valid.
      expect(chip?.className).toContain('border-border-danger');
    });

    it('renders the separator as aria-hidden and non-interactive', () => {
      const { container } = render(
        <FilterInputChip
          attribute='Context Param'
          operator='is'
          value='xxx'
          pair={{ attribute: 'Value', operator: 'is', value: 'yyy' }}
        />,
      );
      const separator = container.querySelector('[data-slot="segment-separator"]');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('aria-hidden');
    });

    it('calls onPairSegmentClick when a paired value is clicked', async () => {
      const user = userEvent.setup();
      const onPairSegmentClick = vi.fn();
      render(
        <FilterInputChip
          attribute='Context Param'
          operator='is'
          value='xxx'
          pair={{ attribute: 'Value', operator: 'is', value: 'yyy' }}
          onPairSegmentClick={onPairSegmentClick}
        />,
      );
      await user.click(screen.getByText('yyy'));
      expect(onPairSegmentClick).toHaveBeenCalledWith('value', expect.any(HTMLElement));
    });
  });
});

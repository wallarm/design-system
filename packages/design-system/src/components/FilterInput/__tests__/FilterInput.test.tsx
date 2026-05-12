import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterInput } from '../FilterInput';
import type { Condition, FieldMetadata, Group } from '../types';

const sampleFields = [
  {
    name: 'status',
    label: 'Status',
    type: 'enum' as const,
    values: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
    ],
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'integer' as const,
    values: [
      { value: 1, label: 'Low' },
      { value: 5, label: 'Medium' },
    ],
  },
];

describe('FilterInput', () => {
  describe('basic rendering', () => {
    it('renders with default placeholder', () => {
      render(<FilterInput fields={sampleFields} />);
      expect(screen.getByPlaceholderText('Type to filter...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(<FilterInput fields={sampleFields} placeholder='Search attacks...' />);
      expect(screen.getByPlaceholderText('Search attacks...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<FilterInput fields={sampleFields} className='custom-class' />);
      const wrapper = container.firstElementChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('has combobox role on input', () => {
      render(<FilterInput fields={sampleFields} />);
      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
    });
  });

  describe('controlled mode with single condition', () => {
    it('displays chip when value is a single Condition', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };

      render(<FilterInput fields={sampleFields} value={condition} />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('calls onChange with null when chip is cleared', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };

      render(<FilterInput fields={sampleFields} value={condition} onChange={onChange} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      await user.click(clearButton);

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('controlled mode with Group (multi-condition)', () => {
    it('displays multiple chips with AND connector', () => {
      const group: Group = {
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'status', operator: '=', value: 'active' },
          { type: 'condition', field: 'priority', operator: '=', value: 1 },
        ],
      };

      render(<FilterInput fields={sampleFields} value={group} />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('AND')).toBeInTheDocument();
    });

    it('displays OR connector when group operator is or', () => {
      const group: Group = {
        type: 'group',
        operator: 'or',
        children: [
          { type: 'condition', field: 'status', operator: '=', value: 'active' },
          { type: 'condition', field: 'priority', operator: '=', value: 1 },
        ],
      };

      render(<FilterInput fields={sampleFields} value={group} />);

      expect(screen.getByText('OR')).toBeInTheDocument();
    });
  });

  describe('keyboard hint', () => {
    it('shows keyboard hint when showKeyboardHint is true', () => {
      render(<FilterInput fields={sampleFields} showKeyboardHint={true} />);

      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('does not show keyboard hint by default', () => {
      render(<FilterInput fields={sampleFields} />);

      expect(screen.queryByText('K')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('applies error border when error is true', () => {
      const { container } = render(<FilterInput fields={sampleFields} error={true} />);
      const field = container.querySelector('[data-slot="filter-input"]');
      expect(field).toHaveClass('border-border-strong-danger');
    });

    it('sets aria-invalid when error is true', () => {
      render(<FilterInput fields={sampleFields} error={true} />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('applies normal styling when error is false', () => {
      const { container } = render(<FilterInput fields={sampleFields} error={false} />);
      const field = container.querySelector('[data-slot="filter-input"]');
      expect(field).toHaveClass('border-border-primary');
      expect(field).not.toHaveClass('border-border-strong-danger');
    });
  });

  describe('input focus on empty space click', () => {
    it('has cursor-text wrapper that delegates clicks to input', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };

      const { container } = render(<FilterInput fields={sampleFields} value={condition} />);

      const filterInput = container.querySelector('[data-slot="filter-input"]')!;
      const wrapper = filterInput.querySelector('.cursor-text')!;
      expect(wrapper).toBeTruthy();
      expect(wrapper.classList.contains('cursor-text')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label for clear button when chips exist', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };

      render(<FilterInput fields={sampleFields} value={condition} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearButton).toHaveAttribute('aria-label', 'Clear all filters');
    });

    it('has combobox role attribute on input', () => {
      render(<FilterInput fields={sampleFields} />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });
  });

  describe('AS-929: state leak after segment edit cancel', () => {
    it('reopens field menu after editing a value segment, blurring, and removing the chip', async () => {
      const user = userEvent.setup();
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };

      render(<FilterInput fields={sampleFields} value={condition} />);

      const input = screen.getByRole('combobox');

      // Step 1: Click value segment to enter editing mode.
      const valueSegment = screen.getByRole('button', { name: /Edit filter value/i });
      await user.click(valueSegment);

      // Sanity: segment is now an editable input.
      const segmentInput = screen.getByLabelText('Filter value');
      expect(segmentInput.tagName).toBe('INPUT');

      // Step 2: Blur the segment by focusing back to the main input
      // (cursor leaves the value segment but stays inside FilterInput).
      input.focus();

      // Step 3: Remove the chip via the X button.
      const removeButton = screen.getByRole('button', { name: 'Remove filter' });
      await user.click(removeButton);

      // Step 4: Click the main input — the field dropdown must reopen.
      await user.click(input);

      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('reopens field menu after Escape cancels a value segment edit and the chip is removed', async () => {
      const user = userEvent.setup();
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };

      render(<FilterInput fields={sampleFields} value={condition} />);

      const input = screen.getByRole('combobox');

      const valueSegment = screen.getByRole('button', { name: /Edit filter value/i });
      await user.click(valueSegment);

      // Cancel segment edit via Escape — same code path as blur, but a
      // different entry point (handleSegmentEditKeyDown). Pinning the post-
      // Escape state guards against the editing-state leak resurfacing on
      // either trigger.
      await user.keyboard('{Escape}');

      const removeButton = screen.getByRole('button', { name: 'Remove filter' });
      await user.click(removeButton);

      await user.click(input);

      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('getSuggestions-backed fields (AS-877)', () => {
    const staticCodeField: FieldMetadata = {
      name: 'code',
      label: 'Status code',
      type: 'enum',
      values: [
        { value: '200', label: '200 OK' },
        { value: '404', label: '404 Not Found' },
      ],
    };

    const dynamicCodeField: FieldMetadata = {
      name: 'code',
      label: 'Status code',
      type: 'integer',
      getSuggestions: (t: string) => [{ value: `${t || '2'}00`, label: `${t || '2'}00` }],
    };

    it('renders a specific invalid-value error for static-allowlist field', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'code',
        operator: 'in',
        value: ['200', 'bogus'],
        error: 'value',
      };

      render(<FilterInput fields={[staticCodeField]} value={condition} />);

      expect(screen.getByText('Invalid value for Status code: bogus')).toBeInTheDocument();
    });

    it('renders a generic invalid-value error for dynamic (getSuggestions) field', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'code',
        operator: 'in',
        value: ['bogus'],
        error: 'value',
      };

      render(<FilterInput fields={[dynamicCodeField]} value={condition} />);

      expect(screen.getByText('Invalid value for Status code')).toBeInTheDocument();
      // Must NOT include the specific value — the list is a hint, not an allowlist.
      expect(screen.queryByText('Invalid value for Status code: bogus')).not.toBeInTheDocument();
    });

    it('does not render any error for dynamic field without per-condition error flag', () => {
      // Consumer accepts arbitrary values (e.g. free-typed status code '429').
      // Without an `error: 'value'` marker set by the consumer, we expect no alert.
      const condition: Condition = {
        type: 'condition',
        field: 'code',
        operator: '=',
        value: '429',
      };

      render(<FilterInput fields={[dynamicCodeField]} value={condition} />);

      expect(screen.queryByText(/Invalid value for Status code/)).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not call getSuggestions during initial render of a committed chip', () => {
      const spy = vi.fn(() => [{ value: 'only', label: 'Only' }]);
      const field: FieldMetadata = {
        name: 'code',
        label: 'Status code',
        type: 'integer',
        getSuggestions: spy,
      };
      const condition: Condition = {
        type: 'condition',
        field: 'code',
        operator: '=',
        value: '429',
      };

      render(<FilterInput fields={[field]} value={condition} />);

      // With no selected field + no open menu, the autocomplete pipeline should not
      // prefetch suggestions. This pins the "dynamic fields don't run on every render"
      // behavior — if anyone adds a blanket getFieldValues() call at FilterInput top level,
      // this test will fail.
      expect(spy).not.toHaveBeenCalled();
    });

    it('renders chip for dynamic field without attempting to validate value against static list', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'code',
        operator: '=',
        value: '429',
      };

      render(<FilterInput fields={[dynamicCodeField]} value={condition} />);

      // Chip renders with the free-typed value — validation does not flag it.
      expect(screen.getByText('Status code')).toBeInTheDocument();
      expect(screen.getByText('429')).toBeInTheDocument();
    });
  });
});

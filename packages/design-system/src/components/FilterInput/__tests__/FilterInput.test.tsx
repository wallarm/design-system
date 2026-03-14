import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterInput } from '../FilterInput';
import type { Condition, Group } from '../types';

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
});

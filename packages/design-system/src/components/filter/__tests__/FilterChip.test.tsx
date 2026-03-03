import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterChip } from '../FilterChip';

describe('FilterChip', () => {
  describe('chip variant', () => {
    it('renders chip variant with attribute, operator, and value', () => {
      render(
        <FilterChip variant='chip' attribute='IP Address' operator='is' value='192.168.1.1' />,
      );

      expect(screen.getByText('IP Address')).toBeInTheDocument();
      expect(screen.getByText('is')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    });

    it('renders chip variant with only attribute', () => {
      render(<FilterChip variant='chip' attribute='Country' />);

      expect(screen.getByText('Country')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <FilterChip variant='chip' attribute='Test' className='custom-class' />,
      );

      const chip = container.querySelector('[data-slot="filter-chip"]');
      expect(chip).toHaveClass('custom-class');
    });

    it('shows delete button on hover when onRemove is provided', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      const { container } = render(
        <FilterChip variant='chip' attribute='Test' onRemove={onRemove} />,
      );

      const chip = container.querySelector('[data-slot="filter-chip"]');
      expect(chip).toBeInTheDocument();

      // Hover over the chip
      await user.hover(chip!);

      // Delete button should be visible
      const deleteButton = screen.getByRole('button', { name: /remove filter/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('calls onRemove when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      const { container } = render(
        <FilterChip variant='chip' attribute='Test' onRemove={onRemove} />,
      );

      const chip = container.querySelector('[data-slot="filter-chip"]');

      // Hover over the chip to show delete button using fireEvent
      fireEvent.mouseEnter(chip!);

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /remove filter/i });
      await user.click(deleteButton);

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('does not show delete button when onRemove is not provided', async () => {
      const user = userEvent.setup();

      const { container } = render(<FilterChip variant='chip' attribute='Test' />);

      const chip = container.querySelector('[data-slot="filter-chip"]');

      // Hover over the chip
      await user.hover(chip!);

      // Delete button should not be visible
      const deleteButton = screen.queryByRole('button', { name: /remove filter/i });
      expect(deleteButton).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('applies error styling when error is true', () => {
      const { container } = render(<FilterChip variant='chip' attribute='Test' error={true} />);

      const chip = container.querySelector('[data-slot="filter-chip"]');
      expect(chip).toHaveClass('bg-bg-light-danger', 'border-border-danger');
    });

    it('applies normal styling when error is false', () => {
      const { container } = render(<FilterChip variant='chip' attribute='Test' error={false} />);

      const chip = container.querySelector('[data-slot="filter-chip"]');
      expect(chip).toHaveClass('bg-badge-badge-bg', 'border-border-primary');
    });
  });

  describe('and variant', () => {
    it('renders AND text', () => {
      render(<FilterChip variant='and' />);
      expect(screen.getByText('AND')).toBeInTheDocument();
    });

    it('applies correct styling', () => {
      const { container } = render(<FilterChip variant='and' />);
      const chip = container.querySelector('[data-slot="filter-chip"]');
      expect(chip).toHaveClass('text-text-secondary', 'bg-badge-badge-bg');
    });
  });

  describe('or variant', () => {
    it('renders OR text', () => {
      render(<FilterChip variant='or' />);
      expect(screen.getByText('OR')).toBeInTheDocument();
    });

    it('applies correct styling', () => {
      const { container } = render(<FilterChip variant='or' />);
      const chip = container.querySelector('[data-slot="filter-chip"]');
      expect(chip).toHaveClass('text-text-secondary', 'bg-badge-badge-bg');
    });
  });

  describe('parenthesis variants', () => {
    it('renders opening parenthesis', () => {
      render(<FilterChip variant='(' />);
      expect(screen.getByText('(')).toBeInTheDocument();
    });

    it('renders closing parenthesis', () => {
      render(<FilterChip variant=')' />);
      expect(screen.getByText(')')).toBeInTheDocument();
    });

    it('applies correct styling to opening parenthesis', () => {
      const { container } = render(<FilterChip variant='(' />);
      const chip = container.querySelector('[data-slot="filter-chip"]');
      expect(chip).toHaveClass('text-text-secondary', 'bg-badge-badge-bg');
    });

    it('applies correct styling to closing parenthesis', () => {
      const { container } = render(<FilterChip variant=')' />);
      const chip = container.querySelector('[data-slot="filter-chip"]');
      expect(chip).toHaveClass('text-text-secondary', 'bg-badge-badge-bg');
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label for delete button', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      const { container } = render(
        <FilterChip variant='chip' attribute='Test' onRemove={onRemove} />,
      );

      const chip = container.querySelector('[data-slot="filter-chip"]');
      await user.hover(chip!);

      const deleteButton = screen.getByRole('button', { name: /remove filter/i });
      expect(deleteButton).toHaveAttribute('aria-label', 'Remove filter');
    });
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BuildingFilterChip } from '../BuildingFilterChip';
import { ConnectorChip } from '../ConnectorChip';
import { FilterChip } from '../FilterChip';

describe('FilterChip', () => {
  it('renders chip with attribute, operator, and value', () => {
    render(
      <FilterChip attribute='IP Address' operator='is' value='192.168.1.1' />,
    );

    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('renders chip with only attribute', () => {
    render(<FilterChip attribute='Country' />);

    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FilterChip attribute='Test' className='custom-class' />,
    );

    const chip = container.querySelector('[data-slot="filter-chip"]');
    expect(chip).toHaveClass('custom-class');
  });

  it('shows delete button on hover when onRemove is provided', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    const { container } = render(
      <FilterChip attribute='Test' onRemove={onRemove} />,
    );

    const chip = container.querySelector('[data-slot="filter-chip"]');
    await user.hover(chip!);

    const deleteButton = screen.getByRole('button', { name: /remove filter/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('calls onRemove when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    const { container } = render(
      <FilterChip attribute='Test' onRemove={onRemove} />,
    );

    const chip = container.querySelector('[data-slot="filter-chip"]');
    fireEvent.mouseEnter(chip!);

    const deleteButton = screen.getByRole('button', { name: /remove filter/i });
    await user.click(deleteButton);

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not show delete button when onRemove is not provided', async () => {
    const user = userEvent.setup();

    const { container } = render(<FilterChip attribute='Test' />);

    const chip = container.querySelector('[data-slot="filter-chip"]');
    await user.hover(chip!);

    const deleteButton = screen.queryByRole('button', { name: /remove filter/i });
    expect(deleteButton).not.toBeInTheDocument();
  });

  describe('error state', () => {
    it('applies error styling when error is true', () => {
      const { container } = render(<FilterChip attribute='Test' error={true} />);

      const chip = container.querySelector('[data-slot="filter-chip"]');
      expect(chip).toHaveClass('bg-bg-light-danger', 'border-border-danger');
    });

    it('applies normal styling when error is false', () => {
      const { container } = render(<FilterChip attribute='Test' error={false} />);

      const chip = container.querySelector('[data-slot="filter-chip"]');
      expect(chip).toHaveClass('bg-badge-badge-bg', 'border-border-primary');
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label for delete button', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      const { container } = render(
        <FilterChip attribute='Test' onRemove={onRemove} />,
      );

      const chip = container.querySelector('[data-slot="filter-chip"]');
      await user.hover(chip!);

      const deleteButton = screen.getByRole('button', { name: /remove filter/i });
      expect(deleteButton).toHaveAttribute('aria-label', 'Remove filter');
    });
  });
});

describe('ConnectorChip', () => {
  it('renders AND text', () => {
    render(<ConnectorChip variant='and' />);
    expect(screen.getByText('AND')).toBeInTheDocument();
  });

  it('renders OR text', () => {
    render(<ConnectorChip variant='or' />);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it('renders opening parenthesis', () => {
    render(<ConnectorChip variant='(' />);
    expect(screen.getByText('(')).toBeInTheDocument();
  });

  it('renders closing parenthesis', () => {
    render(<ConnectorChip variant=')' />);
    expect(screen.getByText(')')).toBeInTheDocument();
  });

  it('applies error styling', () => {
    const { container } = render(<ConnectorChip variant='and' error />);
    const chip = container.querySelector('[data-slot="filter-chip"]');
    expect(chip).toHaveClass('bg-bg-light-danger', 'border-border-danger');
  });

  it('applies normal styling', () => {
    const { container } = render(<ConnectorChip variant='and' />);
    const chip = container.querySelector('[data-slot="filter-chip"]');
    expect(chip).toHaveClass('bg-badge-badge-bg', 'border-border-primary');
  });
});

describe('BuildingFilterChip', () => {
  it('renders with only attribute', () => {
    render(<BuildingFilterChip attribute='IP Address' />);
    expect(screen.getByText('IP Address')).toBeInTheDocument();
  });

  it('renders with attribute and operator', () => {
    render(<BuildingFilterChip attribute='IP Address' operator='is' />);
    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
  });

  it('renders with attribute, operator, and value', () => {
    render(<BuildingFilterChip attribute='IP Address' operator='is' value='192.168.1.1' />);
    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('does not have hover/remove functionality', () => {
    const { container } = render(<BuildingFilterChip attribute='Test' />);
    const chip = container.querySelector('[data-slot="filter-chip"]');
    fireEvent.mouseEnter(chip!);

    const deleteButton = screen.queryByRole('button', { name: /remove filter/i });
    expect(deleteButton).not.toBeInTheDocument();
  });
});

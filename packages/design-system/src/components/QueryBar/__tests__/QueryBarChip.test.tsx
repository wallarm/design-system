import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QueryBarChip, QueryBarConnectorChip } from '../QueryBarInput';

describe('QueryBarChip', () => {
  it('renders chip with attribute, operator, and value', () => {
    render(<QueryBarChip attribute='IP Address' operator='is' value='192.168.1.1' />);

    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('renders chip with only attribute', () => {
    render(<QueryBarChip attribute='Country' />);

    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<QueryBarChip attribute='Test' className='custom-class' />);

    const chip = container.querySelector('[data-slot="query-bar-condition-chip"]');
    expect(chip).toHaveClass('custom-class');
  });

  it('renders delete button when onRemove is provided', () => {
    const onRemove = vi.fn();
    render(<QueryBarChip attribute='Test' onRemove={onRemove} />);
    const deleteButton = screen.getByRole('button', { name: /remove filter/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('calls onRemove when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<QueryBarChip attribute='Test' onRemove={onRemove} />);
    const deleteButton = screen.getByRole('button', { name: /remove filter/i });
    await user.click(deleteButton);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not show delete button when onRemove is not provided', async () => {
    const user = userEvent.setup();

    const { container } = render(<QueryBarChip attribute='Test' />);

    const chip = container.querySelector('[data-slot="query-bar-condition-chip"]');
    await user.hover(chip!);

    const deleteButton = screen.queryByRole('button', { name: /remove filter/i });
    expect(deleteButton).not.toBeInTheDocument();
  });

  describe('error state', () => {
    it('applies error styling when error is true', () => {
      const { container } = render(<QueryBarChip attribute='Test' error={true} />);

      const chip = container.querySelector('[data-slot="query-bar-condition-chip"]');
      expect(chip).toHaveClass('bg-bg-light-danger', 'border-border-danger');
    });

    it('applies normal styling when error is false', () => {
      const { container } = render(<QueryBarChip attribute='Test' error={false} />);

      const chip = container.querySelector('[data-slot="query-bar-condition-chip"]');
      expect(chip).toHaveClass('bg-badge-badge-bg', 'border-border-primary');
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label for delete button', () => {
      const onRemove = vi.fn();
      render(<QueryBarChip attribute='Test' onRemove={onRemove} />);
      const deleteButton = screen.getByRole('button', { name: /remove filter/i });
      expect(deleteButton).toHaveAttribute('aria-label', 'Remove filter');
    });
  });
});

describe('QueryBarConnectorChip', () => {
  it('renders AND text', () => {
    render(<QueryBarConnectorChip variant='and' chipId='c-1' onChange={vi.fn()} />);
    expect(screen.getByText('AND')).toBeInTheDocument();
  });

  it('renders OR text', () => {
    render(<QueryBarConnectorChip variant='or' chipId='c-1' onChange={vi.fn()} />);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it('applies normal styling', () => {
    const { container } = render(
      <QueryBarConnectorChip variant='and' chipId='c-1' onChange={vi.fn()} />,
    );
    const chip = container.querySelector('[data-slot="query-bar-connector-chip"]');
    expect(chip).toHaveClass('bg-badge-badge-bg', 'border-border-primary');
  });
});

describe('QueryBarChip building mode', () => {
  it('renders with only attribute', () => {
    render(<QueryBarChip building attribute='IP Address' />);
    expect(screen.getByText('IP Address')).toBeInTheDocument();
  });

  it('renders with attribute and operator', () => {
    render(<QueryBarChip building attribute='IP Address' operator='is' />);
    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
  });

  it('renders with attribute, operator, and value', () => {
    render(<QueryBarChip building attribute='IP Address' operator='is' value='192.168.1.1' />);
    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('does not have hover/remove functionality', () => {
    const { container } = render(<QueryBarChip building attribute='Test' />);
    const chip = container.querySelector('[data-slot="query-bar-condition-chip"]');
    fireEvent.mouseEnter(chip!);

    const deleteButton = screen.queryByRole('button', { name: /remove filter/i });
    expect(deleteButton).not.toBeInTheDocument();
  });
});

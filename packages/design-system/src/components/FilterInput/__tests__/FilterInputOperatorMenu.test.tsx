// TODO: These tests render DropdownMenu (Ark UI Portal + state machine) which does not
// work reliably in jsdom. Migrate to Playwright e2e tests for full interaction coverage.
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterInputOperatorMenu } from '../FilterInputMenu';
import { OPERATOR_LABELS, OPERATORS_BY_TYPE } from '../lib';

describe.skip('FilterInputOperatorMenu', () => {
  describe('operator filtering by field type', () => {
    it('displays operators for string field type', () => {
      render(<FilterInputOperatorMenu fieldType='string' onSelect={vi.fn()} open={true} />);

      const stringOperators = OPERATORS_BY_TYPE.string;
      for (const operator of stringOperators) {
        expect(screen.getByText(OPERATOR_LABELS[operator])).toBeInTheDocument();
      }
    });

    it('displays operators for integer field type', () => {
      render(<FilterInputOperatorMenu fieldType='integer' onSelect={vi.fn()} open={true} />);

      const integerOperators = OPERATORS_BY_TYPE.integer;
      // Check for numeric operators
      expect(screen.getByText(OPERATOR_LABELS['='])).toBeInTheDocument();
      expect(screen.getByText(OPERATOR_LABELS['>'])).toBeInTheDocument();
      expect(screen.getByText(OPERATOR_LABELS['<'])).toBeInTheDocument();
      expect(screen.getByText(OPERATOR_LABELS.between)).toBeInTheDocument();

      // Verify correct count
      const allButtons = screen.getAllByRole('menuitem');
      expect(allButtons).toHaveLength(integerOperators.length);
    });

    it('displays operators for boolean field type', () => {
      render(<FilterInputOperatorMenu fieldType='boolean' onSelect={vi.fn()} open={true} />);

      const booleanOperators = OPERATORS_BY_TYPE.boolean;
      const allButtons = screen.getAllByRole('menuitem');
      expect(allButtons).toHaveLength(booleanOperators.length);
    });

    it('displays operators for date field type', () => {
      render(<FilterInputOperatorMenu fieldType='date' onSelect={vi.fn()} open={true} />);

      const dateOperators = OPERATORS_BY_TYPE.date;
      const allButtons = screen.getAllByRole('menuitem');
      expect(allButtons).toHaveLength(dateOperators.length);
    });
  });

  describe('operator selection', () => {
    it('calls onSelect when operator is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<FilterInputOperatorMenu fieldType='string' onSelect={onSelect} open={true} />);

      const isButton = screen.getByText(OPERATOR_LABELS['=']);
      await user.click(isButton);

      expect(onSelect).toHaveBeenCalledWith('=');
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenChange(false) after selection', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const onOpenChange = vi.fn();

      render(
        <FilterInputOperatorMenu
          fieldType='string'
          onSelect={onSelect}
          onOpenChange={onOpenChange}
          open={true}
        />,
      );

      const isButton = screen.getByText(OPERATOR_LABELS['=']);
      await user.click(isButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('highlights selected operator with aria-selected', () => {
      render(
        <FilterInputOperatorMenu
          fieldType='string'
          selectedOperator='='
          onSelect={vi.fn()}
          open={true}
        />,
      );

      // Find the button containing the label text
      const isButton = screen.getByText(OPERATOR_LABELS['=']).closest('button');
      // Check for aria-selected attribute which indicates selection
      expect(isButton).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('open/closed state', () => {
    it('returns null when open is false', () => {
      const { container } = render(
        <FilterInputOperatorMenu fieldType='string' onSelect={vi.fn()} open={false} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders menu when open is true', () => {
      render(<FilterInputOperatorMenu fieldType='string' onSelect={vi.fn()} open={true} />);

      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates down with ArrowDown key', async () => {
      const user = userEvent.setup();

      render(<FilterInputOperatorMenu fieldType='string' onSelect={vi.fn()} open={true} />);

      const menu = screen.getByRole('menu');
      menu.focus();

      await user.keyboard('{ArrowDown}');

      // Second item should be highlighted
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems[1]).toHaveClass('bg-gray-100');
    });

    it('navigates up with ArrowUp key', async () => {
      const user = userEvent.setup();

      render(<FilterInputOperatorMenu fieldType='string' onSelect={vi.fn()} open={true} />);

      const menu = screen.getByRole('menu');
      menu.focus();

      // Press ArrowUp to go to last item (wraps around)
      await user.keyboard('{ArrowUp}');

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems[menuItems.length - 1]).toHaveClass('bg-gray-100');
    });

    it('selects highlighted item with Enter key', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<FilterInputOperatorMenu fieldType='string' onSelect={onSelect} open={true} />);

      const menu = screen.getByRole('menu');
      menu.focus();

      await user.keyboard('{Enter}');

      // First operator should be selected (default highlighted)
      expect(onSelect).toHaveBeenCalledWith(OPERATORS_BY_TYPE.string[0]);
    });

    it('closes menu with Escape key', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <FilterInputOperatorMenu
          fieldType='string'
          onSelect={vi.fn()}
          onOpenChange={onOpenChange}
          open={true}
        />,
      );

      const menu = screen.getByRole('menu');
      menu.focus();

      await user.keyboard('{Escape}');

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<FilterInputOperatorMenu fieldType='string' onSelect={vi.fn()} open={true} />);

      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-label', 'Filter operators');
      expect(menu).toHaveAttribute('aria-expanded', 'true');
    });

    it('has correct role attributes for menu items', () => {
      render(<FilterInputOperatorMenu fieldType='string' onSelect={vi.fn()} open={true} />);

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <FilterInputOperatorMenu
          fieldType='string'
          onSelect={vi.fn()}
          open={true}
          className='custom-class'
        />,
      );

      const menu = container.querySelector('[data-slot="filter-operator-menu"]');
      expect(menu).toHaveClass('custom-class');
    });

    it('has correct base styling', () => {
      const { container } = render(
        <FilterInputOperatorMenu fieldType='string' onSelect={vi.fn()} open={true} />,
      );

      const menu = container.querySelector('[data-slot="filter-operator-menu"]');
      expect(menu).toHaveClass('w-64', 'bg-white', 'rounded-xl');
    });
  });
});

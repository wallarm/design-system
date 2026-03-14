// TODO: These tests render DropdownMenu (Ark UI Portal + state machine) which does not
// work reliably in jsdom. Migrate to Playwright e2e tests for full interaction coverage.
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterInputFieldMenu } from '../FilterInputMenu';
import type { FieldMetadata } from '../types';

const mockFields: FieldMetadata[] = [
  { name: 'ip_address', label: 'IP Address', type: 'string' },
  { name: 'country', label: 'Country', type: 'enum' },
  { name: 'timestamp', label: 'Timestamp', type: 'date' },
  { name: 'request_count', label: 'Request Count', type: 'integer' },
  { name: 'response_time', label: 'Response Time', type: 'float' },
];

describe.skip('FilterInputFieldMenu', () => {
  describe('field list display', () => {
    it('displays all fields by label', () => {
      render(<FilterInputFieldMenu fields={mockFields} onSelect={vi.fn()} open={true} />);

      for (const field of mockFields) {
        expect(screen.getByText(field.label)).toBeInTheDocument();
      }
    });

    it('returns null when open is false', () => {
      const { container } = render(
        <FilterInputFieldMenu fields={mockFields} onSelect={vi.fn()} open={false} />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('search functionality', () => {
    it('filters fields by label (case-insensitive)', async () => {
      const user = userEvent.setup();

      render(<FilterInputFieldMenu fields={mockFields} onSelect={vi.fn()} open={true} />);

      const searchInput = screen.getByPlaceholderText('Search fields...');
      await user.type(searchInput, 'count');

      // Should show "Country" and "Request Count"
      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Request Count')).toBeInTheDocument();

      // Should not show other fields
      expect(screen.queryByText('IP Address')).not.toBeInTheDocument();
      expect(screen.queryByText('Timestamp')).not.toBeInTheDocument();
    });

    it('filters fields by name (case-insensitive)', async () => {
      const user = userEvent.setup();

      render(<FilterInputFieldMenu fields={mockFields} onSelect={vi.fn()} open={true} />);

      const searchInput = screen.getByPlaceholderText('Search fields...');
      await user.type(searchInput, 'ip_add');

      expect(screen.getByText('IP Address')).toBeInTheDocument();
      expect(screen.queryByText('Country')).not.toBeInTheDocument();
    });

    it('shows empty state when no matches found', async () => {
      const user = userEvent.setup();

      render(<FilterInputFieldMenu fields={mockFields} onSelect={vi.fn()} open={true} />);

      const searchInput = screen.getByPlaceholderText('Search fields...');
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByText('No fields found')).toBeInTheDocument();
    });

    it('resets search query after field selection', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<FilterInputFieldMenu fields={mockFields} onSelect={onSelect} open={true} />);

      const searchInput = screen.getByPlaceholderText('Search fields...') as HTMLInputElement;
      await user.type(searchInput, 'country');

      const countryButton = screen.getByText('Country');
      await user.click(countryButton);

      expect(searchInput.value).toBe('');
    });
  });

  describe('field selection', () => {
    it('calls onSelect when field is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<FilterInputFieldMenu fields={mockFields} onSelect={onSelect} open={true} />);

      const ipAddressButton = screen.getByText('IP Address');
      await user.click(ipAddressButton);

      expect(onSelect).toHaveBeenCalledWith(mockFields[0]);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenChange(false) after selection', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const onOpenChange = vi.fn();

      render(
        <FilterInputFieldMenu
          fields={mockFields}
          onSelect={onSelect}
          onOpenChange={onOpenChange}
          open={true}
        />,
      );

      const ipAddressButton = screen.getByText('IP Address');
      await user.click(ipAddressButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('recent fields section', () => {
    const recentFields: FieldMetadata[] = [
      mockFields[0], // IP Address
      mockFields[1], // Country
    ];

    it('displays recent fields section when recentFields provided', () => {
      render(
        <FilterInputFieldMenu
          fields={mockFields}
          onSelect={vi.fn()}
          open={true}
          recentFields={recentFields}
        />,
      );

      expect(screen.getByText('Recent')).toBeInTheDocument();
      expect(screen.getAllByText('IP Address')).toHaveLength(2); // One in recent, one in all fields
      expect(screen.getAllByText('Country')).toHaveLength(2);
    });

    it('limits recent fields to max 3', () => {
      const manyRecentFields = [...mockFields]; // 5 fields

      render(
        <FilterInputFieldMenu
          fields={mockFields}
          onSelect={vi.fn()}
          open={true}
          recentFields={manyRecentFields}
        />,
      );

      // Count buttons in recent section (before separator)
      const recentSection = screen.getByText('Recent').parentElement;
      const recentButtons = recentSection?.querySelectorAll('button');
      expect(recentButtons?.length).toBe(3);
    });

    it('filters recent fields based on search query', async () => {
      const user = userEvent.setup();

      render(
        <FilterInputFieldMenu
          fields={mockFields}
          onSelect={vi.fn()}
          open={true}
          recentFields={recentFields}
        />,
      );

      const searchInput = screen.getByPlaceholderText('Search fields...');
      await user.type(searchInput, 'country');

      // Recent section should only show Country
      const recentSection = screen.getByText('Recent').parentElement;
      const recentButtons = recentSection?.querySelectorAll('button');
      expect(recentButtons?.length).toBe(1);
      expect(screen.getAllByText('Country')).toHaveLength(2); // One in recent, one in all
    });

    it('hides recent section when no recent fields match search', async () => {
      const user = userEvent.setup();

      render(
        <FilterInputFieldMenu
          fields={mockFields}
          onSelect={vi.fn()}
          open={true}
          recentFields={[mockFields[0]]} // Only IP Address
        />,
      );

      const searchInput = screen.getByPlaceholderText('Search fields...');
      await user.type(searchInput, 'timestamp');

      expect(screen.queryByText('Recent')).not.toBeInTheDocument();
    });
  });

  describe('suggestions section', () => {
    const suggestedFields: FieldMetadata[] = [
      mockFields[2], // Timestamp
      mockFields[3], // Request Count
    ];

    it('displays suggestions section when suggestedFields provided', () => {
      render(
        <FilterInputFieldMenu
          fields={mockFields}
          onSelect={vi.fn()}
          open={true}
          suggestedFields={suggestedFields}
        />,
      );

      expect(screen.getByText('Suggestions')).toBeInTheDocument();
      expect(screen.getAllByText('Timestamp')).toHaveLength(2);
      expect(screen.getAllByText('Request Count')).toHaveLength(2);
    });

    it('filters suggested fields based on search query', async () => {
      const user = userEvent.setup();

      render(
        <FilterInputFieldMenu
          fields={mockFields}
          onSelect={vi.fn()}
          open={true}
          suggestedFields={suggestedFields}
        />,
      );

      const searchInput = screen.getByPlaceholderText('Search fields...');
      await user.type(searchInput, 'timestamp');

      const suggestionsSection = screen.getByText('Suggestions').parentElement;
      const suggestedButtons = suggestionsSection?.querySelectorAll('button');
      expect(suggestedButtons?.length).toBe(1);
    });
  });

  describe('keyboard navigation hints', () => {
    it('displays keyboard navigation hints', () => {
      render(<FilterInputFieldMenu fields={mockFields} onSelect={vi.fn()} open={true} />);

      expect(screen.getByText('to navigate')).toBeInTheDocument();
      expect(screen.getByText('to select')).toBeInTheDocument();
      expect(screen.getByText('↑')).toBeInTheDocument();
      expect(screen.getByText('↓')).toBeInTheDocument();
      expect(screen.getByText('↵')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<FilterInputFieldMenu fields={mockFields} onSelect={vi.fn()} open={true} />);

      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-label', 'Filter fields');
      expect(menu).toHaveAttribute('aria-expanded', 'true');
    });

    it('has correct role attributes for menu items', () => {
      render(<FilterInputFieldMenu fields={mockFields} onSelect={vi.fn()} open={true} />);

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBe(mockFields.length);
    });

    it('search input is rendered', () => {
      render(<FilterInputFieldMenu fields={mockFields} onSelect={vi.fn()} open={true} />);

      const searchInput = screen.getByPlaceholderText('Search fields...');
      // Verify search input is in the document
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <FilterInputFieldMenu
          fields={mockFields}
          onSelect={vi.fn()}
          open={true}
          className='custom-class'
        />,
      );

      const menu = container.querySelector('[data-slot="filter-input-field-menu"]');
      expect(menu).toHaveClass('custom-class');
    });

    it('has correct base styling', () => {
      const { container } = render(
        <FilterInputFieldMenu fields={mockFields} onSelect={vi.fn()} open={true} />,
      );

      const menu = container.querySelector('[data-slot="filter-input-field-menu"]');
      expect(menu).toHaveClass('w-80', 'bg-white', 'rounded-xl');
    });
  });
});

import type { ReactNode } from 'react';

/**
 * Item in a dropdown menu
 */
export interface FilterDropdownItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Value to return on selection */
  value: any;
  /** Optional icon to display */
  icon?: ReactNode;
  /** Optional badge with color and text */
  badge?: {
    color: string;
    text: string;
  };
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether item shows a submenu arrow */
  hasSubmenu?: boolean;
  /** Custom renderer for item content */
  renderContent?: (item: FilterDropdownItem) => ReactNode;
}

/**
 * Section in a dropdown menu (group of items)
 */
export interface FilterDropdownSection {
  /** Unique identifier */
  id: string;
  /** Optional section title/header */
  title?: string;
  /** Items in this section */
  items: FilterDropdownItem[];
  /** Whether to show separator after this section */
  showSeparator?: boolean;
}

/**
 * Props for FilterDropdownBase component
 */
export interface FilterDropdownBaseProps {
  /** Sections to display in the dropdown */
  sections: FilterDropdownSection[];
  /** Callback when item is selected */
  onSelect: (item: FilterDropdownItem) => void;
  /** Whether the dropdown is open */
  open?: boolean;
  /** Callback when open state should change */
  onOpenChange?: (open: boolean) => void;
  /** Custom footer hint text */
  footerHint?: string;
  /** Optional custom class name */
  className?: string;
}

import type { FC } from 'react';
import { Settings } from '../../../icons';
import { NavRailFooter, NavRailItem } from '../../NavRail';
import type { Theme } from '../../ThemeProvider';
import { AccountDropdown, type SidebarMode } from './_storyAccountDropdown';
import type { Product } from './_storyLib';

interface NavRailFooterContentProps {
  activeProduct: Product;
  onSelectProduct: (product: Product) => void;
  sidebarMode: SidebarMode;
  onSidebarModeChange: (mode: SidebarMode) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const NavRailFooterContent: FC<NavRailFooterContentProps> = ({
  activeProduct,
  onSelectProduct,
  sidebarMode,
  onSidebarModeChange,
  theme,
  onThemeChange,
}) => (
  <NavRailFooter>
    <NavRailItem
      icon={Settings}
      label='Settings'
      shortcut={['G', 'S']}
      active={activeProduct === 'settings'}
      onClick={() => onSelectProduct('settings')}
    />
    <AccountDropdown
      sidebarMode={sidebarMode}
      onSidebarModeChange={onSidebarModeChange}
      theme={theme}
      onThemeChange={onThemeChange}
    />
  </NavRailFooter>
);

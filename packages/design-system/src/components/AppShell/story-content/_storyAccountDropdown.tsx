import { Check, LogOut, PanelLeftDashed, PencilRuler, Settings, User } from '../../../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemContent,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuTriggerItem,
} from '../../DropdownMenu';
import { NavRailItem } from '../../NavRail';
import { HStack, VStack } from '../../Stack';
import { Text } from '../../Text';
import type { Theme } from '../../ThemeProvider';

export type SidebarMode = 'adaptive' | 'expanded';

const USER_NAME = 'Meow Meow';
const USER_EMAIL = 'meow@meow.com';

const THEME_LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
};

const SIDEBAR_MODE_LABELS: Record<SidebarMode, string> = {
  adaptive: 'Adaptive',
  expanded: 'Always expanded',
};

export const AccountDropdown = ({
  sidebarMode,
  onSidebarModeChange,
  theme,
  onThemeChange,
}: {
  sidebarMode: SidebarMode;
  onSidebarModeChange: (mode: SidebarMode) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}) => (
  <DropdownMenu positioning={{ placement: 'right-end', gutter: 6, offset: { crossAxis: 12 } }}>
    <DropdownMenuTrigger>
      <NavRailItem icon={User} label={USER_NAME} />
    </DropdownMenuTrigger>
    <DropdownMenuContent className='w-256'>
      <div className='rounded-6 border border-border-primary-light bg-states-primary-hover px-8 py-8 mb-4'>
        <HStack gap={8} align='start'>
          <div>
            <User />
          </div>
          <VStack gap={0}>
            <Text size='sm' color='primary'>
              {USER_NAME}
            </Text>
            <Text size='xs' color='secondary'>
              {USER_EMAIL}
            </Text>
          </VStack>
        </HStack>
      </div>
      <DropdownMenuItem>
        <DropdownMenuItemIcon>
          <Settings />
        </DropdownMenuItemIcon>
        <DropdownMenuItemText>Profile settings</DropdownMenuItemText>
      </DropdownMenuItem>
      <DropdownMenu>
        <DropdownMenuTriggerItem>
          <DropdownMenuItemIcon>
            <PencilRuler />
          </DropdownMenuItemIcon>
          <DropdownMenuItemContent>
            <DropdownMenuItemText>Theme</DropdownMenuItemText>
            <Text size='xs' color='secondary'>
              {THEME_LABELS[theme]}
            </Text>
          </DropdownMenuItemContent>
        </DropdownMenuTriggerItem>
        <DropdownMenuContent className='w-132'>
          <DropdownMenuItem onSelect={() => onThemeChange('light')}>
            <DropdownMenuItemText>Light</DropdownMenuItemText>
            {theme === 'light' && (
              <DropdownMenuShortcut>
                <Check />
              </DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onThemeChange('dark')}>
            <DropdownMenuItemText>Dark</DropdownMenuItemText>
            {theme === 'dark' && (
              <DropdownMenuShortcut>
                <Check />
              </DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTriggerItem>
          <DropdownMenuItemIcon>
            <PanelLeftDashed />
          </DropdownMenuItemIcon>
          <DropdownMenuItemContent>
            <DropdownMenuItemText>Sidebar mode</DropdownMenuItemText>
            <Text size='xs' color='secondary'>
              {SIDEBAR_MODE_LABELS[sidebarMode]}
            </Text>
          </DropdownMenuItemContent>
        </DropdownMenuTriggerItem>
        <DropdownMenuContent className='w-200'>
          <DropdownMenuItem onSelect={() => onSidebarModeChange('adaptive')}>
            <DropdownMenuItemText>Adaptive</DropdownMenuItemText>
            {sidebarMode === 'adaptive' && (
              <DropdownMenuShortcut>
                <Check />
              </DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSidebarModeChange('expanded')}>
            <DropdownMenuItemText>Always expanded</DropdownMenuItemText>
            {sidebarMode === 'expanded' && (
              <DropdownMenuShortcut>
                <Check />
              </DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <DropdownMenuItemIcon>
          <LogOut />
        </DropdownMenuItemIcon>
        <DropdownMenuItemText>Sign out</DropdownMenuItemText>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

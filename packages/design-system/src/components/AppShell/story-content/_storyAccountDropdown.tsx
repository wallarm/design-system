import { Fragment } from 'react';

import { LogOut, PanelLeftDashed, PencilRuler, Settings, UserRound } from '../../../icons';
import { cn } from '../../../utils/cn';
import {
  Avatar,
  AvatarContent,
  AvatarDescription,
  AvatarFallback,
  AvatarImage,
  AvatarName,
} from '../../Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemContent,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuTriggerItem,
} from '../../DropdownMenu';
import { NavRailItem, type NavRailMode } from '../../NavRail';
import { Text } from '../../Text';
import { type FrameStyle, type Theme, useTheme } from '../../ThemeProvider';

export type SidebarMode = 'adaptive' | 'expanded' | 'collapsed' | 'compact';

/** Adaptive collapses the rail inside a product and expands it on Home; the other modes pin it. */
export const railModeFor = (mode: SidebarMode, onHome: boolean): NavRailMode => {
  if (mode === 'adaptive') return onHome ? 'expanded' : 'collapsed';
  return mode;
};

const USER_NAME = 'Meow Meow';
const USER_EMAIL = 'meow@meow.com';

const THEMES: Theme[] = ['light', 'dark'];
// Adaptive on its own, then the two pinned widths, then compact.
const SIDEBAR_MODE_GROUPS: SidebarMode[][] = [['adaptive'], ['expanded', 'collapsed'], ['compact']];
const SIDEBAR_MODES = SIDEBAR_MODE_GROUPS.flat();

const THEME_LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
};

const FRAME_STYLES: FrameStyle[] = ['neutral', 'branded'];

const FRAME_STYLE_LABELS: Record<FrameStyle, string> = {
  neutral: 'Neutral',
  branded: 'Branded',
};

// The swatch in front of each Frame style option, as in Figma.
const FRAME_STYLE_SWATCH: Record<FrameStyle, string> = {
  neutral: 'bg-icon-secondary',
  branded: 'bg-icon-brand',
};

const SIDEBAR_MODE_LABELS: Record<SidebarMode, string> = {
  adaptive: 'Adaptive',
  expanded: 'Always expanded',
  collapsed: 'Always collapsed',
  compact: 'Compact',
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
}) => {
  const { frameStyle, setFrameStyle } = useTheme();

  return (
    <DropdownMenu positioning={{ placement: 'right-end', gutter: 6, offset: { crossAxis: 12 } }}>
      <DropdownMenuTrigger>
        <NavRailItem icon={UserRound} label={USER_NAME} avatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-256'>
        <div className='mb-4 rounded-6 border border-border-primary-light bg-states-primary-hover px-8 py-8'>
          <Avatar size='md'>
            <AvatarImage />
            <AvatarFallback name={USER_NAME} />
            <AvatarContent>
              <AvatarName>{USER_NAME}</AvatarName>
              <AvatarDescription>{USER_EMAIL}</AvatarDescription>
            </AvatarContent>
          </Avatar>
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
              <DropdownMenuItemText>Appearance</DropdownMenuItemText>
              <Text size='xs' color='secondary'>
                {THEME_LABELS[theme]} and {FRAME_STYLE_LABELS[frameStyle].toLowerCase()}
              </Text>
            </DropdownMenuItemContent>
          </DropdownMenuTriggerItem>
          <DropdownMenuContent className='w-132'>
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={({ value }) => {
                const next = THEMES.find(t => t === value);
                if (next) onThemeChange(next);
              }}
            >
              {THEMES.map(t => (
                <DropdownMenuRadioItem key={t} value={t}>
                  <DropdownMenuItemText>{THEME_LABELS[t]}</DropdownMenuItemText>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={frameStyle}
              onValueChange={({ value }) => {
                const next = FRAME_STYLES.find(s => s === value);
                if (next) setFrameStyle(next);
              }}
            >
              {FRAME_STYLES.map(s => (
                <DropdownMenuRadioItem key={s} value={s}>
                  <DropdownMenuItemIcon>
                    <span className='flex size-16 items-center justify-center'>
                      <span className={cn('size-8 rounded-full', FRAME_STYLE_SWATCH[s])} />
                    </span>
                  </DropdownMenuItemIcon>
                  <DropdownMenuItemText>{FRAME_STYLE_LABELS[s]}</DropdownMenuItemText>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
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
            <DropdownMenuRadioGroup
              value={sidebarMode}
              onValueChange={({ value }) => {
                const next = SIDEBAR_MODES.find(m => m === value);
                if (next) onSidebarModeChange(next);
              }}
            >
              {SIDEBAR_MODE_GROUPS.map((group, index) => (
                <Fragment key={group.join('-')}>
                  {index > 0 && <DropdownMenuSeparator />}
                  {group.map(m => (
                    <DropdownMenuRadioItem key={m} value={m}>
                      <DropdownMenuItemText>{SIDEBAR_MODE_LABELS[m]}</DropdownMenuItemText>
                    </DropdownMenuRadioItem>
                  ))}
                </Fragment>
              ))}
            </DropdownMenuRadioGroup>
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
};

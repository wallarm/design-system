import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  CircleDashed,
  CircleHelp,
  History,
  Home,
  LayoutPanelLeft,
  Settings,
  SlidersHorizontal,
  User,
} from '../../icons';
import { Button } from '../Button';
import { Code } from '../Code';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuTriggerItem,
} from '../DropdownMenu';
import { Kbd } from '../Kbd';
import { NavRail, NavRailBody, NavRailFooter, NavRailItem, NavRailSeparator } from '../NavRail';
import { TopHeader, TopHeaderActions, TopHeaderLogo, TopHeaderSeparator } from '../TopHeader';
import { AppShell, type AppShellProps } from './AppShell';
import { AppShellHeader } from './AppShellHeader';
import { AppShellRail } from './AppShellRail';
import { AppShellRemote } from './AppShellRemote';

const meta = {
  title: 'Navigation/AppShell',
  component: AppShell,
  subcomponents: {
    AppShellHeader,
    AppShellRail,
    AppShellRemote,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Application shell layout using CSS Grid. ' +
          'Provides header, rail (sidebar), and remote (main content) areas. ' +
          'Use compound components: AppShellHeader, AppShellRail, AppShellRemote.',
      },
    },
  },
  argTypes: {
    children: { control: false },
    ref: { control: false },
  },
} satisfies Meta<typeof AppShell>;

export default meta;

type SidebarMode = 'adaptive' | 'expanded';

const USER_NAME = 'Meow Meow';

const AccountDropdown = ({
  sidebarMode,
  onSidebarModeChange,
}: {
  sidebarMode: SidebarMode;
  onSidebarModeChange: (mode: SidebarMode) => void;
}) => {
  return (
    <DropdownMenu positioning={{ placement: 'right-end', gutter: 8 }}>
      <DropdownMenuTrigger asChild>
        <NavRailItem icon={User} label={USER_NAME} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <DropdownMenuItemIcon>
            <CircleDashed />
          </DropdownMenuItemIcon>
          <DropdownMenuItemText>Profile</DropdownMenuItemText>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <DropdownMenuItemIcon>
            <SlidersHorizontal />
          </DropdownMenuItemIcon>
          <DropdownMenuItemText>Theme</DropdownMenuItemText>
        </DropdownMenuItem>
        <DropdownMenu>
          <DropdownMenuTriggerItem>
            <DropdownMenuItemIcon>
              <LayoutPanelLeft />
            </DropdownMenuItemIcon>
            <DropdownMenuItemText>Sidebar mode</DropdownMenuItemText>
          </DropdownMenuTriggerItem>
          <DropdownMenuContent>
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
        <DropdownMenuItem>
          <DropdownMenuItemIcon>
            <ArrowRight />
          </DropdownMenuItemIcon>
          <DropdownMenuItemText>Sign out</DropdownMenuItemText>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const Basic: StoryFn<AppShellProps> = () => {
  const [activeItem, setActiveItem] = useState('home');
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('adaptive');
  const collapsed = sidebarMode === 'adaptive' && activeItem !== 'home';

  return (
    <AppShell>
      <AppShellHeader>
        <TopHeader>
          <TopHeaderLogo href='/'>
            <CircleDashed size='lg' />
            Wallarm
          </TopHeaderLogo>
          <TopHeaderActions>
            <Button variant='ghost' size='small' color='neutral'>
              <Code size='s' color='secondary'>
                Search Wallarm
              </Code>
              <Kbd size='small'>⌘K</Kbd>
            </Button>
            <TopHeaderSeparator />
            <Button variant='ghost' size='small' color='neutral'>
              Tenant Name
              <Code size='s' color='secondary'>
                · 12345
              </Code>
              <ChevronDown size='sm' />
            </Button>
            <Button variant='ghost' size='small' color='neutral' aria-label='Notifications'>
              <Bell size='sm' />
            </Button>
            <Button variant='ghost' size='small' color='neutral' aria-label='Help'>
              <CircleHelp size='sm' />
            </Button>
          </TopHeaderActions>
        </TopHeader>
      </AppShellHeader>
      <AppShellRail>
        <NavRail collapsed={collapsed}>
          <NavRailBody>
            <NavRailItem
              icon={Home}
              label='Home'
              shortcut={['G', 'H']}
              active={activeItem === 'home'}
              onClick={() => setActiveItem('home')}
            />
            <NavRailItem
              icon={History}
              label='Recent'
              shortcut={['G', 'R']}
              active={activeItem === 'recent'}
              onClick={() => setActiveItem('recent')}
            />
            <NavRailSeparator />
            <NavRailItem
              icon={CircleDashed}
              label='Edge'
              shortcut={['G', 'E']}
              active={activeItem === 'edge'}
              onClick={() => setActiveItem('edge')}
            />
            <NavRailItem
              icon={CircleDashed}
              label='AI Hypervisor'
              shortcut={['G', 'A']}
              active={activeItem === 'ai-hypervisor'}
              onClick={() => setActiveItem('ai-hypervisor')}
            />
            <NavRailItem
              icon={CircleDashed}
              label='Infra Discovery'
              shortcut={['G', 'I']}
              active={activeItem === 'infra-discovery'}
              onClick={() => setActiveItem('infra-discovery')}
            />
          </NavRailBody>
          <NavRailFooter>
            <NavRailItem
              icon={Settings}
              label='Settings'
              shortcut={['G', 'S']}
              active={activeItem === 'settings'}
              onClick={() => setActiveItem('settings')}
            />
            <AccountDropdown sidebarMode={sidebarMode} onSidebarModeChange={setSidebarMode} />
          </NavRailFooter>
        </NavRail>
      </AppShellRail>
      <AppShellRemote>
        <div className='p-24'>
          <h2 className='text-lg font-semibold capitalize'>{activeItem}</h2>
          <p className='mt-8 text-sm text-text-secondary'>
            Click items to navigate. Use the header button to toggle collapsed state.
          </p>
        </div>
      </AppShellRemote>
    </AppShell>
  );
};

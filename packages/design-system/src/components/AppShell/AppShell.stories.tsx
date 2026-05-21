import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  CircleDashed,
  CircleHelp,
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
import { Logo } from '../Logo';
import { NavRail, NavRailBody, NavRailFooter, NavRailItem, NavRailSeparator } from '../NavRail';
import { findFirstLinkPath, pushPathname, useLocationPathname } from '../ProductNav';
import { TopHeader, TopHeaderActions, TopHeaderLogo, TopHeaderSeparator } from '../TopHeader';
import { AppShell, type AppShellProps } from './AppShell';
import { AppShellHeader } from './AppShellHeader';
import { AppShellRail } from './AppShellRail';
import { AppShellRemote } from './AppShellRemote';
import {
  aiHypervisorNavConfig,
  ConfigRemote,
  edgeNavConfig,
  HomeContent,
  infraDiscoveryNavConfig,
  securityTestingNavConfig,
  settingsNavConfig,
} from './story-content';

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

const KNOWN_PRODUCTS = [
  'home',
  'edge',
  'ai-hypervisor',
  'infra-discovery',
  'security-testing',
  'settings',
] as const;

type Product = (typeof KNOWN_PRODUCTS)[number];

const PRODUCT_CONFIGS: Record<Exclude<Product, 'home'>, { config: typeof edgeNavConfig }> = {
  edge: { config: edgeNavConfig },
  'ai-hypervisor': { config: aiHypervisorNavConfig },
  'infra-discovery': { config: infraDiscoveryNavConfig },
  'security-testing': { config: securityTestingNavConfig },
  settings: { config: settingsNavConfig },
};

function deriveProduct(pathname: string): Product {
  const segment = pathname.split('/').filter(Boolean)[0];
  if (segment && (KNOWN_PRODUCTS as readonly string[]).includes(segment)) {
    return segment as Product;
  }
  return 'home';
}

function navigateToProduct(product: Product) {
  if (product === 'home') {
    pushPathname('/home');
    return;
  }
  const { config } = PRODUCT_CONFIGS[product];
  const firstPath = findFirstLinkPath(config.items) ?? '';
  pushPathname(`/${product}/${firstPath}`);
}

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

const RemoteForProduct = ({ product }: { product: Product }) => {
  if (product === 'home') return <HomeContent />;
  const { config } = PRODUCT_CONFIGS[product];
  return <ConfigRemote config={config} basePath={`/${product}`} />;
};

export const Basic: StoryFn<AppShellProps> = () => {
  const pathname = useLocationPathname();
  const activeProduct = deriveProduct(pathname);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('adaptive');
  const collapsed = sidebarMode === 'adaptive' && activeProduct !== 'home';

  return (
    <AppShell>
      <AppShellHeader>
        <TopHeader>
          <TopHeaderLogo href='/'>
            <Logo size='md' />
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
              active={activeProduct === 'home'}
              onClick={() => navigateToProduct('home')}
            />
            <NavRailSeparator />
            <NavRailItem
              icon={CircleDashed}
              label='Edge'
              shortcut={['G', 'E']}
              active={activeProduct === 'edge'}
              onClick={() => navigateToProduct('edge')}
            />
            <NavRailItem
              icon={CircleDashed}
              label='AI Hypervisor'
              shortcut={['G', 'A']}
              active={activeProduct === 'ai-hypervisor'}
              onClick={() => navigateToProduct('ai-hypervisor')}
            />
            <NavRailItem
              icon={CircleDashed}
              label='Infra Discovery'
              shortcut={['G', 'I']}
              active={activeProduct === 'infra-discovery'}
              onClick={() => navigateToProduct('infra-discovery')}
            />
            <NavRailItem
              icon={CircleDashed}
              label='Security Testing'
              shortcut={['G', 'T']}
              active={activeProduct === 'security-testing'}
              onClick={() => navigateToProduct('security-testing')}
            />
          </NavRailBody>
          <NavRailFooter>
            <NavRailItem
              icon={Settings}
              label='Settings'
              shortcut={['G', 'S']}
              active={activeProduct === 'settings'}
              onClick={() => navigateToProduct('settings')}
            />
            <AccountDropdown sidebarMode={sidebarMode} onSidebarModeChange={setSidebarMode} />
          </NavRailFooter>
        </NavRail>
      </AppShellRail>

      <AppShellRemote>
        <RemoteForProduct product={activeProduct} />
      </AppShellRemote>
    </AppShell>
  );
};

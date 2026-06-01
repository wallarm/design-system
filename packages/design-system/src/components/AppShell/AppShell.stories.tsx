import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Bell, ChevronUpDown, CircleDashed, Home, Settings } from '../../icons';
import { Button } from '../Button';
import { Code } from '../Code';
import { Kbd } from '../Kbd';
import {
  NavRail,
  NavRailBody,
  NavRailFooter,
  NavRailItem,
  NavRailSeparator,
  NavRailSkeleton,
} from '../NavRail';
import { useLocationPathname } from '../RemoteShell';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';
import { useTheme } from '../ThemeProvider';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { TopHeader, TopHeaderActions, TopHeaderLogo, TopHeaderSeparator } from '../TopHeader';
import { AppShell, type AppShellProps } from './AppShell';
import { AppShellHeader } from './AppShellHeader';
import { AppShellRail } from './AppShellRail';
import { AppShellRemote } from './AppShellRemote';
import {
  AccountDropdown,
  deriveProduct,
  navigateToProduct,
  QuickHelpDropdown,
  RecentDropdown,
  RemoteForProduct,
  type SidebarMode,
  WallarmLogo,
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

export const Basic: StoryFn<AppShellProps> = () => {
  const pathname = useLocationPathname();
  const activeProduct = deriveProduct(pathname);

  const [loading, setLoading] = useState(true);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('adaptive');
  const { theme, setTheme } = useTheme();
  const collapsed = sidebarMode === 'adaptive' && activeProduct !== 'home';

  return (
    <AppShell>
      <AppShellHeader>
        <TopHeader>
          <TopHeaderLogo href='/'>
            <WallarmLogo />
          </TopHeaderLogo>

          <TopHeaderActions>
            {loading ? (
              <>
                <Skeleton width='150px' height='20px' rounded={6} />
                <TopHeaderSeparator />
                <Skeleton width='150px' height='20px' rounded={6} />
              </>
            ) : (
              <>
                <Button
                  variant='ghost'
                  size='small'
                  color='neutral'
                  className='p-4 gap-6 rounded-6'
                >
                  <Code size='s' color='secondary'>
                    Search Wallarm
                  </Code>
                  <Kbd size='xsmall'>⌘ K</Kbd>
                </Button>

                <TopHeaderSeparator />

                <Button variant='ghost' size='small' color='neutral' className='py-4 rounded-6'>
                  <Text size='xs' weight='medium'>
                    Tenant Name
                  </Text>
                  <span className='text-text-tertiary mx-[-2px]'>•</span>
                  <Code size='s' color='secondary'>
                    12345
                  </Code>
                  <ChevronUpDown className='!icon-sm' />
                </Button>
              </>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='small' color='neutral' aria-label='Wallarm Updates'>
                  <Bell />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Wallarm updates</TooltipContent>
            </Tooltip>

            <QuickHelpDropdown />
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
            <RecentDropdown />

            <NavRailSeparator />

            {loading ? (
              <NavRailSkeleton />
            ) : (
              <>
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
              </>
            )}
          </NavRailBody>

          <NavRailFooter>
            <NavRailItem
              icon={Settings}
              label='Settings'
              shortcut={['G', 'S']}
              active={activeProduct === 'settings'}
              onClick={() => navigateToProduct('settings')}
            />
            <AccountDropdown
              sidebarMode={sidebarMode}
              onSidebarModeChange={setSidebarMode}
              theme={theme}
              onThemeChange={setTheme}
            />
          </NavRailFooter>
        </NavRail>
      </AppShellRail>

      <AppShellRemote>
        <div className='absolute top-4 right-4 z-10'>
          <Button variant='ghost' size='small' color='neutral' onClick={() => setLoading(v => !v)}>
            {loading ? 'Finish loading' : 'Start loading'}
          </Button>
        </div>

        <RemoteForProduct product={activeProduct} />
      </AppShellRemote>
    </AppShell>
  );
};

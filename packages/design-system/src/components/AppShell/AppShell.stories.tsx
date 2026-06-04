import { useEffect, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Bell, Home } from '../../icons';
import { AnimatedBackground } from '../AnimatedBackground';
import { Button } from '../Button';
import { Input } from '../Input';
import { NavRail, NavRailBody, NavRailItem, NavRailSeparator, NavRailSkeleton } from '../NavRail';
import { useLocationPathname } from '../RemoteShell';
import { Skeleton } from '../Skeleton';
import { SplashScreen } from '../SplashScreen';
import { Text } from '../Text';
import { useTheme } from '../ThemeProvider';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { TopHeader, TopHeaderActions, TopHeaderLogo, TopHeaderSeparator } from '../TopHeader';
import { AppShell, type AppShellProps } from './AppShell';
import { AppShellHeader } from './AppShellHeader';
import { AppShellRail } from './AppShellRail';
import { AppShellRemote } from './AppShellRemote';
import {
  deriveProduct,
  HeaderActions,
  NavRailFooterContent,
  navigateToProduct,
  ProductNavItems,
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

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='small'
                      color='neutral'
                      aria-label='Wallarm Updates'
                    >
                      <Bell />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Wallarm updates</TooltipContent>
                </Tooltip>

                <QuickHelpDropdown />
              </>
            ) : (
              <HeaderActions />
            )}
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

            {loading ? <NavRailSkeleton /> : <ProductNavItems activeProduct={activeProduct} />}
          </NavRailBody>

          <NavRailFooterContent
            activeProduct={activeProduct}
            sidebarMode={sidebarMode}
            onSidebarModeChange={setSidebarMode}
            theme={theme}
            onThemeChange={setTheme}
          />
        </NavRail>
      </AppShellRail>

      <AppShellRemote>
        <div className='flex gap-8 absolute top-4 right-4 z-10'>
          <Button variant='ghost' size='small' color='neutral' onClick={() => setLoading(v => !v)}>
            {loading ? 'Finish loading' : 'Start loading'}
          </Button>
        </div>

        <RemoteForProduct product={activeProduct} />
      </AppShellRemote>
    </AppShell>
  );
};

export const RevealFlow: StoryFn<AppShellProps> = () => {
  const pathname = useLocationPathname();
  const activeProduct = deriveProduct(pathname);

  const [splashDone, setSplashDone] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('adaptive');
  const [revealKey, setRevealKey] = useState(0);
  const { theme, setTheme } = useTheme();
  const collapsed = sidebarMode === 'adaptive' && activeProduct !== 'home';

  useEffect(() => {
    if (splashDone) return;
    const timer = setTimeout(() => setSplashDone(true), 2000);
    return () => clearTimeout(timer);
  }, [splashDone]);

  const handleReplay = () => {
    setSplashDone(false);
    setRevealKey(k => k + 1);
  };

  if (!splashDone) {
    return (
      <div key={revealKey} className='h-screen w-screen bg-bg-page-bg'>
        <SplashScreen />
      </div>
    );
  }

  return (
    <AppShell key={revealKey} reveal>
      <AppShellHeader>
        <TopHeader>
          <TopHeaderLogo href='/'>
            <WallarmLogo />
          </TopHeaderLogo>

          <TopHeaderActions>
            <HeaderActions />
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

            <ProductNavItems activeProduct={activeProduct} />
          </NavRailBody>

          <NavRailFooterContent
            activeProduct={activeProduct}
            sidebarMode={sidebarMode}
            onSidebarModeChange={setSidebarMode}
            theme={theme}
            onThemeChange={setTheme}
          />
        </NavRail>
      </AppShellRail>

      <AppShellRemote>
        <div className='flex gap-8 absolute top-4 right-4 z-10'>
          <Button variant='ghost' size='small' color='neutral' onClick={handleReplay}>
            Replay animation
          </Button>
        </div>

        <RemoteForProduct product={activeProduct} />
      </AppShellRemote>
    </AppShell>
  );
};

const CARD_DIMENSIONS = { width: 480, height: 600, borderRadius: 12 };

export const LoginFlow: StoryFn<AppShellProps> = () => {
  const pathname = useLocationPathname();
  const activeProduct = deriveProduct(pathname);

  const [splashVisible, setSplashVisible] = useState(true);
  const [showShell, setShowShell] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [flowKey, setFlowKey] = useState(0);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('adaptive');
  const { theme, setTheme } = useTheme();
  const collapsed = sidebarMode === 'adaptive' && activeProduct !== 'home';

  useEffect(() => {
    if (!splashVisible) return;
    const timer = setTimeout(() => setSplashVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [splashVisible]);

  const handleSignIn = () => {
    setShowShell(true);
  };

  const handleReplay = () => {
    setShowShell(false);
    setRevealed(false);
    setSplashVisible(true);
    setFlowKey(k => k + 1);
  };

  return (
    <div
      key={flowKey}
      className='relative h-screen w-screen overflow-hidden bg-component-app-shell-bg'
    >
      {!revealed && (
        <AnimatedBackground
          className='absolute inset-0'
          style={{
            opacity: showShell ? 0 : 1,
            transition: showShell ? 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
          }}
        />
      )}

      {!showShell && (
        <div className='absolute inset-0 flex items-center justify-center z-10'>
          <SplashScreen
            visible={splashVisible}
            shrinkTarget={CARD_DIMENSIONS}
            className='bg-bg-page-bg shadow-lg'
          >
            <div className='flex h-full w-full flex-col items-center justify-center gap-16 p-24'>
              <Text size='xl'>Sign In</Text>
              <div className='flex w-full flex-col gap-12'>
                <Input placeholder='Email' />
                <Input placeholder='Password' type='password' />
              </div>
              <Button variant='primary' color='brand' className='w-full' onClick={handleSignIn}>
                Sign In
              </Button>
            </div>
          </SplashScreen>
        </div>
      )}

      {showShell && (
        <div className='absolute inset-0'>
          <AppShell expandFrom={CARD_DIMENSIONS} onRevealed={() => setRevealed(true)}>
            <AppShellHeader>
              <TopHeader>
                <TopHeaderLogo href='/'>
                  <WallarmLogo />
                </TopHeaderLogo>

                <TopHeaderActions>
                  <HeaderActions />
                </TopHeaderActions>
              </TopHeader>
            </AppShellHeader>

            <AppShellRail>
              <NavRail collapsed={collapsed}>
                <NavRailBody>
                  <NavRailItem
                    icon={Home}
                    label='Home'
                    active={activeProduct === 'home'}
                    onClick={() => navigateToProduct('home')}
                  />

                  <NavRailSeparator />

                  <ProductNavItems activeProduct={activeProduct} />
                </NavRailBody>
                <NavRailFooterContent
                  activeProduct={activeProduct}
                  sidebarMode={sidebarMode}
                  onSidebarModeChange={setSidebarMode}
                  theme={theme}
                  onThemeChange={setTheme}
                />
              </NavRail>
            </AppShellRail>

            <AppShellRemote>
              <div className='flex gap-8 absolute top-4 right-4 z-10'>
                <Button variant='ghost' size='small' color='neutral' onClick={handleReplay}>
                  Replay animation
                </Button>
              </div>
              <RemoteForProduct product={activeProduct} />
            </AppShellRemote>
          </AppShell>
        </div>
      )}
    </div>
  );
};

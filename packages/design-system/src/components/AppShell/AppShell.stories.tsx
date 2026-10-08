import { type FC, useEffect, useState } from 'react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link as RouterLink,
  RouterProvider,
  useNavigate,
  useParams,
  useRouterState,
} from '@tanstack/react-router';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Bell, Home } from '../../icons';
import { AnimatedBackground } from '../AnimatedBackground';
import { Button } from '../Button';
import { Input } from '../Input';
import { Link } from '../Link';
import { NavRail, NavRailBody, NavRailItem, NavRailSeparator, NavRailSkeleton } from '../NavRail';
import { Page, PageContent, PageHeader, PageTitle } from '../Page';
import {
  RemoteShell,
  RemoteShellBreadcrumb,
  RemoteShellContent,
  RemoteShellPanel,
  useRemoteShellContext,
} from '../RemoteShell';
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
  HomeContent,
  NavRailFooterContent,
  PRODUCT_CONFIGS,
  type Product,
  ProductNavItems,
  productLandingPath,
  QuickHelpDropdown,
  RecentDropdown,
  RemoteForProduct,
  railModeFor,
  type SidebarMode,
  StoryRouter,
  useStoryProductNavigation,
  WallarmLogo,
} from './story-content';

const DESCRIPTION = [
  'The platform’s outermost frame — global top bar, product rail, and the content surface products mount into. There is exactly one, at the app root, and it persists while the content swaps.',
  'Do not wrap a page in it: a single product screen renders `RemoteShell` and its own content, blind to the shell. In-product navigation is `NavPanel`, and laying out a page’s insides is `Stack` and `Flex`.',
  'The gray surround — header bar plus rail, everything that is not the canvas — is the **Frame**. It carries **Ambient**, a faint still layer of soft blooms, grain and a dot cluster pooled bottom-left, painted under everything. Ambient is on by default; `ambient={false}` leaves the flat Frame fill.',
  'The Frame comes in two styles, **Neutral** and **Branded**: a user preference next to light/dark, set with `useTheme().setFrameStyle` (from `ThemeProvider`) and written on `<html>` so every micro-frontend follows it. Branded warms the Frame and turns active navigation to the brand colour; try it from the account item → Appearance.',
].join(' ');

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
        component: DESCRIPTION,
      },
    },
  },
  args: {
    ambient: true,
  },
  argTypes: {
    children: { control: false },
    ref: { control: false },
    ambient: {
      control: 'boolean',
      description: 'The Frame’s ambient layer. Turn off to see the flat Frame token fill.',
    },
  },
} satisfies Meta<typeof AppShell>;

export default meta;

interface ShellProps {
  ambient?: boolean;
  /** Header actions and product rail show skeletons in place of their items. */
  loading?: boolean;
  /** Each product fakes a 2s load when opened, showing its panel and content skeletons. */
  simulateProductLoading?: boolean;
}

const Shell = ({ ambient, loading = false, simulateProductLoading = false }: ShellProps) => {
  const { activeProduct, goToProduct } = useStoryProductNavigation();

  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('adaptive');
  const { theme, setTheme } = useTheme();
  const railMode = railModeFor(sidebarMode, activeProduct === 'home');

  return (
    <AppShell ambient={ambient}>
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
        <NavRail mode={railMode}>
          <NavRailBody>
            <NavRailItem
              icon={Home}
              label='Home'
              shortcut={['G', 'H']}
              active={activeProduct === 'home'}
              onClick={() => goToProduct('home')}
            />
            <RecentDropdown />

            <NavRailSeparator />

            {loading ? (
              <NavRailSkeleton />
            ) : (
              <ProductNavItems activeProduct={activeProduct} onSelectProduct={goToProduct} />
            )}
          </NavRailBody>

          <NavRailFooterContent
            onSelectProduct={goToProduct}
            activeProduct={activeProduct}
            sidebarMode={sidebarMode}
            onSidebarModeChange={setSidebarMode}
            theme={theme}
            onThemeChange={setTheme}
          />
        </NavRail>
      </AppShellRail>

      <AppShellRemote>
        <RemoteForProduct product={activeProduct} simulateLoading={simulateProductLoading} />
      </AppShellRemote>
    </AppShell>
  );
};

/** The three regions composed once — `AppShellHeader`, `AppShellRail`, `AppShellRemote` — with the content surface being the only part that scrolls. Pick a product in the rail to drill into it, and the account item at the bottom for appearance and sidebar mode. */
export const Basic: StoryFn<AppShellProps> = ({ ambient }) => (
  <StoryRouter>
    <Shell ambient={ambient} />
  </StoryRouter>
);

/** How the shell looks while the platform loads. The header actions and the product rail hold skeletons that sit exactly where the real items land, so nothing jumps when they arrive. Turn `loading` off in Controls to watch the swap. Opening a product also shows its own panel and content loading. */
export const Loading: StoryFn<AppShellProps & { loading: boolean }> = ({ ambient, loading }) => (
  <StoryRouter>
    <Shell ambient={ambient} loading={loading} simulateProductLoading />
  </StoryRouter>
);
Loading.args = { loading: true };
Loading.argTypes = {
  loading: {
    control: 'boolean',
    description: 'Show the header and rail skeletons instead of their items.',
  },
};

const RevealFlowShell = () => {
  const { activeProduct, goToProduct } = useStoryProductNavigation();

  const [splashDone, setSplashDone] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('adaptive');
  const [revealKey, setRevealKey] = useState(0);
  const { theme, setTheme } = useTheme();
  const railMode = railModeFor(sidebarMode, activeProduct === 'home');

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
        <NavRail mode={railMode}>
          <NavRailBody>
            <NavRailItem
              icon={Home}
              label='Home'
              shortcut={['G', 'H']}
              active={activeProduct === 'home'}
              onClick={() => goToProduct('home')}
            />
            <RecentDropdown />

            <NavRailSeparator />

            <ProductNavItems activeProduct={activeProduct} onSelectProduct={goToProduct} />
          </NavRailBody>

          <NavRailFooterContent
            onSelectProduct={goToProduct}
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

/** `reveal` animates the chrome in on the first application load only. Leave it unset for an ordinary screen; this exists for prototyping the boot moment itself. */
export const RevealFlow: StoryFn<AppShellProps> = () => (
  <StoryRouter>
    <RevealFlowShell />
  </StoryRouter>
);

const CARD_DIMENSIONS = { width: 480, height: 600, borderRadius: 12 };

const LoginFlowShell = () => {
  const { activeProduct, goToProduct } = useStoryProductNavigation();

  const [splashVisible, setSplashVisible] = useState(true);
  const [showShell, setShowShell] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [flowKey, setFlowKey] = useState(0);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('adaptive');
  const { theme, setTheme } = useTheme();
  const railMode = railModeFor(sidebarMode, activeProduct === 'home');

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
              <NavRail mode={railMode}>
                <NavRailBody>
                  <NavRailItem
                    icon={Home}
                    label='Home'
                    active={activeProduct === 'home'}
                    onClick={() => goToProduct('home')}
                  />

                  <NavRailSeparator />

                  <ProductNavItems activeProduct={activeProduct} onSelectProduct={goToProduct} />
                </NavRailBody>
                <NavRailFooterContent
                  onSelectProduct={goToProduct}
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

/** The whole entrance: the splash hands off, the content surface expands from the sign-in card into the full shell. `onRevealed` fires when it has settled. */
export const LoginFlow: StoryFn<AppShellProps> = () => (
  <StoryRouter>
    <LoginFlowShell />
  </StoryRouter>
);

// --- TanStack Router ---------------------------------------------------------------

/** Rail → router: the host shell owns product switching. */
const RouterRootLayout: FC = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const activeProduct = deriveProduct(pathname);
  const goToProduct = (product: Product) => navigate({ to: productLandingPath(product) });

  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('adaptive');
  const { theme, setTheme } = useTheme();
  const railMode = railModeFor(sidebarMode, activeProduct === 'home');

  return (
    <AppShell>
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
        <NavRail mode={railMode}>
          <NavRailBody>
            <NavRailItem
              icon={Home}
              label='Home'
              shortcut={['G', 'H']}
              active={activeProduct === 'home'}
              onClick={() => goToProduct('home')}
            />
            <NavRailSeparator />
            <ProductNavItems activeProduct={activeProduct} onSelectProduct={goToProduct} />
          </NavRailBody>
          <NavRailFooterContent
            activeProduct={activeProduct}
            onSelectProduct={goToProduct}
            sidebarMode={sidebarMode}
            onSidebarModeChange={setSidebarMode}
            theme={theme}
            onThemeChange={setTheme}
          />
        </NavRail>
      </AppShellRail>

      <AppShellRemote>
        <Outlet />
      </AppShellRemote>
    </AppShell>
  );
};

/**
 * One product remote. The router owns the URL: `RemoteShell` gets the router's pathname
 * through `pathname` and hands its own navigations back through `onNavigate`. The router
 * has no `basepath`, so both sides use the full pathname (`/edge/...`).
 */
const RouterProductRemote: FC = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const { product } = useParams({ strict: false });
  const entry = PRODUCT_CONFIGS[product as Exclude<Product, 'home'>];

  if (!entry) return <HomeContent />;

  return (
    <RemoteShell
      // A product is its own remote: remount so no drill state carries over.
      key={product}
      config={entry.config}
      basePath={`/${product}`}
      pathname={pathname}
      onNavigate={to => navigate({ to })}
    >
      <RemoteShellPanel resizable />
      <RemoteShellBreadcrumb />
      <RemoteShellContent>
        <Outlet />
      </RemoteShellContent>
    </RemoteShell>
  );
};

const ROUTER_PAGE_LINKS = [
  { to: '/edge/data-planes/production/services', label: 'Edge → Production → Services' },
  {
    to: '/edge/data-planes/staging/nodes/node-2/metrics',
    label: 'Edge → Staging → Node 2 → Metrics',
  },
  { to: '/settings', label: 'Settings (another product)' },
];

/** A routed page. Its router links bypass the shell — the panel and breadcrumbs still follow. */
const RouterProductPage: FC = () => {
  const { breadcrumbSegments } = useRemoteShellContext();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const title = breadcrumbSegments[breadcrumbSegments.length - 1]?.label ?? '';

  return (
    <Page title={title} fixedHeight>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
      </PageHeader>
      <PageContent>
        <div className='flex flex-col gap-12'>
          <Text size='sm' color='secondary'>
            Router pathname: <code>{pathname}</code>
          </Text>
          <ul className='flex flex-col gap-4'>
            {ROUTER_PAGE_LINKS.map(link => (
              <li key={link.to}>
                <Link asChild>
                  <RouterLink to={link.to}>{link.label}</RouterLink>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </PageContent>
    </Page>
  );
};

const createShellRouter = () => {
  const rootRoute = createRootRoute({ component: RouterRootLayout });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'home',
    component: HomeContent,
  });
  const productRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '$product',
    component: RouterProductRemote,
  });
  const productIndexRoute = createRoute({
    getParentRoute: () => productRoute,
    path: '/',
    component: RouterProductPage,
  });
  const productPageRoute = createRoute({
    getParentRoute: () => productRoute,
    path: '$',
    component: RouterProductPage,
  });

  return createRouter({
    routeTree: rootRoute.addChildren([
      homeRoute,
      productRoute.addChildren([productIndexRoute, productPageRoute]),
    ]),
    history: createMemoryHistory({ initialEntries: ['/edge/overview'] }),
  });
};

/**
 * `AppShell` and a `RemoteShell` per product on one TanStack Router: the root route is
 * the shell (rail → `navigate`, `AppShellRemote` → `<Outlet />`), `/$product` is the
 * remote (`RemoteShell` with `pathname` + `onNavigate`, content → `<Outlet />`), and
 * `/$product/$` is the page. Every way of moving — the rail, the nav panel, the
 * breadcrumbs, links in the page — goes through the router, and the active items follow.
 */
export const WithTanStackRouter: StoryFn<AppShellProps> = () => {
  const [router] = useState(createShellRouter);

  return <RouterProvider router={router} />;
};

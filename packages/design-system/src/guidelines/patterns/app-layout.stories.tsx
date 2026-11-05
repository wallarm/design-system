import type { MouseEvent } from 'react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { AppShell, AppShellHeader, AppShellRail, AppShellRemote } from '../../components/AppShell';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import {
  NavRail,
  NavRailBody,
  NavRailFooter,
  NavRailItem,
  NavRailSeparator,
  NavRailSkeleton,
} from '../../components/NavRail';
import {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderGroup,
  PageTitle,
} from '../../components/Page';
import {
  type NavConfig,
  RemoteShell,
  RemoteShellBreadcrumb,
  RemoteShellContent,
  RemoteShellPanel,
} from '../../components/RemoteShell';
import { Skeleton } from '../../components/Skeleton';
import type { TableColumnDef } from '../../components/Table';
import { Table } from '../../components/Table';
import { Text } from '../../components/Text';
import {
  TopHeader,
  TopHeaderActions,
  TopHeaderLogo,
  TopHeaderSeparator,
} from '../../components/TopHeader';
import {
  Activity,
  Bell,
  Bot,
  ChevronUpDown,
  CircleHelp,
  Cloud,
  FlaskConical,
  History,
  Home as HomeIcon,
  Layers,
  ListFilter,
  Server,
  Settings,
  ShieldCheck,
  User,
  Users,
  Zap,
} from '../../icons';

// The host's product list (from the microfrontends API in a real app).
const PRODUCTS = [
  { id: 'edge', label: 'Edge', icon: Cloud, shortcut: ['G', 'E'] },
  { id: 'security-testing', label: 'Security Testing', icon: FlaskConical, shortcut: ['G', 'T'] },
  { id: 'ai-hypervisor', label: 'AI Hypervisor', icon: Bot, shortcut: ['G', 'A'] },
];

// A standalone product's own NavConfig (`src/configs/nav/navConfig.ts` in the product).
const EDGE_NAV: NavConfig = {
  productLabel: 'Edge',
  productPath: '/edge',
  items: [
    { type: 'link', id: 'overview', label: 'Overview', path: 'overview', icon: Activity },
    {
      type: 'drill',
      id: 'data-planes',
      label: 'Data planes',
      path: 'data-planes',
      param: 'dataPlaneId',
      icon: Layers,
      entities: [
        { id: 'production', label: 'Production' },
        { id: 'staging', label: 'Staging' },
      ],
      children: [
        { type: 'link', id: 'dp-overview', label: 'Overview', path: 'overview', icon: Activity },
        { type: 'link', id: 'dp-nodes', label: 'Nodes', path: 'nodes', icon: Server },
        { type: 'link', id: 'dp-services', label: 'Services', path: 'services', icon: Layers },
      ],
    },
    {
      type: 'link',
      id: 'dashboards',
      label: 'Dashboards',
      path: 'dashboards',
      icon: Activity,
      dividerAfter: true,
    },
    { type: 'section-header', id: 'detect', label: 'Detect & Respond' },
    {
      type: 'group',
      id: 'events',
      label: 'Events',
      icon: Zap,
      defaultExpanded: true,
      children: [
        { type: 'link', id: 'attacks', label: 'Attacks', path: 'attacks' },
        { type: 'link', id: 'incidents', label: 'Incidents', path: 'incidents' },
        { type: 'link', id: 'security-issues', label: 'Security Issues', path: 'security-issues' },
        { type: 'link', id: 'api-sessions', label: 'API Sessions', path: 'api-sessions' },
      ],
    },
    {
      type: 'group',
      id: 'api-security',
      label: 'API Security',
      icon: ShieldCheck,
      children: [
        { type: 'link', id: 'api-discovery', label: 'API Discovery', path: 'api-discovery' },
        {
          type: 'link',
          id: 'api-specifications',
          label: 'API Specifications',
          path: 'api-specifications',
        },
      ],
    },
  ],
};

// The host builds this from a rail group's children: one link per child product.
const SECURITY_TESTING_GROUP: NavConfig = {
  productLabel: 'Security Testing',
  productPath: '/',
  items: [
    { type: 'link', id: 'threat-replay', label: 'Threat Replay', path: 'threat-replay', icon: Zap },
    {
      type: 'link',
      id: 'schema-based',
      label: 'Schema-Based Testing',
      path: 'schema-based',
      icon: ListFilter,
    },
  ],
};

// A host-local section: Settings is a host route, not a remote.
const SETTINGS_NAV: NavConfig = {
  productLabel: 'Settings',
  productPath: '/settings',
  items: [
    { type: 'link', id: 'profile', label: 'Profile', path: 'profile', icon: User },
    { type: 'link', id: 'general', label: 'General', path: 'general', icon: Settings },
    { type: 'section-header', id: 'team', label: 'Team & access' },
    { type: 'link', id: 'users', label: 'Users', path: 'users', icon: Users },
    { type: 'link', id: 'service-accounts', label: 'Service accounts', path: 'service-accounts' },
    { type: 'link', id: 'groups', label: 'Groups', path: 'groups' },
    { type: 'link', id: 'roles', label: 'Roles', path: 'roles' },
  ],
};

interface ApiSession {
  id: string;
  application: string;
  requests: number;
  started: string;
}

const API_SESSIONS: ApiSession[] = [
  { id: 'a91f3c', application: 'Payments API', requests: 128, started: '2026-11-05 09:12' },
  { id: '7be210', application: 'Mobile banking', requests: 46, started: '2026-11-05 09:08' },
  { id: 'c04d77', application: 'Partner gateway', requests: 312, started: '2026-11-05 08:57' },
  { id: '19ea52', application: 'Payments API', requests: 9, started: '2026-11-05 08:41' },
];

interface Service {
  id: string;
  name: string;
  nodes: number;
  upstream: string;
}

const SERVICES: Service[] = [
  { id: 'checkout', name: 'checkout', nodes: 4, upstream: 'checkout.svc:8080' },
  { id: 'accounts', name: 'accounts', nodes: 3, upstream: 'accounts.svc:8080' },
  { id: 'statements', name: 'statements', nodes: 2, upstream: 'statements.svc:9000' },
];

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

const MEMBERS: Member[] = [
  { id: 'u1', name: 'Maria Lopez', email: 'maria.lopez@acme-bank.com', role: 'Administrator' },
  { id: 'u2', name: 'Daniel Kim', email: 'daniel.kim@acme-bank.com', role: 'Analyst' },
  { id: 'u3', name: 'Priya Nair', email: 'priya.nair@acme-bank.com', role: 'Deploy' },
];

interface ReplayRun {
  id: string;
  target: string;
  attacks: number;
  status: string;
}

const REPLAY_RUNS: ReplayRun[] = [
  { id: 'r1', target: 'Payments API', attacks: 214, status: 'Finished' },
  { id: 'r2', target: 'Mobile banking', attacks: 87, status: 'Running' },
];

const onNavigate = fn().mockName('onNavigate');
const onRailNavigate = fn().mockName('onRailNavigate');
const onCreateUser = fn().mockName('onCreateUser');

const meta = {
  title: 'Patterns/Application layout',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when placing a screen in the console frame: the host AppShell, a product RemoteShell driven by a NavConfig, breadcrumbs and where Page goes.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * A standalone product at `/edge/api-sessions`. The host renders `AppShell` with the product
 * list in `NavRail`; the product renders `RemoteShell` with its own `NavConfig`, and its page
 * goes in `RemoteShellContent`. The panel, the active item and the trail all come from
 * `pathname`.
 */
export const Default: StoryFn = () => {
  const [pathname, setPathname] = useState('/edge/api-sessions');

  const handleRailClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onRailNavigate(event.currentTarget.getAttribute('href'));
  };
  const handleNavigate = (to: string) => {
    onNavigate(to);
    setPathname(to);
  };

  const columns: TableColumnDef<ApiSession>[] = [
    { accessorKey: 'id', header: 'Session', size: 160 },
    { accessorKey: 'application', header: 'Application', size: 240 },
    { accessorKey: 'requests', header: 'Requests', size: 120 },
    { accessorKey: 'started', header: 'Started', size: 200 },
  ];

  return (
    <AppShell data-testid='app-shell'>
      <AppShellHeader>
        <TopHeader data-testid='top-header'>
          <TopHeaderLogo href='/' onClick={handleRailClick}>
            <Logo size='md' />
          </TopHeaderLogo>
          <TopHeaderActions>
            <Button variant='ghost' color='neutral' size='small'>
              Acme Bank
              <ChevronUpDown />
            </Button>
            <TopHeaderSeparator />
            <Button variant='ghost' color='neutral' size='small' aria-label='Wallarm updates'>
              <Bell />
            </Button>
            <Button variant='ghost' color='neutral' size='small' aria-label='Help'>
              <CircleHelp />
            </Button>
          </TopHeaderActions>
        </TopHeader>
      </AppShellHeader>

      <AppShellRail>
        <NavRail mode='collapsed' data-testid='nav-rail'>
          <NavRailBody>
            <NavRailItem
              href='/'
              icon={HomeIcon}
              label='Home'
              shortcut={['G', 'H']}
              onClick={handleRailClick}
              data-testid='nav-rail-home'
            />
            <NavRailItem href='/recent' icon={History} label='Recent' onClick={handleRailClick} />
            <NavRailSeparator />
            {PRODUCTS.map(product => (
              <NavRailItem
                key={product.id}
                href={`/${product.id}`}
                icon={product.icon}
                label={product.label}
                shortcut={product.shortcut}
                active={product.id === 'edge'}
                onClick={handleRailClick}
                data-testid={`nav-rail-${product.id}`}
              />
            ))}
          </NavRailBody>
          <NavRailFooter>
            <NavRailItem
              href='/settings'
              icon={Settings}
              label='Settings'
              shortcut={['G', 'S']}
              onClick={handleRailClick}
              data-testid='nav-rail-settings'
            />
            <NavRailItem
              href='/account'
              icon={User}
              label='Maria Lopez'
              avatar
              onClick={handleRailClick}
              data-testid='nav-rail-account'
            />
          </NavRailFooter>
        </NavRail>
      </AppShellRail>

      <AppShellRemote role='main'>
        <RemoteShell
          config={EDGE_NAV}
          basePath='/edge'
          pathname={pathname}
          onNavigate={handleNavigate}
          data-testid='product-shell'
        >
          <RemoteShellPanel resizable />
          <RemoteShellBreadcrumb />
          <RemoteShellContent>
            <Page name='edge-api-sessions' fullSize fixedHeight data-testid='sessions-page'>
              <PageHeader>
                <PageTitle>API Sessions</PageTitle>
              </PageHeader>
              <PageContent>
                <Table
                  aria-label='API sessions'
                  data={API_SESSIONS}
                  columns={columns}
                  data-testid='sessions-table'
                />
              </PageContent>
            </Page>
          </RemoteShellContent>
        </RemoteShell>
      </AppShellRemote>
    </AppShell>
  );
};

/**
 * Home is a host page, not a product: `Page` goes straight into `AppShellRemote`, with no
 * `RemoteShell`, no panel and no breadcrumbs. The rail is expanded at the top level.
 */
export const Home: StoryFn = () => {
  const handleRailClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onRailNavigate(event.currentTarget.getAttribute('href'));
  };

  return (
    <AppShell data-testid='app-shell'>
      <AppShellHeader>
        <TopHeader data-testid='top-header'>
          <TopHeaderLogo href='/' onClick={handleRailClick}>
            <Logo size='md' />
          </TopHeaderLogo>
          <TopHeaderActions>
            <Button variant='ghost' color='neutral' size='small'>
              Acme Bank
              <ChevronUpDown />
            </Button>
            <TopHeaderSeparator />
            <Button variant='ghost' color='neutral' size='small' aria-label='Wallarm updates'>
              <Bell />
            </Button>
            <Button variant='ghost' color='neutral' size='small' aria-label='Help'>
              <CircleHelp />
            </Button>
          </TopHeaderActions>
        </TopHeader>
      </AppShellHeader>

      <AppShellRail>
        <NavRail mode='expanded' data-testid='nav-rail'>
          <NavRailBody>
            <NavRailItem
              href='/'
              icon={HomeIcon}
              label='Home'
              shortcut={['G', 'H']}
              active
              onClick={handleRailClick}
              data-testid='nav-rail-home'
            />
            <NavRailItem href='/recent' icon={History} label='Recent' onClick={handleRailClick} />
            <NavRailSeparator />
            {PRODUCTS.map(product => (
              <NavRailItem
                key={product.id}
                href={`/${product.id}`}
                icon={product.icon}
                label={product.label}
                shortcut={product.shortcut}
                onClick={handleRailClick}
                data-testid={`nav-rail-${product.id}`}
              />
            ))}
          </NavRailBody>
          <NavRailFooter>
            <NavRailItem
              href='/settings'
              icon={Settings}
              label='Settings'
              shortcut={['G', 'S']}
              onClick={handleRailClick}
              data-testid='nav-rail-settings'
            />
            <NavRailItem
              href='/account'
              icon={User}
              label='Maria Lopez'
              avatar
              onClick={handleRailClick}
              data-testid='nav-rail-account'
            />
          </NavRailFooter>
        </NavRail>
      </AppShellRail>

      <AppShellRemote role='main'>
        <Page name='home' data-testid='home-page'>
          <PageHeader>
            <PageTitle>Good morning, Maria</PageTitle>
          </PageHeader>
          <PageContent>
            <Text size='sm' color='secondary'>
              3 new incidents and 1 node update since your last visit.
            </Text>
          </PageContent>
        </Page>
      </AppShellRemote>
    </AppShell>
  );
};

/**
 * A product inside a host group. The host renders one group `RemoteShell` with a link per child
 * product; the child renders its page only, with no shell of its own.
 */
export const GroupedProduct: StoryFn = () => {
  const [pathname, setPathname] = useState('/security-testing/threat-replay');

  const handleRailClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onRailNavigate(event.currentTarget.getAttribute('href'));
  };
  const handleNavigate = (to: string) => {
    onNavigate(to);
    setPathname(to);
  };

  const columns: TableColumnDef<ReplayRun>[] = [
    { accessorKey: 'target', header: 'Target', size: 240 },
    { accessorKey: 'attacks', header: 'Replayed attacks', size: 180 },
    { accessorKey: 'status', header: 'Status', size: 160 },
  ];

  return (
    <AppShell data-testid='app-shell'>
      <AppShellHeader>
        <TopHeader data-testid='top-header'>
          <TopHeaderLogo href='/' onClick={handleRailClick}>
            <Logo size='md' />
          </TopHeaderLogo>
          <TopHeaderActions>
            <Button variant='ghost' color='neutral' size='small'>
              Acme Bank
              <ChevronUpDown />
            </Button>
            <TopHeaderSeparator />
            <Button variant='ghost' color='neutral' size='small' aria-label='Wallarm updates'>
              <Bell />
            </Button>
            <Button variant='ghost' color='neutral' size='small' aria-label='Help'>
              <CircleHelp />
            </Button>
          </TopHeaderActions>
        </TopHeader>
      </AppShellHeader>

      <AppShellRail>
        <NavRail mode='collapsed' data-testid='nav-rail'>
          <NavRailBody>
            <NavRailItem
              href='/'
              icon={HomeIcon}
              label='Home'
              shortcut={['G', 'H']}
              onClick={handleRailClick}
              data-testid='nav-rail-home'
            />
            <NavRailItem href='/recent' icon={History} label='Recent' onClick={handleRailClick} />
            <NavRailSeparator />
            {PRODUCTS.map(product => (
              <NavRailItem
                key={product.id}
                href={`/${product.id}`}
                icon={product.icon}
                label={product.label}
                shortcut={product.shortcut}
                active={product.id === 'security-testing'}
                onClick={handleRailClick}
                data-testid={`nav-rail-${product.id}`}
              />
            ))}
          </NavRailBody>
          <NavRailFooter>
            <NavRailItem
              href='/settings'
              icon={Settings}
              label='Settings'
              shortcut={['G', 'S']}
              onClick={handleRailClick}
              data-testid='nav-rail-settings'
            />
            <NavRailItem
              href='/account'
              icon={User}
              label='Maria Lopez'
              avatar
              onClick={handleRailClick}
              data-testid='nav-rail-account'
            />
          </NavRailFooter>
        </NavRail>
      </AppShellRail>

      <AppShellRemote role='main'>
        <RemoteShell
          config={SECURITY_TESTING_GROUP}
          basePath='/security-testing'
          pathname={pathname}
          onNavigate={handleNavigate}
          data-testid='group-shell'
        >
          <RemoteShellPanel resizable />
          <RemoteShellBreadcrumb />
          <RemoteShellContent>
            <Page name='threat-replay' fullSize fixedHeight data-testid='replay-page'>
              <PageHeader>
                <PageTitle>Threat Replay</PageTitle>
              </PageHeader>
              <PageContent>
                <Table
                  aria-label='Replay runs'
                  data={REPLAY_RUNS}
                  columns={columns}
                  data-testid='replay-table'
                />
              </PageContent>
            </Page>
          </RemoteShellContent>
        </RemoteShell>
      </AppShellRemote>
    </AppShell>
  );
};

/**
 * Settings is a host route that renders `RemoteShell` itself. The trail comes from
 * `RemoteShellBreadcrumb`, so `PageHeader` holds no `Breadcrumbs`.
 */
export const SettingsSection: StoryFn = () => {
  const [pathname, setPathname] = useState('/settings/users');

  const handleRailClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onRailNavigate(event.currentTarget.getAttribute('href'));
  };
  const handleNavigate = (to: string) => {
    onNavigate(to);
    setPathname(to);
  };

  const columns: TableColumnDef<Member>[] = [
    { accessorKey: 'name', header: 'Name', size: 200 },
    { accessorKey: 'email', header: 'Email', size: 280 },
    { accessorKey: 'role', header: 'Role', size: 160 },
  ];

  return (
    <AppShell data-testid='app-shell'>
      <AppShellHeader>
        <TopHeader data-testid='top-header'>
          <TopHeaderLogo href='/' onClick={handleRailClick}>
            <Logo size='md' />
          </TopHeaderLogo>
          <TopHeaderActions>
            <Button variant='ghost' color='neutral' size='small'>
              Acme Bank
              <ChevronUpDown />
            </Button>
            <TopHeaderSeparator />
            <Button variant='ghost' color='neutral' size='small' aria-label='Wallarm updates'>
              <Bell />
            </Button>
            <Button variant='ghost' color='neutral' size='small' aria-label='Help'>
              <CircleHelp />
            </Button>
          </TopHeaderActions>
        </TopHeader>
      </AppShellHeader>

      <AppShellRail>
        <NavRail mode='collapsed' data-testid='nav-rail'>
          <NavRailBody>
            <NavRailItem
              href='/'
              icon={HomeIcon}
              label='Home'
              shortcut={['G', 'H']}
              onClick={handleRailClick}
              data-testid='nav-rail-home'
            />
            <NavRailItem href='/recent' icon={History} label='Recent' onClick={handleRailClick} />
            <NavRailSeparator />
            {PRODUCTS.map(product => (
              <NavRailItem
                key={product.id}
                href={`/${product.id}`}
                icon={product.icon}
                label={product.label}
                shortcut={product.shortcut}
                onClick={handleRailClick}
                data-testid={`nav-rail-${product.id}`}
              />
            ))}
          </NavRailBody>
          <NavRailFooter>
            <NavRailItem
              href='/settings'
              icon={Settings}
              label='Settings'
              shortcut={['G', 'S']}
              active
              onClick={handleRailClick}
              data-testid='nav-rail-settings'
            />
            <NavRailItem
              href='/account'
              icon={User}
              label='Maria Lopez'
              avatar
              onClick={handleRailClick}
              data-testid='nav-rail-account'
            />
          </NavRailFooter>
        </NavRail>
      </AppShellRail>

      <AppShellRemote role='main'>
        <RemoteShell
          config={SETTINGS_NAV}
          basePath='/settings'
          pathname={pathname}
          onNavigate={handleNavigate}
          data-testid='settings-shell'
        >
          <RemoteShellPanel />
          <RemoteShellBreadcrumb />
          <RemoteShellContent>
            <Page name='settings-users' fullSize fixedHeight data-testid='users-page'>
              <PageHeader>
                <PageHeaderGroup className='flex-1'>
                  <PageTitle>Users</PageTitle>
                  <PageDescription>
                    People who can sign in to your organization, with access set by roles.
                  </PageDescription>
                </PageHeaderGroup>
                <PageActions>
                  <Button size='medium' onClick={onCreateUser}>
                    Create user
                  </Button>
                </PageActions>
              </PageHeader>
              <PageContent>
                <Table
                  aria-label='Users'
                  data={MEMBERS}
                  columns={columns}
                  data-testid='users-table'
                />
              </PageContent>
            </Page>
          </RemoteShellContent>
        </RemoteShell>
      </AppShellRemote>
    </AppShell>
  );
};

/**
 * A `drill` node at `/edge/data-planes/production/services`: the panel shows the entity level
 * with a back button, and the trail gets a scope switcher for the entity.
 */
export const DrillDown: StoryFn = () => {
  const [pathname, setPathname] = useState('/edge/data-planes/production/services');

  const handleRailClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onRailNavigate(event.currentTarget.getAttribute('href'));
  };
  const handleNavigate = (to: string) => {
    onNavigate(to);
    setPathname(to);
  };

  const columns: TableColumnDef<Service>[] = [
    { accessorKey: 'name', header: 'Service', size: 200 },
    { accessorKey: 'nodes', header: 'Nodes', size: 120 },
    { accessorKey: 'upstream', header: 'Upstream', size: 280 },
  ];

  return (
    <AppShell data-testid='app-shell'>
      <AppShellHeader>
        <TopHeader data-testid='top-header'>
          <TopHeaderLogo href='/' onClick={handleRailClick}>
            <Logo size='md' />
          </TopHeaderLogo>
          <TopHeaderActions>
            <Button variant='ghost' color='neutral' size='small'>
              Acme Bank
              <ChevronUpDown />
            </Button>
            <TopHeaderSeparator />
            <Button variant='ghost' color='neutral' size='small' aria-label='Wallarm updates'>
              <Bell />
            </Button>
            <Button variant='ghost' color='neutral' size='small' aria-label='Help'>
              <CircleHelp />
            </Button>
          </TopHeaderActions>
        </TopHeader>
      </AppShellHeader>

      <AppShellRail>
        <NavRail mode='collapsed' data-testid='nav-rail'>
          <NavRailBody>
            <NavRailItem
              href='/'
              icon={HomeIcon}
              label='Home'
              shortcut={['G', 'H']}
              onClick={handleRailClick}
              data-testid='nav-rail-home'
            />
            <NavRailItem href='/recent' icon={History} label='Recent' onClick={handleRailClick} />
            <NavRailSeparator />
            {PRODUCTS.map(product => (
              <NavRailItem
                key={product.id}
                href={`/${product.id}`}
                icon={product.icon}
                label={product.label}
                shortcut={product.shortcut}
                active={product.id === 'edge'}
                onClick={handleRailClick}
                data-testid={`nav-rail-${product.id}`}
              />
            ))}
          </NavRailBody>
          <NavRailFooter>
            <NavRailItem
              href='/settings'
              icon={Settings}
              label='Settings'
              shortcut={['G', 'S']}
              onClick={handleRailClick}
              data-testid='nav-rail-settings'
            />
            <NavRailItem
              href='/account'
              icon={User}
              label='Maria Lopez'
              avatar
              onClick={handleRailClick}
              data-testid='nav-rail-account'
            />
          </NavRailFooter>
        </NavRail>
      </AppShellRail>

      <AppShellRemote role='main'>
        <RemoteShell
          config={EDGE_NAV}
          basePath='/edge'
          pathname={pathname}
          onNavigate={handleNavigate}
          data-testid='product-shell'
        >
          <RemoteShellPanel resizable />
          <RemoteShellBreadcrumb />
          <RemoteShellContent>
            <Page name='edge-services' fullSize fixedHeight data-testid='services-page'>
              <PageHeader>
                <PageTitle>Services</PageTitle>
              </PageHeader>
              <PageContent>
                <Table
                  aria-label='Services'
                  data={SERVICES}
                  columns={columns}
                  data-testid='services-table'
                />
              </PageContent>
            </Page>
          </RemoteShellContent>
        </RemoteShell>
      </AppShellRemote>
    </AppShell>
  );
};

/**
 * While the host loads the user and the product list, skeletons sit where the header actions
 * and rail items land. While a product loads, its panel shows skeleton rows under the product
 * name and its content shows a loader.
 */
export const Loading: StoryFn = () => (
  <AppShell data-testid='app-shell'>
    <AppShellHeader>
      <TopHeader data-testid='top-header'>
        <TopHeaderLogo href='/'>
          <Logo size='md' />
        </TopHeaderLogo>
        <TopHeaderActions>
          <Skeleton width='120px' height='20px' rounded={6} />
          <TopHeaderSeparator />
          <Skeleton width='60px' height='20px' rounded={6} />
        </TopHeaderActions>
      </TopHeader>
    </AppShellHeader>

    <AppShellRail>
      <NavRail mode='collapsed' data-testid='nav-rail'>
        <NavRailBody>
          <NavRailItem href='/' icon={HomeIcon} label='Home' shortcut={['G', 'H']} />
          <NavRailSeparator />
          <NavRailSkeleton />
        </NavRailBody>
      </NavRail>
    </AppShellRail>

    <AppShellRemote role='main'>
      <RemoteShell
        config={EDGE_NAV}
        basePath='/edge'
        pathname='/edge'
        onNavigate={onNavigate}
        data-testid='product-shell'
      >
        <RemoteShellPanel isLoading />
        <RemoteShellContent isLoading />
      </RemoteShell>
    </AppShellRemote>
  </AppShell>
);

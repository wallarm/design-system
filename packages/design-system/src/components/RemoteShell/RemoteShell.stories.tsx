import type { FC } from 'react';
import { Link as RouterLink, useNavigate, useRouterState } from '@tanstack/react-router';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { edgeNavConfig, StoryRouter } from '../AppShell/story-content';
import { Link } from '../Link';
import { Page, PageContent, PageHeader, PageTitle } from '../Page';
import { Text } from '../Text';
import { useRemoteShellContext } from './model';
import { RemoteShell, type RemoteShellProps } from './RemoteShell';
import { RemoteShellBreadcrumb } from './RemoteShellBreadcrumb';
import { RemoteShellContent } from './RemoteShellContent';
import { RemoteShellPanel } from './RemoteShellPanel';

const DESCRIPTION = [
  'The frame of one product inside `AppShell` — its navigation panel, breadcrumbs and content area, all driven by a single `NavConfig`.',
  'The URL is the state: the active item, the drill level and the breadcrumbs are matched from the pathname. When a router owns the URL, hand the shell the router’s pathname through `pathname` and take its navigations back through `onNavigate` — then links in the page, the host rail or `router.navigate` keep the menu in sync. Without `pathname` the shell reads `window.location` and only notices `popstate` and its own navigations.',
].join(' ');

const meta = {
  title: 'Navigation/RemoteShell',
  component: RemoteShell,
  subcomponents: {
    RemoteShellPanel,
    RemoteShellBreadcrumb,
    RemoteShellContent,
  },
  // Each story render gets its own TanStack Router on a memory history (story-only
  // harness); the story body below is the integration a product writes itself.
  decorators: [
    Story => (
      <StoryRouter initialPath='/edge/overview'>
        <Story />
      </StoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    children: { control: false },
    ref: { control: false },
    config: { control: false },
    basePath: { control: false },
    pathname: { control: false },
    onNavigate: { control: false },
  },
} satisfies Meta<typeof RemoteShell>;

export default meta;

const EDGE_LINKS = [
  { to: '/edge/overview', label: 'Edge overview' },
  { to: '/edge/data-planes/production/services', label: 'Production → Services' },
  { to: '/edge/data-planes/staging/overview', label: 'Staging → Overview' },
  { to: '/edge/data-planes/production/nodes/node-2/metrics', label: 'Node 2 → Metrics' },
];

const EdgePage: FC = () => {
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
          <Text size='sm' color='secondary'>
            These are router links in the page, not shell navigation — the panel and the breadcrumbs
            follow them.
          </Text>
          <ul className='flex flex-col gap-4'>
            {EDGE_LINKS.map(link => (
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

/**
 * A standalone product on TanStack Router — the recommended integration. `pathname` is
 * the router’s `location.pathname` and `onNavigate` calls `navigate`, so the menu, drill
 * level and breadcrumbs follow every navigation: the panel, the breadcrumbs and the
 * router links in the page. This router has no `basepath` (its routes include `/edge`),
 * so both sides use the full pathname. If your router sets `basepath`, its
 * `location.pathname` is router-relative: omit `basePath` on `RemoteShell` (or keep it
 * and strip it in `onNavigate`), otherwise `navigate` prefixes it twice.
 */
export const Basic: StoryFn<RemoteShellProps> = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: state => state.location.pathname });

  return (
    <div className='h-screen bg-bg-page-bg'>
      <RemoteShell
        config={edgeNavConfig}
        basePath='/edge'
        pathname={pathname}
        onNavigate={to => navigate({ to })}
      >
        <RemoteShellPanel resizable />
        <RemoteShellBreadcrumb />
        <RemoteShellContent>
          <EdgePage />
        </RemoteShellContent>
      </RemoteShell>
    </div>
  );
};

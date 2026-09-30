import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NavConfig } from './model';
import { useRemoteShellContext } from './model';
import { RemoteShell } from './RemoteShell';
import { RemoteShellPanel } from './RemoteShellPanel';

const config: NavConfig = {
  productLabel: 'Settings',
  productPath: '/settings',
  items: [
    { type: 'link', id: 'profile', label: 'Profile', path: 'profile' },
    { type: 'link', id: 'notifications', label: 'Notifications', path: 'notifications' },
    {
      type: 'drill',
      id: 'teams',
      label: 'Teams',
      path: 'teams',
      param: 'teamId',
      entities: [{ id: 'core', label: 'Core' }],
      children: [
        { type: 'link', id: 'members', label: 'Members', path: 'members' },
        { type: 'link', id: 'roles', label: 'Roles', path: 'roles' },
      ],
    },
  ],
};

const otherConfig: NavConfig = {
  productLabel: 'Edge',
  productPath: '/edge',
  items: [
    { type: 'link', id: 'overview', label: 'Overview', path: 'overview' },
    { type: 'link', id: 'rules', label: 'Rules', path: 'rules' },
  ],
};

const NavigationState = () => {
  const {
    activeItemId,
    effectiveActiveItemId,
    breadcrumbSegments,
    drillLevel,
    navigateTo,
    goBack,
  } = useRemoteShellContext();

  return (
    <>
      <output data-testid='active-item'>{activeItemId}</output>
      <output data-testid='effective-active-item'>{effectiveActiveItemId}</output>
      <output data-testid='drill-level'>{drillLevel}</output>
      <output data-testid='breadcrumbs'>
        {breadcrumbSegments.map(segment => segment.label).join(' / ')}
      </output>
      <button
        type='button'
        data-testid='go-notifications'
        onClick={() => navigateTo('/notifications')}
      >
        Go to notifications
      </button>
      <button type='button' data-testid='go-back' onClick={goBack}>
        Back
      </button>
    </>
  );
};

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('RemoteShell', () => {
  describe('uncontrolled (window.location)', () => {
    it('updates breadcrumbs and active navigation after router navigation', () => {
      window.history.replaceState(null, '', '/profile');

      render(
        <RemoteShell
          config={config}
          onNavigate={pathname => window.history.pushState(null, '', pathname)}
        >
          <NavigationState />
        </RemoteShell>,
      );

      expect(screen.getByTestId('active-item')).toHaveTextContent('profile');
      expect(screen.getByTestId('breadcrumbs')).toHaveTextContent('Settings / Profile');

      fireEvent.click(screen.getByTestId('go-notifications'));

      expect(window.location.pathname).toBe('/notifications');
      expect(screen.getByTestId('active-item')).toHaveTextContent('notifications');
      expect(screen.getByTestId('breadcrumbs')).toHaveTextContent('Settings / Notifications');
    });
  });

  describe('controlled pathname prop', () => {
    it('follows the pathname prop without any window.history change', () => {
      window.history.replaceState(null, '', '/unrelated');

      const { rerender } = render(
        <RemoteShell config={config} basePath='/settings' pathname='/settings/profile'>
          <NavigationState />
        </RemoteShell>,
      );

      expect(screen.getByTestId('active-item')).toHaveTextContent('profile');
      expect(screen.getByTestId('breadcrumbs')).toHaveTextContent('Settings / Profile');

      rerender(
        <RemoteShell config={config} basePath='/settings' pathname='/settings/notifications'>
          <NavigationState />
        </RemoteShell>,
      );

      expect(window.location.pathname).toBe('/unrelated');
      expect(screen.getByTestId('active-item')).toHaveTextContent('notifications');
      expect(screen.getByTestId('breadcrumbs')).toHaveTextContent('Settings / Notifications');
    });

    it('ignores popstate on window.location while controlled', () => {
      const { rerender } = render(
        <RemoteShell config={config} pathname='/profile'>
          <NavigationState />
        </RemoteShell>,
      );

      act(() => {
        window.history.pushState(null, '', '/notifications');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });

      expect(screen.getByTestId('active-item')).toHaveTextContent('profile');

      rerender(
        <RemoteShell config={config} pathname='/profile'>
          <NavigationState />
        </RemoteShell>,
      );
      expect(screen.getByTestId('active-item')).toHaveTextContent('profile');
    });

    it('hands the full pathname (with basePath) to onNavigate', () => {
      const calls: string[] = [];

      render(
        <RemoteShell
          config={config}
          basePath='/settings'
          pathname='/settings/profile'
          onNavigate={to => calls.push(to)}
        >
          <NavigationState />
        </RemoteShell>,
      );

      fireEvent.click(screen.getByTestId('go-notifications'));

      expect(calls).toEqual(['/settings/notifications']);
      // Controlled: nothing changes until the parent passes the new pathname.
      expect(screen.getByTestId('active-item')).toHaveTextContent('profile');
    });

    it('strips basePath only on a segment boundary', () => {
      const edgeConfig: NavConfig = {
        productLabel: 'Edge',
        productPath: '/edge',
        items: [
          { type: 'link', id: 'overview', label: 'Overview', path: 'overview' },
          { type: 'link', id: 'edge-nodes', label: 'Edge nodes', path: 'edge-nodes' },
        ],
      };

      const { rerender } = render(
        <RemoteShell config={edgeConfig} basePath='/edge' pathname='/edge-nodes'>
          <NavigationState />
        </RemoteShell>,
      );

      // Router-relative '/edge-nodes' is not under '/edge' — nothing is stripped.
      expect(screen.getByTestId('active-item')).toHaveTextContent('edge-nodes');

      rerender(
        <RemoteShell config={edgeConfig} basePath='/edge' pathname='/edge/edge-nodes'>
          <NavigationState />
        </RemoteShell>,
      );
      expect(screen.getByTestId('active-item')).toHaveTextContent('edge-nodes');

      rerender(
        <RemoteShell config={edgeConfig} basePath='/edge' pathname='/edge'>
          <NavigationState />
        </RemoteShell>,
      );
      expect(screen.getByTestId('breadcrumbs')).toHaveTextContent('Edge');
    });

    it('warns in development when pathname is controlled without onNavigate', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      try {
        const { rerender } = render(
          <RemoteShell config={config} pathname='/profile'>
            <NavigationState />
          </RemoteShell>,
        );

        expect(warn).toHaveBeenCalledTimes(1);
        expect(String(warn.mock.calls[0]?.[0])).toContain('[RemoteShell]');

        rerender(
          <RemoteShell config={config} pathname='/notifications' onNavigate={() => undefined}>
            <NavigationState />
          </RemoteShell>,
        );
        expect(warn).toHaveBeenCalledTimes(1);
      } finally {
        warn.mockRestore();
      }
    });

    it('does not warn when uncontrolled or when onNavigate is given', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      try {
        render(
          <>
            <RemoteShell config={config}>
              <NavigationState />
            </RemoteShell>
            <RemoteShell config={otherConfig} pathname='/overview' onNavigate={() => undefined} />
          </>,
        );

        expect(warn).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    });
  });

  describe('visual back navigation (goBack)', () => {
    it('clears the goBack override in the same render the pathname changes', () => {
      const renderLevels: string[] = [];
      const LevelProbe = () => {
        const { drillLevel, navStack } = useRemoteShellContext();
        renderLevels.push(`${drillLevel}/${navStack.length - 1}`);
        return null;
      };

      const { rerender } = render(
        <RemoteShell config={config} pathname='/teams/core/members'>
          <NavigationState />
          <LevelProbe />
        </RemoteShell>,
      );

      expect(screen.getByTestId('drill-level')).toHaveTextContent('1');
      expect(screen.getByTestId('effective-active-item')).toHaveTextContent('members');

      fireEvent.click(screen.getByTestId('go-back'));

      expect(screen.getByTestId('drill-level')).toHaveTextContent('0');
      expect(screen.getByTestId('effective-active-item')).toHaveTextContent('teams');

      renderLevels.length = 0;

      rerender(
        <RemoteShell config={config} pathname='/teams/core/roles'>
          <NavigationState />
          <LevelProbe />
        </RemoteShell>,
      );

      // Every render after the pathname change already sees the URL's level — no
      // intermediate render with the stale override.
      expect(renderLevels.length).toBeGreaterThan(0);
      expect(renderLevels.every(entry => entry === '1/1')).toBe(true);
      expect(screen.getByTestId('drill-level')).toHaveTextContent('1');
      expect(screen.getByTestId('effective-active-item')).toHaveTextContent('roles');
    });

    it('does not resurrect a stale override when returning to the same pathname', () => {
      const { rerender } = render(
        <RemoteShell config={config} pathname='/teams/core/members'>
          <NavigationState />
        </RemoteShell>,
      );

      fireEvent.click(screen.getByTestId('go-back'));
      expect(screen.getByTestId('drill-level')).toHaveTextContent('0');

      rerender(
        <RemoteShell config={config} pathname='/teams/core/roles'>
          <NavigationState />
        </RemoteShell>,
      );
      rerender(
        <RemoteShell config={config} pathname='/teams/core/members'>
          <NavigationState />
        </RemoteShell>,
      );

      expect(screen.getByTestId('drill-level')).toHaveTextContent('1');
      expect(screen.getByTestId('effective-active-item')).toHaveTextContent('members');
    });

    it('never goes below level 0', () => {
      render(
        <RemoteShell config={config} pathname='/teams/core/members'>
          <NavigationState />
        </RemoteShell>,
      );

      fireEvent.click(screen.getByTestId('go-back'));
      fireEvent.click(screen.getByTestId('go-back'));

      expect(screen.getByTestId('drill-level')).toHaveTextContent('0');
    });
  });

  describe('TanStack Router integration', () => {
    it('stays in sync with router navigations made outside the shell', async () => {
      const RouterNavButton = () => {
        const navigate = useNavigate();
        return (
          <button
            type='button'
            data-testid='router-link'
            onClick={() => navigate({ to: '/settings/notifications' })}
          >
            Router link
          </button>
        );
      };

      const Shell = () => {
        const navigate = useNavigate();
        const pathname = useRouterState({ select: state => state.location.pathname });
        return (
          <RemoteShell
            config={config}
            basePath='/settings'
            pathname={pathname}
            onNavigate={to => navigate({ to })}
          >
            <NavigationState />
            <RouterNavButton />
          </RemoteShell>
        );
      };

      const router = createRouter({
        routeTree: createRootRoute({ component: Shell }),
        history: createMemoryHistory({ initialEntries: ['/settings/profile'] }),
      });

      render(<RouterProvider router={router} />);

      expect(await screen.findByTestId('active-item')).toHaveTextContent('profile');

      await act(async () => {
        fireEvent.click(screen.getByTestId('router-link'));
      });

      expect(await screen.findByText('Settings / Notifications')).toBeInTheDocument();
      expect(screen.getByTestId('active-item')).toHaveTextContent('notifications');
      expect(window.location.pathname).toBe('/');
    });
  });

  describe('TanStack Router with basepath', () => {
    const RouterNotificationsLink = () => {
      const navigate = useNavigate();
      return (
        <button
          type='button'
          data-testid='router-link'
          onClick={() => navigate({ to: '/notifications' })}
        >
          Router link
        </button>
      );
    };

    const renderWithBasepath = (Shell: () => React.JSX.Element) => {
      const history = createMemoryHistory({ initialEntries: ['/settings/profile'] });
      const router = createRouter({
        routeTree: createRootRoute({ component: Shell }),
        history,
        basepath: '/settings',
      });
      render(<RouterProvider router={router} />);
      return history;
    };

    it('works with basePath omitted: pathname and onNavigate are router-relative', async () => {
      const Shell = () => {
        const navigate = useNavigate();
        const pathname = useRouterState({ select: state => state.location.pathname });
        return (
          <RemoteShell config={config} pathname={pathname} onNavigate={to => navigate({ to })}>
            <NavigationState />
            <RouterNotificationsLink />
          </RemoteShell>
        );
      };

      const history = renderWithBasepath(Shell);

      expect(await screen.findByTestId('active-item')).toHaveTextContent('profile');

      await act(async () => {
        fireEvent.click(screen.getByTestId('go-notifications'));
      });

      expect(history.location.pathname).toBe('/settings/notifications');
      expect(screen.getByTestId('active-item')).toHaveTextContent('notifications');
    });

    it('works with basePath kept: onNavigate strips it before router.navigate', async () => {
      const basePath = '/settings';
      const Shell = () => {
        const navigate = useNavigate();
        const pathname = useRouterState({ select: state => state.location.pathname });
        return (
          <RemoteShell
            config={config}
            basePath={basePath}
            pathname={pathname}
            onNavigate={to => navigate({ to: to.slice(basePath.length) || '/' })}
          >
            <NavigationState />
            <RouterNotificationsLink />
          </RemoteShell>
        );
      };

      const history = renderWithBasepath(Shell);

      expect(await screen.findByTestId('active-item')).toHaveTextContent('profile');

      await act(async () => {
        fireEvent.click(screen.getByTestId('go-notifications'));
      });

      expect(history.location.pathname).toBe('/settings/notifications');
      expect(screen.getByTestId('active-item')).toHaveTextContent('notifications');
    });
  });

  describe('drill transition', () => {
    const shell = (navConfig: NavConfig, pathname: string) => (
      <RemoteShell config={navConfig} pathname={pathname} data-testid='shell'>
        <RemoteShellPanel />
      </RemoteShell>
    );

    it('animates between drill levels within the same product', () => {
      const { rerender } = render(shell(config, '/profile'));

      rerender(shell(config, '/teams/core/members'));

      const panel = screen.getByTestId('shell--panel');
      // Mid-transition both levels are on screen: the root list and the drill.
      expect(within(panel).getByText('Profile')).toBeInTheDocument();
      expect(within(panel).getByText('Members')).toBeInTheDocument();
    });

    it('does not animate from the previous product when the config switches', () => {
      const { rerender } = render(shell(config, '/teams/core/members'));

      rerender(shell(otherConfig, '/overview'));

      const panel = screen.getByTestId('shell--panel');
      expect(within(panel).getByText('Overview')).toBeInTheDocument();
      expect(within(panel).queryByText('Members')).not.toBeInTheDocument();
      expect(within(panel).queryByText('Profile')).not.toBeInTheDocument();
    });
  });
});

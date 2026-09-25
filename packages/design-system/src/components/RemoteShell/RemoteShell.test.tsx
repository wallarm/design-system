import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRemoteShellContext } from './model';
import { RemoteShell } from './RemoteShell';

const config = {
  productLabel: 'Settings',
  productPath: '/settings',
  items: [
    { type: 'link' as const, id: 'profile', label: 'Profile', path: 'profile' },
    {
      type: 'link' as const,
      id: 'notifications',
      label: 'Notifications',
      path: 'notifications',
    },
  ],
};

const NavigationState = () => {
  const { activeItemId, breadcrumbSegments, navigateTo } = useRemoteShellContext();

  return (
    <>
      <output data-testid='active-item'>{activeItemId}</output>
      <output data-testid='breadcrumbs'>
        {breadcrumbSegments.map(segment => segment.label).join(' / ')}
      </output>
      <button onClick={() => navigateTo('/notifications')}>Go to notifications</button>
    </>
  );
};

describe('RemoteShell', () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Go to notifications' }));

    expect(window.location.pathname).toBe('/notifications');
    expect(screen.getByTestId('active-item')).toHaveTextContent('notifications');
    expect(screen.getByTestId('breadcrumbs')).toHaveTextContent('Settings / Notifications');
  });
});

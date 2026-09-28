import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Activity } from '../../icons';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { NavRail } from './NavRail';
import { NavRailItem } from './NavRailItem';
import { NavRailSkeleton } from './NavRailSkeleton';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the default <a> branch', () => {
    render(
      <NavRail>
        <NavRailItem
          icon={Activity}
          label='Activity'
          href='/activity'
          data-testid='item-activity'
          data-analytics-id='NAV_ACTIVITY'
        />
      </NavRail>,
    );

    const item = screen.getByTestId('item-activity');
    expect(item.tagName).toBe('A');
    expect(item).toHaveAttribute('href', '/activity');
    expect(item).toHaveAttribute('data-analytics-id', 'NAV_ACTIVITY');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'nav', target: 'activity' });

    render(
      <NavRail>
        <NavRailItem
          icon={Activity}
          label='Activity'
          href='/activity'
          data-testid='item-activity'
          data-analytics-id='NAV_ACTIVITY'
          data-analytics-props={payload}
        />
      </NavRail>,
    );

    const item = screen.getByTestId('item-activity');
    expect(item).toHaveAttribute('data-analytics-id', 'NAV_ACTIVITY');
    expect(item).toHaveAttribute('data-analytics-props', payload);
  });

  it('forwards data-analytics-id through asChild to the consumer element', () => {
    render(
      <NavRail>
        <NavRailItem icon={Activity} label='Activity' asChild>
          <button type='button' data-testid='item-button' data-analytics-id='NAV_ACTIVITY_BTN'>
            Custom
          </button>
        </NavRailItem>
      </NavRail>,
    );

    const item = screen.getByTestId('item-button');
    expect(item.tagName).toBe('BUTTON');
    expect(item).toHaveAttribute('data-analytics-id', 'NAV_ACTIVITY_BTN');
  });

  it('preserves data-analytics-id when the item becomes active', () => {
    const { rerender } = render(
      <NavRail>
        <NavRailItem
          icon={Activity}
          label='Activity'
          href='/activity'
          data-testid='item-activity'
          data-analytics-id='NAV_ACTIVITY'
        />
      </NavRail>,
    );

    let item = screen.getByTestId('item-activity');
    expect(item).toHaveAttribute('data-analytics-id', 'NAV_ACTIVITY');
    expect(item).not.toHaveAttribute('aria-current');

    rerender(
      <NavRail>
        <NavRailItem
          icon={Activity}
          label='Activity'
          href='/activity'
          data-testid='item-activity'
          data-analytics-id='NAV_ACTIVITY'
          active
        />
      </NavRail>,
    );

    item = screen.getByTestId('item-activity');
    expect(item).toHaveAttribute('aria-current', 'page');
    expect(item).toHaveAttribute('data-analytics-id', 'NAV_ACTIVITY');
  });

  it('each item captures its own data-analytics-id via closest() across both branches', async () => {
    const captured = captureAnalyticsClicks();

    render(
      <NavRail>
        <NavRailItem
          icon={Activity}
          label='Activity'
          href='/activity'
          data-testid='item-activity'
          data-analytics-id='NAV_ACTIVITY'
          onClick={e => e.preventDefault()}
        />
        <NavRailItem icon={Activity} label='Reports' asChild>
          <button type='button' data-testid='item-reports' data-analytics-id='NAV_REPORTS'>
            Reports
          </button>
        </NavRailItem>
      </NavRail>,
    );

    await userEvent.click(screen.getByTestId('item-activity'));
    await userEvent.click(screen.getByTestId('item-reports'));

    expect(captured).toHaveBeenCalledWith('NAV_ACTIVITY');
    expect(captured).toHaveBeenCalledWith('NAV_REPORTS');
  });
});

describe('Avatar plate', () => {
  it('seats the icon on a plate when avatar is set', () => {
    render(
      <NavRail>
        <NavRailItem icon={Activity} label='Meow Meow' avatar data-testid='item-user' />
      </NavRail>,
    );

    const plate = screen
      .getByTestId('item-user')
      .querySelector('[data-slot="nav-rail-item-avatar"]');
    expect(plate).not.toBeNull();
    expect(plate?.querySelector('svg')).not.toBeNull();
  });

  it('fills the plate with the photo when avatarSrc is set', () => {
    render(
      <NavRail>
        <NavRailItem
          icon={Activity}
          label='Meow Meow'
          avatarSrc='/me.png'
          data-testid='item-user'
        />
      </NavRail>,
    );

    const img = screen
      .getByTestId('item-user')
      .querySelector('[data-slot="nav-rail-item-avatar"] img');
    expect(img).toHaveAttribute('src', '/me.png');
    expect(img).toHaveAttribute('alt', '');
  });

  it('falls back to the icon when the photo fails to load', () => {
    render(
      <NavRail>
        <NavRailItem
          icon={Activity}
          label='Meow Meow'
          avatarSrc='/broken.png'
          data-testid='item-user'
        />
      </NavRail>,
    );

    const plate = screen
      .getByTestId('item-user')
      .querySelector('[data-slot="nav-rail-item-avatar"]');
    const img = plate?.querySelector('img');
    if (!img) throw new Error('expected the photo to render first');
    fireEvent.error(img);

    expect(plate?.querySelector('img')).toBeNull();
    expect(plate?.querySelector('svg')).not.toBeNull();
  });

  it('renders no plate by default', () => {
    render(
      <NavRail>
        <NavRailItem icon={Activity} label='Activity' data-testid='item-activity' />
      </NavRail>,
    );

    expect(
      screen.getByTestId('item-activity').querySelector('[data-slot="nav-rail-item-avatar"]'),
    ).toBeNull();
  });
});

describe('Rail modes', () => {
  const renderRail = (props: {
    mode?: 'expanded' | 'collapsed' | 'compact';
    collapsed?: boolean;
  }) =>
    render(
      <NavRail {...props} data-testid='rail'>
        <NavRailItem icon={Activity} label='API Security' data-testid='item-api' />
        <NavRailItem icon={Activity} label='Meow Meow' avatar data-testid='item-user' />
      </NavRail>,
    );

  it('shows the label beside the icon when expanded', () => {
    renderRail({ mode: 'expanded' });
    expect(screen.getByTestId('rail')).toHaveAttribute('data-mode', 'expanded');
    expect(screen.getByTestId('item-api')).toHaveTextContent('API Security');
  });

  it('hides every label when collapsed', () => {
    renderRail({ mode: 'collapsed' });
    expect(screen.getByTestId('item-api')).not.toHaveTextContent('API Security');
  });

  it('keeps the label under the icon when compact, except on the avatar item', () => {
    renderRail({ mode: 'compact' });
    expect(screen.getByTestId('rail')).toHaveAttribute('data-mode', 'compact');
    expect(screen.getByTestId('item-api')).toHaveTextContent('API Security');
    expect(screen.getByTestId('item-user')).not.toHaveTextContent('Meow Meow');
  });

  it('still honours the collapsed shorthand', () => {
    renderRail({ collapsed: true });
    expect(screen.getByTestId('rail')).toHaveAttribute('data-mode', 'collapsed');
  });

  it('lets mode win over the collapsed shorthand', () => {
    renderRail({ mode: 'compact', collapsed: true });
    expect(screen.getByTestId('rail')).toHaveAttribute('data-mode', 'compact');
  });
});

describe('Accessible names', () => {
  it('names icon-only items from the label when collapsed', () => {
    render(
      <NavRail mode='collapsed'>
        <NavRailItem icon={Activity} label='Activity' data-testid='item-activity' />
      </NavRail>,
    );
    expect(screen.getByTestId('item-activity')).toHaveAttribute('aria-label', 'Activity');
  });

  it('names the compact avatar item, which shows no label', () => {
    render(
      <NavRail mode='compact'>
        <NavRailItem icon={Activity} label='Meow Meow' avatar data-testid='item-user' />
        <NavRailItem icon={Activity} label='Activity' data-testid='item-activity' />
      </NavRail>,
    );
    expect(screen.getByTestId('item-user')).toHaveAttribute('aria-label', 'Meow Meow');
    expect(screen.getByTestId('item-activity')).not.toHaveAttribute('aria-label');
  });

  it("keeps the consumer's own aria-label", () => {
    render(
      <NavRail mode='collapsed'>
        <NavRailItem
          icon={Activity}
          label='Activity'
          aria-label='Open activity'
          data-testid='item'
        />
      </NavRail>,
    );
    expect(screen.getByTestId('item')).toHaveAttribute('aria-label', 'Open activity');
  });
});

describe('Compact skeleton', () => {
  it('sizes each bar 4px inside the 62x42 compact item', () => {
    const { container } = render(
      <NavRail mode='compact'>
        <NavRailSkeleton count={2} />
      </NavRail>,
    );
    const bars = container.querySelector('[data-slot="nav-rail-skeleton"]')?.children ?? [];
    expect(bars).toHaveLength(2);
    for (const bar of bars) {
      expect(bar).toHaveStyle({ '--skeleton-width': '54px', '--skeleton-height': '38px' });
    }
  });
});

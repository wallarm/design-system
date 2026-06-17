import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Activity } from '../../icons';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { NavRail } from './NavRail';
import { NavRailItem } from './NavRailItem';

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

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { SegmentedControl } from './SegmentedControl';
import { SegmentedControlButton } from './SegmentedControlButton';
import { SegmentedControlItem } from './SegmentedControlItem';

const renderSegmentedControl = () =>
  render(
    <SegmentedControl defaultValue='list'>
      <SegmentedControlItem value='list' data-testid='item-list' data-analytics-id='VIEW_LIST'>
        List
      </SegmentedControlItem>
      <SegmentedControlItem value='grid' data-testid='item-grid' data-analytics-id='VIEW_GRID'>
        Grid
      </SegmentedControlItem>
    </SegmentedControl>,
  );

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to each item <label>', () => {
    renderSegmentedControl();

    const itemList = screen.getByTestId('item-list');
    const itemGrid = screen.getByTestId('item-grid');

    expect(itemList.tagName).toBe('LABEL');
    expect(itemList).toHaveAttribute('data-analytics-id', 'VIEW_LIST');
    expect(itemGrid).toHaveAttribute('data-analytics-id', 'VIEW_GRID');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'hosts', view: 'list' });

    render(
      <SegmentedControl defaultValue='list'>
        <SegmentedControlItem
          value='list'
          data-testid='item-list'
          data-analytics-id='VIEW_LIST'
          data-analytics-props={payload}
        >
          List
        </SegmentedControlItem>
      </SegmentedControl>,
    );

    const item = screen.getByTestId('item-list');
    expect(item).toHaveAttribute('data-analytics-id', 'VIEW_LIST');
    expect(item).toHaveAttribute('data-analytics-props', payload);
  });

  it('does not strand data-analytics-id on the hidden <input>', () => {
    renderSegmentedControl();

    const radios = document.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBeGreaterThan(0);
    radios.forEach(input => {
      expect(input).not.toHaveAttribute('data-analytics-id');
    });
  });

  it('preserves data-analytics-id across selection changes', async () => {
    renderSegmentedControl();

    const itemList = screen.getByTestId('item-list');
    const itemGrid = screen.getByTestId('item-grid');

    await userEvent.click(itemGrid);
    expect(itemList).toHaveAttribute('data-analytics-id', 'VIEW_LIST');
    expect(itemGrid).toHaveAttribute('data-analytics-id', 'VIEW_GRID');

    await userEvent.click(itemList);
    expect(itemList).toHaveAttribute('data-analytics-id', 'VIEW_LIST');
    expect(itemGrid).toHaveAttribute('data-analytics-id', 'VIEW_GRID');
  });

  it('user clicks resolve each item to its own data-analytics-id via closest()', async () => {
    const captured = captureAnalyticsClicks();

    renderSegmentedControl();

    await userEvent.click(screen.getByTestId('item-grid'));
    await userEvent.click(screen.getByTestId('item-list'));

    expect(captured).toHaveBeenCalledWith('VIEW_GRID');
    expect(captured).toHaveBeenCalledWith('VIEW_LIST');
  });

  it('SegmentedControlButton carries its own data-analytics-id distinct from items', () => {
    render(
      <SegmentedControl defaultValue='list'>
        <SegmentedControlItem value='list' data-testid='item-list' data-analytics-id='VIEW_LIST'>
          List
        </SegmentedControlItem>
        <SegmentedControlButton data-testid='more' data-analytics-id='VIEW_MORE'>
          More
        </SegmentedControlButton>
      </SegmentedControl>,
    );

    expect(screen.getByTestId('item-list')).toHaveAttribute('data-analytics-id', 'VIEW_LIST');
    expect(screen.getByTestId('more')).toHaveAttribute('data-analytics-id', 'VIEW_MORE');
  });
});

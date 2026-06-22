import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { SegmentedTabs } from './SegmentedTabs';
import { SegmentedTabsContent } from './SegmentedTabsContent';
import { SegmentedTabsList } from './SegmentedTabsList';
import { SegmentedTabsTrigger } from './SegmentedTabsTrigger';
import { SegmentedTabsTriggerButton } from './SegmentedTabsTriggerButton';

const renderSegmentedTabs = () =>
  render(
    <SegmentedTabs defaultValue='one'>
      <SegmentedTabsList>
        <SegmentedTabsTrigger value='one' data-analytics-id='SEG_TAB_ONE'>
          One
        </SegmentedTabsTrigger>
        <SegmentedTabsTrigger value='two' data-analytics-id='SEG_TAB_TWO'>
          Two
        </SegmentedTabsTrigger>
      </SegmentedTabsList>
      <SegmentedTabsContent value='one'>Body one</SegmentedTabsContent>
      <SegmentedTabsContent value='two'>Body two</SegmentedTabsContent>
    </SegmentedTabs>,
  );

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to each segmented-tabs trigger <button>', () => {
    renderSegmentedTabs();

    const tabOne = screen.getByRole('tab', { name: /one/i });
    const tabTwo = screen.getByRole('tab', { name: /two/i });

    expect(tabOne.tagName).toBe('BUTTON');
    expect(tabOne).toHaveAttribute('data-analytics-id', 'SEG_TAB_ONE');
    expect(tabTwo).toHaveAttribute('data-analytics-id', 'SEG_TAB_TWO');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'filters', segment: 'one' });

    render(
      <SegmentedTabs defaultValue='one'>
        <SegmentedTabsList>
          <SegmentedTabsTrigger
            value='one'
            data-analytics-id='SEG_TAB_ONE'
            data-analytics-props={payload}
          >
            One
          </SegmentedTabsTrigger>
        </SegmentedTabsList>
        <SegmentedTabsContent value='one'>Body one</SegmentedTabsContent>
      </SegmentedTabs>,
    );

    const tab = screen.getByRole('tab', { name: /one/i });
    expect(tab).toHaveAttribute('data-analytics-id', 'SEG_TAB_ONE');
    expect(tab).toHaveAttribute('data-analytics-props', payload);
  });

  it('preserves data-analytics-id across segment selection changes', async () => {
    renderSegmentedTabs();

    const tabOne = screen.getByRole('tab', { name: /one/i });
    const tabTwo = screen.getByRole('tab', { name: /two/i });

    await userEvent.click(tabTwo);
    expect(tabOne).toHaveAttribute('data-analytics-id', 'SEG_TAB_ONE');
    expect(tabTwo).toHaveAttribute('data-analytics-id', 'SEG_TAB_TWO');

    await userEvent.click(tabOne);
    expect(tabOne).toHaveAttribute('data-analytics-id', 'SEG_TAB_ONE');
    expect(tabTwo).toHaveAttribute('data-analytics-id', 'SEG_TAB_TWO');
  });

  it('each trigger captures its own data-analytics-id via closest()', async () => {
    const captured = captureAnalyticsClicks();

    renderSegmentedTabs();

    await userEvent.click(screen.getByRole('tab', { name: /two/i }));
    await userEvent.click(screen.getByRole('tab', { name: /one/i }));

    expect(captured).toHaveBeenNthCalledWith(1, 'SEG_TAB_TWO');
    expect(captured).toHaveBeenNthCalledWith(2, 'SEG_TAB_ONE');
  });

  it('SegmentedTabsTriggerButton carries its own data-analytics-id distinct from the parent trigger', () => {
    render(
      <SegmentedTabs defaultValue='one'>
        <SegmentedTabsList>
          <SegmentedTabsTrigger value='one' data-analytics-id='SEG_TAB_ONE'>
            One
            <SegmentedTabsTriggerButton
              data-testid='trigger-button'
              data-analytics-id='SEG_TAB_ONE_MENU'
            />
          </SegmentedTabsTrigger>
        </SegmentedTabsList>
        <SegmentedTabsContent value='one'>Body one</SegmentedTabsContent>
      </SegmentedTabs>,
    );

    const tab = screen.getByRole('tab', { name: /one/i });
    expect(tab).toHaveAttribute('data-analytics-id', 'SEG_TAB_ONE');

    const triggerButton = screen.getByTestId('trigger-button');
    expect(triggerButton).toHaveAttribute('data-analytics-id', 'SEG_TAB_ONE_MENU');
  });
});

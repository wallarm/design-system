import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Tabs } from './Tabs';
import { TabsContent } from './TabsContent';
import { TabsList } from './TabsList';
import { TabsTrigger } from './TabsTrigger';

const renderTabs = () =>
  render(
    <Tabs defaultValue='one'>
      <TabsList>
        <TabsTrigger value='one' data-analytics-id='OPEN_TAB_ONE'>
          One
        </TabsTrigger>
        <TabsTrigger value='two' data-analytics-id='OPEN_TAB_TWO'>
          Two
        </TabsTrigger>
      </TabsList>
      <TabsContent value='one'>Body one</TabsContent>
      <TabsContent value='two'>Body two</TabsContent>
    </Tabs>,
  );

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to each tab trigger <button>', () => {
    renderTabs();

    const tabOne = screen.getByRole('tab', { name: /one/i });
    const tabTwo = screen.getByRole('tab', { name: /two/i });

    expect(tabOne.tagName).toBe('BUTTON');
    expect(tabOne).toHaveAttribute('data-analytics-id', 'OPEN_TAB_ONE');
    expect(tabTwo).toHaveAttribute('data-analytics-id', 'OPEN_TAB_TWO');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'docs', tab: 'one' });

    render(
      <Tabs defaultValue='one'>
        <TabsList>
          <TabsTrigger
            value='one'
            data-analytics-id='OPEN_TAB_ONE'
            data-analytics-props={payload}
          >
            One
          </TabsTrigger>
        </TabsList>
        <TabsContent value='one'>Body one</TabsContent>
      </Tabs>,
    );

    const tab = screen.getByRole('tab', { name: /one/i });
    expect(tab).toHaveAttribute('data-analytics-id', 'OPEN_TAB_ONE');
    expect(tab).toHaveAttribute('data-analytics-props', payload);
  });

  it('preserves data-analytics-id across tab selection changes', async () => {
    renderTabs();

    const tabOne = screen.getByRole('tab', { name: /one/i });
    const tabTwo = screen.getByRole('tab', { name: /two/i });

    expect(tabOne).toHaveAttribute('data-analytics-id', 'OPEN_TAB_ONE');
    expect(tabTwo).toHaveAttribute('data-analytics-id', 'OPEN_TAB_TWO');

    await userEvent.click(tabTwo);
    expect(tabOne).toHaveAttribute('data-analytics-id', 'OPEN_TAB_ONE');
    expect(tabTwo).toHaveAttribute('data-analytics-id', 'OPEN_TAB_TWO');

    await userEvent.click(tabOne);
    expect(tabOne).toHaveAttribute('data-analytics-id', 'OPEN_TAB_ONE');
    expect(tabTwo).toHaveAttribute('data-analytics-id', 'OPEN_TAB_TWO');
  });

  it('each tab trigger captures its own data-analytics-id via closest()', async () => {
    const captured = captureAnalyticsClicks();

    renderTabs();

    await userEvent.click(screen.getByRole('tab', { name: /two/i }));
    await userEvent.click(screen.getByRole('tab', { name: /one/i }));

    expect(captured).toHaveBeenNthCalledWith(1, 'OPEN_TAB_TWO');
    expect(captured).toHaveBeenNthCalledWith(2, 'OPEN_TAB_ONE');
  });
});

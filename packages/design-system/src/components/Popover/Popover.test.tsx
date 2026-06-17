import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Button } from '../Button';
import { Popover } from './Popover';
import { PopoverContent } from './PopoverContent';
import { PopoverTrigger } from './PopoverTrigger';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the default PopoverTrigger <button>', () => {
    render(
      <Popover>
        <PopoverTrigger data-testid='trigger' data-analytics-id='OPEN_POPOVER'>
          Open
        </PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_POPOVER');
  });

  it('forwards data-analytics-props verbatim on PopoverTrigger', () => {
    const payload = JSON.stringify({ feature: 'host', action: 'open' });

    render(
      <Popover>
        <PopoverTrigger
          data-testid='trigger'
          data-analytics-id='OPEN_POPOVER'
          data-analytics-props={payload}
        >
          Open
        </PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );

    expect(screen.getByTestId('trigger')).toHaveAttribute('data-analytics-props', payload);
  });

  it('preserves analytics on a Button wrapped by PopoverTrigger asChild', () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button data-testid='trigger' data-analytics-id='OPEN_VIA_CHILD'>
            Open
          </Button>
        </PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_VIA_CHILD');
  });

  it('forwards data-analytics-id to PopoverContent', async () => {
    render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent data-testid='content' data-analytics-id='POPOVER_BODY'>
          Body
        </PopoverContent>
      </Popover>,
    );

    const content = await screen.findByTestId('content');
    expect(content).toHaveAttribute('data-analytics-id', 'POPOVER_BODY');
  });
});

describe('Handler composition', () => {
  it('consumer onClick on PopoverTrigger fires alongside Ark open behavior', async () => {
    const onClick = vi.fn();

    render(
      <Popover>
        <PopoverTrigger data-testid='trigger' onClick={onClick}>
          Open
        </PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );

    await userEvent.click(screen.getByTestId('trigger'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Body')).toBeInTheDocument();
  });

  it('clicks on a Button inside PopoverContent bubble for SDK click capture', async () => {
    const onAnalyticsClick = captureAnalyticsClicks();

    render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <Button data-testid='inner' data-analytics-id='POPOVER_ACTION'>
            Action
          </Button>
        </PopoverContent>
      </Popover>,
    );

    const inner = await screen.findByTestId('inner');
    await userEvent.click(inner);

    expect(onAnalyticsClick).toHaveBeenCalledWith('POPOVER_ACTION');
  });
});

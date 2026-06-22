import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Button } from '../Button';
import { Card } from '../Card';
import { Popover } from './Popover';
import { PopoverContent } from './PopoverContent';
import { PopoverTrigger } from './PopoverTrigger';

/**
 * M50 regression suite: the `event.stopPropagation()` calls removed from
 * `PopoverTrigger.handleClick` and `PopoverContent.handleClick` (M33) let
 * trigger/content clicks bubble to document-level analytics SDKs. These tests
 * prove the removal did not regress the surrounding parent / overlay behavior:
 *  (a) the analytics path still resolves via `closest('[data-analytics-id]')`, and
 *  (b) the enclosing clickable Card / outer Popover behaves correctly.
 */
describe('PopoverTrigger inside a clickable Card', () => {
  it('trigger click resolves analytics and opens the popover without firing the Card onClick', async () => {
    const cardClick = vi.fn();
    const onOpenChange = vi.fn();
    const captured = captureAnalyticsClicks();

    render(
      <Card onClick={cardClick}>
        <Popover onOpenChange={onOpenChange}>
          <PopoverTrigger data-testid='trigger' data-analytics-id='OPEN_POPOVER'>
            Open
          </PopoverTrigger>
          <PopoverContent>Body</PopoverContent>
        </Popover>
      </Card>,
    );

    await userEvent.click(screen.getByTestId('trigger'));

    // (a) the trigger resolves its analytics id
    expect(captured).toHaveBeenCalledWith('OPEN_POPOVER');
    // (b) the popover opened, and the native <button> trigger is shielded by
    // Card's INTERACTIVE_SELECTORS gate so the Card onClick does not also fire
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(cardClick).not.toHaveBeenCalled();
  });
});

describe('Button inside PopoverContent', () => {
  it('inner button click resolves analytics and does not dismiss the Popover', async () => {
    const onOpenChange = vi.fn();
    const onClick = vi.fn();

    render(
      <Popover open onOpenChange={onOpenChange}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <Button data-testid='inner' data-analytics-id='POPOVER_ACTION' onClick={onClick}>
            Action
          </Button>
        </PopoverContent>
      </Popover>,
    );

    const inner = await screen.findByTestId('inner');
    const captured = captureAnalyticsClicks();

    await userEvent.click(inner);

    // (a) analytics resolves and the consumer handler still runs
    expect(captured).toHaveBeenCalledWith('POPOVER_ACTION');
    expect(onClick).toHaveBeenCalledTimes(1);
    // (b) a click inside the content is not an outside-click, so no dismissal
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});

describe('Nested Popovers', () => {
  it('clicking the inner trigger does not dismiss the outer Popover', async () => {
    const outerOpenChange = vi.fn();
    const innerOpenChange = vi.fn();
    const captured = captureAnalyticsClicks();

    render(
      <Popover open onOpenChange={outerOpenChange}>
        <PopoverTrigger>Open outer</PopoverTrigger>
        <PopoverContent>
          <Popover onOpenChange={innerOpenChange}>
            <PopoverTrigger data-testid='inner-trigger' data-analytics-id='OPEN_INNER'>
              Open inner
            </PopoverTrigger>
            <PopoverContent>Inner body</PopoverContent>
          </Popover>
        </PopoverContent>
      </Popover>,
    );

    const innerTrigger = await screen.findByTestId('inner-trigger');
    await userEvent.click(innerTrigger);

    // (a) the inner trigger resolves its analytics id
    expect(captured).toHaveBeenCalledWith('OPEN_INNER');
    // (b) the inner trigger lives inside the outer content, so clicking it
    // opens the inner popover without requesting the outer to close
    expect(innerOpenChange).toHaveBeenCalledWith(true);
    expect(outerOpenChange).not.toHaveBeenCalledWith(false);
  });
});

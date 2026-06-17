import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ChevronDown } from '../../icons';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Button } from '../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { SplitButton } from './SplitButton';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to each consumer-rendered child <button>', () => {
    render(
      <SplitButton>
        <Button data-testid='primary' data-analytics-id='SAVE_PRIMARY'>
          Save
        </Button>
        <Button data-testid='menu' data-analytics-id='SAVE_MENU'>
          <ChevronDown />
        </Button>
      </SplitButton>,
    );

    const primary = screen.getByTestId('primary');
    const menu = screen.getByTestId('menu');

    expect(primary.tagName).toBe('BUTTON');
    expect(menu.tagName).toBe('BUTTON');
    expect(primary).toHaveAttribute('data-analytics-id', 'SAVE_PRIMARY');
    expect(menu).toHaveAttribute('data-analytics-id', 'SAVE_MENU');
  });

  it('forwards data-analytics-props JSON payload verbatim on each child', () => {
    const primaryPayload = JSON.stringify({ feature: 'host', action: 'save' });
    const menuPayload = JSON.stringify({ feature: 'host', action: 'save', menu: true });

    render(
      <SplitButton>
        <Button
          data-testid='primary'
          data-analytics-id='SAVE_PRIMARY'
          data-analytics-props={primaryPayload}
        >
          Save
        </Button>
        <Button data-testid='menu' data-analytics-id='SAVE_MENU' data-analytics-props={menuPayload}>
          <ChevronDown />
        </Button>
      </SplitButton>,
    );

    expect(screen.getByTestId('primary')).toHaveAttribute('data-analytics-props', primaryPayload);
    expect(screen.getByTestId('menu')).toHaveAttribute('data-analytics-props', menuPayload);
  });

  it('does not strand child analytics on the role="group" wrapper', () => {
    render(
      <SplitButton data-testid='group'>
        <Button data-testid='primary' data-analytics-id='SAVE_PRIMARY'>
          Save
        </Button>
        <Button data-testid='menu' data-analytics-id='SAVE_MENU'>
          <ChevronDown />
        </Button>
      </SplitButton>,
    );

    const group = screen.getByTestId('group');
    expect(group.tagName).toBe('DIV');
    expect(group).toHaveAttribute('role', 'group');
    expect(group).not.toHaveAttribute('data-analytics-id');
  });

  it('each child button captures its own data-analytics-id via closest()', async () => {
    const captured = captureAnalyticsClicks();

    render(
      <SplitButton>
        <Button data-testid='primary' data-analytics-id='SAVE_PRIMARY'>
          Save
        </Button>
        <Button data-testid='menu' data-analytics-id='SAVE_MENU'>
          <ChevronDown />
        </Button>
      </SplitButton>,
    );

    await userEvent.click(screen.getByTestId('primary'));
    await userEvent.click(screen.getByTestId('menu'));

    expect(captured).toHaveBeenNthCalledWith(1, 'SAVE_PRIMARY');
    expect(captured).toHaveBeenNthCalledWith(2, 'SAVE_MENU');
  });

  it('preserves analytics on a Button wrapped by DropdownMenuTrigger asChild', () => {
    render(
      <DropdownMenu>
        <SplitButton>
          <Button data-testid='primary' data-analytics-id='SAVE_PRIMARY'>
            Save
          </Button>
          <DropdownMenuTrigger asChild>
            <Button data-testid='menu' data-analytics-id='SAVE_MENU'>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
        </SplitButton>
        <DropdownMenuContent>
          <DropdownMenuItem value='draft'>Save as draft</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const menu = screen.getByTestId('menu');
    expect(menu.tagName).toBe('BUTTON');
    expect(menu).toHaveAttribute('data-analytics-id', 'SAVE_MENU');
  });
});

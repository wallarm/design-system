import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import { DropdownMenu } from './DropdownMenu';
import { DropdownMenuCheckboxItem } from './DropdownMenuCheckboxItem';
import { DropdownMenuContent } from './DropdownMenuContent';
import { DropdownMenuItem } from './DropdownMenuItem';
import { DropdownMenuRadioGroup } from './DropdownMenuRadioGroup';
import { DropdownMenuRadioItem } from './DropdownMenuRadioItem';
import { DropdownMenuTrigger } from './DropdownMenuTrigger';
import { DropdownMenuTriggerItem } from './DropdownMenuTriggerItem';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to DropdownMenuTrigger via asChild', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button data-testid='trigger' data-analytics-id='OPEN_MENU'>
            Open
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_MENU');
  });

  it('forwards data-analytics-id and verbatim payload to DropdownMenuItem', async () => {
    const payload = JSON.stringify({ feature: 'host', action: 'edit' });

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            data-testid='item'
            data-analytics-id='MENU_ITEM_EDIT'
            data-analytics-props={payload}
          >
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const item = await screen.findByTestId('item');
    expect(item).toHaveAttribute('data-analytics-id', 'MENU_ITEM_EDIT');
    expect(item).toHaveAttribute('data-analytics-props', payload);
  });

  it('forwards data-analytics-id to DropdownMenuCheckboxItem', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            data-testid='checkbox-item'
            data-analytics-id='MENU_TOGGLE_HOSTS'
            checked
          >
            Show hosts
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const item = await screen.findByTestId('checkbox-item');
    expect(item).toHaveAttribute('data-analytics-id', 'MENU_TOGGLE_HOSTS');
  });

  it('forwards data-analytics-id to DropdownMenuRadioItem and group', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            value='asc'
            data-testid='group'
            data-analytics-id='MENU_SORT_GROUP'
          >
            <DropdownMenuRadioItem
              value='asc'
              data-testid='radio-asc'
              data-analytics-id='MENU_SORT_ASC'
            >
              Ascending
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value='desc'
              data-testid='radio-desc'
              data-analytics-id='MENU_SORT_DESC'
            >
              Descending
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const group = await screen.findByTestId('group');
    expect(group).toHaveAttribute('data-analytics-id', 'MENU_SORT_GROUP');

    const asc = screen.getByTestId('radio-asc');
    const desc = screen.getByTestId('radio-desc');
    expect(asc).toHaveAttribute('data-analytics-id', 'MENU_SORT_ASC');
    expect(desc).toHaveAttribute('data-analytics-id', 'MENU_SORT_DESC');
  });

  it('forwards data-analytics-id to a nested DropdownMenuTriggerItem', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenu>
            <DropdownMenuTriggerItem
              data-testid='sub-trigger'
              data-analytics-id='MENU_OPEN_SUBMENU'
            >
              More
            </DropdownMenuTriggerItem>
            <DropdownMenuContent>
              <DropdownMenuItem>Sub item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const subTrigger = await screen.findByTestId('sub-trigger');
    expect(subTrigger).toHaveAttribute('data-analytics-id', 'MENU_OPEN_SUBMENU');
  });
});

describe('Handler composition', () => {
  it('consumer onSelect on DropdownMenuItem fires when item is selected', async () => {
    const onSelect = vi.fn();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid='item' onSelect={onSelect}>
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const item = await screen.findByTestId('item');
    await userEvent.click(item);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

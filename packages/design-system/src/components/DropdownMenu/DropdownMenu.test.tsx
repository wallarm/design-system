import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '../Button';
import { DropdownMenu } from './DropdownMenu';
import { DropdownMenuCheckboxItem } from './DropdownMenuCheckboxItem';
import { DropdownMenuContent } from './DropdownMenuContent';
import { DropdownMenuInput } from './DropdownMenuInput';
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
    const onSelect = rs.fn();

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

describe('Interact outside', () => {
  it('keeps the menu open on outside interaction when closeOnInteractOutside is false', async () => {
    render(
      <DropdownMenu defaultOpen closeOnInteractOutside={false}>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid='item'>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(await screen.findByTestId('item')).toBeVisible();

    await userEvent.click(document.body);

    expect(screen.getByTestId('item')).toBeVisible();
  });

  it('closes the menu on outside interaction by default', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid='item'>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(await screen.findByTestId('item')).toBeVisible();

    await userEvent.click(document.body);

    await waitFor(() => expect(screen.queryByTestId('item')).not.toBeInTheDocument());
  });
});

describe('Keyboard focus', () => {
  // jsdom has no layout, so zag's tabbable check (offsetWidth/getClientRects) sees every
  // element as hidden and never picks the ScrollArea viewport for initial focus. Report a
  // width like a real browser does, so the menu's initial-focus logic runs as in production.
  beforeEach(() => {
    rs.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100);
  });
  afterEach(() => {
    rs.restoreAllMocks();
  });

  const renderMenu = (onSelectB = rs.fn()) =>
    render(
      <DropdownMenu data-testid='menu'>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem value='a'>A</DropdownMenuItem>
          <DropdownMenuItem value='b' data-testid='item-b' onSelect={onSelectB}>
            B
          </DropdownMenuItem>
          <DropdownMenu>
            <DropdownMenuTriggerItem value='more' data-testid='sub-trigger'>
              More
            </DropdownMenuTriggerItem>
            <DropdownMenuContent data-testid='sub-content'>
              <DropdownMenuItem value='sub'>Sub item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

  it('focuses the menu content when opened with Enter, then ArrowDown + Enter selects', async () => {
    const user = userEvent.setup();
    const onSelectB = rs.fn();
    renderMenu(onSelectB);

    screen.getByTestId('menu--trigger').focus();
    await user.keyboard('{Enter}');

    const content = await screen.findByTestId('menu--content');
    await waitFor(() => expect(document.activeElement).toBe(content));

    await user.keyboard('{ArrowDown}');
    expect(screen.getByTestId('item-b')).toHaveAttribute('data-highlighted');

    await user.keyboard('{Enter}');
    expect(onSelectB).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByTestId('menu--content')).not.toBeInTheDocument());
  });

  it('focuses the menu content when opened with ArrowDown', async () => {
    const user = userEvent.setup();
    renderMenu();

    screen.getByTestId('menu--trigger').focus();
    await user.keyboard('{ArrowDown}');

    const content = await screen.findByTestId('menu--content');
    await waitFor(() => expect(document.activeElement).toBe(content));
  });

  it('returns focus to the trigger on Escape', async () => {
    const user = userEvent.setup();
    renderMenu();

    const trigger = screen.getByTestId('menu--trigger');
    trigger.focus();
    await user.keyboard('{Enter}');
    const content = await screen.findByTestId('menu--content');
    await waitFor(() => expect(document.activeElement).toBe(content));

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByTestId('menu--content')).not.toBeInTheDocument());
    expect(document.activeElement).toBe(trigger);
  });

  it('opens on mouse click', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByTestId('menu--trigger'));

    expect(await screen.findByTestId('menu--content')).toBeVisible();
  });

  it('still focuses a DropdownMenuInput when the menu opens', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu data-testid='menu'>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuInput data-testid='search' />
          <DropdownMenuItem value='a'>A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    screen.getByTestId('menu--trigger').focus();
    await user.keyboard('{Enter}');

    const search = await screen.findByTestId('search');
    await waitFor(() => expect(document.activeElement).toBe(search));
  });

  it('moves focus into a nested submenu opened with ArrowRight', async () => {
    const user = userEvent.setup();
    renderMenu();

    screen.getByTestId('menu--trigger').focus();
    await user.keyboard('{Enter}');
    const content = await screen.findByTestId('menu--content');
    await waitFor(() => expect(document.activeElement).toBe(content));

    await user.keyboard('{End}');
    expect(screen.getByTestId('sub-trigger')).toHaveAttribute('data-highlighted');
    await user.keyboard('{ArrowRight}');

    const subContent = await screen.findByTestId('sub-content');
    await waitFor(() => expect(document.activeElement).toBe(subContent));
  });
});

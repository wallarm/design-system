import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { TestIdProvider } from '../../utils/testId';
import { ChatPermissions } from './ChatPermissions';
import { ChatPermissionsContent } from './ChatPermissionsContent';
import { ChatPermissionsItem } from './ChatPermissionsItem';
import { ChatPermissionsTrigger } from './ChatPermissionsTrigger';

const renderPermissions = (onCheckedChange = rs.fn()) =>
  render(
    <ChatPermissions data-testid='permissions'>
      <ChatPermissionsTrigger />
      <ChatPermissionsContent>
        <ChatPermissionsItem
          name='search_attacks'
          title='search_attacks'
          description='Search detected attacks'
          defaultChecked
          onCheckedChange={onCheckedChange}
        />
      </ChatPermissionsContent>
    </ChatPermissions>,
  );

describe('ChatPermissions', () => {
  it('renders an icon-only trigger labelled "Permission settings"', () => {
    renderPermissions();
    const trigger = screen.getByTestId('permissions--trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('data-slot', 'chat-permissions-trigger');
    expect(screen.getByRole('button', { name: 'Permission settings' })).toBe(trigger);
  });

  it('opens the popover as a dialog named by the label when the trigger is clicked', async () => {
    renderPermissions();
    expect(screen.queryByTestId('permissions--content')).toBeNull();

    await userEvent.click(screen.getByTestId('permissions--trigger'));

    const content = await screen.findByTestId('permissions--content');
    expect(content).toHaveAttribute('role', 'dialog');
    expect(screen.getByRole('dialog', { name: 'Always allowed in this conversation' })).toBe(
      content,
    );
  });

  it('shares one id between the popover and tooltip triggers', async () => {
    renderPermissions();
    const trigger = screen.getByTestId('permissions--trigger');
    await userEvent.click(trigger);
    await screen.findByTestId('permissions--content');
    // Neither Ark default (`popover:…:trigger` / `tooltip:…:trigger`) wins: both roots use the shared id.
    expect(trigger.id).not.toBe('');
    expect(trigger.id).not.toMatch(/^(popover|tooltip):/);
  });

  it('shows the tooltip on hover while closed and disables it while open', async () => {
    renderPermissions();
    const trigger = screen.getByTestId('permissions--trigger');

    await userEvent.hover(trigger);
    expect(await screen.findByTestId('permissions--tooltip')).toHaveTextContent(
      'Permission settings',
    );
    await userEvent.unhover(trigger);
    await waitFor(() => expect(screen.queryByTestId('permissions--tooltip')).toBeNull());

    await userEvent.click(trigger);
    await screen.findByTestId('permissions--content');
    await userEvent.hover(trigger);
    // Stays absent past the tooltip's openDelay; waitFor fails fast if it ever shows up.
    await expect(
      waitFor(() => expect(screen.getByTestId('permissions--tooltip')).toBeInTheDocument(), {
        timeout: 600,
      }),
    ).rejects.toThrow();
  });

  it('flips aria-expanded on the trigger when the popover opens', async () => {
    renderPermissions();
    const trigger = screen.getByTestId('permissions--trigger');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await screen.findByTestId('permissions--content');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps the shared trigger id when the consumer passes its own id', async () => {
    render(
      <ChatPermissions data-testid='permissions'>
        <ChatPermissionsTrigger id='custom-id' />
        <ChatPermissionsContent>body</ChatPermissionsContent>
      </ChatPermissions>,
    );
    const trigger = screen.getByTestId('permissions--trigger');
    expect(trigger.id).not.toBe('custom-id');
    await userEvent.click(trigger);
    expect(await screen.findByTestId('permissions--content')).toBeInTheDocument();
  });

  it('calls onCheckedChange when a row is clicked and keeps the popover open', async () => {
    const onCheckedChange = rs.fn();
    renderPermissions(onCheckedChange);
    await userEvent.click(screen.getByTestId('permissions--trigger'));
    await screen.findByTestId('permissions--content');

    await userEvent.click(screen.getByTestId('permissions--item'));

    expect(onCheckedChange).toHaveBeenCalledWith(expect.objectContaining({ checked: false }));
    expect(screen.getByTestId('permissions--content')).toBeInTheDocument();
  });

  it('passes the row name to onCheckedChange with the new checked state', async () => {
    const onCheckedChange = rs.fn();
    renderPermissions(onCheckedChange);
    await userEvent.click(screen.getByTestId('permissions--trigger'));
    const item = await screen.findByTestId('permissions--item');

    await userEvent.click(item);
    expect(onCheckedChange).toHaveBeenLastCalledWith({ checked: false, name: 'search_attacks' });

    await userEvent.click(item);
    expect(onCheckedChange).toHaveBeenLastCalledWith({ checked: true, name: 'search_attacks' });
  });

  it('renders the row title, truncating description and data-slot', async () => {
    renderPermissions();
    await userEvent.click(screen.getByTestId('permissions--trigger'));
    const item = await screen.findByTestId('permissions--item');
    expect(item.tagName).toBe('LABEL');
    expect(item).toHaveAttribute('data-slot', 'chat-permissions-item');
    expect(screen.getByTestId('permissions--item--label')).toHaveTextContent('search_attacks');
    expect(item).toHaveTextContent('Search detected attacks');
    expect(item.querySelector('input')).toBeChecked();
  });

  it('honours a custom label and hides it with null', async () => {
    const { unmount } = render(
      <ChatPermissions data-testid='permissions' open>
        <ChatPermissionsTrigger />
        <ChatPermissionsContent label='Allowed tools'>body</ChatPermissionsContent>
      </ChatPermissions>,
    );
    expect(await screen.findByRole('dialog', { name: 'Allowed tools' })).toBeInTheDocument();
    unmount();

    render(
      <ChatPermissions data-testid='permissions' open>
        <ChatPermissionsTrigger />
        <ChatPermissionsContent label={null}>body</ChatPermissionsContent>
      </ChatPermissions>,
    );
    const content = await screen.findByTestId('permissions--content');
    expect(content.querySelector('p')).toBeNull();
  });

  it('hides the label with false instead of rendering an empty name node', async () => {
    render(
      <ChatPermissions data-testid='permissions' open>
        <ChatPermissionsTrigger />
        <ChatPermissionsContent label={false}>body</ChatPermissionsContent>
      </ChatPermissions>,
    );
    const content = await screen.findByTestId('permissions--content');
    expect(content.querySelector('p')).toBeNull();
  });

  it('supports controlled open with onOpenChange', async () => {
    const onOpenChange = rs.fn();
    render(
      <ChatPermissions open={false} onOpenChange={onOpenChange} data-testid='permissions'>
        <ChatPermissionsTrigger />
        <ChatPermissionsContent>body</ChatPermissionsContent>
      </ChatPermissions>,
    );
    await userEvent.click(screen.getByTestId('permissions--trigger'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByTestId('permissions--content')).toBeNull();
  });

  it('accepts a custom aria-label and icon', () => {
    render(
      <ChatPermissions>
        <ChatPermissionsTrigger aria-label='Tools' data-testid='custom'>
          <span>T</span>
        </ChatPermissionsTrigger>
        <ChatPermissionsContent>body</ChatPermissionsContent>
      </ChatPermissions>,
    );
    expect(screen.getByTestId('custom')).toHaveAccessibleName('Tools');
    expect(screen.getByTestId('custom')).toHaveTextContent('T');
  });

  it('throws when a part is rendered outside ChatPermissions', () => {
    const spy = rs.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<ChatPermissionsTrigger />)).toThrow(/inside <ChatPermissions>/);
    spy.mockRestore();
  });
});

describe('ChatPermissions — test ids', () => {
  it('derives permissions--trigger / --content / --item', async () => {
    renderPermissions();
    await userEvent.click(screen.getByTestId('permissions--trigger'));
    expect(await screen.findByTestId('permissions--content')).toBeInTheDocument();
    expect(screen.getByTestId('permissions--item')).toBeInTheDocument();
  });

  it('adds the permissions slot under an inherited cascade', () => {
    render(
      <TestIdProvider value='chat'>
        <ChatPermissions>
          <ChatPermissionsTrigger />
          <ChatPermissionsContent>body</ChatPermissionsContent>
        </ChatPermissions>
      </TestIdProvider>,
    );
    expect(screen.getByTestId('chat--permissions--trigger')).toBeInTheDocument();
  });

  it('lets a per-instance data-testid win on items', async () => {
    render(
      <ChatPermissions data-testid='permissions' open>
        <ChatPermissionsTrigger />
        <ChatPermissionsContent>
          <ChatPermissionsItem name='a' data-testid='tool-a' title='a' />
          <ChatPermissionsItem name='b' data-testid='tool-b' title='b' />
        </ChatPermissionsContent>
      </ChatPermissions>,
    );
    expect(await screen.findByTestId('tool-a')).toBeInTheDocument();
    expect(screen.getByTestId('tool-b--label')).toHaveTextContent('b');
  });

  it('leaves the DOM clean without a data-testid', () => {
    render(
      <ChatPermissions>
        <ChatPermissionsTrigger />
        <ChatPermissionsContent>body</ChatPermissionsContent>
      </ChatPermissions>,
    );
    expect(screen.getByRole('button')).not.toHaveAttribute('data-testid');
  });
});

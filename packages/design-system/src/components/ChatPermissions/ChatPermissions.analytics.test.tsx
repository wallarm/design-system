import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { ChatPermissions } from './ChatPermissions';
import { ChatPermissionsContent } from './ChatPermissionsContent';
import { ChatPermissionsItem } from './ChatPermissionsItem';
import { ChatPermissionsTrigger } from './ChatPermissionsTrigger';

const PAYLOAD = '{"tool":"search_attacks","source":"chat"}';

describe('ChatPermissionsTrigger — analytics pass-through', () => {
  it('forwards data-analytics-id and props verbatim to the real <button> through the asChild chain', () => {
    render(
      <ChatPermissions>
        <ChatPermissionsTrigger
          data-testid='trigger'
          data-analytics-id='CHAT_PERMISSIONS_OPEN'
          data-analytics-props={PAYLOAD}
        />
        <ChatPermissionsContent>body</ChatPermissionsContent>
      </ChatPermissions>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'CHAT_PERMISSIONS_OPEN');
    expect(trigger).toHaveAttribute('data-analytics-props', PAYLOAD);
  });

  it('keeps the id across open/close and still fires the consumer onClick', async () => {
    const onClick = rs.fn();
    render(
      <ChatPermissions>
        <ChatPermissionsTrigger
          data-testid='trigger'
          data-analytics-id='CHAT_PERMISSIONS_OPEN'
          onClick={onClick}
        />
        <ChatPermissionsContent data-testid='content'>body</ChatPermissionsContent>
      </ChatPermissions>,
    );

    const trigger = screen.getByTestId('trigger');
    await userEvent.click(trigger);
    expect(await screen.findByTestId('content')).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(trigger).toHaveAttribute('data-analytics-id', 'CHAT_PERMISSIONS_OPEN');
  });

  it('forwards a ref to the real <button>', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <ChatPermissions>
        <ChatPermissionsTrigger ref={ref} data-testid='trigger' />
        <ChatPermissionsContent>body</ChatPermissionsContent>
      </ChatPermissions>,
    );
    expect(ref.current).toBe(screen.getByTestId('trigger'));
  });
});

describe('ChatPermissionsContent — analytics (dialog panel)', () => {
  it('forwards a ref and analytics attributes to the dialog and sets its own data-slot', async () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <ChatPermissions open>
        <ChatPermissionsTrigger />
        <ChatPermissionsContent
          ref={ref}
          data-testid='content'
          data-analytics-id='CHAT_PERMISSIONS_PANEL'
          data-analytics-props={PAYLOAD}
        >
          body
        </ChatPermissionsContent>
      </ChatPermissions>,
    );

    const content = await screen.findByTestId('content');
    expect(ref.current).toBe(content);
    expect(content).toHaveAttribute('role', 'dialog');
    expect(content).toHaveAttribute('data-slot', 'chat-permissions-content');
    expect(content).toHaveAttribute('data-analytics-id', 'CHAT_PERMISSIONS_PANEL');
    expect(content).toHaveAttribute('data-analytics-props', PAYLOAD);
  });
});

describe('ChatPermissionsItem — analytics (label root)', () => {
  const renderItem = () =>
    render(
      <ChatPermissions open>
        <ChatPermissionsTrigger />
        <ChatPermissionsContent>
          <ChatPermissionsItem
            name='search_attacks'
            data-testid='item'
            data-analytics-id='CHAT_PERMISSION_TOGGLE'
            data-analytics-props={PAYLOAD}
            title='search_attacks'
          />
        </ChatPermissionsContent>
      </ChatPermissions>,
    );

  it('resolves clicks to the analytics-id via closest()', async () => {
    const captured = captureAnalyticsClicks();
    renderItem();

    await userEvent.click(await screen.findByTestId('item'));
    expect(captured).toHaveBeenCalledWith('CHAT_PERMISSION_TOGGLE');
  });

  it('forwards data-analytics-props byte-for-byte to the <label>', async () => {
    renderItem();
    const item = await screen.findByTestId('item');
    expect(item.tagName).toBe('LABEL');
    expect(item).toHaveAttribute('data-analytics-props', PAYLOAD);
  });

  it('forwards a ref to the item <label>', async () => {
    const ref = { current: null as HTMLLabelElement | null };
    render(
      <ChatPermissions open>
        <ChatPermissionsTrigger />
        <ChatPermissionsContent>
          <ChatPermissionsItem
            ref={ref}
            name='search_attacks'
            data-testid='item'
            title='search_attacks'
          />
        </ChatPermissionsContent>
      </ChatPermissions>,
    );
    expect(ref.current).toBe(await screen.findByTestId('item'));
  });

  it('does not strand the id on the hidden input (negative)', async () => {
    renderItem();
    const hiddenInput = (await screen.findByTestId('item')).querySelector('input');
    expect(hiddenInput).not.toBeNull();
    expect(hiddenInput).not.toHaveAttribute('data-analytics-id');
  });
});

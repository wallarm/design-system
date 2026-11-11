import { createRef } from 'react';

import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Button } from '../Button';
import { APPROVAL_PENDING, CONVERSATION, EMPTY } from './mocks';
import { WallyAssistant, type WallyAssistantProps } from './WallyAssistant';

rs.mock('../../utils/copyText', () => ({ copyText: rs.fn(() => Promise.resolve()) }));

const PROPS = '{"panel":"wally","surface":"drawer"}';
const noop = () => undefined;

const panel = (props: Partial<WallyAssistantProps> = {}) =>
  render(<WallyAssistant data-testid='wally' {...EMPTY} onSubmit={noop} {...props} />);

describe('WallyAssistant — analytics (docs/metrics/contract.md)', () => {
  it('root forwards data-*, aria-*, id and ref to the <section>', () => {
    const ref = createRef<HTMLElement>();
    render(
      <WallyAssistant
        {...EMPTY}
        onSubmit={noop}
        ref={ref}
        id='wally-panel'
        aria-describedby='hint'
        data-testid='wally'
        data-analytics-id='wally.panel'
        data-analytics-props={PROPS}
      />,
    );
    const root = screen.getByTestId('wally');
    expect(root.tagName).toBe('SECTION');
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute('id', 'wally-panel');
    expect(root).toHaveAttribute('aria-describedby', 'hint');
    expect(root).toHaveAttribute('data-analytics-id', 'wally.panel');
    expect(root.getAttribute('data-analytics-props')).toBe(PROPS);
  });

  it('a headerActions slot instance keeps its attributes and owns the click', async () => {
    const spy = captureAnalyticsClicks();
    panel({
      ...CONVERSATION,
      headerActions: (
        <Button aria-label='New chat' data-testid='new' data-analytics-id='wally.new'>
          New
        </Button>
      ),
    });
    await userEvent.click(screen.getByTestId('new'));
    expect(spy).toHaveBeenCalledWith('wally.new');
  });

  it('closed target → callback: a pill calls onSuggestionSelect(item)', async () => {
    const onSuggestionSelect = rs.fn();
    panel({ onSuggestionSelect });
    await userEvent.click(screen.getByTestId('wally--suggestion-0'));
    expect(onSuggestionSelect).toHaveBeenCalledWith(EMPTY.suggestions?.[0]);
  });

  it('closed target → callback: Send calls onSubmit(text), Stop calls onStop()', async () => {
    const onSubmit = rs.fn();
    const onStop = rs.fn();
    const { rerender } = panel({ onSubmit });
    await userEvent.type(screen.getByTestId('wally--input--textarea'), 'hi');
    await userEvent.click(screen.getByTestId('wally--input--submit'));
    expect(onSubmit).toHaveBeenCalledWith('hi');
    rerender(
      <WallyAssistant
        data-testid='wally'
        {...CONVERSATION}
        status='streaming'
        onSubmit={noop}
        onStop={onStop}
      />,
    );
    await userEvent.click(screen.getByTestId('wally--input--submit'));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('closed target → callback: a permission row calls onPermissionChange(permission, allowed)', async () => {
    const onPermissionChange = rs.fn();
    panel({ ...CONVERSATION, onPermissionChange });
    await userEvent.click(screen.getByTestId('wally--input--permissions--trigger'));
    await userEvent.click(screen.getByTestId('wally--input--permissions--item-0'));
    expect(onPermissionChange).toHaveBeenCalledWith(CONVERSATION.permissions?.[0], false);
  });

  it('closed target → callback: a context chip close calls onContextRemove(item)', async () => {
    const onContextRemove = rs.fn();
    const item = { id: 'c', label: 'Attacks' };
    panel({ context: [item], onContextRemove });
    await userEvent.click(screen.getByTestId('wally--input--context-0--close'));
    expect(onContextRemove).toHaveBeenCalledWith(item);
  });

  it('closed target → callback: a docked approval option calls onApprovalRespond(response, approval)', async () => {
    const onApprovalRespond = rs.fn();
    panel({ ...APPROVAL_PENDING, onApprovalRespond });
    await userEvent.click(screen.getByTestId('wally--approval-card--option-reject'));
    expect(onApprovalRespond).toHaveBeenCalledWith(
      expect.objectContaining({ approvalId: 'u1:reply:approval', kind: 'reject', approved: false }),
      expect.objectContaining({ id: 'u1:reply:approval' }),
    );
  });
});

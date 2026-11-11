import { describe, expect, it } from '@rstest/core';

import { copyTextOf, deriveChatState, isLiveStep } from './deriveChatState';
import type { ChatApprovalPart, ChatAssistantMessage, ChatMessage, ChatStatus } from './model';

const user = (id: string): ChatMessage => ({
  role: 'user',
  id,
  parts: [{ type: 'text', id: `${id}:text`, text: id }],
});
const approval = (id: string, status: ChatApprovalPart['status']): ChatApprovalPart => ({
  type: 'approval',
  id,
  status,
  content: 'Run `x`',
});
const reply = (id: string, ...parts: ChatAssistantMessage['parts']): ChatAssistantMessage => ({
  role: 'assistant',
  id,
  parts,
});

describe('deriveChatState', () => {
  it('handles an empty list with defaults', () => {
    const s = deriveChatState([]);
    expect(s).toMatchObject({ empty: true, running: false, awaitingApproval: false, busy: false });
    expect(s.rows).toEqual([]);
    expect(s.lastUserMessageId).toBeUndefined();
    expect(s.dockedApprovals).toEqual([]);
  });

  it('adds the synthetic :reply row only while running with the user message last', () => {
    const messages = [user('u1')];
    for (const status of ['submitted', 'streaming'] as const) {
      const { rows } = deriveChatState(messages, status);
      expect(rows).toHaveLength(2);
      expect(rows[1]).toEqual({ role: 'assistant', id: 'u1:reply', parts: [] });
    }
    for (const status of ['ready', 'error', 'unknown' as ChatStatus] as const) {
      expect(deriveChatState(messages, status).rows).toBe(messages);
    }
    const answered = [user('u1'), reply('u1:reply')];
    expect(deriveChatState(answered, 'streaming').rows).toBe(answered);
  });

  it('derives running, busy and awaitingApproval', () => {
    const pending = [user('u1'), reply('u1:reply', approval('a1', 'pending'))];
    expect(deriveChatState(pending, 'streaming')).toMatchObject({
      running: true,
      awaitingApproval: true,
      busy: false,
    });
    expect(deriveChatState(pending, 'ready')).toMatchObject({
      running: false,
      awaitingApproval: true,
      busy: false,
    });
    expect(deriveChatState([user('u1')], 'submitted')).toMatchObject({
      busy: true,
      awaitingApproval: false,
    });
    const older = [...pending, user('u2'), reply('u2:reply')];
    expect(deriveChatState(older, 'ready').awaitingApproval).toBe(false);
  });

  it('docks the pending approvals of the last row', () => {
    const a1 = approval('a1', 'approved');
    const a2 = approval('a2', 'pending');
    const a3 = approval('a3', 'pending');
    const messages = [user('u1'), reply('u1:reply', a1, a2, a3)];
    expect(deriveChatState(messages, 'ready', 'docked').dockedApprovals).toEqual([a2, a3]);
  });

  it('docks only the last resolved approval when none is pending', () => {
    const a1 = approval('a1', 'approved');
    const a2 = approval('a2', 'rejected');
    const messages = [user('u1'), reply('u1:reply', a1, a2)];
    expect(deriveChatState(messages, 'ready', 'docked').dockedApprovals).toEqual([a2]);
  });

  it('docks nothing once a newer user message exists, or with inline placement', () => {
    const resolved = [user('u1'), reply('u1:reply', approval('a1', 'approved'))];
    expect(deriveChatState([...resolved, user('u2')], 'ready', 'docked').dockedApprovals).toEqual(
      [],
    );
    expect(
      deriveChatState([...resolved, user('u2')], 'submitted', 'docked').dockedApprovals,
    ).toEqual([]);
    expect(deriveChatState(resolved, 'ready').dockedApprovals).toEqual([]);
    expect(deriveChatState(resolved, 'ready', 'inline').dockedApprovals).toEqual([]);
  });

  it('reports the last user message id', () => {
    expect(
      deriveChatState([user('u1'), reply('u1:reply'), user('u2'), reply('u2:reply')])
        .lastUserMessageId,
    ).toBe('u2');
  });
});

describe('helpers', () => {
  it('isLiveStep looks at nested steps', () => {
    expect(isLiveStep({ id: 's', status: 'done', label: 'Done' })).toBe(false);
    expect(isLiveStep({ id: 's', status: 'awaiting-approval', label: 'Wait' })).toBe(true);
    expect(
      isLiveStep({
        id: 's',
        status: 'done',
        label: 'Agent',
        steps: [{ id: 'c', status: 'pending', label: 'Child' }],
      }),
    ).toBe(true);
  });

  it('copyTextOf prefers copyText, else joins non-empty text parts', () => {
    const m = reply(
      'r',
      { type: 'text', id: 't1', text: 'One' },
      approval('a', 'pending'),
      { type: 'text', id: 't2', text: '' },
      { type: 'text', id: 't3', text: 'Two' },
    );
    expect(copyTextOf(m)).toBe('One\n\nTwo');
    expect(copyTextOf({ ...m, copyText: 'Custom' })).toBe('Custom');
    expect(copyTextOf({ ...m, copyText: '' })).toBe('One\n\nTwo');
    expect(copyTextOf(user('u1'))).toBe('u1');
  });
});

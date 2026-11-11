import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { act, renderHook } from '@testing-library/react';

import type {
  ChatApprovalPart,
  ChatAssistantMessage,
  ChatChainOfThoughtPart,
  ChatSnapshot,
  ChatStep,
} from '../model/model';
import {
  APPROVAL_PENDING,
  CONVERSATION,
  EMPTY,
  ERROR_TURN,
  longThread,
  reduceWally,
  useMockWally,
  WALLY_SCRIPT,
  type WallyEvent,
} from './index';

const run = (s: ChatSnapshot, events: WallyEvent[]) => events.reduce(reduceWally, s);
const step = (id: string, status: ChatStep['status'] = 'running'): ChatStep => ({
  id,
  status,
  label: id,
});
const replyOf = (s: ChatSnapshot, id = 'u1:reply') =>
  s.messages.find(m => m.id === id) as ChatAssistantMessage;
const blocks = (s: ChatSnapshot) =>
  replyOf(s).parts.filter((p): p is ChatChainOfThoughtPart => p.type === 'chain-of-thought');
const pending: ChatApprovalPart = {
  type: 'approval',
  id: 'a1',
  status: 'pending',
  content: 'Run `x`',
};
const started = run(EMPTY, [{ t: 'user', id: 'u1', text: 'Hi' }]);

describe('reduceWally', () => {
  it('appends a user message and submits', () => {
    expect(started.status).toBe('submitted');
    expect(started.messages).toEqual([
      {
        role: 'user',
        id: 'u1',
        createdAt: undefined,
        parts: [{ type: 'text', id: 'u1:text', text: 'Hi' }],
      },
    ]);
  });

  it('keeps the identity of untouched messages', () => {
    const before = run(CONVERSATION, [{ t: 'user', id: 'u3', text: 'More' }]);
    const after = reduceWally(before, { t: 'text', delta: 'Hello' });
    before.messages.forEach((m, i) => expect(after.messages[i]).toBe(m));
  });

  it('ignores unknown events', () => {
    expect(reduceWally(started, { t: 'nope' } as unknown as WallyEvent)).toBe(started);
  });

  it('is idempotent for replayed step and approval events', () => {
    const events: WallyEvent[] = [
      { t: 'step', step: step('s1') },
      { t: 'approval', approval: pending },
    ];
    const once = run(started, events);
    expect(run(once, events)).toEqual(once);
  });

  it('creates ${userId}:reply on a text event before any reply', () => {
    const s = reduceWally(started, { t: 'text', delta: 'Hel' });
    const next = reduceWally(s, { t: 'text', delta: 'lo' });
    expect(next.status).toBe('streaming');
    expect(replyOf(next).parts).toEqual([{ type: 'text', id: 'u1:reply:text:0', text: 'Hello' }]);
  });

  it('opens a new block for steps after a text part, but not after an approval', () => {
    const s = run(started, [
      { t: 'step', step: step('s1') },
      { t: 'approval', approval: pending },
      { t: 'step', step: step('s2') },
      { t: 'text', delta: 'Answer' },
      { t: 'step', step: step('s3') },
    ]);
    expect(blocks(s).map(b => b.steps.map(x => x.id))).toEqual([['s1', 's2'], ['s3']]);
    expect(replyOf(s).parts.map(p => p.type)).toEqual([
      'chain-of-thought',
      'approval',
      'text',
      'chain-of-thought',
    ]);
  });

  it('nests a step under its parent and replaces it by id anywhere', () => {
    let s = run(started, [
      { t: 'step', step: step('agent') },
      { t: 'step', step: step('child'), parentId: 'agent' },
    ]);
    expect(blocks(s)[0]?.steps[0]?.steps?.map(x => x.id)).toEqual(['child']);
    s = reduceWally(s, { t: 'step', step: step('child', 'done') });
    expect(blocks(s)[0]?.steps[0]?.steps?.[0]?.status).toBe('done');
    // Replacing the parent without `steps` keeps its children.
    s = reduceWally(s, { t: 'step', step: step('agent', 'done') });
    expect(blocks(s)[0]?.steps[0]?.steps).toHaveLength(1);
  });

  it('stamps the summary on the first block', () => {
    const s = run(started, [
      { t: 'step', step: step('s1', 'done') },
      { t: 'text', delta: 'x' },
      { t: 'step', step: step('s2', 'done') },
      { t: 'summary', text: 'Worked for 1s' },
    ]);
    expect(blocks(s).map(b => b.summary)).toEqual(['Worked for 1s', undefined]);
  });

  it('settles live steps and appends a retryable error', () => {
    const s = run(started, [
      { t: 'step', step: step('s1') },
      { t: 'error', text: 'Boom' },
    ]);
    expect(s.status).toBe('error');
    expect(blocks(s)[0]?.steps[0]?.status).toBe('error');
    expect(replyOf(s).parts.at(-1)).toEqual({
      type: 'error',
      id: 'u1:reply:error',
      text: 'Boom',
      retryable: true,
    });
  });

  it('cancels live steps and pending approvals on stop', () => {
    const s = run(started, [
      { t: 'step', step: step('s1') },
      { t: 'step', step: step('s2', 'done') },
      { t: 'approval', approval: pending },
      { t: 'end', stopped: true },
    ]);
    expect(s.status).toBe('ready');
    expect(blocks(s)[0]?.steps.map(x => x.status)).toEqual(['cancelled', 'done']);
    expect(replyOf(s).parts.find(p => p.type === 'approval')).toMatchObject({
      status: 'rejected',
      resolvedLabel: 'Cancelled',
    });
  });

  it('ends a run without touching the messages', () => {
    const s = reduceWally(started, { t: 'end' });
    expect(s.status).toBe('ready');
    expect(s.messages).toBe(started.messages);
  });
});

describe('fixtures', () => {
  it('have the documented shapes', () => {
    expect(EMPTY.messages).toHaveLength(0);
    expect(EMPTY.suggestions?.length).toBeGreaterThan(0);
    expect(CONVERSATION.messages.map(m => m.id)).toEqual(['u1', 'u1:reply', 'u2', 'u2:reply']);
    expect(CONVERSATION.suggestions?.length).toBeGreaterThan(0);
    expect(
      replyOf(APPROVAL_PENDING).parts.some(p => p.type === 'approval' && p.status === 'pending'),
    ).toBe(true);
    expect(replyOf(ERROR_TURN).parts.map(p => p.type)).toEqual(['error']);
    const long = longThread(300);
    expect(long.messages).toHaveLength(300);
    expect(new Set(long.messages.map(m => m.id)).size).toBe(300);
  });

  it('the script ends in a folded, finished run', () => {
    const s = run(
      started,
      WALLY_SCRIPT.map(([, e]) => e),
    );
    expect(s.status).toBe('ready');
    expect(blocks(s)[0]?.summary).toBe('Worked for 12s');
    expect(blocks(s)[0]?.steps.every(x => x.status === 'done')).toBe(true);
    expect(replyOf(s).parts.at(-1)?.type).toBe('text');
  });
});

describe('useMockWally', () => {
  beforeEach(() => {
    rs.useFakeTimers();
  });
  afterEach(() => {
    rs.useRealTimers();
  });

  it('replays the script with deterministic ids', () => {
    const { result } = renderHook(() => useMockWally({ initial: CONVERSATION }));
    act(() => result.current.send('Next'));
    expect(result.current.snapshot.messages.at(-1)?.id).toBe('u3');
    expect(result.current.snapshot.status).toBe('submitted');
    act(() => {
      rs.runAllTimers();
    });
    expect(result.current.snapshot.status).toBe('ready');
    expect(replyOf(result.current.snapshot, 'u3:reply').parts.at(-1)?.type).toBe('text');
  });

  it('stop clears the timers and cancels live steps', () => {
    const { result } = renderHook(() =>
      useMockWally({
        script: [
          [10, { t: 'step', step: step('s1') }],
          [10, { t: 'end' }],
        ],
      }),
    );
    act(() => result.current.send('Hi'));
    act(() => {
      rs.advanceTimersByTime(10);
    });
    act(() => result.current.stop());
    act(() => {
      rs.runAllTimers();
    });
    expect(result.current.snapshot.status).toBe('ready');
    expect(blocks(result.current.snapshot)[0]?.steps[0]?.status).toBe('cancelled');
    expect(rs.getTimerCount()).toBe(0);
  });

  it('clears the timers on unmount', () => {
    const { result, unmount } = renderHook(() => useMockWally({ speed: 2 }));
    act(() => result.current.send('Hi'));
    expect(rs.getTimerCount()).toBe(1);
    unmount();
    expect(rs.getTimerCount()).toBe(0);
  });

  it('respond resolves the approval', () => {
    const { result } = renderHook(() => useMockWally({ initial: APPROVAL_PENDING }));
    const approval = replyOf(result.current.snapshot).parts.find(
      p => p.type === 'approval',
    ) as ChatApprovalPart;
    act(() =>
      result.current.respond(
        { approvalId: approval.id, optionId: 'allow', kind: 'allow-once', approved: true },
        approval,
      ),
    );
    expect(replyOf(result.current.snapshot).parts.find(p => p.id === approval.id)).toMatchObject({
      status: 'approved',
    });
    expect(result.current.snapshot.status).toBe('ready');
    const steps = replyOf(result.current.snapshot).parts.flatMap(p =>
      p.type === 'chain-of-thought' ? p.steps : [],
    );
    expect(steps.find(st => st.id === 'deny')).toMatchObject({ status: 'done' });
  });

  it('a rejected approval denies its step', () => {
    const { result } = renderHook(() => useMockWally({ initial: APPROVAL_PENDING }));
    const approval = replyOf(result.current.snapshot).parts.find(
      p => p.type === 'approval',
    ) as ChatApprovalPart;
    act(() =>
      result.current.respond(
        { approvalId: approval.id, optionId: 'reject', kind: 'reject', approved: false },
        approval,
      ),
    );
    const steps = replyOf(result.current.snapshot).parts.flatMap(p =>
      p.type === 'chain-of-thought' ? p.steps : [],
    );
    expect(steps.find(st => st.id === 'deny')).toMatchObject({ status: 'denied' });
  });
});

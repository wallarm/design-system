/**
 * Story and test fixtures for WallyAssistant, plus the custom SSE/REST mapper example from spec §10.2.
 * Excluded from the build and the d.ts (`**\/mocks.{ts,tsx}`), like `Table/mocks.tsx`.
 */
import { useEffect, useReducer, useRef } from 'react';

import { isRunningStatus } from '../model/deriveChatState';
import type {
  ChatApprovalPart,
  ChatApprovalResponse,
  ChatAssistantMessage,
  ChatAssistantPart,
  ChatChainOfThoughtPart,
  ChatMessage,
  ChatSnapshot,
  ChatStatus,
  ChatStep,
  ChatStepStatus,
} from '../model/model';

export type WallyEvent =
  | { t: 'user'; id: string; text: string; at?: string }
  /** Insert, or replace by id anywhere in the reply. */
  | { t: 'step'; step: ChatStep; parentId?: string }
  /** Deltas aren't idempotent: real streams carry offsets or snapshots. */
  | { t: 'text'; delta: string }
  /** Insert, or replace by id (resolving it too). */
  | { t: 'approval'; approval: ChatApprovalPart }
  /** "Worked for 12s", stamped on the first block. */
  | { t: 'summary'; text: string }
  | { t: 'error'; text: string }
  | { t: 'end'; stopped?: boolean };

const LIVE = new Set<ChatStepStatus>(['pending', 'running', 'awaiting-approval']);

const upsert = <T extends { id: string }>(list: readonly T[], item: T): readonly T[] => {
  const i = list.findIndex(x => x.id === item.id);
  return i < 0 ? [...list, item] : list.map((x, j) => (j === i ? item : x));
};

const isCot = (p: ChatAssistantPart): p is ChatChainOfThoughtPart => p.type === 'chain-of-thought';

const hasStep = (steps: readonly ChatStep[], id: string): boolean =>
  steps.some(s => s.id === id || hasStep(s.steps ?? [], id));

/** Depth-first map; untouched branches keep their identity. */
const mapSteps = (
  steps: readonly ChatStep[],
  f: (s: ChatStep) => ChatStep,
): readonly ChatStep[] => {
  const next = steps.map(s => {
    const kids = s.steps && mapSteps(s.steps, f);
    return f(kids === s.steps ? s : { ...s, steps: kids });
  });
  return next.every((s, i) => s === steps[i]) ? steps : next;
};

const mapBlocks = (
  m: ChatAssistantMessage,
  f: (steps: readonly ChatStep[]) => readonly ChatStep[],
): ChatAssistantMessage => {
  const parts = m.parts.map(p => {
    if (!isCot(p)) return p;
    const steps = f(p.steps);
    return steps === p.steps ? p : { ...p, steps };
  });
  return parts.every((p, i) => p === m.parts[i]) ? m : { ...m, parts };
};

const addStep = (
  m: ChatAssistantMessage,
  step: ChatStep,
  parentId?: string,
): ChatAssistantMessage => {
  const has = (id: string) => m.parts.some(p => isCot(p) && hasStep(p.steps, id));
  if (has(step.id)) {
    return mapBlocks(m, s =>
      mapSteps(s, x => (x.id === step.id ? { ...step, steps: step.steps ?? x.steps } : x)),
    );
  }
  if (parentId && has(parentId)) {
    return mapBlocks(m, s =>
      mapSteps(s, x => (x.id === parentId ? { ...x, steps: [...(x.steps ?? []), step] } : x)),
    );
  }
  const tail = [...m.parts].reverse().find(p => p.type !== 'approval'); // approvals don't close a block
  if (tail && isCot(tail)) {
    return {
      ...m,
      parts: m.parts.map(p => (p === tail ? { ...tail, steps: [...tail.steps, step] } : p)),
    };
  }
  // After text (or at the start): a new block.
  return {
    ...m,
    parts: [
      ...m.parts,
      { type: 'chain-of-thought', id: `${m.id}:cot:${m.parts.length}`, steps: [step] },
    ],
  };
};

const settle = (m: ChatAssistantMessage, to: ChatStepStatus) =>
  mapBlocks(m, s => mapSteps(s, x => (LIVE.has(x.status) ? { ...x, status: to } : x)));

const cancelApprovals = (m: ChatAssistantMessage): ChatAssistantMessage => ({
  ...m,
  parts: m.parts.map(p =>
    p.type === 'approval' && p.status === 'pending'
      ? { ...p, status: 'rejected' as const, resolvedLabel: 'Cancelled' }
      : p,
  ),
});

const lastUserId = (s: ChatSnapshot) => {
  for (let i = s.messages.length - 1; i >= 0; i--) {
    if (s.messages[i]?.role === 'user') return s.messages[i]?.id;
  }
  return undefined;
};

/** The reply to the last user message, created on demand; its id is the one WallyAssistant's loading row uses. */
const withReply = (
  s: ChatSnapshot,
  f: (m: ChatAssistantMessage) => ChatAssistantMessage,
  status: ChatStatus = 'streaming',
): ChatSnapshot => {
  const id = `${lastUserId(s) ?? 'boot'}:reply`;
  const prev = s.messages.find(m => m.id === id);
  const reply: ChatAssistantMessage =
    prev?.role === 'assistant' ? prev : { role: 'assistant', id, parts: [] };
  return { ...s, status, messages: upsert(s.messages, f(reply)) }; // untouched messages keep their identity
};

/** Folds one backend event into the next immutable snapshot (spec §10.2). */
export function reduceWally(s: ChatSnapshot, e: WallyEvent): ChatSnapshot {
  switch (e.t) {
    case 'user':
      return {
        ...s,
        status: 'submitted',
        messages: upsert(s.messages, {
          role: 'user',
          id: e.id,
          createdAt: e.at,
          parts: [{ type: 'text', id: `${e.id}:text`, text: e.text }],
        }),
      };
    case 'step':
      return withReply(s, m => addStep(m, e.step, e.parentId));
    case 'text':
      return withReply(s, m => {
        const last = m.parts[m.parts.length - 1];
        return last?.type === 'text'
          ? { ...m, parts: [...m.parts.slice(0, -1), { ...last, text: last.text + e.delta }] }
          : {
              ...m,
              parts: [
                ...m.parts,
                { type: 'text', id: `${m.id}:text:${m.parts.length}`, text: e.delta },
              ],
            };
      });
    case 'approval':
      return withReply(s, m => {
        const n = { ...m, parts: upsert(m.parts, e.approval) };
        if (e.approval.status === 'pending') return n;
        // ponytail: approvals don't name their step, so a resolution settles every HITL step in the reply
        const to = e.approval.status === 'approved' ? 'done' : 'denied';
        return mapBlocks(n, st =>
          mapSteps(st, x => (x.status === 'awaiting-approval' ? { ...x, status: to } : x)),
        );
      });
    case 'summary':
      return withReply(s, m => {
        const first = m.parts.find(isCot);
        return first
          ? { ...m, parts: m.parts.map(p => (p === first ? { ...first, summary: e.text } : p)) }
          : m;
      });
    case 'error':
      return withReply(
        s,
        m => {
          const n = settle(m, 'error');
          return {
            ...n,
            parts: upsert(n.parts, {
              type: 'error',
              id: `${m.id}:error`,
              text: e.text,
              retryable: true,
            }),
          };
        },
        'error',
      );
    case 'end':
      return e.stopped
        ? withReply(s, m => cancelApprovals(settle(m, 'cancelled')), 'ready')
        : { ...s, status: 'ready' };
    default:
      return s; // unknown events are ignored: forward compatible
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Script
// ---------------------------------------------------------------------------------------------------------------

/** About 30ms per token at `speed: 1`. */
const TOKEN_MS = 30;
const tokens = (text: string) => text.match(/\S+\s*/g) ?? [];

const REASONING =
  'The user wants the noisiest attack sources. I will query the last 24 hours of attack events, ' +
  'check which applications they hit, then read the policy to see what is already blocked.';
const ANSWER =
  'Over the last 24 hours `api.example.com` received 1,204 attacks, mostly SQL injection from 3 IPs.\n\n' +
  'Two of those IPs are already on the denylist. I can propose a rule for the third one, `203.0.113.7`.';

const reasoningStep = (status: ChatStepStatus, label: string, content?: string): ChatStep => ({
  id: 'reasoning',
  kind: 'reasoning',
  status,
  label,
  content,
});

const tool = (id: string, icon: string, running: string, done: string, metric?: string) =>
  [
    [500, { t: 'step', step: { id, kind: 'tool', icon, status: 'running', label: running } }],
    [900, { t: 'step', step: { id, kind: 'tool', icon, status: 'done', label: done, metric } }],
  ] satisfies [number, WallyEvent][];

/** `[delayMs, event]` pairs replayed by `useMockWally` after the user event (Streaming Simulation story). */
export const WALLY_SCRIPT: readonly (readonly [number, WallyEvent])[] = [
  [400, { t: 'step', step: reasoningStep('running', 'Thinking...') }],
  ...tokens(REASONING).map(
    (_, i, all) =>
      [
        TOKEN_MS,
        { t: 'step', step: reasoningStep('running', 'Thinking...', all.slice(0, i + 1).join('')) },
      ] as const,
  ),
  [200, { t: 'step', step: reasoningStep('done', 'Thought for 3s', REASONING) }],
  ...tool('query', 'query', 'Querying attack events...', 'Queried attack events', '1,204'),
  ...tool('apps', 'scan', 'Checking applications...', 'Checked 3 applications'),
  ...tool(
    'policy',
    'read',
    'Reading the policy for api.example.com...',
    'Read the policy for api.example.com',
  ),
  ...tokens(ANSWER).map((delta, i) => [i === 0 ? 400 : TOKEN_MS, { t: 'text', delta }] as const),
  [300, { t: 'summary', text: 'Worked for 12s' }],
  [100, { t: 'end' }],
];

// ---------------------------------------------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------------------------------------------

const userText = (id: string, text: string, createdAt?: string): ChatMessage => ({
  role: 'user',
  id,
  createdAt,
  parts: [{ type: 'text', id: `${id}:text`, text }],
});

const SUGGESTIONS: ChatSnapshot['suggestions'] = [
  { id: 'top-attacks', label: 'Show top attacks today' },
  {
    id: 'blocked',
    label: 'Which requests were blocked?',
    prompt: 'Which requests were blocked in the last hour?',
  },
  { id: 'rule', label: 'Create a mitigation rule' },
];

const FOLLOW_UPS: ChatSnapshot['suggestions'] = [
  { id: 'deny', label: 'Add 203.0.113.7 to the denylist' },
  { id: 'details', label: 'Show attack details' },
];

/** No messages: the greeting with suggestion pills. */
export const EMPTY: ChatSnapshot = { messages: [], status: 'ready', suggestions: SUGGESTIONS };

/** Two finished turns plus follow-up suggestions and tool permissions. Timestamps are fixed: pass a fixed
 *  `formatTimestamp` in screenshots. */
export const CONVERSATION: ChatSnapshot = {
  status: 'ready',
  messages: [
    userText('u1', 'Show me the top attacks from the last 24 hours', '2026-10-21T09:00:00.000Z'),
    {
      role: 'assistant',
      id: 'u1:reply',
      createdAt: '2026-10-21T09:00:12.000Z',
      parts: [
        {
          type: 'chain-of-thought',
          id: 'u1:reply:cot:0',
          summary: 'Worked for 12s',
          steps: [
            reasoningStep('done', 'Thought for 3s', REASONING),
            {
              id: 'query',
              kind: 'tool',
              icon: 'query',
              status: 'done',
              label: 'Queried attack events',
              metric: '1,204',
            },
            {
              id: 'apps',
              kind: 'tool',
              icon: 'scan',
              status: 'done',
              label: 'Checked 3 applications',
            },
          ],
        },
        { type: 'text', id: 'u1:reply:text:1', text: ANSWER },
      ],
    },
    userText('u2', 'Which of them were blocked?', '2026-10-21T09:01:00.000Z'),
    {
      role: 'assistant',
      id: 'u2:reply',
      createdAt: '2026-10-21T09:01:05.000Z',
      feedback: 'positive',
      parts: [
        {
          type: 'chain-of-thought',
          id: 'u2:reply:cot:0',
          steps: [{ id: 'reasoning', kind: 'reasoning', status: 'done', label: 'Thought for 2s' }],
        },
        {
          type: 'text',
          id: 'u2:reply:text:1',
          text: '1,019 of the 1,204 attacks were blocked by the `sqli-default` rule. The other 185 came from `203.0.113.7`, which is not on the denylist yet.',
        },
      ],
    },
  ],
  suggestions: FOLLOW_UPS,
  permissions: [
    {
      id: 'deny',
      title: 'propose_add_to_denylist',
      description: 'Propose a denylist entry for an IP',
      allowed: true,
    },
    { id: 'rules', title: 'create_mitigation_rule', allowed: false },
  ],
};

/** A reply waiting on a pending approval. `status` stays 'ready', as with CopilotKit HITL tools (§7.5). */
export const APPROVAL_PENDING: ChatSnapshot = {
  status: 'ready',
  messages: [
    userText('u1', 'Block 203.0.113.7 for a day'),
    {
      role: 'assistant',
      id: 'u1:reply',
      parts: [
        {
          type: 'chain-of-thought',
          id: 'u1:reply:cot:0',
          steps: [
            {
              id: 'policy',
              kind: 'tool',
              icon: 'read',
              status: 'done',
              label: 'Read the policy for api.example.com',
            },
            {
              id: 'deny',
              kind: 'tool',
              name: 'propose_add_to_denylist',
              icon: 'create',
              status: 'awaiting-approval',
              label: 'Proposing a denylist entry...',
            },
          ],
        },
        {
          type: 'approval',
          id: 'u1:reply:approval',
          status: 'pending',
          content:
            'Wally wants to run `propose_add_to_denylist`:\n\n```json\n{ "ip": "203.0.113.7", "duration": "24h" }\n```',
        },
      ],
    },
  ],
};

/** A run that failed before any output: an assistant message with only a retryable error part. */
export const ERROR_TURN: ChatSnapshot = {
  status: 'error',
  messages: [
    userText('u1', 'Show me the top attacks from the last 24 hours'),
    {
      role: 'assistant',
      id: 'u1:reply',
      parts: [
        {
          type: 'error',
          id: 'u1:reply:error',
          text: "Wally couldn't reach the attack store.",
          retryable: true,
        },
      ],
    },
  ],
};

/** `n` finished messages, alternating user and assistant, for the perf test. */
export const longThread = (n: number): ChatSnapshot => ({
  status: 'ready',
  messages: Array.from({ length: n }, (_, i): ChatMessage => {
    const turn = Math.floor(i / 2) + 1;
    return i % 2 === 0
      ? userText(`u${turn}`, `Question ${turn}`)
      : {
          role: 'assistant',
          id: `u${turn}:reply`,
          parts: [{ type: 'text', id: `u${turn}:reply:text:0`, text: `Answer ${turn}` }],
        };
  }),
});

// ---------------------------------------------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------------------------------------------

export interface UseMockWallyOptions {
  /** Default `EMPTY`. */
  initial?: ChatSnapshot;
  /** Default `WALLY_SCRIPT`. */
  script?: readonly (readonly [number, WallyEvent])[];
  /** Delay multiplier: 1 = about 30ms per token, 0 = as fast as timers allow. Default 1. */
  speed?: number;
}

export interface MockWally {
  snapshot: ChatSnapshot;
  /** Appends a user message (`u1`, `u2`, …) and replays the script. */
  send: (text: string) => void;
  /** Clears the timers, cancels live steps and pending approvals. */
  stop: () => void;
  /** Same signature as `onApprovalRespond`: resolves the approval in the next snapshot. */
  respond: (response: ChatApprovalResponse, approval: ChatApprovalPart) => void;
}

/** Replays `script` against `reduceWally` with a `setTimeout` chain. Deterministic ids for stable screenshots. */
export function useMockWally({
  initial = EMPTY,
  script = WALLY_SCRIPT,
  speed = 1,
}: UseMockWallyOptions = {}): MockWally {
  const [snapshot, dispatch] = useReducer(reduceWally, initial);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const play = (i: number) => {
    const entry = script[i];
    if (!entry) return;
    const [delay, event] = entry;
    timer.current = setTimeout(() => {
      dispatch(event);
      play(i + 1);
    }, delay * speed);
  };

  const send = (text: string) => {
    clearTimeout(timer.current);
    const n = snapshot.messages.filter(m => m.role === 'user').length + 1;
    dispatch({ t: 'user', id: `u${n}`, text });
    play(0);
  };

  const stop = () => {
    clearTimeout(timer.current);
    dispatch({ t: 'end', stopped: true });
  };

  const respond = (response: ChatApprovalResponse, approval: ChatApprovalPart) => {
    dispatch({
      t: 'approval',
      approval: { ...approval, status: response.approved ? 'approved' : 'rejected' },
    });
    // The reducer marks the reply as streaming; outside a run, put the status back to 'ready'.
    if (!isRunningStatus(snapshot.status)) dispatch({ t: 'end' });
  };

  return { snapshot, send, stop, respond };
}

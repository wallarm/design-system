import { useRef, useState } from 'react';
import type {
  ChatApprovalPart,
  ChatApprovalResponse,
  ChatAssistantMessage,
  ChatAssistantPart,
  ChatCustomPart,
  ChatMessage,
  ChatStatus,
} from '@wallarm-org/design-system/WallyAssistant';
import { ATTACK_SUMMARY_A2UI, ATTACK_SUMMARY_JSON_RENDER } from '@wallarm-org/gen-ui/fixtures';

export type GenUiFormat = 'a2ui' | 'json-render';

/** The custom part the emulated agent streams: one surface, its lines in arrival order. */
export interface GenUiPartData {
  format: GenUiFormat;
  lines: readonly unknown[];
}
export type GenUiPart = ChatCustomPart<GenUiPartData>;
export const GEN_UI_KIND = 'wallarm.gen-ui';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const INTRO = "Here's what happened in the last 24 hours. The login endpoint stands out.";

const BLOCK_APPROVAL = (ips: readonly string[]) =>
  [`Block **${ips.length}** source IPs on all applications?`, '```', ...ips, '```'].join('\n');

/**
 * A scripted stand-in for the agent: every reply is built from fixtures on timers, the way a
 * mapper would fold a real stream into snapshots. Only the format of the UI part changes.
 */
export function useEmulatedAgent(format: GenUiFormat) {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('ready');
  const run = useRef(0);
  /** Message ids: a counter, not `messages.length`, which a surface's handler may have captured stale. */
  const seq = useRef(0);

  /** Starts a run; the returned `alive()` turns false once Stop or a newer run supersedes it. */
  const start = () => {
    const id = ++run.current;
    return () => run.current === id;
  };

  const patch = (id: string, f: (m: ChatAssistantMessage) => ChatAssistantMessage) =>
    setMessages(list => {
      const prev = list.find(m => m.id === id);
      const base: ChatAssistantMessage =
        prev?.role === 'assistant' ? prev : { role: 'assistant', id, parts: [] };
      const next = f(base);
      return prev ? list.map(m => (m.id === id ? next : m)) : [...list, next];
    });

  const upsertPart = (id: string, part: ChatAssistantPart) =>
    patch(id, m => ({
      ...m,
      parts: m.parts.some(p => p.id === part.id)
        ? m.parts.map(p => (p.id === part.id ? part : p))
        : [...m.parts, part],
    }));

  const send = async (text: string) => {
    const alive = start();
    const userId = `u${++seq.current}`;
    const replyId = `${userId}:reply`;
    setMessages(list => [
      ...list,
      { role: 'user', id: userId, parts: [{ type: 'text', id: `${userId}:text`, text }] },
    ]);
    setStatus('submitted');

    await sleep(500);
    if (!alive()) return;
    setStatus('streaming');
    const step = { id: 'query', kind: 'tool', name: 'query_attacks' } as const;
    upsertPart(replyId, {
      type: 'chain-of-thought',
      id: `${replyId}:cot`,
      steps: [{ ...step, status: 'running', label: 'Querying attacks for the last 24 hours' }],
    });

    await sleep(900);
    if (!alive()) return;
    upsertPart(replyId, {
      type: 'chain-of-thought',
      id: `${replyId}:cot`,
      steps: [{ ...step, status: 'done', label: 'Queried attacks', metric: '1,240' }],
    });

    const words = INTRO.split(' ');
    for (let i = 1; i <= words.length; i++) {
      await sleep(40);
      if (!alive()) return;
      upsertPart(replyId, {
        type: 'text',
        id: `${replyId}:text`,
        text: words.slice(0, i).join(' '),
      });
    }

    const lines: readonly unknown[] =
      format === 'a2ui' ? ATTACK_SUMMARY_A2UI : ATTACK_SUMMARY_JSON_RENDER;
    for (let i = 1; i <= lines.length; i++) {
      await sleep(format === 'a2ui' ? 450 : 180);
      if (!alive()) return;
      const part: GenUiPart = {
        type: 'custom',
        id: `${replyId}:ui`,
        kind: GEN_UI_KIND,
        data: { format, lines: lines.slice(0, i) },
      };
      upsertPart(replyId, part);
    }
    setStatus('ready');
  };

  const stop = () => {
    run.current++;
    setStatus('ready');
  };

  /** What the surface's buttons trigger. block_ips is a side effect, so it asks first. */
  const act = (name: string, params: Record<string, unknown>) => {
    if (name !== 'block_ips') return;
    const ips = Array.isArray(params.ips) ? params.ips.map(String) : [];
    const id = `a${++seq.current}:block`;
    const approval: ChatApprovalPart = {
      type: 'approval',
      id: `${id}:approval`,
      status: 'pending',
      content: BLOCK_APPROVAL(ips),
      options: [
        { id: 'once', kind: 'allow-once', label: 'Block' },
        { id: 'reject', kind: 'reject', label: 'Cancel' },
      ],
    };
    upsertPart(id, approval);
  };

  const respond = async (response: ChatApprovalResponse, approval: ChatApprovalPart) => {
    const id = approval.id.replace(/:approval$/, '');
    upsertPart(id, { ...approval, status: response.approved ? 'approved' : 'rejected' });
    if (!response.approved) return;
    // A side reply: it neither takes over nor cancels a run that may be streaming meanwhile.
    await sleep(600);
    upsertPart(id, {
      type: 'text',
      id: `${id}:text`,
      text: 'Done: the 3 IPs are on the denylist for 24 hours.',
    });
  };

  return { messages, status, send, stop, act, respond };
}

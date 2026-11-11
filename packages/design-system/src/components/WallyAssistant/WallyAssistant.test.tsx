import { createRef, type HTMLAttributes } from 'react';

import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CodeSnippetAdapterProvider, type SyntaxAdapter } from '../CodeSnippet';
import { Drawer, DrawerContent } from '../Drawer';
import { APPROVAL_PENDING, CONVERSATION, EMPTY, ERROR_TURN } from './mocks';
import type { ChatContextItem, ChatMessage } from './model/model';
import {
  WallyAssistant,
  type WallyAssistantOwnProps,
  type WallyAssistantProps,
  type WallyAssistantReservedProps,
} from './WallyAssistant';

rs.mock('../../utils/copyText', () => ({ copyText: rs.fn(() => Promise.resolve()) }));

const noop = () => undefined;

// Type test: WallyAssistant's own prop names overlap HTMLAttributes only in the reserved list.
type Overlap = Extract<keyof WallyAssistantOwnProps, keyof HTMLAttributes<HTMLElement>>;
const onlyReserved: Exclude<Overlap, WallyAssistantReservedProps> extends never ? true : false =
  true;

const panel = (props: Partial<WallyAssistantProps> = {}) => {
  const onSubmit = rs.fn();
  const utils = render(
    <WallyAssistant
      data-testid='wally'
      {...EMPTY}
      onSubmit={onSubmit}
      formatTimestamp={() => 'now'}
      {...props}
    />,
  );
  return { ...utils, onSubmit };
};

const textarea = () => screen.getByTestId('wally--input--textarea');
const submitBtn = () => screen.getByTestId('wally--input--submit');

describe('WallyAssistant', () => {
  it('own props overlap DOM attributes only in the reserved list', () => {
    expect(onlyReserved).toBe(true);
  });

  describe('empty state and draft', () => {
    it('shows the greeting with its pills and the strong background', () => {
      panel();
      expect(screen.getByTestId('wally--empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('wally--greeting')).toHaveTextContent('How can I help you today?');
      expect(screen.getByTestId('wally--suggestion-2')).toHaveTextContent(
        'Create a mitigation rule',
      );
      expect(screen.getByTestId('wally--background')).toHaveClass('opacity-12');
    });

    it('uses the subtle background once there are messages', () => {
      panel({ ...CONVERSATION });
      expect(screen.getByTestId('wally--background')).toHaveClass('opacity-5');
    });

    it('a pill calls onSuggestionSelect(item)', async () => {
      const onSuggestionSelect = rs.fn();
      const { onSubmit } = panel({ onSuggestionSelect });
      await userEvent.click(screen.getByTestId('wally--suggestion-1'));
      expect(onSuggestionSelect).toHaveBeenCalledWith(EMPTY.suggestions?.[1]);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('without onSuggestionSelect a pill submits prompt ?? label', async () => {
      const { onSubmit } = panel();
      await userEvent.click(screen.getByTestId('wally--suggestion-1'));
      expect(onSubmit).toHaveBeenLastCalledWith('Which requests were blocked in the last hour?');
      await userEvent.click(screen.getByTestId('wally--suggestion-0'));
      expect(onSubmit).toHaveBeenLastCalledWith('Show top attacks today');
    });

    it('an uncontrolled draft clears after a send', async () => {
      const { onSubmit } = panel();
      await userEvent.type(textarea(), '  hello  {Enter}');
      expect(onSubmit).toHaveBeenCalledWith('hello');
      expect(textarea()).toHaveValue('');
    });

    it('a controlled draft passes through unchanged', async () => {
      const onValueChange = rs.fn();
      const { onSubmit } = panel({ value: 'kept', onValueChange });
      await userEvent.type(textarea(), 'x');
      expect(onValueChange).toHaveBeenCalledWith('keptx');
      await userEvent.click(submitBtn());
      expect(onSubmit).toHaveBeenCalledWith('kept');
      expect(textarea()).toHaveValue('kept');
    });

    it('disabled disables the textarea, Send and the pills', () => {
      panel({ disabled: true, value: 'typed' });
      expect(textarea()).toBeDisabled();
      expect(submitBtn()).toBeDisabled();
      expect(screen.getByTestId('wally--suggestion-0')).toBeDisabled();
    });
  });

  describe('pending approvals', () => {
    it('blocks Send and Enter, keeps typing, hides the pills', async () => {
      const { onSubmit } = panel({
        ...APPROVAL_PENDING,
        suggestions: CONVERSATION.suggestions,
        onApprovalRespond: noop,
      });
      expect(screen.getByTestId('wally--approval-card')).toBeInTheDocument();
      await userEvent.type(textarea(), 'next{Enter}');
      expect(textarea()).toHaveValue('next');
      expect(submitBtn()).toBeDisabled();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.queryByTestId('wally--suggestions')).toBeNull();
    });

    it('keeps Stop enabled while streaming', async () => {
      const onStop = rs.fn();
      panel({ ...APPROVAL_PENDING, status: 'streaming', onStop });
      expect(submitBtn()).toBeEnabled();
      expect(submitBtn()).toHaveAccessibleName('Stop response');
      await userEvent.click(submitBtn());
      expect(onStop).toHaveBeenCalledOnce();
    });

    it('Esc in the textarea stops the run without closing a host Drawer', async () => {
      const onStop = rs.fn();
      const onOpenChange = rs.fn();
      render(
        <Drawer open onOpenChange={onOpenChange}>
          <DrawerContent>
            <WallyAssistant
              data-testid='wally'
              {...CONVERSATION}
              status='streaming'
              onSubmit={noop}
              onStop={onStop}
            />
          </DrawerContent>
        </Drawer>,
      );
      textarea().focus();
      await userEvent.keyboard('{Escape}');
      expect(onStop).toHaveBeenCalledOnce();
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('hands focus to the next docked card when the answered one moves inline', async () => {
      const [u, reply] = APPROVAL_PENDING.messages;
      if (reply?.role !== 'assistant' || !u) throw new Error('fixture');
      const approval = reply.parts.find(p => p.type === 'approval');
      if (approval?.type !== 'approval') throw new Error('fixture');
      const two = (aStatus: 'pending' | 'approved') => [
        u,
        {
          ...reply,
          parts: [
            { ...approval, id: 'a', status: aStatus },
            { ...approval, id: 'b' },
          ],
        },
      ];
      const view = (aStatus: 'pending' | 'approved') => (
        <WallyAssistant
          data-testid='wally'
          messages={two(aStatus)}
          onSubmit={noop}
          onApprovalRespond={noop}
        />
      );
      const { rerender } = render(view('pending'));
      const [first] = screen.getAllByTestId('wally--approval-card--option-reject');
      first?.focus();
      await userEvent.keyboard('{Enter}');
      rerender(view('approved'));
      expect(document.activeElement).not.toBe(document.body);
      expect(screen.getByTestId('wally--approval-card')).toContainElement(
        document.activeElement as HTMLElement,
      );
    });

    it('keeps a resolved card docked until the next user message', () => {
      const [u, reply] = APPROVAL_PENDING.messages;
      if (reply?.role !== 'assistant' || !u) throw new Error('fixture');
      const resolved = {
        ...reply,
        parts: reply.parts.map(p =>
          p.type === 'approval' ? { ...p, status: 'approved' as const } : p,
        ),
      };
      const { rerender } = panel({ messages: [u, resolved] });
      expect(screen.getByTestId('wally--approval-card--status')).toHaveTextContent('Approved');
      expect(screen.getByTestId('wally--footer')).toContainElement(
        screen.getByTestId('wally--approval-card'),
      );
      rerender(
        <WallyAssistant
          data-testid='wally'
          messages={[
            u,
            resolved,
            { role: 'user', id: 'u2', parts: [{ type: 'text', id: 't', text: 'ok' }] },
          ]}
          onSubmit={noop}
        />,
      );
      expect(screen.queryByTestId('wally--approval-card')).toBeNull();
      expect(screen.getByTestId('wally--assistant-message-1--approval-card')).toBeInTheDocument();
    });
  });

  describe('input', () => {
    it('shows permissions only with both props, partitioned by a separator', async () => {
      const { rerender } = panel({ ...CONVERSATION });
      expect(screen.queryByTestId('wally--input--permissions--trigger')).toBeNull();
      const onPermissionChange = rs.fn();
      rerender(
        <WallyAssistant
          data-testid='wally'
          {...CONVERSATION}
          onSubmit={noop}
          onPermissionChange={onPermissionChange}
        />,
      );
      await userEvent.click(screen.getByTestId('wally--input--permissions--trigger'));
      const content = screen.getByTestId('wally--input--permissions--content');
      expect(content.querySelector('[data-orientation=horizontal]')).not.toBeNull();
      await userEvent.click(screen.getByTestId('wally--input--permissions--item-1'));
      expect(onPermissionChange).toHaveBeenCalledWith(CONVERSATION.permissions?.[1], true);
    });

    it('context chips use labels.removeContext and call onContextRemove(item)', async () => {
      const context: ChatContextItem[] = [
        { id: 'a', label: 'Attacks' },
        { id: 'b', label: 'Incidents', removable: false },
      ];
      const onContextRemove = rs.fn();
      panel({ context, onContextRemove, labels: { removeContext: l => `Drop ${l}` } });
      expect(screen.getByTestId('wally--input--context-0')).toHaveTextContent('Attacks');
      expect(screen.queryByTestId('wally--input--context-1--close')).toBeNull();
      const close = screen.getByTestId('wally--input--context-0--close');
      expect(close).toHaveAccessibleName('Drop Attacks');
      await userEvent.click(close);
      expect(onContextRemove).toHaveBeenCalledWith(context[0]);
    });

    it('context chips are not removable without onContextRemove', () => {
      panel({ context: [{ id: 'a', label: 'Attacks' }] });
      expect(screen.queryByTestId('wally--input--context-0--close')).toBeNull();
    });
  });

  describe('labels and slots', () => {
    it('labels reach the textarea, Send and the disclaimer', async () => {
      panel({
        labels: { input: 'Nachricht', send: 'Senden', disclaimer: 'Prüfen', placeholder: 'Frag' },
      });
      expect(textarea()).toHaveAccessibleName('Nachricht');
      expect(textarea()).toHaveAttribute('placeholder', 'Frag');
      expect(submitBtn()).toHaveAccessibleName('Senden');
      expect(screen.getByTestId('wally--input--disclaimer')).toHaveTextContent('Prüfen');
    });

    it('undefined slots give the defaults, null renders nothing, a node replaces it', () => {
      const { rerender } = panel();
      expect(screen.getByTestId('wally--header')).toBeInTheDocument();
      expect(screen.getByTestId('wally--input')).toBeInTheDocument();
      rerender(
        <WallyAssistant
          data-testid='wally'
          {...EMPTY}
          onSubmit={noop}
          header={null}
          input={<div data-testid='my-input' />}
          emptyState={<p data-testid='my-empty' />}
          footerStart={<p data-testid='banner' />}
        />,
      );
      expect(screen.queryByTestId('wally--header')).toBeNull();
      expect(screen.queryByTestId('wally--input')).toBeNull();
      expect(screen.queryByTestId('wally--empty-state')).toBeNull();
      expect(screen.getByTestId('my-input')).toBeInTheDocument();
      expect(screen.getByTestId('my-empty')).toBeInTheDocument();
      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('headerTitle and headerActions render inside the header', () => {
      panel({
        headerTitle: <span data-testid='thread'>Thread</span>,
        headerActions: <button type='button'>New</button>,
      });
      expect(screen.getByTestId('wally--title')).toContainElement(screen.getByTestId('thread'));
      expect(screen.getByTestId('wally--actions')).toHaveTextContent('New');
    });

    it('textareaRef reaches the textarea', () => {
      const ref = createRef<HTMLTextAreaElement>();
      panel({ textareaRef: ref });
      expect(ref.current).toBe(textarea());
    });
  });

  describe('test ids (§6.4)', () => {
    // Every id below must match exactly one node (getByTestId throws on 0 or 2+).
    it('maps the conversation', async () => {
      panel({
        ...CONVERSATION,
        context: [{ id: 'a', label: 'Attacks' }],
        onFeedback: noop,
        onPermissionChange: noop,
        headerActions: <button type='button'>New</button>,
      });
      const m1 = 'wally--assistant-message-1';
      const cot = `${m1}--chain-of-thought`;
      for (const id of [
        'wally',
        'wally--header',
        'wally--title',
        'wally--actions',
        'wally--body',
        'wally--footer',
        'wally--suggestions',
        'wally--suggestion-0',
        'wally--user-message-0',
        'wally--user-message-0--bubble',
        'wally--user-message-0--text',
        'wally--user-message-0--actions--copy',
        'wally--user-message-0--actions--timestamp',
        m1,
        cot,
        `${cot}--step-summary`,
        `${cot}--step-summary--chain-of-thought--step-0`,
        `${m1}--content`,
        `${m1}--actions`,
        `${m1}--actions--copy`,
        `${m1}--actions--like`,
        `${m1}--actions--dislike`,
        `${m1}--actions--timestamp`,
        'wally--assistant-message-3--chain-of-thought--step-0',
        'wally--input',
        'wally--input--context-0',
        'wally--input--textarea',
        'wally--input--permissions--trigger',
        'wally--input--submit',
        'wally--input--disclaimer',
      ]) {
        expect(screen.getByTestId(id)).toBeInTheDocument();
      }
      await userEvent.click(screen.getByTestId('wally--input--permissions--trigger'));
      expect(screen.getByTestId('wally--input--permissions--content')).toBeInTheDocument();
      expect(screen.getByTestId('wally--input--permissions--item-0')).toBeInTheDocument();
    });

    it('maps the docked approval', () => {
      panel({ ...APPROVAL_PENDING, onApprovalRespond: noop });
      for (const id of [
        'wally--approval-card',
        'wally--approval-card--option-allow-always',
        'wally--approval-card--option-reject',
        'wally--approval-card--more',
      ]) {
        expect(screen.getByTestId(id)).toBeInTheDocument();
      }
    });

    it('maps the loader row and the error', () => {
      const [u] = CONVERSATION.messages;
      if (!u) throw new Error('fixture');
      const { rerender } = panel({ messages: [u], status: 'submitted' });
      expect(screen.getByTestId('wally--assistant-message-1--loader')).toBeInTheDocument();
      expect(screen.getByTestId('wally--body')).toHaveAttribute('aria-busy', 'true');
      rerender(
        <WallyAssistant data-testid='wally' {...ERROR_TURN} onSubmit={noop} onRetry={noop} />,
      );
      expect(screen.getByTestId('wally--assistant-message-1--error--retry')).toBeInTheDocument();
    });
  });

  describe('code highlighting', () => {
    const FENCED: ChatMessage[] = [
      { role: 'user', id: 'u', parts: [{ type: 'text', id: 'u:t', text: 'Show the rule' }] },
      {
        role: 'assistant',
        id: 'r',
        parts: [{ type: 'text', id: 'r:t', text: '```json\n{"action": "block"}\n```' }],
      },
    ];
    const block = () => screen.getByTestId('wally--assistant-message-1--code-block');

    it('highlights fenced code with its own lazy Prism adapter', async () => {
      panel({ messages: FENCED });
      await waitFor(() => expect(block().querySelector('.text-syntax-string')).not.toBeNull());
    });

    it('uses an outer CodeSnippetAdapterProvider instead of mounting its own', async () => {
      const highlight = rs.fn(async (code: string) => ({
        tokens: [[{ content: code, type: 'keyword' as const }]],
      }));
      const adapter: SyntaxAdapter = { name: 'fake', highlight, getSupportedLanguages: () => [] };
      render(
        <CodeSnippetAdapterProvider adapter={adapter}>
          <WallyAssistant data-testid='wally' messages={FENCED} onSubmit={noop} />
        </CodeSnippetAdapterProvider>,
      );
      await waitFor(() => expect(block().querySelector('.text-syntax-keyword')).not.toBeNull());
      expect(highlight).toHaveBeenCalledWith('{"action": "block"}', 'json');
      expect(block().querySelector('.text-syntax-string')).toBeNull();
    });
  });
});

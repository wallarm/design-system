import type { ReactElement, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { act, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Activity, Brain, CircleDashed, Search, Wrench } from '../../../icons';
import { copyText } from '../../../utils/copyText';
import { TestIdProvider } from '../../../utils/testId';
import { ApprovalCardActions } from '../../ApprovalCard';
import { Button } from '../../Button';
import { longThread } from '../mocks';
import type {
  ChatApprovalPart,
  ChatAssistantMessage,
  ChatAssistantPart,
  ChatChainOfThoughtPart,
  ChatMessage,
  ChatStep,
  ChatStepStatus,
  ChatUserMessage,
} from '../model/model';
import { ApprovalCardView } from './ApprovalCardView';
import { ChainOfThoughtView } from './ChainOfThoughtView';
import { ChatMessageView } from './ChatMessageView';
import { ChatPartView } from './ChatPartView';
import type { ChatMarkdownProps, ChatViewConfig } from './ChatViewContext';
import { ChatViewProvider } from './ChatViewProvider';

rs.mock('../../../utils/copyText', () => ({ copyText: rs.fn(() => Promise.resolve()) }));

afterEach(() => {
  rs.mocked(copyText).mockClear();
});

// --- fixtures -----------------------------------------------------------------------------------

const renders = new Map<string, number>();
const Markdown = ({ text, streaming, variant, messageId, partId }: ChatMarkdownProps) => {
  renders.set(partId, (renders.get(partId) ?? 0) + 1);
  return (
    <span
      data-testid={`md-${partId}`}
      data-streaming={String(streaming)}
      data-variant={variant}
      data-message={messageId ?? 'none'}
    >
      {text}
    </span>
  );
};

const step = (id: string, status: ChatStepStatus, extra: Partial<ChatStep> = {}): ChatStep => ({
  id,
  status,
  label: id,
  ...extra,
});
const cot = (steps: ChatStep[], summary?: string): ChatChainOfThoughtPart => ({
  type: 'chain-of-thought',
  id: 'cot',
  steps,
  summary,
});
const reply = (
  parts: ChatAssistantPart[],
  extra: Partial<ChatAssistantMessage> = {},
): ChatAssistantMessage => ({ role: 'assistant', id: 'r', parts, ...extra });
const userMsg = (text: string, extra: Partial<ChatUserMessage> = {}): ChatUserMessage => ({
  role: 'user',
  id: 'u',
  parts: [{ type: 'text', id: 'u:text', text }],
  ...extra,
});
const approval = (extra: Partial<ChatApprovalPart> = {}): ChatApprovalPart => ({
  type: 'approval',
  id: 'a',
  status: 'pending',
  content: 'Run `x`',
  ...extra,
});

const tree = (ui: ReactNode, config: ChatViewConfig = {}) => (
  <ChatViewProvider markdown={Markdown} {...config}>
    <TestIdProvider value='w'>{ui}</TestIdProvider>
  </ChatViewProvider>
);
/** Renders inside a provider with the counting Markdown; `rerender` keeps that wrapper. */
const withView = (ui: ReactNode, config: ChatViewConfig = {}) => {
  const result = render(tree(ui, config));
  return { ...result, rerender: (next: ReactNode) => result.rerender(tree(next, config)) };
};

const at = <T,>(items: readonly T[], i: number): T => {
  const item = items[i];
  if (item === undefined) throw new Error(`no item at ${i}`);
  return item;
};

const pathOf = (icon: ReactElement) => /d="([^"]+)"/.exec(renderToStaticMarkup(icon))?.[1];
const iconPath = (testId: string) =>
  screen.getByTestId(`${testId}--icon`).querySelector('path')?.getAttribute('d');

// --- ChainOfThoughtView -------------------------------------------------------------------------

describe('ChainOfThoughtView', () => {
  const msg = reply([]);

  it('stays flat while active; the Working row appears only when working', () => {
    const part = cot([step('s1', 'done')], 'Worked for 3s');
    const { rerender } = withView(
      <ChainOfThoughtView data-testid='c' part={part} message={msg} active />,
    );
    expect(screen.getByTestId('c--step-0')).toHaveTextContent('s1');
    expect(screen.queryByTestId('c--step-summary')).toBeNull();
    expect(screen.queryByTestId('c--step-working')).toBeNull();

    rerender(
      <ChatViewProvider markdown={Markdown}>
        <ChainOfThoughtView data-testid='c' part={part} message={msg} active working />
      </ChatViewProvider>,
    );
    const working = screen.getByTestId('c--step-working');
    expect(working).toHaveTextContent('Working...');
    expect(working.closest('li')).toHaveAttribute('data-status', 'running');
  });

  it('folds only when the summary is set, the block is inactive and no step is live', () => {
    const { rerender } = withView(
      <ChainOfThoughtView data-testid='c' part={cot([step('s1', 'running')], 'W')} message={msg} />,
    );
    expect(screen.queryByTestId('c--step-summary')).toBeNull();

    rerender(<ChainOfThoughtView data-testid='c' part={cot([step('s1', 'done')])} message={msg} />);
    expect(screen.queryByTestId('c--step-summary')).toBeNull();

    rerender(
      <ChainOfThoughtView data-testid='c' part={cot([step('s1', 'done')], 'W')} message={msg} />,
    );
    expect(screen.getByTestId('c--step-summary')).toHaveTextContent('W');
    expect(screen.getByTestId('c--step-summary')).toHaveAttribute('aria-expanded', 'false');
    // Folded steps stay mounted inside the summary body.
    expect(screen.getByTestId('c--step-summary--chain-of-thought--step-0')).toHaveTextContent('s1');
  });

  it('a nested live step keeps the block from folding', () => {
    const part = cot([step('p', 'done', { steps: [step('child', 'pending')] })], 'W');
    withView(<ChainOfThoughtView data-testid='c' part={part} message={msg} />);
    expect(screen.queryByTestId('c--step-summary')).toBeNull();
  });

  it.each([
    ['preamble text', { type: 'text', id: 't', text: 'Let me check.' }],
    ['a custom part', { type: 'custom', id: 'x', kind: 'app.chart', data: null }],
  ] as const)('stays flat mid-run with %s after the block (regression)', (_, after) => {
    const message = reply([cot([step('s1', 'done')], 'W'), after]);
    withView(<ChatPartView part={at(message.parts, 0)} message={message} isLast />, {
      status: 'streaming',
    });
    expect(screen.queryByText('W')).toBeNull();
    // Something follows the block, so no Working row either.
    expect(screen.queryByText('Working...')).toBeNull();
  });

  it('shows the Working row when only an empty text follows the block (regression)', () => {
    const message = reply([cot([step('s1', 'done')]), { type: 'text', id: 't', text: '' }]);
    withView(<ChatMessageView message={message} index={1} isLast />, { status: 'streaming' });
    expect(screen.getByText('Working...')).toBeInTheDocument();
  });

  it('shows the Working row through ChatPartView when only approvals follow the block', () => {
    const message = reply([cot([step('s1', 'done')]), approval()]);
    withView(<ChatPartView part={at(message.parts, 0)} message={message} isLast />, {
      status: 'submitted',
    });
    expect(screen.getByText('Working...')).toBeInTheDocument();
  });

  it('the fold uses Brain when every top-level step is reasoning, Activity otherwise', () => {
    const { rerender } = withView(
      <ChainOfThoughtView
        data-testid='c'
        part={cot([step('r', 'done', { kind: 'reasoning' })], 'Thought for 2s')}
        message={msg}
      />,
    );
    expect(iconPath('c--step-summary')).toBe(pathOf(<Brain />));

    rerender(
      <ChainOfThoughtView
        data-testid='c'
        part={cot([step('r', 'done', { kind: 'reasoning' }), step('t', 'done')], 'W')}
        message={msg}
      />,
    );
    expect(iconPath('c--step-summary')).toBe(pathOf(<Activity />));
  });

  it('a reasoning step is open while live and closes when done; a manual toggle sticks through the fold', async () => {
    const live = cot([step('r', 'running', { kind: 'reasoning', content: 'thinking' })], 'W');
    const { rerender } = withView(
      <ChainOfThoughtView data-testid='c' part={live} message={msg} active />,
    );
    expect(screen.getByTestId('c--step-0')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('md-r')).toHaveAttribute('data-streaming', 'true');
    expect(screen.getByTestId('md-r')).toHaveAttribute('data-variant', 'chain-of-thought');

    const done = cot([step('r', 'done', { kind: 'reasoning', content: 'thinking' })], 'W');
    rerender(<ChainOfThoughtView data-testid='c' part={done} message={msg} active />);
    expect(screen.getByTestId('c--step-0')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('md-r')).toHaveAttribute('data-streaming', 'false');

    await userEvent.click(screen.getByTestId('c--step-0'));
    expect(screen.getByTestId('c--step-0')).toHaveAttribute('aria-expanded', 'true');

    // Run over → folds; the toggle survives inside the summary.
    rerender(<ChainOfThoughtView data-testid='c' part={done} message={msg} />);
    await userEvent.click(screen.getByTestId('c--step-summary'));
    expect(screen.getByTestId('c--step-summary--chain-of-thought--step-0')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('the summary toggle is independent of a step that shares the part id', async () => {
    const part = cot([step('cot', 'done', { content: 'out' })], 'W');
    withView(<ChainOfThoughtView data-testid='c' part={part} message={msg} />);
    await userEvent.click(screen.getByTestId('c--step-summary'));
    expect(screen.getByTestId('c--step-summary')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('c--step-summary--chain-of-thought--step-0')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('a manual close wins over the live reasoning default', async () => {
    const live = cot([step('r', 'running', { kind: 'reasoning', content: 'x' })]);
    withView(<ChainOfThoughtView data-testid='c' part={live} message={msg} active />);
    await userEvent.click(screen.getByTestId('c--step-0'));
    expect(screen.getByTestId('c--step-0')).toHaveAttribute('aria-expanded', 'false');
  });

  it('non-reasoning steps start closed', () => {
    withView(
      <ChainOfThoughtView
        data-testid='c'
        part={cot([step('t', 'running', { kind: 'tool', content: 'out' })])}
        message={msg}
      />,
    );
    expect(screen.getByTestId('c--step-0')).toHaveAttribute('aria-expanded', 'false');
  });

  it.each([
    ['pending', 'running'],
    ['running', 'running'],
    ['awaiting-approval', 'running'],
    ['done', 'done'],
    ['denied', 'done'],
    ['cancelled', 'done'],
    ['error', 'error'],
    ['from-the-future', 'done'],
  ])('maps step status %s to the %s visual', (status, visual) => {
    withView(
      <ChainOfThoughtView
        data-testid='c'
        part={cot([step('s', status as ChatStepStatus)])}
        message={msg}
      />,
    );
    expect(screen.getByTestId('c--step-0').closest('li')).toHaveAttribute('data-status', visual);
  });

  it('resolves icons: null → Simple row, app icons, the Figma table, the kind default, CircleDashed', () => {
    withView(
      <ChainOfThoughtView
        data-testid='c'
        part={cot([
          step('a', 'done', { icon: null }),
          step('b', 'done', { icon: 'query' }),
          step('c', 'done', { icon: 'query' }),
          step('d', 'done', { kind: 'tool', icon: 'nope' }),
          step('e', 'done', { icon: 'constructor' }),
        ])}
        message={msg}
      />,
      { icons: {} },
    );
    expect(screen.queryByTestId('c--step-0--icon')).toBeNull();
    expect(iconPath('c--step-1')).toBe(pathOf(<Search />));
    expect(iconPath('c--step-3')).toBe(pathOf(<Wrench />));
    expect(iconPath('c--step-4')).toBe(pathOf(<CircleDashed />));
  });

  it('app icons win over the built-in table', () => {
    withView(
      <ChainOfThoughtView
        data-testid='c'
        part={cot([step('b', 'done', { icon: 'query' })])}
        message={msg}
      />,
      { icons: { query: <Brain /> } },
    );
    expect(iconPath('c--step-0')).toBe(pathOf(<Brain />));
  });

  it('renderStepContent: undefined → default body, null → not collapsible, a node replaces it', () => {
    const part = cot([
      step('def', 'done', { content: 'body' }),
      step('none', 'done', { content: 'body' }),
      step('card', 'done', { name: 'search_attacks' }),
    ]);
    const renderStepContent: ChatViewConfig['renderStepContent'] = (s, ctx) => {
      if (s.id === 'none') return null;
      if (s.name === 'search_attacks') return <div data-testid='card'>{ctx.message.id}</div>;
      return undefined;
    };
    withView(<ChainOfThoughtView data-testid='c' part={part} message={msg} />, {
      renderStepContent,
    });
    expect(screen.getByTestId('c--step-0').tagName).toBe('BUTTON');
    expect(screen.getByTestId('md-def')).toHaveAttribute('data-message', 'r');
    expect(screen.getByTestId('c--step-1').tagName).toBe('DIV');
    expect(screen.getByTestId('c--step-2').tagName).toBe('BUTTON');
    expect(screen.getByTestId('card')).toHaveTextContent('r');
  });

  it('renderStepContent can wrap defaultRender', () => {
    withView(
      <ChainOfThoughtView
        data-testid='c'
        part={cot([step('s', 'done', { content: 'body' })])}
        message={msg}
      />,
      {
        renderStepContent: (_, ctx) => <section data-testid='wrap'>{ctx.defaultRender()}</section>,
      },
    );
    expect(within(screen.getByTestId('wrap')).getByTestId('md-s')).toHaveTextContent('body');
  });

  it('nests child steps with derived test ids and forwards rest to the root ol', () => {
    withView(
      <ChainOfThoughtView
        data-testid='c'
        data-analytics-id='COT'
        part={cot([step('p', 'done', { steps: [step('k0', 'done'), step('k1', 'done')] })])}
        message={msg}
      />,
    );
    expect(screen.getByTestId('c').tagName).toBe('OL');
    expect(screen.getByTestId('c')).toHaveAttribute('data-analytics-id', 'COT');
    expect(screen.getByTestId('c--step-0--chain-of-thought--step-1')).toHaveTextContent('k1');
  });
});

// --- ApprovalCardView ---------------------------------------------------------------------------

describe('ApprovalCardView', () => {
  it('renders the default options as a SplitButton with an "Allow once" item, plus Reject', async () => {
    const onApprovalRespond = rs.fn();
    withView(<ApprovalCardView approval={approval()} />, { onApprovalRespond });

    expect(screen.getByTestId('w--approval-card--option-allow-always')).toHaveTextContent(
      'Always allow in this session',
    );
    expect(screen.getByTestId('w--approval-card--more')).toHaveAccessibleName(
      'More approval options',
    );
    expect(screen.getByTestId('w--approval-card--option-reject')).toHaveTextContent('Reject');
    expect(screen.getByTestId('w--approval-card--caption')).toHaveTextContent(
      'Requires your approval',
    );

    await userEvent.click(screen.getByTestId('w--approval-card--more'));
    await userEvent.click(await screen.findByTestId('w--approval-card--option-allow-once'));
    expect(onApprovalRespond).toHaveBeenCalledWith(
      { approvalId: 'a', optionId: 'allow-once', kind: 'allow-once', approved: true },
      expect.objectContaining({ id: 'a' }),
    );
  });

  it('a single allow option is a plain Button; onRespond gets the payload', async () => {
    const onRespond = rs.fn();
    withView(
      <ApprovalCardView
        onRespond={onRespond}
        approval={approval({
          options: [
            { id: 'yes', kind: 'allow-once', label: 'Yes' },
            { id: 'no', kind: 'reject', label: 'No' },
          ],
        })}
      />,
    );
    expect(screen.queryByTestId('w--approval-card--more')).toBeNull();
    await userEvent.click(screen.getByTestId('w--approval-card--option-no'));
    expect(onRespond).toHaveBeenCalledWith({
      approvalId: 'a',
      optionId: 'no',
      kind: 'reject',
      approved: false,
    });
  });

  it('treats an unknown option kind as allow', async () => {
    const onRespond = rs.fn();
    withView(
      <ApprovalCardView
        onRespond={onRespond}
        approval={approval({ options: [{ id: 'z', kind: 'allow-forever', label: 'Z' }] })}
      />,
    );
    await userEvent.click(screen.getByTestId('w--approval-card--option-z'));
    expect(onRespond).toHaveBeenCalledWith(expect.objectContaining({ approved: true }));
  });

  it.each([
    ['approval.disabled', { approval: approval({ disabled: true }), onRespond: rs.fn() }],
    ['the disabled prop', { approval: approval(), disabled: true, onRespond: rs.fn() }],
    ['no callback', { approval: approval() }],
  ])('is disabled by %s', (_, props) => {
    withView(<ApprovalCardView {...props} />);
    expect(screen.getByTestId('w--approval-card--option-allow-always')).toBeDisabled();
    expect(screen.getByTestId('w--approval-card--more')).toBeDisabled();
    expect(screen.getByTestId('w--approval-card--option-reject')).toBeDisabled();
  });

  it('children replace the default actions; content goes through markdown as approval', () => {
    withView(
      <ApprovalCardView approval={approval()} message={reply([])}>
        <ApprovalCardActions>
          <Button data-testid='mine'>Mine</Button>
        </ApprovalCardActions>
      </ApprovalCardView>,
    );
    expect(screen.getByTestId('mine')).toBeInTheDocument();
    expect(screen.queryByTestId('w--approval-card--option-reject')).toBeNull();
    expect(screen.getByTestId('md-a')).toHaveAttribute('data-variant', 'approval');
    expect(screen.getByTestId('md-a')).toHaveAttribute('data-streaming', 'false');
    expect(screen.getByTestId('md-a')).toHaveAttribute('data-message', 'r');
  });

  it('children={null} renders no actions', () => {
    withView(<ApprovalCardView approval={approval()}>{null}</ApprovalCardView>);
    expect(screen.getByTestId('w--approval-card')).toBeInTheDocument();
    expect(screen.queryByTestId('w--approval-card--option-reject')).toBeNull();
  });

  it('shows resolvedLabel, or the provider labels, in the status row', () => {
    const { rerender } = withView(
      <ApprovalCardView approval={approval({ status: 'rejected', resolvedLabel: 'Expired' })} />,
    );
    expect(screen.getByTestId('w--approval-card--status')).toHaveTextContent('Expired');

    rerender(
      <ChatViewProvider labels={{ approved: 'Erlaubt' }}>
        <TestIdProvider value='w'>
          <ApprovalCardView approval={approval({ status: 'approved' })} />
        </TestIdProvider>
      </ChatViewProvider>,
    );
    expect(screen.getByTestId('w--approval-card--status')).toHaveTextContent('Erlaubt');
  });

  it('uses the default labels and the DS markdown without a provider', () => {
    render(<ApprovalCardView data-testid='card' approval={approval({ content: 'Run **x**' })} />);
    expect(screen.getByTestId('card--option-reject')).toHaveTextContent('Reject');
    expect(screen.getByTestId('card--content').querySelector('strong')).toHaveTextContent('x');
  });

  it('renders assistant text with the DS markdown by default; a custom markdown wins', () => {
    const message = reply([{ type: 'text', id: 't', text: '**a**' }]);
    const { container, rerender } = render(
      <ChatViewProvider>
        <ChatMessageView message={message} index={1} isLast />
      </ChatViewProvider>,
    );
    expect(container.querySelector('strong')).toHaveTextContent('a');
    rerender(
      <ChatViewProvider markdown={Markdown}>
        <ChatMessageView message={message} index={1} isLast />
      </ChatViewProvider>,
    );
    expect(container.querySelector('strong')).toBeNull();
    expect(screen.getByTestId('md-t')).toHaveTextContent('**a**');
  });
});

// --- ChatPartView -------------------------------------------------------------------------------

describe('ChatPartView', () => {
  const text = { type: 'text', id: 't', text: 'Hello' } as const;

  it('renderPart: undefined → default, null → nothing, a node replaces it', () => {
    const message = reply([text]);
    const { rerender } = withView(<ChatPartView part={text} message={message} isLast />, {
      renderPart: () => undefined,
    });
    expect(screen.getByTestId('md-t')).toHaveAttribute('data-variant', 'answer');

    rerender(
      <ChatViewProvider renderPart={() => null}>
        <ChatPartView part={text} message={message} isLast />
      </ChatViewProvider>,
    );
    expect(screen.queryByText('Hello')).toBeNull();

    rerender(
      <ChatViewProvider renderPart={() => <b data-testid='mine'>x</b>}>
        <ChatPartView part={text} message={message} isLast />
      </ChatViewProvider>,
    );
    expect(screen.getByTestId('mine')).toBeInTheDocument();
  });

  it('passes placement, streaming and a wrappable defaultRender in ctx', () => {
    const message = reply([text]);
    const seen: unknown[] = [];
    withView(<ChatPartView part={text} message={message} isLast placement='docked' />, {
      status: 'streaming',
      renderPart: (_, ctx) => {
        seen.push({ placement: ctx.placement, streaming: ctx.streaming, isLast: ctx.isLast });
        return <div data-testid='wrap'>{ctx.defaultRender()}</div>;
      },
    });
    expect(seen.at(-1)).toEqual({ placement: 'docked', streaming: true, isLast: true });
    expect(within(screen.getByTestId('wrap')).getByTestId('md-t')).toHaveAttribute(
      'data-streaming',
      'true',
    );
  });

  it('only the last part of the last message streams', () => {
    const message = reply([text, { type: 'text', id: 't2', text: 'tail' }]);
    withView(
      <>
        <ChatPartView part={at(message.parts, 0)} message={message} isLast />
        <ChatPartView part={at(message.parts, 1)} message={message} isLast />
      </>,
      { status: 'streaming' },
    );
    expect(screen.getByTestId('md-t')).toHaveAttribute('data-streaming', 'false');
    expect(screen.getByTestId('md-t2')).toHaveAttribute('data-streaming', 'true');
  });

  it('known approximation: with renderPart set, a part it maps to nothing still hides the loader', () => {
    const message = reply([{ type: 'custom', id: 'x', kind: 'k', data: null }]);
    withView(<ChatMessageView message={message} index={1} isLast />, {
      status: 'streaming',
      renderPart: () => undefined,
    });
    expect(screen.queryByTestId('w--assistant-message-1--loader')).toBeNull();
  });

  it('an unknown type goes to renderPart only and never throws', () => {
    const part = { type: 'sources', id: 's' } as unknown as ChatAssistantPart;
    const message = reply([part]);
    const { container } = withView(<ChatPartView part={part} message={message} isLast />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders error parts with Retry only when retryable and onRetry is set', async () => {
    const onRetry = rs.fn();
    const err = { type: 'error', id: 'e', text: 'Failed', retryable: true } as const;
    const message = reply([err]);
    const { rerender } = withView(<ChatPartView part={err} message={message} isLast />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
    expect(screen.queryByTestId('w--error--retry')).toBeNull();

    rerender(
      <ChatViewProvider onRetry={onRetry}>
        <TestIdProvider value='w'>
          <ChatPartView part={err} message={message} isLast />
        </TestIdProvider>
      </ChatViewProvider>,
    );
    await userEvent.click(screen.getByTestId('w--error--retry'));
    expect(onRetry).toHaveBeenCalledWith(message, err);
  });

  it('approvals in older messages render disabled', () => {
    const message = reply([approval()]);
    withView(<ChatPartView part={at(message.parts, 0)} message={message} isLast={false} />, {
      onApprovalRespond: rs.fn(),
    });
    expect(screen.getByTestId('w--approval-card--option-reject')).toBeDisabled();
  });

  it('user text renders a bubble', () => {
    const message = userMsg('Hi there');
    withView(<ChatPartView part={at(message.parts, 0)} message={message} isLast={false} />);
    expect(screen.getByTestId('w--bubble')).toHaveTextContent('Hi there');
  });
});

// --- ChatMessageView ----------------------------------------------------------------------------

describe('ChatMessageView', () => {
  it('shows the loader only for a last, empty reply while running', () => {
    const empty = reply([]);
    const { rerender, container } = withView(<ChatMessageView message={empty} index={1} isLast />, {
      status: 'submitted',
    });
    expect(screen.getByTestId('w--assistant-message-1--loader')).toHaveTextContent('Working...');
    expect(screen.getByTestId('w--assistant-message-1')).toHaveAttribute('aria-busy', 'true');

    rerender(
      <ChatViewProvider status='ready'>
        <ChatMessageView message={empty} index={1} isLast />
      </ChatViewProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the actions row once a non-approval part rendered, hidden while the turn is open', () => {
    const message = reply([{ type: 'text', id: 't', text: 'Answer' }]);
    const { rerender } = withView(<ChatMessageView message={message} index={1} isLast />, {
      status: 'streaming',
    });
    expect(screen.queryByTestId('w--assistant-message-1--actions')).toBeNull();

    rerender(
      <ChatViewProvider markdown={Markdown}>
        <TestIdProvider value='w'>
          <ChatMessageView message={message} index={1} isLast />
        </TestIdProvider>
      </ChatViewProvider>,
    );
    const row = screen.getByTestId('w--assistant-message-1--actions');
    expect(row).toHaveAccessibleName('Message actions');
    expect(row).toHaveClass('opacity-100');
  });

  it('hides the actions row while a pending approval is open, and for approval-only messages', () => {
    const pending = reply([{ type: 'text', id: 't', text: 'x' }, approval()]);
    const { rerender } = withView(<ChatMessageView message={pending} index={0} isLast />);
    expect(screen.queryByTestId('w--assistant-message-0--actions')).toBeNull();

    rerender(
      <ChatViewProvider>
        <TestIdProvider value='w'>
          <ChatMessageView
            message={reply([approval({ status: 'approved' })])}
            index={0}
            isLast={false}
          />
        </TestIdProvider>
      </ChatViewProvider>,
    );
    expect(screen.getByTestId('w--assistant-message-0--approval-card')).toBeInTheDocument();
    expect(screen.queryByTestId('w--assistant-message-0--actions')).toBeNull();
  });

  it('Copy copies copyText ?? the joined text parts and fires onCopy', async () => {
    const onCopy = rs.fn();
    const message = reply([
      { type: 'text', id: 't1', text: 'One' },
      { type: 'text', id: 't2', text: 'Two' },
    ]);
    const { rerender } = withView(<ChatMessageView message={message} index={1} isLast />, {
      onCopy,
    });
    await userEvent.click(screen.getByTestId('w--assistant-message-1--actions--copy'));
    expect(copyText).toHaveBeenCalledWith('One\n\nTwo');
    expect(onCopy).toHaveBeenCalledWith(message, 'One\n\nTwo');

    const custom = { ...message, copyText: 'Custom' };
    rerender(
      <ChatViewProvider>
        <TestIdProvider value='w'>
          <ChatMessageView message={custom} index={1} isLast />
        </TestIdProvider>
      </ChatViewProvider>,
    );
    await userEvent.click(screen.getByTestId('w--assistant-message-1--actions--copy'));
    expect(copyText).toHaveBeenLastCalledWith('Custom');
  });

  it('thumbs need onFeedback, reflect aria-pressed, and the pressed one sends null', async () => {
    const onFeedback = rs.fn();
    const message = reply([{ type: 'text', id: 't', text: 'x' }], { feedback: 'positive' });
    const { rerender } = withView(<ChatMessageView message={message} index={1} isLast />);
    expect(screen.queryByTestId('w--assistant-message-1--actions--like')).toBeNull();

    rerender(
      <ChatViewProvider onFeedback={onFeedback}>
        <TestIdProvider value='w'>
          <ChatMessageView message={message} index={1} isLast />
        </TestIdProvider>
      </ChatViewProvider>,
    );
    const like = screen.getByTestId('w--assistant-message-1--actions--like');
    const dislike = screen.getByTestId('w--assistant-message-1--actions--dislike');
    expect(like).toHaveAttribute('aria-pressed', 'true');
    expect(dislike).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(like);
    expect(onFeedback).toHaveBeenLastCalledWith(message, null);
    await userEvent.click(dislike);
    expect(onFeedback).toHaveBeenLastCalledWith(message, 'negative');
  });

  it('formats the timestamp with formatTimestamp, defaulting to relative time', () => {
    const message = reply([{ type: 'text', id: 't', text: 'x' }], {
      createdAt: '2026-10-21T09:00:00.000Z',
    });
    const { rerender } = withView(<ChatMessageView message={message} index={1} isLast />, {
      formatTimestamp: iso => `at ${iso.slice(11, 16)}`,
    });
    const ts = screen.getByTestId('w--assistant-message-1--actions--timestamp');
    expect(ts).toHaveTextContent('at 09:00');
    expect(ts).toHaveAttribute('dateTime', '2026-10-21T09:00:00.000Z');

    rerender(
      <ChatViewProvider>
        <TestIdProvider value='w'>
          <ChatMessageView
            message={{ ...message, createdAt: new Date().toISOString() }}
            index={1}
            isLast
          />
        </TestIdProvider>
      </ChatViewProvider>,
    );
    expect(screen.getByTestId('w--assistant-message-1--actions--timestamp')).toHaveTextContent(
      'Just now',
    );
  });

  it('user rows: Timestamp then Copy, revealed on hover', () => {
    withView(
      <ChatMessageView
        message={userMsg('Hi', { createdAt: '2026-10-21T09:00:00.000Z' })}
        index={0}
        isLast={false}
      />,
      { formatTimestamp: () => 'then' },
    );
    const root = screen.getByTestId('w--user-message-0');
    expect(root).toHaveAccessibleName('You');
    const row = screen.getByTestId('w--user-message-0--actions');
    expect(row).not.toHaveClass('opacity-100');
    const ids = [...row.querySelectorAll('[data-testid]')].map(el =>
      el.getAttribute('data-testid'),
    );
    expect(ids.indexOf('w--user-message-0--actions--timestamp')).toBeLessThan(
      ids.indexOf('w--user-message-0--actions--copy'),
    );
  });

  it('renderMessageActions: undefined → default, null → no row, custom content', () => {
    const message = reply([{ type: 'text', id: 't', text: 'x' }]);
    const view = (renderMessageActions: ChatViewConfig['renderMessageActions']) => (
      <ChatViewProvider renderMessageActions={renderMessageActions}>
        <TestIdProvider value='w'>
          <ChatMessageView message={message} index={1} isLast />
        </TestIdProvider>
      </ChatViewProvider>
    );
    const { rerender } = render(view(() => undefined));
    expect(screen.getByTestId('w--assistant-message-1--actions--copy')).toBeInTheDocument();

    rerender(view(() => null));
    expect(screen.queryByTestId('w--assistant-message-1--actions')).toBeNull();

    rerender(
      view((_, a) => (
        <>
          <span data-testid='extra' />
          {a.copy}
        </>
      )),
    );
    expect(screen.getByTestId('extra')).toBeInTheDocument();
    expect(screen.getByTestId('w--assistant-message-1--actions--copy')).toBeInTheDocument();
  });

  it('skips docked approvals, empty text and empty chains', () => {
    const message = reply([
      { type: 'text', id: 'empty', text: '' },
      cot([]),
      { type: 'text', id: 't', text: 'x' },
      approval(),
    ]);
    withView(<ChatMessageView message={message} index={1} isLast />, {
      approvalPlacement: 'docked',
    });
    expect(screen.queryByTestId('w--assistant-message-1--approval-card')).toBeNull();
    expect(screen.queryByTestId('w--assistant-message-1--chain-of-thought')).toBeNull();
    expect(screen.queryByTestId('md-empty')).toBeNull();
    expect(screen.getByTestId('md-t')).toBeInTheDocument();
  });

  it('renders inline approvals when not last, even with docked placement', () => {
    withView(<ChatMessageView message={reply([approval()])} index={1} isLast={false} />, {
      approvalPlacement: 'docked',
    });
    expect(screen.getByTestId('w--assistant-message-1--approval-card')).toBeInTheDocument();
  });

  it('renders nothing for an unknown role', () => {
    const odd = { role: 'system', id: 's', parts: [] } as unknown as ChatMessage;
    const { container } = withView(<ChatMessageView message={odd} index={0} isLast />);
    expect(container).toBeEmptyDOMElement();
  });

  it('gives each part its slot test id under the message', () => {
    const message = reply([cot([step('s', 'done')]), { type: 'text', id: 't', text: 'x' }]);
    withView(<ChatMessageView message={message} index={3} isLast={false} />);
    expect(screen.getByTestId('w--assistant-message-3--chain-of-thought--step-0')).toBeVisible();
    expect(screen.getByTestId('w--assistant-message-3--content')).toHaveTextContent('x');
    expect(screen.getByTestId('w--assistant-message-3')).toHaveAccessibleName('Wally');
  });
});

// --- Provider & perf ----------------------------------------------------------------------------

describe('ChatViewProvider', () => {
  it('merges labels over the defaults', () => {
    withView(<ChatMessageView message={reply([])} index={0} isLast />, {
      status: 'submitted',
      labels: { working: 'Arbeite...' },
    });
    expect(screen.getByTestId('w--assistant-message-0--loader')).toHaveTextContent('Arbeite...');
    expect(screen.getByTestId('w--assistant-message-0')).toHaveAccessibleName('Wally');
  });

  it('changing an inline handler does not re-render message views, and the latest handler runs', async () => {
    let partRenders = 0;
    const renderPart = () => {
      partRenders++;
      return undefined;
    };
    const message = reply([{ type: 'text', id: 't', text: 'x' }]);
    const view = (onFeedback: () => void) => (
      <ChatViewProvider markdown={Markdown} renderPart={renderPart} onFeedback={onFeedback}>
        <TestIdProvider value='w'>
          <ChatMessageView message={message} index={1} isLast />
        </TestIdProvider>
      </ChatViewProvider>
    );
    const first = rs.fn();
    const second = rs.fn();
    const { rerender } = render(view(first));
    const before = partRenders;
    expect(before).toBeGreaterThan(0);
    rerender(view(second));
    expect(partRenders).toBe(before);
    await userEvent.click(screen.getByTestId('w--assistant-message-1--actions--like'));
    expect(second).toHaveBeenCalled();
    expect(first).not.toHaveBeenCalled();
  });

  it('perf: with 300 messages and one growing text, only that part re-renders its markdown', () => {
    renders.clear();
    const base = longThread(300).messages;
    const Log = ({ messages }: { messages: readonly ChatMessage[] }) => (
      <ChatViewProvider markdown={Markdown} status='streaming'>
        {messages.map((m, i) => (
          <ChatMessageView key={m.id} message={m} index={i} isLast={i === messages.length - 1} />
        ))}
      </ChatViewProvider>
    );
    const { rerender } = render(<Log messages={base} />);
    const last = base[base.length - 1] as ChatAssistantMessage;
    const lastPartId = last.parts[0]?.id ?? '';
    const before = new Map(renders);

    for (const tail of [' more', ' and more']) {
      // No structural sharing: every message and part is a fresh object.
      const next = structuredClone(base) as ChatMessage[];
      const grown = next[next.length - 1] as ChatAssistantMessage;
      next[next.length - 1] = {
        ...grown,
        parts: [{ type: 'text', id: lastPartId, text: `Answer 150${tail}` }],
      };
      act(() => rerender(<Log messages={next} />));
    }

    expect(renders.get(lastPartId)).toBe((before.get(lastPartId) ?? 0) + 2);
    for (const [id, count] of renders) {
      if (id !== lastPartId) expect(count).toBe(before.get(id));
    }
  });

  it('perf: renderPart runs only for the streaming message when unchanged messages keep identity', () => {
    let calls = 0;
    const renderPart = () => {
      calls++;
      return undefined;
    };
    const base = longThread(300).messages;
    const Log = ({ messages }: { messages: readonly ChatMessage[] }) => (
      <ChatViewProvider markdown={Markdown} status='streaming' renderPart={renderPart}>
        {messages.map((m, i) => (
          <ChatMessageView key={m.id} message={m} index={i} isLast={i === messages.length - 1} />
        ))}
      </ChatViewProvider>
    );
    const { rerender } = render(<Log messages={base} />);
    const last = base[base.length - 1] as ChatAssistantMessage;
    calls = 0;
    // Structural sharing: only the streaming message is a new object.
    act(() =>
      rerender(
        <Log
          messages={[
            ...base.slice(0, -1),
            { ...last, parts: [{ type: 'text', id: last.parts[0]?.id ?? '', text: 'grown' }] },
          ]}
        />,
      ),
    );
    expect(calls).toBe(1);
  });
});

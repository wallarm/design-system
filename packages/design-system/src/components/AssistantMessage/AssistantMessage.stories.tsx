import { useEffect, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Brain, Database, Ellipsis, RefreshCcw, Search, ThumbsDown, ThumbsUp } from '../../icons';
import { ApprovalCard, ApprovalCardActions, ApprovalCardContent } from '../ApprovalCard';
import { Button } from '../Button';
import { ChainOfThought, ChainOfThoughtStep } from '../ChainOfThought';
import { CodeSnippetAdapterProvider, InlineCodeSnippet, loadPrismAdapter } from '../CodeSnippet';
import { Copyable, CopyableIcon } from '../Copyable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { MessageAction, MessageActions, MessageTimestamp } from '../MessageActions';
import {
  AssistantMessage,
  AssistantMessageContent,
  AssistantMessageError,
  AssistantMessageLoader,
  AssistantMessageMarkdown,
  type AssistantMessageMarkdownComponents,
  AssistantMessageMarkdownLink,
} from '.';
import { COT_TEXT, HOSTILE, WALLY_ANSWER } from './mocks';

const DESCRIPTION = [
  'A message from Wally: an `<article>` named "Wally" that left-aligns the answer and whatever led up to it.',
  'Stack its parts in this order — an optional `ChainOfThought` with the reasoning and tool calls, an optional `ApprovalCard`, the `AssistantMessageContent`, then a `MessageActions` row; the message spaces them 12px and 4px apart and lines the action icons up with the text.',
  "`AssistantMessageContent` spaces and styles markdown blocks; put `AssistantMessageMarkdown` inside it (WallyAssistant's default) or your own renderer's output.",
  '`AssistantMessageMarkdown` renders untrusted GFM as DS elements — no raw HTML, http/https/mailto/relative links only, images as alt text — and is streaming-safe: pass the whole text so far with `streaming` and it repairs only the unfinished tail.',
  'Set `aria-busy` on the message while the answer streams; before the first output, show only an `AssistantMessageLoader` "Working..." row, and if the answer fails, an `AssistantMessageError` after the content with your own Retry button in `action`.',
].join(' ');

const meta = {
  title: 'AI/AssistantMessage',
  component: AssistantMessage,
  subcomponents: {
    AssistantMessageContent,
    AssistantMessageLoader,
    AssistantMessageError,
    AssistantMessageMarkdown,
  },
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  decorators: [
    Story => (
      <div className='w-420'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AssistantMessage>;

export default meta;

const ANSWER_TEXT = 'Blocked 1,204 SQL injection attempts on /api/login in the last 24 hours.';

/** A rendered markdown answer: a heading, paragraphs and a list with inline code. */
export const AnswerProse: StoryFn<typeof meta> = () => (
  <AssistantMessage data-testid='prose'>
    <AssistantMessageContent>
      <h3>Blocked attacks, last 24 hours</h3>
      <p>
        Wallarm blocked 1,204 SQL injection attempts, almost all against{' '}
        <InlineCodeSnippet code='/api/login' size='sm' />.
      </p>
      <ul>
        <li>
          Most came from <InlineCodeSnippet code='203.0.113.0/24' size='sm' />.
        </li>
        <li>The peak was at 03:00 UTC.</li>
        <li>No request reached the application.</li>
      </ul>
      <p>Want me to add a rule that denies the whole subnet?</p>
    </AssistantMessageContent>
  </AssistantMessage>
);

/**
 * The reasoning sits above the answer as a `ChainOfThought`, 12px away. The first message
 * keeps it collapsed; the second opens the "Thought for 5s" step.
 */
export const WithReasoning: StoryFn<typeof meta> = () => (
  <div className='flex flex-col gap-24'>
    <AssistantMessage data-testid='collapsed'>
      <ChainOfThought>
        <ChainOfThoughtStep icon={<Brain />} label='Thought for 5s'>
          <p>
            The user wants blocked attacks for a day. Query the events, then group them by path.
          </p>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep icon={<Search />} label='Searched for blocked requests' />
        <ChainOfThoughtStep icon={<Database />} label='Queried attack events' />
      </ChainOfThought>
      <AssistantMessageContent>
        <h3>Blocked attacks, last 24 hours</h3>
        <p>
          Wallarm blocked 1,204 SQL injection attempts, almost all against{' '}
          <InlineCodeSnippet code='/api/login' size='sm' />.
        </p>
        <ul>
          <li>
            Most came from <InlineCodeSnippet code='203.0.113.0/24' size='sm' />.
          </li>
          <li>The peak was at 03:00 UTC.</li>
          <li>No request reached the application.</li>
        </ul>
        <p>Want me to add a rule that denies the whole subnet?</p>
      </AssistantMessageContent>
    </AssistantMessage>
    <AssistantMessage data-testid='expanded'>
      <ChainOfThought>
        <ChainOfThoughtStep icon={<Brain />} label='Thought for 5s' defaultOpen>
          <p>
            The user wants blocked attacks for a day. Query the events, then group them by path.
          </p>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep icon={<Search />} label='Searched for blocked requests' />
        <ChainOfThoughtStep icon={<Database />} label='Queried attack events' />
      </ChainOfThought>
      <AssistantMessageContent>
        <h3>Blocked attacks, last 24 hours</h3>
        <p>
          Wallarm blocked 1,204 SQL injection attempts, almost all against{' '}
          <InlineCodeSnippet code='/api/login' size='sm' />.
        </p>
        <ul>
          <li>
            Most came from <InlineCodeSnippet code='203.0.113.0/24' size='sm' />.
          </li>
          <li>The peak was at 03:00 UTC.</li>
          <li>No request reached the application.</li>
        </ul>
        <p>Want me to add a rule that denies the whole subnet?</p>
      </AssistantMessageContent>
    </AssistantMessage>
  </div>
);

/**
 * The latest answer forces its actions on with `visible`: Copy, thumbs up and down, a more
 * menu and the timestamp, with the first icon lined up with the text.
 */
export const WithActionsVisible: StoryFn<typeof meta> = () => (
  <AssistantMessage data-testid='with-actions'>
    <ChainOfThought>
      <ChainOfThoughtStep icon={<Brain />} label='Thought for 5s'>
        <p>The user wants blocked attacks for a day. Query the events, then group them by path.</p>
      </ChainOfThoughtStep>
      <ChainOfThoughtStep icon={<Search />} label='Searched for blocked requests' />
      <ChainOfThoughtStep icon={<Database />} label='Queried attack events' />
    </ChainOfThought>
    <AssistantMessageContent>
      <h3>Blocked attacks, last 24 hours</h3>
      <p>
        Wallarm blocked 1,204 SQL injection attempts, almost all against{' '}
        <InlineCodeSnippet code='/api/login' size='sm' />.
      </p>
      <ul>
        <li>
          Most came from <InlineCodeSnippet code='203.0.113.0/24' size='sm' />.
        </li>
        <li>The peak was at 03:00 UTC.</li>
        <li>No request reached the application.</li>
      </ul>
      <p>Want me to add a rule that denies the whole subnet?</p>
    </AssistantMessageContent>
    <MessageActions visible>
      <Copyable text={ANSWER_TEXT}>
        <MessageAction aria-label='Copy'>
          <CopyableIcon />
        </MessageAction>
      </Copyable>
      <MessageAction aria-label='Good response'>
        <ThumbsUp />
      </MessageAction>
      <MessageAction aria-label='Bad response'>
        <ThumbsDown />
      </MessageAction>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MessageAction aria-label='More actions'>
            <Ellipsis />
          </MessageAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Regenerate</DropdownMenuItem>
          <DropdownMenuItem>Report a problem</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <MessageTimestamp dateTime='2026-10-21T09:42:00Z'>1m ago</MessageTimestamp>
    </MessageActions>
  </AssistantMessage>
);

/**
 * The full composition: reasoning, an `ApprovalCard` stretched to the message width, the
 * answer and its actions. The card sits 12px from the parts around it, like the reasoning.
 */
export const WithApproval: StoryFn<typeof meta> = () => (
  <AssistantMessage data-testid='with-approval'>
    <ChainOfThought>
      <ChainOfThoughtStep icon={<Brain />} label='Thought for 5s'>
        <p>The user wants blocked attacks for a day. Query the events, then group them by path.</p>
      </ChainOfThoughtStep>
      <ChainOfThoughtStep icon={<Search />} label='Searched for blocked requests' />
      <ChainOfThoughtStep icon={<Database />} label='Queried attack events' />
    </ChainOfThought>
    <ApprovalCard>
      <ApprovalCardContent>
        Add 203.0.113.0/24 to the denylist on all applications
      </ApprovalCardContent>
      <ApprovalCardActions>
        <Button>Allow</Button>
        <Button variant='secondary' color='neutral'>
          Reject
        </Button>
      </ApprovalCardActions>
    </ApprovalCard>
    <AssistantMessageContent>
      <h3>Blocked attacks, last 24 hours</h3>
      <p>
        Wallarm blocked 1,204 SQL injection attempts, almost all against{' '}
        <InlineCodeSnippet code='/api/login' size='sm' />.
      </p>
      <ul>
        <li>
          Most came from <InlineCodeSnippet code='203.0.113.0/24' size='sm' />.
        </li>
        <li>The peak was at 03:00 UTC.</li>
        <li>No request reached the application.</li>
      </ul>
      <p>Want me to add a rule that denies the whole subnet?</p>
    </AssistantMessageContent>
    <MessageActions visible>
      <Copyable text={ANSWER_TEXT}>
        <MessageAction aria-label='Copy'>
          <CopyableIcon />
        </MessageAction>
      </Copyable>
      <MessageAction aria-label='Good response'>
        <ThumbsUp />
      </MessageAction>
      <MessageAction aria-label='Bad response'>
        <ThumbsDown />
      </MessageAction>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MessageAction aria-label='More actions'>
            <Ellipsis />
          </MessageAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Regenerate</DropdownMenuItem>
          <DropdownMenuItem>Report a problem</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <MessageTimestamp dateTime='2026-10-21T09:42:00Z'>1m ago</MessageTimestamp>
    </MessageActions>
  </AssistantMessage>
);

/**
 * Older answers keep their actions row transparent until the message is hovered or holds
 * focus; the 30px row stays reserved so nothing jumps.
 */
export const WithActionsOnHover: StoryFn<typeof meta> = () => (
  <AssistantMessage data-testid='hover-actions'>
    <AssistantMessageContent>
      <h3>Blocked attacks, last 24 hours</h3>
      <p>
        Wallarm blocked 1,204 SQL injection attempts, almost all against{' '}
        <InlineCodeSnippet code='/api/login' size='sm' />.
      </p>
      <ul>
        <li>
          Most came from <InlineCodeSnippet code='203.0.113.0/24' size='sm' />.
        </li>
        <li>The peak was at 03:00 UTC.</li>
        <li>No request reached the application.</li>
      </ul>
      <p>Want me to add a rule that denies the whole subnet?</p>
    </AssistantMessageContent>
    <MessageActions>
      <Copyable text={ANSWER_TEXT}>
        <MessageAction aria-label='Copy'>
          <CopyableIcon />
        </MessageAction>
      </Copyable>
      <MessageAction aria-label='Good response'>
        <ThumbsUp />
      </MessageAction>
      <MessageAction aria-label='Bad response'>
        <ThumbsDown />
      </MessageAction>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MessageAction aria-label='More actions'>
            <Ellipsis />
          </MessageAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Regenerate</DropdownMenuItem>
          <DropdownMenuItem>Report a problem</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <MessageTimestamp dateTime='2026-10-21T09:42:00Z'>1m ago</MessageTimestamp>
    </MessageActions>
  </AssistantMessage>
);

/**
 * While the answer streams, set `aria-busy` on the message and show the running step with a
 * shimmering label; the actions come once it finishes.
 */
export const Streaming: StoryFn<typeof meta> = () => (
  <AssistantMessage data-testid='streaming' aria-busy>
    <ChainOfThought>
      <ChainOfThoughtStep icon={<Search />} label='Searched for blocked requests' />
      <ChainOfThoughtStep icon={<Database />} label='Querying attack events...' status='running' />
    </ChainOfThought>
    <AssistantMessageContent>
      <p>Wallarm blocked 1,204 SQL injection attempts, almost all against</p>
    </AssistantMessageContent>
  </AssistantMessage>
);

/**
 * Before the first output, the message holds only an `AssistantMessageLoader`: the Figma
 * "Working..." row with a shimmering label, announced as `role='status'`. Pass children to
 * change the text.
 */
export const Loading: StoryFn<typeof meta> = () => (
  <AssistantMessage data-testid='loading' aria-busy>
    <AssistantMessageLoader />
  </AssistantMessage>
);

/**
 * A failed answer: `AssistantMessageError` comes after whatever content streamed, announced
 * as `role='alert'`. Put your own Retry `Button` in `action`, so its click and analytics are
 * yours. The action renders inside the error's test-id cascade, but `Button` doesn't read it:
 * either give it the full id yourself (here `error--error--retry`, i.e. the error's id `error--error`
 * plus `--retry`), or read `useTestId('retry')` (exported from the package) inside your own
 * Retry component to derive it. Not in Figma yet; pending design review.
 */
export const ErrorState: StoryFn<typeof meta> = () => (
  <AssistantMessage data-testid='error'>
    <AssistantMessageContent>
      <p>Wallarm blocked 1,204 SQL injection attempts, almost all against</p>
    </AssistantMessageContent>
    <AssistantMessageError
      action={
        <Button
          variant='ghost'
          color='neutral'
          size='small'
          data-testid='error--error--retry'
          data-analytics-id='WALLY_ANSWER_RETRY'
        >
          <RefreshCcw />
          Retry
        </Button>
      }
    >
      The connection was lost before the answer finished.
    </AssistantMessageError>
  </AssistantMessage>
);

/**
 * The message and its content are not interactive, but `data-analytics-*` still lands on
 * their real nodes; put click analytics on each `MessageAction` instead.
 */
export const Analytics: StoryFn<typeof meta> = () => (
  <AssistantMessage data-testid='analytics' data-analytics-id='WALLY_ANSWER'>
    <AssistantMessageContent data-analytics-id='WALLY_ANSWER_CONTENT'>
      <p>{ANSWER_TEXT}</p>
    </AssistantMessageContent>
    <MessageActions visible>
      <Copyable text={ANSWER_TEXT}>
        <MessageAction aria-label='Copy' data-analytics-id='WALLY_ANSWER_COPY'>
          <CopyableIcon />
        </MessageAction>
      </Copyable>
    </MessageActions>
  </AssistantMessage>
);

/**
 * `AssistantMessageMarkdown` inside `AssistantMessageContent`: every GFM element in the DS look —
 * heading, bold/italic/strike, inline code (click to copy), an aligned table, nested lists, a task
 * list, a fenced block with a copy button, a quote, a rule and links. Highlighting follows the
 * app's `CodeSnippetAdapterProvider` (WallyAssistant mounts the lazy Prism one itself).
 */
export const Markdown: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
    <AssistantMessage data-testid='markdown'>
      <AssistantMessageContent>
        <AssistantMessageMarkdown text={WALLY_ANSWER} />
      </AssistantMessageContent>
    </AssistantMessage>
  </CodeSnippetAdapterProvider>
);

/**
 * Pass the whole text so far (a snapshot, never a delta) with `streaming`: only the unfinished
 * tail is repaired, a dangling `**`, a half-typed table header and an empty fence wait a frame,
 * and an open fence stays plain without a copy button until it closes. Finished blocks never
 * re-render. Here a timer grows the string; press Replay to stream it again.
 */
export const MarkdownStreaming: StoryFn<typeof meta> = () => {
  const [length, setLength] = useState(0);
  const streaming = length < WALLY_ANSWER.length;

  useEffect(() => {
    if (length >= WALLY_ANSWER.length) return;
    const id = setTimeout(() => setLength(Math.min(length + 6, WALLY_ANSWER.length)), 40);
    return () => clearTimeout(id);
  }, [length]);

  const handleClick = () => {
    setLength(0);
  };

  return (
    <div className='flex flex-col items-start gap-16'>
      <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
        <AssistantMessage data-testid='markdown-streaming' aria-busy={streaming}>
          <AssistantMessageContent>
            <AssistantMessageMarkdown text={WALLY_ANSWER.slice(0, length)} streaming={streaming} />
          </AssistantMessageContent>
        </AssistantMessage>
      </CodeSnippetAdapterProvider>
      <Button
        variant='outline'
        color='neutral'
        size='small'
        disabled={streaming}
        data-testid='markdown-streaming--replay'
        onClick={handleClick}
      >
        <RefreshCcw />
        Replay
      </Button>
    </div>
  );
};

/**
 * `variant='chain-of-thought'` for reasoning inside a `ChainOfThoughtStep` (Figma 494:4292): the
 * step body sets the 12/16 muted text, inline code is muted and not copyable, links are 12px.
 */
export const MarkdownInChainOfThought: StoryFn<typeof meta> = () => (
  <AssistantMessage data-testid='cot-markdown'>
    <ChainOfThought>
      <ChainOfThoughtStep label='Thought for 5s' icon={<Brain />} defaultOpen>
        <AssistantMessageMarkdown variant='chain-of-thought' text={COT_TEXT} />
      </ChainOfThoughtStep>
    </ChainOfThought>
  </AssistantMessage>
);

/**
 * Assistant text is untrusted (prompt injection). Raw HTML shows as typed (only `<br>` breaks a
 * line), `javascript:`/`data:`/`vbscript:`/`file:` links render as plain text, and images show
 * only their alt text, so no tracking pixel loads.
 */
export const MarkdownUnsafeContent: StoryFn<typeof meta> = () => (
  <AssistantMessage data-testid='unsafe-markdown'>
    <AssistantMessageContent>
      <AssistantMessageMarkdown text={HOSTILE} />
    </AssistantMessageContent>
  </AssistantMessage>
);

/** Module scope: a new map on every render would re-render every block. */
const MARKDOWN_COMPONENTS: Partial<AssistantMessageMarkdownComponents> = {
  a: props => <AssistantMessageMarkdownLink {...props} data-analytics-id='wally.answer.link' />,
  img: ({ src, alt }) =>
    new URL(src, window.location.href).origin === window.location.origin ? (
      <img src={src} alt={alt} className='size-32' />
    ) : (
      alt
    ),
};

/**
 * `components` overrides any element at module scope; wrap the exported parts
 * (`AssistantMessageMarkdownLink`, `…InlineCode`, `…CodeBlock`, `…Table`) to add analytics
 * attributes to the real nodes. Here every link gets a `data-analytics-id`, and images render
 * only from the app's own origin — the app owns that decision.
 */
export const MarkdownCustomElements: StoryFn<typeof meta> = () => (
  <AssistantMessage data-testid='custom-markdown'>
    <AssistantMessageContent>
      <AssistantMessageMarkdown
        components={MARKDOWN_COMPONENTS}
        text={
          'Read the [rule guide](https://docs.wallarm.com/user-guides/rules/) first.\n\n![Wallarm logo](./favicon.svg)\n\n![tracker](https://evil.example/p.gif)'
        }
      />
    </AssistantMessageContent>
  </AssistantMessage>
);

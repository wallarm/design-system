import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { ApprovalCard, ApprovalCardActions, ApprovalCardContent } from '.';
import { ChevronDown } from '../../icons';
import { Button } from '../Button';
import { CodeSnippetCode, CodeSnippetContent, CodeSnippetRoot } from '../CodeSnippet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { SplitButton } from '../SplitButton';

const DESCRIPTION = [
  'Asks the user to approve an action Wally wants to take — a tool call, a config change — before it runs.',
  'While `status` is `pending` the card shows its children (`ApprovalCardContent` and `ApprovalCardActions`); once the app sets `approved` or `rejected`, the children are replaced by a one-line status, so the buttons need no gating of their own.',
  'The card has no outer margins or horizontal padding: the panel gutter (`ChatBody` / `ChatFooter`) places it, whether it sits inline in the conversation or docked above the input.',
  'Buttons are plain DS components composed by the app, which also owns loading — disable them while the request is in flight.',
].join(' ');

const meta = {
  title: 'AI/ApprovalCard',
  component: ApprovalCard,
  subcomponents: { ApprovalCardContent, ApprovalCardActions },
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  decorators: [
    Story => (
      <div className='w-[440px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ApprovalCard>;

export default meta;

/** The default ask: what Wally wants to do, then the split approve button and Reject. */
export const Pending: StoryFn<typeof meta> = () => (
  <ApprovalCard data-testid='approval-card'>
    <ApprovalCardContent>Add 203.0.113.42 to the denylist on all applications</ApprovalCardContent>
    <ApprovalCardActions>
      <DropdownMenu positioning={{ placement: 'bottom-end' }}>
        <SplitButton>
          <Button>Always allow in this session</Button>
          <DropdownMenuTrigger asChild>
            <Button aria-label='More approval options' data-testid='approval-card-more'>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
        </SplitButton>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid='approval-card-allow-once'>Allow once</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant='secondary' color='neutral'>
        Reject
      </Button>
    </ApprovalCardActions>
  </ApprovalCard>
);

/** Long text wraps, and unbroken strings such as URLs break rather than overflow the card. */
export const PendingLongText: StoryFn<typeof meta> = () => (
  <ApprovalCard data-testid='approval-card'>
    <ApprovalCardContent>
      Disable the rule "Block SQL injection attempts" for the application "Payments API" and
      redeploy the policy to every node in the eu-west-1 cluster. Affected endpoint:
      https://payments.example.com/api/v2/transactions/refunds/batch-processing/callbacks
    </ApprovalCardContent>
    <ApprovalCardActions>
      <DropdownMenu positioning={{ placement: 'bottom-end' }}>
        <SplitButton>
          <Button>Always allow in this session</Button>
          <DropdownMenuTrigger asChild>
            <Button aria-label='More approval options' data-testid='approval-card-more'>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
        </SplitButton>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid='approval-card-allow-once'>Allow once</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant='secondary' color='neutral'>
        Reject
      </Button>
    </ApprovalCardActions>
  </ApprovalCard>
);

/** Arguments the user should read verbatim go in a `CodeSnippet`, 8px under the text. */
export const PendingWithCodeSnippet: StoryFn<typeof meta> = () => (
  <ApprovalCard data-testid='approval-card'>
    <ApprovalCardContent>
      <p>Run this command on the node:</p>
      <CodeSnippetRoot
        code='wallarm-cli rules disable --id 4021 --app payments-api'
        language='bash'
      >
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </ApprovalCardContent>
    <ApprovalCardActions>
      <DropdownMenu positioning={{ placement: 'bottom-end' }}>
        <SplitButton>
          <Button>Always allow in this session</Button>
          <DropdownMenuTrigger asChild>
            <Button aria-label='More approval options' data-testid='approval-card-more'>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
        </SplitButton>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid='approval-card-allow-once'>Allow once</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant='secondary' color='neutral'>
        Reject
      </Button>
    </ApprovalCardActions>
  </ApprovalCard>
);

/** The chevron half of the split button opens the narrower "Allow once" option. */
export const AllowOnceMenu: StoryFn<typeof meta> = () => (
  <ApprovalCard data-testid='approval-card'>
    <ApprovalCardContent>Add 203.0.113.42 to the denylist on all applications</ApprovalCardContent>
    <ApprovalCardActions>
      <DropdownMenu positioning={{ placement: 'bottom-end' }} defaultOpen>
        <SplitButton>
          <Button>Always allow in this session</Button>
          <DropdownMenuTrigger asChild>
            <Button aria-label='More approval options' data-testid='approval-card-more'>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
        </SplitButton>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid='approval-card-allow-once'>Allow once</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant='secondary' color='neutral'>
        Reject
      </Button>
    </ApprovalCardActions>
  </ApprovalCard>
);

/** There is no loading variant: while the decision is being sent, the app disables its own buttons. */
export const Loading: StoryFn<typeof meta> = () => (
  <ApprovalCard data-testid='approval-card'>
    <ApprovalCardContent>Add 203.0.113.42 to the denylist on all applications</ApprovalCardContent>
    <ApprovalCardActions>
      <DropdownMenu positioning={{ placement: 'bottom-end' }}>
        <SplitButton>
          <Button disabled>Always allow in this session</Button>
          <DropdownMenuTrigger asChild>
            <Button aria-label='More approval options' data-testid='approval-card-more' disabled>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
        </SplitButton>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid='approval-card-allow-once'>Allow once</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant='secondary' color='neutral' disabled>
        Reject
      </Button>
    </ApprovalCardActions>
  </ApprovalCard>
);

/**
 * After approval the content and buttons collapse into a status row; the caption stays. The
 * children are kept on purpose: the app renders the same tree and only flips `status`.
 */
export const Approved: StoryFn<typeof meta> = () => (
  <ApprovalCard data-testid='approval-card' status='approved'>
    <ApprovalCardContent>Add 203.0.113.42 to the denylist on all applications</ApprovalCardContent>
    <ApprovalCardActions>
      <DropdownMenu positioning={{ placement: 'bottom-end' }}>
        <SplitButton>
          <Button>Always allow in this session</Button>
          <DropdownMenuTrigger asChild>
            <Button aria-label='More approval options'>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
        </SplitButton>
        <DropdownMenuContent>
          <DropdownMenuItem>Allow once</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant='secondary' color='neutral'>
        Reject
      </Button>
    </ApprovalCardActions>
  </ApprovalCard>
);

/**
 * The rejected status row. `rejectedLabel` (like `approvedLabel` and `caption`) is a prop, so
 * the app can say what was rejected.
 */
export const Rejected: StoryFn<typeof meta> = () => (
  <ApprovalCard
    data-testid='approval-card'
    status='rejected'
    rejectedLabel='Denylist change rejected'
  >
    <ApprovalCardContent>Add 203.0.113.42 to the denylist on all applications</ApprovalCardContent>
    <ApprovalCardActions>
      <DropdownMenu positioning={{ placement: 'bottom-end' }}>
        <SplitButton>
          <Button>Always allow in this session</Button>
          <DropdownMenuTrigger asChild>
            <Button aria-label='More approval options'>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
        </SplitButton>
        <DropdownMenuContent>
          <DropdownMenuItem>Allow once</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant='secondary' color='neutral'>
        Reject
      </Button>
    </ApprovalCardActions>
  </ApprovalCard>
);

/**
 * Analytics attributes go on the composed DS buttons themselves — the card adds no seam of
 * its own, so each `data-analytics-id` lands on the real `<button>`.
 */
export const Analytics: StoryFn<typeof meta> = () => (
  <ApprovalCard data-testid='approval-card' data-analytics-id='AI_APPROVAL_CARD'>
    <ApprovalCardContent>Add 203.0.113.42 to the denylist on all applications</ApprovalCardContent>
    <ApprovalCardActions>
      <DropdownMenu positioning={{ placement: 'bottom-end' }}>
        <SplitButton>
          <Button data-analytics-id='AI_APPROVAL_ALLOW_SESSION'>
            Always allow in this session
          </Button>
          <DropdownMenuTrigger asChild>
            <Button aria-label='More approval options' data-analytics-id='AI_APPROVAL_MORE'>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
        </SplitButton>
        <DropdownMenuContent>
          <DropdownMenuItem data-analytics-id='AI_APPROVAL_ALLOW_ONCE'>Allow once</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant='secondary' color='neutral' data-analytics-id='AI_APPROVAL_REJECT'>
        Reject
      </Button>
    </ApprovalCardActions>
  </ApprovalCard>
);

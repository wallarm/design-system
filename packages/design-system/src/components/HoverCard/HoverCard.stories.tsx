import { useId } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Zap } from '../../icons';
import { AgentAvatar } from '../AgentAvatar';
import { Attribute, AttributeLabel, AttributeValue } from '../Attribute';
import { AgentItem, Avatar, AvatarContent, AvatarFallback, AvatarName } from '../Avatar';
import { Badge } from '../Badge';
import { FormatDateTime } from '../FormatDateTime';
import { Link } from '../Link';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { Separator } from '../Separator';
import { Skeleton } from '../Skeleton';
import { HStack } from '../Stack';
import { Table, type TableColumnDef } from '../Table';
import { Tag } from '../Tag';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { HoverCard } from './HoverCard';
import { HoverCardAction } from './HoverCardAction';
import { HoverCardContent } from './HoverCardContent';
import { HoverCardDescription } from './HoverCardDescription';
import { HoverCardHeader } from './HoverCardHeader';
import { HoverCardTitle } from './HoverCardTitle';
import { HoverCardTrigger } from './HoverCardTrigger';

const DESCRIPTION = [
  'A preview of a person or an agent, opened by resting on their name: media, the name, a status badge, a subtitle, a few facts and at most one action. It opens after 600 ms and stays while the pointer is on it.',
  'Use it in read contexts only — tables, attributes, the timeline and history. Never in a menu, a select or a filter, where hovering a name is choosing it.',
  'The card is supplementary. Focus never moves into it, so its links and its action are out of keyboard reach: never put the only path to an action or a fact in the card. The action goes where the name goes, and every row link also exists at that destination. A card with an action of its own needs a `Popover`.',
  'One action at most, as `HoverCardAction`. The product leaves out a row that does not apply (Approvals for agents that never ask) and the action when the viewer lacks the permission. A row that applies but is empty passes `isEmpty` and shows the em dash; never write "None".',
  'Fetch inside the content: it mounts only when the card opens, so a data component in `HoverCardContent` fetches on open with no `open` wiring. While it loads, keep the known name and the row labels, and skeleton only the values.',
  'On an element that already has a `Tooltip`, nest `HoverCardTrigger` and `TooltipTrigger asChild` on it and pass the same `ids.trigger` to `HoverCard` and `Tooltip`. Tooltips outside the content close while the card is up, so neither needs `open` wiring.',
  "`data-analytics-id` goes on the trigger's child — the real link or button — on `HoverCardAction`, and on each row `Link`. The card adds no seam of its own.",
  "The DS has no status mapping; pass a `Badge variant='dotted' type='secondary'`. People: Active green, Invited blue, Invite expired w-orange, Deactivated gray. Agents: On duty green, Working blue, Needs you amber, Failed red, Deactivated and Not set up gray, Inviting blue.",
].join('\n\n');

const meta = {
  title: 'Overlay/HoverCard',
  component: HoverCard,
  subcomponents: {
    HoverCardTrigger,
    HoverCardContent,
    HoverCardHeader,
    HoverCardTitle,
    HoverCardDescription,
    HoverCardAction,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof HoverCard>;

export default meta;

// Relative to the story's load, so "1 week ago" stays the same in every screenshot.
const WEEK_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

/**
 * An agent, from the timeline or history: the live character with no plate, the name in pixel
 * type, how it runs, its latest run and its pending approvals.
 */
export const Agent: StoryFn<typeof meta> = () => {
  return (
    <HoverCard data-testid='agent-card'>
      <AgentItem agent='radar' size={20}>
        <AvatarContent>
          <AvatarName>
            <HoverCardTrigger data-testid='agent-card--trigger'>
              <Link href='#' size='md'>
                Radar
              </Link>
            </HoverCardTrigger>
          </AvatarName>
        </AvatarContent>
      </AgentItem>
      <HoverCardContent>
        <HoverCardHeader>
          <AgentAvatar agent='radar' size={56} state='working' live seed='radar' />
          <HoverCardTitle variant='agent'>Radar</HoverCardTitle>
          <Badge variant='dotted' type='secondary' color='blue'>
            Working
          </Badge>
          <HoverCardDescription>Anomaly Investigation Agent</HoverCardDescription>
        </HoverCardHeader>
        <Separator spacing={6} />
        <Attribute orientation='horizontal' data-testid='agent-card--runs'>
          <AttributeLabel>Runs</AttributeLabel>
          <AttributeValue>
            <HStack gap={4} wrap='wrap' className='min-w-0'>
              <Tag>
                <Zap />
                On attack spikes
              </Tag>
            </HStack>
          </AttributeValue>
        </Attribute>
        <Attribute orientation='horizontal' data-testid='agent-card--latest-run'>
          <AttributeLabel>Latest run</AttributeLabel>
          <AttributeValue>
            <Link href='#' size='md'>
              Run at 00:00
            </Link>
          </AttributeValue>
        </Attribute>
        <Attribute orientation='horizontal' data-testid='agent-card--approvals'>
          <AttributeLabel>Approvals</AttributeLabel>
          <AttributeValue>
            <Link href='#' size='md'>
              5 pending
            </Link>
          </AttributeValue>
        </Attribute>
        <HoverCardAction asChild>
          <a href='/agents/radar'>View agent</a>
        </HoverCardAction>
      </HoverCardContent>
    </HoverCard>
  );
};

/**
 * A person: the 56 px plate and the name in Geist, their email, roles and when they were last
 * active — the exact time is in the tooltip.
 */
export const User: StoryFn<typeof meta> = () => {
  const handleOpenUser = fn();

  return (
    <HoverCard data-testid='user-card'>
      <Avatar size='sm'>
        <AvatarFallback name='Artem Miskevich' />
        <AvatarContent>
          <AvatarName>
            <HoverCardTrigger data-testid='user-card--trigger'>
              <Link href='#' size='md'>
                Artem Miskevich
              </Link>
            </HoverCardTrigger>
          </AvatarName>
        </AvatarContent>
      </Avatar>
      <HoverCardContent>
        <HoverCardHeader>
          <Avatar size='xl'>
            <AvatarFallback name='Artem Miskevich' />
          </Avatar>
          <HoverCardTitle>Artem Miskevich</HoverCardTitle>
          <Badge variant='dotted' type='secondary' color='green'>
            Active
          </Badge>
          <HoverCardDescription>amiskevich@wallarm.com</HoverCardDescription>
        </HoverCardHeader>
        <Separator spacing={6} />
        <Attribute orientation='horizontal' data-testid='user-card--roles'>
          <AttributeLabel>Roles</AttributeLabel>
          <AttributeValue>
            <HStack gap={4} wrap='wrap' className='min-w-0'>
              <Tag>Admin</Tag>
              <Tag>temp-role</Tag>
            </HStack>
          </AttributeValue>
        </Attribute>
        <Attribute orientation='horizontal' data-testid='user-card--last-active'>
          <AttributeLabel>Last active</AttributeLabel>
          <AttributeValue>
            <FormatDateTime value={WEEK_AGO} format='relative' />
          </AttributeValue>
        </Attribute>
        <HoverCardAction onClick={handleOpenUser}>View user</HoverCardAction>
      </HoverCardContent>
    </HoverCard>
  );
};

/**
 * What the product leaves out. Lens never asks for approval, so it has no Approvals row, and a
 * viewer without access to agents gets no action. Rest on the name to open it.
 */
export const WithoutAction: StoryFn<typeof meta> = () => (
  <HoverCard data-testid='lens-card'>
    <AgentItem agent='lens' size={20}>
      <AvatarContent>
        <AvatarName>
          <HoverCardTrigger data-testid='lens-card--trigger'>
            <Link href='#' size='md'>
              Lens
            </Link>
          </HoverCardTrigger>
        </AvatarName>
      </AvatarContent>
    </AgentItem>
    <HoverCardContent>
      <HoverCardHeader>
        <AgentAvatar agent='lens' size={56} state='idle' live seed='lens' />
        <HoverCardTitle variant='agent'>Lens</HoverCardTitle>
        <Badge variant='dotted' type='secondary' color='green'>
          On duty
        </Badge>
        <HoverCardDescription>API Inventory Reviewer</HoverCardDescription>
      </HoverCardHeader>
      <Separator spacing={6} />
      <Attribute orientation='horizontal' data-testid='lens-card--runs'>
        <AttributeLabel>Runs</AttributeLabel>
        <AttributeValue>
          <HStack gap={4} wrap='wrap' className='min-w-0'>
            <Tag>Every day at 09:00</Tag>
          </HStack>
        </AttributeValue>
      </Attribute>
      <Attribute orientation='horizontal' isEmpty data-testid='lens-card--latest-run'>
        <AttributeLabel>Latest run</AttributeLabel>
        <AttributeValue />
      </Attribute>
    </HoverCardContent>
  </HoverCard>
);

/**
 * While the product fetches: the known name and the real row labels stay, and only the values
 * are skeletons, so the card keeps its shape. No action until the permission is known.
 */
export const Loading: StoryFn<typeof meta> = () => {
  return (
    <HoverCard data-testid='loading-card'>
      <Avatar size='sm'>
        <AvatarFallback name='Artem Miskevich' />
        <AvatarContent>
          <AvatarName>
            <HoverCardTrigger data-testid='loading-card--trigger'>
              <Link href='#' size='md'>
                Artem Miskevich
              </Link>
            </HoverCardTrigger>
          </AvatarName>
        </AvatarContent>
      </Avatar>
      <HoverCardContent>
        <HoverCardHeader>
          <Skeleton width='56px' height='56px' rounded={16} />
          <HoverCardTitle>Artem Miskevich</HoverCardTitle>
          <HoverCardDescription>
            <Skeleton width='160px' height='16px' />
          </HoverCardDescription>
        </HoverCardHeader>
        <Separator spacing={6} />
        <Attribute orientation='horizontal'>
          <AttributeLabel>Roles</AttributeLabel>
          <AttributeValue>
            <Skeleton width='100%' height='16px' />
          </AttributeValue>
        </Attribute>
        <Attribute orientation='horizontal'>
          <AttributeLabel>Last active</AttributeLabel>
          <AttributeValue>
            <Skeleton width='100%' height='16px' />
          </AttributeValue>
        </Attribute>
      </HoverCardContent>
    </HoverCard>
  );
};

/**
 * A deleted person or a failed fetch: the header alone, with the known name and the product's
 * reason. No separator, rows or action.
 */
export const Unavailable: StoryFn<typeof meta> = () => {
  return (
    <HoverCard data-testid='unavailable-card'>
      <Avatar size='sm'>
        <AvatarFallback />
        <AvatarContent>
          <AvatarName>
            <HoverCardTrigger data-testid='unavailable-card--trigger'>
              <Link href='#' size='md'>
                Former Employee
              </Link>
            </HoverCardTrigger>
          </AvatarName>
        </AvatarContent>
      </Avatar>
      <HoverCardContent>
        <HoverCardHeader>
          <Avatar size='xl'>
            <AvatarFallback />
          </Avatar>
          <HoverCardTitle>Former Employee</HoverCardTitle>
          <HoverCardDescription>No longer available</HoverCardDescription>
        </HoverCardHeader>
      </HoverCardContent>
    </HoverCard>
  );
};

const LONG_ROLES = [
  'Admin',
  'temp-role',
  'Security analyst',
  'API inventory viewer',
  'Read-only auditor',
];

/**
 * The card never grows past 320 px. The name and the email end with "…" and show in full in a
 * tooltip, tags wrap, and a plain string value takes the `OverflowTooltip` recipe.
 */
export const LongValues: StoryFn<typeof meta> = () => {
  return (
    <HoverCard data-testid='long-card'>
      <Avatar size='sm'>
        <AvatarFallback name='Konstantin Aleksandrovich Konstantinopolsky' />
        <AvatarContent>
          <AvatarName>
            <HoverCardTrigger data-testid='long-card--trigger'>
              <Link href='#' size='md'>
                Konstantin Aleksandrovich Konstantinopolsky
              </Link>
            </HoverCardTrigger>
          </AvatarName>
        </AvatarContent>
      </Avatar>
      <HoverCardContent>
        <HoverCardHeader>
          <Avatar size='xl'>
            <AvatarFallback name='Konstantin Aleksandrovich Konstantinopolsky' />
          </Avatar>
          <HoverCardTitle>Konstantin Aleksandrovich Konstantinopolsky</HoverCardTitle>
          <Badge variant='dotted' type='secondary' color='w-orange'>
            Invite expired
          </Badge>
          <HoverCardDescription>
            konstantin.aleksandrovich.konstantinopolsky@security-operations.example.com
          </HoverCardDescription>
        </HoverCardHeader>
        <Separator spacing={6} />
        <Attribute orientation='horizontal' data-testid='long-card--roles'>
          <AttributeLabel>Roles</AttributeLabel>
          <AttributeValue>
            <HStack gap={4} wrap='wrap' className='min-w-0'>
              {LONG_ROLES.map(role => (
                <Tag key={role}>{role}</Tag>
              ))}
            </HStack>
          </AttributeValue>
        </Attribute>
        <Attribute orientation='horizontal' data-testid='long-card--team'>
          <AttributeLabel>Team</AttributeLabel>
          <AttributeValue>
            <OverflowTooltip>
              <OverflowTooltipTrigger>
                <span className='truncate'>Security Operations Center, EMEA night shift</span>
              </OverflowTooltipTrigger>
              <OverflowTooltipContent>
                Security Operations Center, EMEA night shift
              </OverflowTooltipContent>
            </OverflowTooltip>
          </AttributeValue>
        </Attribute>
        <Attribute orientation='horizontal' data-testid='long-card--last-active'>
          <AttributeLabel>Last active</AttributeLabel>
          <AttributeValue>
            <FormatDateTime value={WEEK_AGO} format='relative' />
          </AttributeValue>
        </Attribute>
        <HoverCardAction>View user</HoverCardAction>
      </HoverCardContent>
    </HoverCard>
  );
};

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
}

const USERS: UserRow[] = [
  { id: '1', name: 'Artem Miskevich', email: 'amiskevich@wallarm.com', role: 'Admin' },
  { id: '2', name: 'Maria Petrova', email: 'mpetrova@wallarm.com', role: 'Analyst' },
  { id: '3', name: 'John Carter', email: 'jcarter@wallarm.com', role: 'Read only' },
  {
    id: '4',
    name: 'Konstantin Aleksandrovich Konstantinopolsky',
    email: 'konstantin.aleksandrovich.konstantinopolsky@security-operations.example.com',
    role: 'Security analyst',
  },
];

/**
 * A name cell, as in the users table. The cell forces its direct child to block, so the card sits
 * in a `<span>`, and only `HoverCardTrigger` goes inside `AvatarName` — `AvatarName` renders its
 * children again in its own tooltip. The name is a button that opens the user. The last name is
 * truncated: its tooltip repeats the trigger, so that copy shares the trigger's id and test id —
 * a known limitation until `AvatarName` can show plain text in its tooltip.
 */
export const InTable: StoryFn<typeof meta> = () => {
  const handleOpenUser = fn();

  const getRowId = (user: UserRow) => user.id;

  const columns: TableColumnDef<UserRow>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      size: 240,
      cell: ({ row }) => (
        <span>
          <HoverCard data-testid={`user-card-${row.id}`}>
            <Avatar size='sm' data-testid={`user-row-${row.id}`}>
              <AvatarFallback name={row.original.name} />
              <AvatarContent>
                <AvatarName>
                  <HoverCardTrigger data-testid={`user-card-${row.id}--trigger`}>
                    <Link type='table' size='md' asChild>
                      <button type='button' onClick={handleOpenUser}>
                        {row.original.name}
                      </button>
                    </Link>
                  </HoverCardTrigger>
                </AvatarName>
              </AvatarContent>
            </Avatar>
            <HoverCardContent>
              <HoverCardHeader>
                <Avatar size='xl'>
                  <AvatarFallback name={row.original.name} />
                </Avatar>
                <HoverCardTitle>{row.original.name}</HoverCardTitle>
                <Badge variant='dotted' type='secondary' color='green'>
                  Active
                </Badge>
                <HoverCardDescription>{row.original.email}</HoverCardDescription>
              </HoverCardHeader>
              <Separator spacing={6} />
              <Attribute orientation='horizontal' data-testid={`user-card-${row.id}--roles`}>
                <AttributeLabel>Roles</AttributeLabel>
                <AttributeValue>
                  <HStack gap={4} wrap='wrap' className='min-w-0'>
                    <Tag>{row.original.role}</Tag>
                  </HStack>
                </AttributeValue>
              </Attribute>
              <Attribute orientation='horizontal' data-testid={`user-card-${row.id}--last-active`}>
                <AttributeLabel>Last active</AttributeLabel>
                <AttributeValue>
                  <FormatDateTime value={WEEK_AGO} format='relative' />
                </AttributeValue>
              </Attribute>
              <HoverCardAction onClick={handleOpenUser}>View user</HoverCardAction>
            </HoverCardContent>
          </HoverCard>
        </span>
      ),
    },
    { accessorKey: 'email', header: 'Email', size: 240 },
    { accessorKey: 'role', header: 'Role', size: 160 },
  ];

  return (
    <Table
      aria-label='Users'
      data={USERS}
      columns={columns}
      getRowId={getRowId}
      data-testid='users-table'
    />
  );
};

/**
 * A trigger that already has a tooltip. Nest the two asChild triggers on the one element and give
 * both roots the same `ids.trigger`, so each machine finds it. The tooltip shows first; when the
 * card opens the tooltip closes at once and stays off while the card is up, with no `open`
 * wiring.
 */
export const WithTooltip: StoryFn<typeof meta> = () => {
  const triggerId = useId();
  const handleOpenUser = fn();

  return (
    <HoverCard data-testid='tooltip-card' ids={{ trigger: triggerId }}>
      <Tooltip data-testid='tooltip-card-tooltip' ids={{ trigger: triggerId }}>
        <HoverCardTrigger data-testid='tooltip-card--trigger'>
          <TooltipTrigger asChild>
            <Link href='#' size='md'>
              Artem Miskevich
            </Link>
          </TooltipTrigger>
        </HoverCardTrigger>
        <TooltipContent>Signed in 5 minutes ago</TooltipContent>
      </Tooltip>
      <HoverCardContent>
        <HoverCardHeader>
          <Avatar size='xl'>
            <AvatarFallback name='Artem Miskevich' />
          </Avatar>
          <HoverCardTitle>Artem Miskevich</HoverCardTitle>
          <Badge variant='dotted' type='secondary' color='green'>
            Active
          </Badge>
          <HoverCardDescription>amiskevich@wallarm.com</HoverCardDescription>
        </HoverCardHeader>
        <HoverCardAction onClick={handleOpenUser}>View user</HoverCardAction>
      </HoverCardContent>
    </HoverCard>
  );
};

/**
 * Analytics attributes go on the elements themselves: the trigger's child, each row `Link` and
 * `HoverCardAction`. The card adds no seam of its own, so each `data-analytics-id` lands on the
 * real `<a>` or `<button>`.
 */
export const Analytics: StoryFn<typeof meta> = () => (
  <HoverCard data-testid='analytics-card'>
    <AgentItem agent='radar' size={20}>
      <AvatarContent>
        <AvatarName>
          <HoverCardTrigger data-testid='analytics-card--trigger'>
            <Link href='#' size='md' data-analytics-id='history.agent'>
              Radar
            </Link>
          </HoverCardTrigger>
        </AvatarName>
      </AvatarContent>
    </AgentItem>
    <HoverCardContent>
      <HoverCardHeader>
        <AgentAvatar agent='radar' size={56} state='working' live seed='radar' />
        <HoverCardTitle variant='agent'>Radar</HoverCardTitle>
        <Badge variant='dotted' type='secondary' color='blue'>
          Working
        </Badge>
        <HoverCardDescription>Anomaly Investigation Agent</HoverCardDescription>
      </HoverCardHeader>
      <Separator spacing={6} />
      <Attribute orientation='horizontal' data-testid='analytics-card--latest-run'>
        <AttributeLabel>Latest run</AttributeLabel>
        <AttributeValue>
          <Link href='#' size='md' data-analytics-id='agent-card.latest-run'>
            Run at 00:00
          </Link>
        </AttributeValue>
      </Attribute>
      <HoverCardAction asChild data-analytics-id='agent-card.view'>
        <a href='/agents/radar'>View agent</a>
      </HoverCardAction>
    </HoverCardContent>
  </HoverCard>
);

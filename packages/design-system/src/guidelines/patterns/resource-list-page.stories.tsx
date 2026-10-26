import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { fn } from 'storybook/test';
import {
  Avatar,
  AvatarContent,
  AvatarDescription,
  AvatarFallback,
  AvatarName,
} from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemText,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateMessage,
  EmptyStateTitle,
} from '../../components/EmptyState';
import { FormatDateTime } from '../../components/FormatDateTime';
import { NumericBadge } from '../../components/NumericBadge';
import {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderGroup,
  PageTitle,
  PageToolbar,
} from '../../components/Page';
import { SearchInput } from '../../components/SearchInput';
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from '../../components/SegmentedTabs';
import type { TableCellContext, TableColumnDef, TableRow } from '../../components/Table';
import { Table, TableEmptyState } from '../../components/Table';
import { Ellipsis, FilterX, SearchX, Users } from '../../icons';

type UserStatus = 'active' | 'invited' | 'deactivated';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  lastSignIn: string | null;
}

const USERS: User[] = [
  {
    id: 'u-1042',
    name: 'Maria Lopez',
    email: 'maria.lopez@acme-bank.com',
    role: 'Administrator',
    status: 'active',
    lastSignIn: '2026-11-04T12:10:00Z',
  },
  {
    id: 'u-1043',
    name: 'Daniel Okafor',
    email: 'daniel.okafor@acme-bank.com',
    role: 'Security analyst',
    status: 'active',
    lastSignIn: '2026-11-03T12:40:00Z',
  },
  {
    id: 'u-1051',
    name: 'Priya Raman',
    email: 'priya.raman@acme-bank.com',
    role: 'Security analyst',
    status: 'invited',
    lastSignIn: null,
  },
  {
    id: 'u-1058',
    name: 'Tomás Herrera',
    email: 'tomas.herrera@acme-bank.com',
    role: 'Deploy',
    status: 'active',
    lastSignIn: '2026-10-29T12:05:00Z',
  },
  {
    id: 'u-1060',
    name: 'Anna Schmidt',
    email: 'anna.schmidt@acme-bank.com',
    role: 'Read only',
    status: 'deactivated',
    lastSignIn: '2026-08-14T12:30:00Z',
  },
  {
    id: 'u-1064',
    name: 'Kenji Watanabe',
    email: 'kenji.watanabe@acme-bank.com',
    role: 'API developer',
    status: 'invited',
    lastSignIn: null,
  },
];

const onCreateUser = fn().mockName('onCreateUser');
const onEditUser = fn().mockName('onEditUser');
const onDeactivateUser = fn().mockName('onDeactivateUser');
const onDeleteUser = fn().mockName('onDeleteUser');

const getUserId = (user: User) => user.id;

const meta = {
  title: 'Patterns/Resource list page',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when building a page that lists one kind of entity (users, roles, SSO providers, channels) with a create action, search, status tabs and a table.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * The whole page: title, description and one create action in the header; search
 * and status tabs with counts in the toolbar; a user table with a status badge and a
 * row menu in the master cell. Search and tabs filter the rows.
 */
export const Default: StoryFn = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const STATUS = {
    active: { label: 'Active', color: 'green' },
    invited: { label: 'Invited', color: 'yellow' },
    deactivated: { label: 'Deactivated', color: 'gray' },
  } as const;

  const renderUser = ({ row }: TableCellContext<User, unknown>) => (
    <Avatar size='md'>
      <AvatarFallback name={row.original.name} />
      <AvatarContent>
        <AvatarName>{row.original.name}</AvatarName>
        <AvatarDescription>{row.original.email}</AvatarDescription>
      </AvatarContent>
    </Avatar>
  );

  const renderStatus = ({ row }: TableCellContext<User, unknown>) => (
    <Badge variant='dotted' type='secondary' color={STATUS[row.original.status].color}>
      {STATUS[row.original.status].label}
    </Badge>
  );

  const renderLastSignIn = ({ row }: TableCellContext<User, unknown>) => (
    <FormatDateTime value={row.original.lastSignIn} format='date' />
  );

  const renderMenuAction = (row: TableRow<User>) => {
    const user = row.original;
    const handleEdit = () => onEditUser(user);
    const handleDeactivate = () => onDeactivateUser(user);
    const handleDelete = () => onDeleteUser(user);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            aria-label={`Actions for ${user.name}`}
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleEdit}>
            <DropdownMenuItemText>Edit</DropdownMenuItemText>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleDeactivate}>
            <DropdownMenuItemText>Deactivate</DropdownMenuItemText>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onSelect={handleDelete}>
            <DropdownMenuItemText>Delete user</DropdownMenuItemText>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const columns: TableColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      size: 320,
      cell: renderUser,
      meta: { renderMenuAction },
    },
    { accessorKey: 'role', header: 'Role', size: 200 },
    { accessorKey: 'status', header: 'Status', size: 140, cell: renderStatus },
    { accessorKey: 'lastSignIn', header: 'Last sign-in', size: 200, cell: renderLastSignIn },
  ];

  const search = query.trim().toLowerCase();
  const matching = USERS.filter(
    user => user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search),
  );
  const counts = {
    all: matching.length,
    active: matching.filter(user => user.status === 'active').length,
    invited: matching.filter(user => user.status === 'invited').length,
    deactivated: matching.filter(user => user.status === 'deactivated').length,
  };
  const rows = status === 'all' ? matching : matching.filter(user => user.status === status);

  const handleReset = () => {
    setQuery('');
    setStatus('all');
  };

  return (
    <Page name='settings-users' fullSize fixedHeight data-testid='users-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>Users</PageTitle>
          <PageDescription>
            People who can sign in to your organization, with access set by roles and groups.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={onCreateUser} data-testid='users-create'>
            Create user
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or email'
          className='w-[320px]'
          data-testid='users-search'
        />
        <SegmentedTabs value={status} onChange={setStatus} data-testid='users-status-tabs'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>
              All <NumericBadge>{counts.all}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='active'>
              Active <NumericBadge>{counts.active}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='invited'>
              Invited <NumericBadge>{counts.invited}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='deactivated'>
              Deactivated <NumericBadge>{counts.deactivated}</NumericBadge>
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='Users'
          data={rows}
          columns={columns}
          getRowId={getUserId}
          data-testid='users-table'
        >
          <TableEmptyState>
            <EmptyState type='collection-empty' data-testid='users-no-results'>
              <EmptyStateIllustration>
                <SearchX />
              </EmptyStateIllustration>
              <EmptyStateMessage>
                <EmptyStateTitle>No results found</EmptyStateTitle>
                <EmptyStateDescription>No users match your search or status.</EmptyStateDescription>
              </EmptyStateMessage>
              <EmptyStateActions>
                <Button size='medium' variant='outline' color='neutral' onClick={handleReset}>
                  <FilterX />
                  Reset filters
                </Button>
              </EmptyStateActions>
            </EmptyState>
          </TableEmptyState>
        </Table>
      </PageContent>
    </Page>
  );
};

/** The title repeats the last crumb of the product's trail; one create action sits on the right. */
export const Header: StoryFn = () => (
  <Page name='settings-users' data-testid='users-page'>
    <PageHeader>
      <PageHeaderGroup className='flex-1'>
        <PageTitle>Users</PageTitle>
        <PageDescription>
          People who can sign in to your organization, with access set by roles and groups.
        </PageDescription>
      </PageHeaderGroup>
      <PageActions>
        <Button size='medium' onClick={onCreateUser} data-testid='users-create'>
          Create user
        </Button>
      </PageActions>
    </PageHeader>
  </Page>
);

/** Search clears with its built-in button; the tabs filter the one table, with no tab panels. */
export const Toolbar: StoryFn = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const counts = {
    all: USERS.length,
    active: USERS.filter(user => user.status === 'active').length,
    invited: USERS.filter(user => user.status === 'invited').length,
  };

  return (
    <Page name='settings-users' data-testid='users-page'>
      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or email'
          className='w-[320px]'
          data-testid='users-search'
        />
        <SegmentedTabs value={status} onChange={setStatus} data-testid='users-status-tabs'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>
              All <NumericBadge>{counts.all}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='active'>
              Active <NumericBadge>{counts.active}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='invited'>
              Invited <NumericBadge>{counts.invited}</NumericBadge>
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>
    </Page>
  );
};

/**
 * Search or a tab matched nothing: "No results found" with a "Reset filters" button that clears
 * both. The header keeps its one create action; the empty state never adds another, and never
 * uses `type='no-results'` (that is for cards and menus).
 */
export const NoResults: StoryFn = () => {
  const [query, setQuery] = useState('contractor');
  const [status, setStatus] = useState('all');

  const columns: TableColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Name', size: 320 },
    { accessorKey: 'role', header: 'Role', size: 200 },
    { accessorKey: 'status', header: 'Status', size: 140 },
    { accessorKey: 'lastSignIn', header: 'Last sign-in', size: 200 },
  ];

  const search = query.trim().toLowerCase();
  const matching = USERS.filter(
    user => user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search),
  );
  const counts = {
    all: matching.length,
    active: matching.filter(user => user.status === 'active').length,
    invited: matching.filter(user => user.status === 'invited').length,
  };
  const rows = status === 'all' ? matching : matching.filter(user => user.status === status);

  const handleReset = () => {
    setQuery('');
    setStatus('all');
  };

  return (
    <Page name='settings-users' fullSize fixedHeight data-testid='users-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>Users</PageTitle>
          <PageDescription>
            People who can sign in to your organization, with access set by roles and groups.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={onCreateUser} data-testid='users-create'>
            Create user
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or email'
          className='w-[320px]'
          data-testid='users-search'
        />
        <SegmentedTabs value={status} onChange={setStatus} data-testid='users-status-tabs'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>
              All <NumericBadge>{counts.all}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='active'>
              Active <NumericBadge>{counts.active}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='invited'>
              Invited <NumericBadge>{counts.invited}</NumericBadge>
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='Users'
          data={rows}
          columns={columns}
          getRowId={getUserId}
          data-testid='users-table'
        >
          <TableEmptyState>
            <EmptyState type='collection-empty' data-testid='users-no-results'>
              <EmptyStateIllustration>
                <SearchX />
              </EmptyStateIllustration>
              <EmptyStateMessage>
                <EmptyStateTitle>No results found</EmptyStateTitle>
                <EmptyStateDescription>No users match your search or status.</EmptyStateDescription>
              </EmptyStateMessage>
              <EmptyStateActions>
                <Button size='medium' variant='outline' color='neutral' onClick={handleReset}>
                  <FilterX />
                  Reset filters
                </Button>
              </EmptyStateActions>
            </EmptyState>
          </TableEmptyState>
        </Table>
      </PageContent>
    </Page>
  );
};

/**
 * Nothing exists yet: the real header with its create button, the toolbar, and an empty state
 * with no button of its own — one create action per screen.
 */
export const Empty: StoryFn = () => {
  const [query, setQuery] = useState('');

  const columns: TableColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Name', size: 320 },
    { accessorKey: 'role', header: 'Role', size: 200 },
    { accessorKey: 'status', header: 'Status', size: 140 },
    { accessorKey: 'lastSignIn', header: 'Last sign-in', size: 200 },
  ];

  return (
    <Page name='settings-users' fullSize fixedHeight data-testid='users-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>Users</PageTitle>
          <PageDescription>
            People who can sign in to your organization, with access set by roles and groups.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={onCreateUser} data-testid='users-create'>
            Create user
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or email'
          className='w-[320px]'
          data-testid='users-search'
        />
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='Users'
          data={[]}
          columns={columns}
          getRowId={getUserId}
          data-testid='users-table'
        >
          <TableEmptyState>
            <EmptyState type='collection-empty' data-testid='users-empty-state'>
              <EmptyStateIllustration>
                <Users />
              </EmptyStateIllustration>
              <EmptyStateMessage>
                <EmptyStateTitle>No users yet</EmptyStateTitle>
                <EmptyStateDescription>Invite people so they can sign in.</EmptyStateDescription>
              </EmptyStateMessage>
            </EmptyState>
          </TableEmptyState>
        </Table>
      </PageContent>
    </Page>
  );
};

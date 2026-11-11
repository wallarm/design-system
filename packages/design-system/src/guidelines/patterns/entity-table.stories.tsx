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
import { Code } from '../../components/Code';
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
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateMessage,
  EmptyStateTitle,
} from '../../components/EmptyState';
import { FormatDateTime } from '../../components/FormatDateTime';
import { OverflowList } from '../../components/OverflowList';
import { Page, PageContent } from '../../components/Page';
import type {
  TableCellContext,
  TableColumnDef,
  TableRow,
  TableRowSelectionState,
  TableSortingState,
} from '../../components/Table';
import { Table, TableActionBar, TableEmptyState } from '../../components/Table';
import { Tag } from '../../components/Tag';
import { Ellipsis, Trash2, UserPlus } from '../../icons';

type UserStatus = 'active' | 'invited' | 'expired' | 'deactivated';

interface User {
  id: string;
  name: string;
  email: string;
  groups: string[];
  status: UserStatus;
  lastSignIn: string | null;
  requests: number | null;
}

const USERS: User[] = [
  {
    id: 'usr_7f3a91',
    name: 'Maria Lopez',
    email: 'maria.lopez@acme-bank.com',
    groups: ['Administrators', 'SOC', 'API owners'],
    status: 'active',
    lastSignIn: '2026-11-04T09:12:00',
    requests: 1284,
  },
  {
    id: 'usr_2b81c4',
    name: 'Daniel Okafor',
    email: 'daniel.okafor@acme-bank.com',
    groups: ['SOC'],
    status: 'active',
    lastSignIn: '2026-11-03T17:40:00',
    requests: 342,
  },
  {
    id: 'usr_c90d17',
    name: 'Priya Raman',
    email: 'priya.raman@acme-bank.com',
    groups: ['Security analysts', 'Payments API'],
    status: 'invited',
    lastSignIn: null,
    requests: null,
  },
  {
    id: 'usr_5e62af',
    name: 'Tomás Herrera',
    email: 'tomas.herrera@acme-bank.com',
    groups: ['Deploy', 'CI tokens', 'Node operators', 'Payments API'],
    status: 'active',
    lastSignIn: '2026-10-29T11:05:00',
    requests: 9021,
  },
  {
    id: 'usr_81d0e3',
    name: 'Anna Schmidt',
    email: 'anna.schmidt@acme-bank.com',
    groups: [],
    status: 'deactivated',
    lastSignIn: '2026-08-14T08:30:00',
    requests: null,
  },
  {
    id: 'usr_f4a2b8',
    name: 'Kenji Watanabe',
    email: 'kenji.watanabe@acme-bank.com',
    groups: ['API owners'],
    status: 'expired',
    lastSignIn: null,
    requests: null,
  },
];

const onEditUser = fn().mockName('onEditUser');
const onResendInvite = fn().mockName('onResendInvite');
const onDeactivateUser = fn().mockName('onDeactivateUser');
const onDeleteUser = fn().mockName('onDeleteUser');
const onAssignGroup = fn().mockName('onAssignGroup');
const onBulkDelete = fn().mockName('onBulkDelete');

const getUserId = (user: User) => user.id;

const meta = {
  title: 'Patterns/Entity table',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when you render a list of users, roles, providers, channels or policies as a Table, with status badges, tags, a row menu and bulk actions.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * Adds an ID in `Code` and an exact time to the `Cells` vocabulary. Sort by any header; select
 * rows to bring up the bulk bar.
 */
export const Default: StoryFn = () => {
  const [sorting, setSorting] = useState<TableSortingState>([]);
  const [selection, setSelection] = useState<TableRowSelectionState>({});

  const STATUS = {
    active: { label: 'Active', color: 'green' },
    invited: { label: 'Invited', color: 'yellow' },
    expired: { label: 'Expired', color: 'red' },
    deactivated: { label: 'Deactivated', color: 'gray' },
  } as const;

  const renderGroup = (group: string) => <Tag key={group}>{group}</Tag>;

  const renderUser = ({ row }: TableCellContext<User, unknown>) => (
    <Avatar size='md'>
      <AvatarFallback name={row.original.name} />
      <AvatarContent>
        <AvatarName>{row.original.name}</AvatarName>
        <AvatarDescription>{row.original.email}</AvatarDescription>
      </AvatarContent>
    </Avatar>
  );

  const renderId = ({ row }: TableCellContext<User, unknown>) => (
    <Code size='m'>{row.original.id}</Code>
  );

  const renderGroups = ({ row }: TableCellContext<User, unknown>) =>
    row.original.groups.length > 0 ? (
      <OverflowList className='gap-4' items={row.original.groups} itemRenderer={renderGroup} />
    ) : (
      '—'
    );

  const renderStatus = ({ row }: TableCellContext<User, unknown>) => (
    <Badge variant='dotted' type='secondary' color={STATUS[row.original.status].color}>
      {STATUS[row.original.status].label}
    </Badge>
  );

  const renderLastSignIn = ({ row }: TableCellContext<User, unknown>) => (
    <FormatDateTime value={row.original.lastSignIn} format='datetime' />
  );

  const renderRequests = ({ row }: TableCellContext<User, unknown>) => row.original.requests ?? '—';

  const renderMenuAction = (row: TableRow<User>) => {
    const user = row.original;
    const handleEdit = () => onEditUser(user);
    const handleResend = () => onResendInvite(user);
    const handleDeactivate = () => onDeactivateUser(user);
    const handleDelete = () => onDeleteUser(user);

    return (
      <DropdownMenu data-testid='users-row-menu'>
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
          {user.status === 'invited' && (
            <DropdownMenuItem onSelect={handleResend}>
              <DropdownMenuItemText>Resend invite</DropdownMenuItemText>
            </DropdownMenuItem>
          )}
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
    { accessorKey: 'id', header: 'User ID', size: 160, cell: renderId },
    {
      accessorKey: 'groups',
      header: 'Groups',
      size: 240,
      enableSorting: false,
      cell: renderGroups,
    },
    { accessorKey: 'status', header: 'Status', size: 140, cell: renderStatus },
    { accessorKey: 'lastSignIn', header: 'Last sign-in', size: 200, cell: renderLastSignIn },
    {
      accessorKey: 'requests',
      header: 'API requests',
      size: 140,
      meta: { sortType: 'number', description: { type: 'tooltip', content: 'Last 24 hours' } },
      cell: renderRequests,
    },
  ];

  const handleAssignGroup = () => onAssignGroup(Object.keys(selection));
  const handleBulkDelete = () => onBulkDelete(Object.keys(selection));

  return (
    <Page name='settings-users' fullSize fixedHeight data-testid='users-page'>
      <PageContent>
        <Table
          aria-label='Users'
          data={USERS}
          columns={columns}
          getRowId={getUserId}
          sorting={sorting}
          onSortingChange={setSorting}
          rowSelection={selection}
          onRowSelectionChange={setSelection}
          data-testid='users-table'
        >
          <TableActionBar>
            <Button variant='ghost' color='neutral-alt' onClick={handleAssignGroup}>
              Assign group
            </Button>
            <Button color='destructive' onClick={handleBulkDelete} data-testid='users-bulk-delete'>
              <Trash2 /> Delete
            </Button>
          </TableActionBar>
        </Table>
      </PageContent>
    </Page>
  );
};

/**
 * Tags collapse into "+N" when the column runs out of room; a user with no groups or no requests
 * shows `—`.
 */
export const Cells: StoryFn = () => {
  const STATUS = {
    active: { label: 'Active', color: 'green' },
    invited: { label: 'Invited', color: 'yellow' },
    expired: { label: 'Expired', color: 'red' },
    deactivated: { label: 'Deactivated', color: 'gray' },
  } as const;

  const renderGroup = (group: string) => <Tag key={group}>{group}</Tag>;

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

  const renderGroups = ({ row }: TableCellContext<User, unknown>) =>
    row.original.groups.length > 0 ? (
      <OverflowList className='gap-4' items={row.original.groups} itemRenderer={renderGroup} />
    ) : (
      '—'
    );

  const renderRequests = ({ row }: TableCellContext<User, unknown>) => row.original.requests ?? '—';

  const columns: TableColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Name', size: 320, cell: renderUser },
    { accessorKey: 'status', header: 'Status', size: 140, cell: renderStatus },
    {
      accessorKey: 'groups',
      header: 'Groups',
      size: 240,
      enableSorting: false,
      cell: renderGroups,
    },
    {
      accessorKey: 'requests',
      header: 'API requests',
      size: 140,
      meta: { sortType: 'number', description: { type: 'tooltip', content: 'Last 24 hours' } },
      cell: renderRequests,
    },
  ];

  return (
    <Page name='settings-users' data-testid='users-page'>
      <PageContent>
        <Table
          aria-label='Users'
          data={USERS}
          columns={columns}
          getRowId={getUserId}
          data-testid='users-table'
        />
      </PageContent>
    </Page>
  );
};

/**
 * Hover a row: the `…` appears in the master cell, `meta.renderMenuAction` on the first column. The
 * trigger names the row and the destructive item comes last.
 */
export const RowMenu: StoryFn = () => {
  const renderUser = ({ row }: TableCellContext<User, unknown>) => (
    <Avatar size='md'>
      <AvatarFallback name={row.original.name} />
      <AvatarContent>
        <AvatarName>{row.original.name}</AvatarName>
        <AvatarDescription>{row.original.email}</AvatarDescription>
      </AvatarContent>
    </Avatar>
  );

  const renderMenuAction = (row: TableRow<User>) => {
    const user = row.original;
    const handleEdit = () => onEditUser(user);
    const handleDeactivate = () => onDeactivateUser(user);
    const handleDelete = () => onDeleteUser(user);

    return (
      <DropdownMenu data-testid='users-row-menu'>
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
  ];

  return (
    <Page name='settings-users' data-testid='users-page'>
      <PageContent>
        <Table
          aria-label='Users'
          data={USERS}
          columns={columns}
          getRowId={getUserId}
          data-testid='users-table'
        />
      </PageContent>
    </Page>
  );
};

/**
 * `isLoading` draws the skeleton rows, not a `Loader`; `skeletonCount` sets how many (12 by
 * default).
 */
export const Loading: StoryFn = () => {
  const columns: TableColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Name', size: 320 },
    { accessorKey: 'id', header: 'User ID', size: 160 },
    { accessorKey: 'groups', header: 'Groups', size: 240 },
    { accessorKey: 'status', header: 'Status', size: 140 },
    { accessorKey: 'lastSignIn', header: 'Last sign-in', size: 200 },
  ];

  return (
    <Page name='settings-users' fullSize fixedHeight data-testid='users-page'>
      <PageContent>
        <Table
          aria-label='Users'
          data={[]}
          columns={columns}
          getRowId={getUserId}
          isLoading
          skeletonCount={6}
          data-testid='users-table'
        />
      </PageContent>
    </Page>
  );
};

/**
 * `EmptyState type='collection-empty'` inside `TableEmptyState`. It has no button when the page
 * header already has Create.
 */
export const Empty: StoryFn = () => {
  const columns: TableColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Name', size: 320 },
    { accessorKey: 'id', header: 'User ID', size: 160 },
    { accessorKey: 'groups', header: 'Groups', size: 240 },
    { accessorKey: 'status', header: 'Status', size: 140 },
    { accessorKey: 'lastSignIn', header: 'Last sign-in', size: 200 },
  ];

  return (
    <Page name='settings-users' fullSize fixedHeight data-testid='users-page'>
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
                <UserPlus />
              </EmptyStateIllustration>
              <EmptyStateMessage>
                <EmptyStateTitle>No users yet</EmptyStateTitle>
                <EmptyStateDescription>
                  Invite people to sign in to your organization.
                </EmptyStateDescription>
              </EmptyStateMessage>
            </EmptyState>
          </TableEmptyState>
        </Table>
      </PageContent>
    </Page>
  );
};

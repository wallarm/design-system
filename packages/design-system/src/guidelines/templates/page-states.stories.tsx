import { useState } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { fn } from 'storybook/test';

import {
  Alert,
  AlertContent,
  AlertControls,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '../../components/Alert';
import { Avatar, AvatarContent, AvatarFallback, AvatarName } from '../../components/Avatar';
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
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateLink,
  EmptyStateMessage,
  EmptyStateTitle,
} from '../../components/EmptyState';
import { FormatDateTime } from '../../components/FormatDateTime';
import { Ip, IpAddress, IpCountry } from '../../components/Ip';
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
import { HStack, VStack } from '../../components/Stack';
import type { TableCellContext, TableColumnDef, TableRow } from '../../components/Table';
import { Table, TableEmptyState } from '../../components/Table';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/Tooltip';
import { CloudOff, Ellipsis, FilterX, KeyRound, RefreshCcw, SearchX } from '../../icons';

type TokenStatus = 'active' | 'expiring' | 'expired';

interface ApiToken {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdBy: string;
  lastUsedAt: string | null;
  lastUsedIp: string | null;
  lastUsedCountry: 'US' | 'DE' | 'NL' | 'GB' | 'SG' | null;
  expiresAt: string | null;
  status: TokenStatus;
}

const TOKENS: ApiToken[] = [
  {
    id: 'tok-2201',
    name: 'ci-deploy-production',
    prefix: 'wlrm_live_8f2c',
    scopes: ['rules:write', 'nodes:read'],
    createdBy: 'Maria Lopez',
    lastUsedAt: '2026-11-05T09:42:00Z',
    lastUsedIp: '203.0.113.24',
    lastUsedCountry: 'US',
    expiresAt: '2027-05-01T00:00:00Z',
    status: 'active',
  },
  {
    id: 'tok-2202',
    name: 'terraform-provider',
    prefix: 'wlrm_live_41ad',
    scopes: ['rules:write', 'integrations:write'],
    createdBy: 'Daniel Okafor',
    lastUsedAt: '2026-11-05T08:15:00Z',
    lastUsedIp: '198.51.100.7',
    lastUsedCountry: 'DE',
    expiresAt: '2026-11-20T00:00:00Z',
    status: 'expiring',
  },
  {
    id: 'tok-2203',
    name: 'siem-export-splunk',
    prefix: 'wlrm_live_c09e',
    scopes: ['events:read'],
    createdBy: 'Priya Raman',
    lastUsedAt: '2026-11-05T07:58:00Z',
    lastUsedIp: '203.0.113.118',
    lastUsedCountry: 'NL',
    expiresAt: null,
    status: 'active',
  },
  {
    id: 'tok-2204',
    name: 'api-discovery-sync',
    prefix: 'wlrm_live_77b1',
    scopes: ['inventory:read', 'inventory:write'],
    createdBy: 'Tomás Herrera',
    lastUsedAt: '2026-11-04T22:10:00Z',
    lastUsedIp: '198.51.100.42',
    lastUsedCountry: 'US',
    expiresAt: '2027-02-14T00:00:00Z',
    status: 'active',
  },
  {
    id: 'tok-2205',
    name: 'staging-smoke-tests',
    prefix: 'wlrm_test_0a3f',
    scopes: ['nodes:read'],
    createdBy: 'Anna Schmidt',
    lastUsedAt: '2026-11-04T16:31:00Z',
    lastUsedIp: '203.0.113.201',
    lastUsedCountry: 'GB',
    expiresAt: '2026-11-12T00:00:00Z',
    status: 'expiring',
  },
  {
    id: 'tok-2206',
    name: 'grafana-dashboards',
    prefix: 'wlrm_live_e5d2',
    scopes: ['events:read', 'stats:read'],
    createdBy: 'Kenji Watanabe',
    lastUsedAt: '2026-11-04T12:05:00Z',
    lastUsedIp: '198.51.100.93',
    lastUsedCountry: 'SG',
    expiresAt: null,
    status: 'active',
  },
  {
    id: 'tok-2207',
    name: 'incident-bot-slack',
    prefix: 'wlrm_live_3c88',
    scopes: ['events:read', 'incidents:write'],
    createdBy: 'Maria Lopez',
    lastUsedAt: '2026-11-03T19:47:00Z',
    lastUsedIp: '203.0.113.56',
    lastUsedCountry: 'US',
    expiresAt: '2027-01-10T00:00:00Z',
    status: 'active',
  },
  {
    id: 'tok-2208',
    name: 'legacy-waf-migration',
    prefix: 'wlrm_live_9b40',
    scopes: ['rules:write'],
    createdBy: 'Daniel Okafor',
    lastUsedAt: '2026-09-18T10:20:00Z',
    lastUsedIp: '198.51.100.12',
    lastUsedCountry: 'DE',
    expiresAt: '2026-10-01T00:00:00Z',
    status: 'expired',
  },
  {
    id: 'tok-2209',
    name: 'pentest-q3-vendor',
    prefix: 'wlrm_test_d61c',
    scopes: ['events:read', 'rules:read'],
    createdBy: 'Priya Raman',
    lastUsedAt: '2026-08-29T14:02:00Z',
    lastUsedIp: '203.0.113.77',
    lastUsedCountry: 'GB',
    expiresAt: '2026-09-30T00:00:00Z',
    status: 'expired',
  },
  {
    id: 'tok-2210',
    name: 'node-autoscaler',
    prefix: 'wlrm_live_15fa',
    scopes: ['nodes:write'],
    createdBy: 'Tomás Herrera',
    lastUsedAt: null,
    lastUsedIp: null,
    lastUsedCountry: null,
    expiresAt: '2027-06-30T00:00:00Z',
    status: 'active',
  },
  {
    id: 'tok-2211',
    name: 'billing-usage-report',
    prefix: 'wlrm_live_a2e7',
    scopes: ['stats:read'],
    createdBy: 'Anna Schmidt',
    lastUsedAt: '2026-11-01T06:00:00Z',
    lastUsedIp: '198.51.100.150',
    lastUsedCountry: 'NL',
    expiresAt: '2026-11-25T00:00:00Z',
    status: 'expiring',
  },
];

// Tokens whose usage data the partial-failure story cannot load.
const USAGE_UNAVAILABLE = ['tok-2203', 'tok-2206', 'tok-2211'];

const STATUS = {
  active: { label: 'Active', color: 'green' },
  expiring: { label: 'Expiring soon', color: 'yellow' },
  expired: { label: 'Expired', color: 'red' },
} as const;

const onCreateToken = fn().mockName('onCreateToken');
const onRotateToken = fn().mockName('onRotateToken');
const onRevokeToken = fn().mockName('onRevokeToken');
const onRetry = fn().mockName('onRetry');

const getTokenId = (token: ApiToken) => token.id;

const matchesSearch = (token: ApiToken, query: string) => {
  const search = query.trim().toLowerCase();
  return token.name.toLowerCase().includes(search) || token.prefix.includes(search);
};

const countByStatus = (tokens: ApiToken[]) => ({
  all: tokens.length,
  active: tokens.filter(token => token.status === 'active').length,
  expiring: tokens.filter(token => token.status === 'expiring').length,
  expired: tokens.filter(token => token.status === 'expired').length,
});

const renderName = ({ row }: TableCellContext<ApiToken, unknown>) => (
  <VStack gap={2} align='start'>
    <Text size='sm' weight='medium'>
      {row.original.name}
    </Text>
    <Code size='s' color='secondary'>
      {row.original.prefix}…
    </Code>
  </VStack>
);

const renderScopes = ({ row }: TableCellContext<ApiToken, unknown>) => (
  <HStack gap={4} wrap='wrap'>
    {row.original.scopes.map(scope => (
      <Badge key={scope} type='secondary' color='slate'>
        {scope}
      </Badge>
    ))}
  </HStack>
);

const renderCreatedBy = ({ row }: TableCellContext<ApiToken, unknown>) => (
  <Avatar size='sm'>
    <AvatarFallback name={row.original.createdBy} />
    <AvatarContent>
      <AvatarName>{row.original.createdBy}</AvatarName>
    </AvatarContent>
  </Avatar>
);

const renderLastUsed = ({ row }: TableCellContext<ApiToken, unknown>) =>
  row.original.lastUsedAt ? (
    <FormatDateTime value={row.original.lastUsedAt} format='datetime' />
  ) : (
    '—'
  );

const renderLastIp = ({ row }: TableCellContext<ApiToken, unknown>) =>
  row.original.lastUsedIp && row.original.lastUsedCountry ? (
    <Ip>
      <IpCountry code={row.original.lastUsedCountry} />
      <IpAddress>{row.original.lastUsedIp}</IpAddress>
    </Ip>
  ) : (
    '—'
  );

const renderExpires = ({ row }: TableCellContext<ApiToken, unknown>) =>
  row.original.expiresAt ? (
    <FormatDateTime value={row.original.expiresAt} format='date' />
  ) : (
    'Never'
  );

const renderStatus = ({ row }: TableCellContext<ApiToken, unknown>) => (
  <Badge variant='dotted' type='secondary' color={STATUS[row.original.status].color}>
    {STATUS[row.original.status].label}
  </Badge>
);

const renderMenuAction = (row: TableRow<ApiToken>) => {
  const token = row.original;
  const handleRotate = () => onRotateToken(token);
  const handleRevoke = () => onRevokeToken(token);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          color='neutral'
          size='small'
          aria-label={`Actions for ${token.name}`}
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={handleRotate}>
          <DropdownMenuItemText>Rotate secret</DropdownMenuItemText>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive' onSelect={handleRevoke}>
          <DropdownMenuItemText>Revoke token</DropdownMenuItemText>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const NAME_COLUMN: TableColumnDef<ApiToken> = {
  accessorKey: 'name',
  header: 'Name',
  size: 280,
  cell: renderName,
};

// Every column but the name; the row menu lives in the name (master) cell.
const DATA_COLUMNS: TableColumnDef<ApiToken>[] = [
  { accessorKey: 'scopes', header: 'Scopes', size: 240, cell: renderScopes },
  { accessorKey: 'createdBy', header: 'Created by', size: 180, cell: renderCreatedBy },
  { accessorKey: 'lastUsedAt', header: 'Last used', size: 200, cell: renderLastUsed },
  { accessorKey: 'lastUsedIp', header: 'Last used from', size: 180, cell: renderLastIp },
  { accessorKey: 'expiresAt', header: 'Expires', size: 140, cell: renderExpires },
  { accessorKey: 'status', header: 'Status', size: 140, cell: renderStatus },
];

// Read-only users see the same columns without the row menu.
const READ_COLUMNS: TableColumnDef<ApiToken>[] = [NAME_COLUMN, ...DATA_COLUMNS];

const COLUMNS: TableColumnDef<ApiToken>[] = [
  { ...NAME_COLUMN, meta: { renderMenuAction } },
  ...DATA_COLUMNS,
];

const meta = {
  title: 'Templates/Page states',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when a list page must handle every state it goes through: data, loading, first use, no results, load error, read-only access and partial failure.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * Data: one create action in the header, search and status tabs with counts in the toolbar, and
 * the token table. Hover a row and the `…` row menu appears in the name (master) cell, through
 * `meta.renderMenuAction` on the first column. "Copy token ID" reports through one toast with a
 * stable id, so repeated copies update it instead of stacking.
 */
export const Default: StoryFn = () => {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const renderRowMenu = (row: TableRow<ApiToken>) => {
    const token = row.original;
    const handleCopyId = async () => {
      try {
        await navigator.clipboard.writeText(token.id);
        toast.create({ id: 'copy-token-id', title: 'Token ID copied', type: 'default' });
      } catch {
        toast.create({ id: 'copy-token-id', title: 'Copy failed', type: 'error' });
      }
    };
    const handleRotate = () => onRotateToken(token);
    const handleRevoke = () => onRevokeToken(token);

    return (
      <DropdownMenu data-testid='api-tokens-row-menu'>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            aria-label={`Actions for ${token.name}`}
            data-testid={`api-tokens-actions-${token.id}`}
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleCopyId}>
            <DropdownMenuItemText>Copy token ID</DropdownMenuItemText>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleRotate}>
            <DropdownMenuItemText>Rotate secret</DropdownMenuItemText>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onSelect={handleRevoke}>
            <DropdownMenuItemText>Revoke token</DropdownMenuItemText>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const columns: TableColumnDef<ApiToken>[] = [
    { ...NAME_COLUMN, meta: { renderMenuAction: renderRowMenu } },
    ...DATA_COLUMNS,
  ];

  const matching = TOKENS.filter(token => matchesSearch(token, query));
  const counts = countByStatus(matching);
  const rows = status === 'all' ? matching : matching.filter(token => token.status === status);

  const handleReset = () => {
    setQuery('');
    setStatus('all');
  };

  return (
    <Page name='settings-api-tokens' fullSize fixedHeight data-testid='api-tokens-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>API tokens</PageTitle>
          <PageDescription>
            Tokens let scripts, CI pipelines and integrations call the Wallarm API on behalf of your
            organization.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={onCreateToken} data-testid='api-tokens-create'>
            Create token
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or prefix'
          className='w-[320px]'
          data-testid='api-tokens-search'
        />
        <SegmentedTabs value={status} onChange={setStatus} data-testid='api-tokens-status-tabs'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>
              All <NumericBadge>{counts.all}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='active'>
              Active <NumericBadge>{counts.active}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expiring'>
              Expiring soon <NumericBadge>{counts.expiring}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expired'>
              Expired <NumericBadge>{counts.expired}</NumericBadge>
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='API tokens'
          data={rows}
          columns={columns}
          getRowId={getTokenId}
          data-testid='api-tokens-table'
        >
          <TableEmptyState>
            <EmptyState type='collection-empty' data-testid='api-tokens-no-results'>
              <EmptyStateIllustration>
                <SearchX />
              </EmptyStateIllustration>
              <EmptyStateMessage>
                <EmptyStateTitle>No results found</EmptyStateTitle>
                <EmptyStateDescription>
                  No tokens match your search or status.
                </EmptyStateDescription>
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
 * First load: the real header and toolbar with skeleton rows under the column headers. Counts are
 * unknown yet, so the tabs drop their badges.
 */
export const Loading: StoryFn = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  return (
    <Page name='settings-api-tokens' fullSize fixedHeight data-testid='api-tokens-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>API tokens</PageTitle>
          <PageDescription>
            Tokens let scripts, CI pipelines and integrations call the Wallarm API on behalf of your
            organization.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={onCreateToken} data-testid='api-tokens-create'>
            Create token
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or prefix'
          className='w-[320px]'
          data-testid='api-tokens-search'
        />
        <SegmentedTabs value={status} onChange={setStatus} data-testid='api-tokens-status-tabs'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>All</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='active'>Active</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expiring'>Expiring soon</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expired'>Expired</SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='API tokens'
          data={[]}
          columns={COLUMNS}
          getRowId={getTokenId}
          isLoading
          data-testid='api-tokens-table'
        />
      </PageContent>
    </Page>
  );
};

/**
 * First use: nothing exists yet. The header keeps the one create action, so the empty state has
 * no button of its own, only an illustration that names the entity and a link to the docs.
 */
export const Empty: StoryFn = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  return (
    <Page name='settings-api-tokens' fullSize fixedHeight data-testid='api-tokens-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>API tokens</PageTitle>
          <PageDescription>
            Tokens let scripts, CI pipelines and integrations call the Wallarm API on behalf of your
            organization.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={onCreateToken} data-testid='api-tokens-create'>
            Create token
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or prefix'
          className='w-[320px]'
          data-testid='api-tokens-search'
        />
        <SegmentedTabs value={status} onChange={setStatus} data-testid='api-tokens-status-tabs'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>
              All <NumericBadge>0</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='active'>
              Active <NumericBadge>0</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expiring'>
              Expiring soon <NumericBadge>0</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expired'>
              Expired <NumericBadge>0</NumericBadge>
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='API tokens'
          data={[]}
          columns={COLUMNS}
          getRowId={getTokenId}
          data-testid='api-tokens-table'
        >
          <TableEmptyState>
            <EmptyState type='collection-empty' data-testid='api-tokens-empty-state'>
              <EmptyStateIllustration>
                <KeyRound />
              </EmptyStateIllustration>
              <EmptyStateMessage>
                <EmptyStateTitle>No API tokens yet</EmptyStateTitle>
                <EmptyStateDescription>
                  Create a token to call the Wallarm API from scripts, CI pipelines and Terraform.
                </EmptyStateDescription>
              </EmptyStateMessage>
              <EmptyStateLink href='#'>How API tokens work</EmptyStateLink>
            </EmptyState>
          </TableEmptyState>
        </Table>
      </PageContent>
    </Page>
  );
};

/**
 * Search matched nothing: the typed value stays, counts drop to zero, and the empty state offers
 * "Reset filters", never a create action.
 */
export const NoResults: StoryFn = () => {
  const [query, setQuery] = useState('okta-scim');
  const [status, setStatus] = useState('all');

  const matching = TOKENS.filter(token => matchesSearch(token, query));
  const counts = countByStatus(matching);
  const rows = status === 'all' ? matching : matching.filter(token => token.status === status);

  const handleReset = () => {
    setQuery('');
    setStatus('all');
  };

  return (
    <Page name='settings-api-tokens' fullSize fixedHeight data-testid='api-tokens-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>API tokens</PageTitle>
          <PageDescription>
            Tokens let scripts, CI pipelines and integrations call the Wallarm API on behalf of your
            organization.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={onCreateToken} data-testid='api-tokens-create'>
            Create token
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or prefix'
          className='w-[320px]'
          data-testid='api-tokens-search'
        />
        <SegmentedTabs value={status} onChange={setStatus} data-testid='api-tokens-status-tabs'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>
              All <NumericBadge>{counts.all}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='active'>
              Active <NumericBadge>{counts.active}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expiring'>
              Expiring soon <NumericBadge>{counts.expiring}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expired'>
              Expired <NumericBadge>{counts.expired}</NumericBadge>
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='API tokens'
          data={rows}
          columns={COLUMNS}
          getRowId={getTokenId}
          data-testid='api-tokens-table'
        >
          <TableEmptyState>
            <EmptyState type='collection-empty' data-testid='api-tokens-no-results'>
              <EmptyStateIllustration>
                <SearchX />
              </EmptyStateIllustration>
              <EmptyStateMessage>
                <EmptyStateTitle>No results found</EmptyStateTitle>
                <EmptyStateDescription>
                  No tokens match your search or status.
                </EmptyStateDescription>
              </EmptyStateMessage>
              <EmptyStateActions>
                <Button
                  size='medium'
                  variant='outline'
                  color='neutral'
                  onClick={handleReset}
                  data-testid='api-tokens-reset'
                >
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
 * The list failed to load: header, toolbar and column headers stay, and the Patterns/Error states
 * `EmptyState` with "Try again" takes the place of the rows. Retrying shows skeleton rows, then
 * the data.
 */
export const LoadError: StoryFn = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [load, setLoad] = useState<'error' | 'loading' | 'ready'>('error');

  const matching = TOKENS.filter(token => matchesSearch(token, query));
  const counts = countByStatus(matching);
  const isReady = load === 'ready';
  const rows = status === 'all' ? matching : matching.filter(token => token.status === status);

  const handleRetry = () => {
    onRetry();
    setLoad('loading');
    setTimeout(() => setLoad('ready'), 800);
  };

  return (
    <Page name='settings-api-tokens' fullSize fixedHeight data-testid='api-tokens-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>API tokens</PageTitle>
          <PageDescription>
            Tokens let scripts, CI pipelines and integrations call the Wallarm API on behalf of your
            organization.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={onCreateToken} data-testid='api-tokens-create'>
            Create token
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or prefix'
          className='w-[320px]'
          data-testid='api-tokens-search'
        />
        <SegmentedTabs value={status} onChange={setStatus} data-testid='api-tokens-status-tabs'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>
              All {isReady && <NumericBadge>{counts.all}</NumericBadge>}
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='active'>
              Active {isReady && <NumericBadge>{counts.active}</NumericBadge>}
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expiring'>
              Expiring soon {isReady && <NumericBadge>{counts.expiring}</NumericBadge>}
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expired'>
              Expired {isReady && <NumericBadge>{counts.expired}</NumericBadge>}
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='API tokens'
          data={isReady ? rows : []}
          columns={COLUMNS}
          getRowId={getTokenId}
          isLoading={load === 'loading'}
          data-testid='api-tokens-table'
        >
          {load === 'error' && (
            <TableEmptyState>
              <EmptyState data-testid='api-tokens-error'>
                <EmptyStateIllustration>
                  <CloudOff />
                </EmptyStateIllustration>
                <EmptyStateMessage>
                  <EmptyStateTitle>Couldn't load API tokens</EmptyStateTitle>
                  <EmptyStateDescription>
                    The server didn't respond in time. Your tokens keep working; try again in a
                    moment.
                  </EmptyStateDescription>
                </EmptyStateMessage>
                <EmptyStateActions>
                  <Button
                    size='medium'
                    variant='outline'
                    color='neutral'
                    onClick={handleRetry}
                    data-testid='api-tokens-retry'
                  >
                    <RefreshCcw />
                    Try again
                  </Button>
                </EmptyStateActions>
              </EmptyState>
            </TableEmptyState>
          )}
        </Table>
      </PageContent>
    </Page>
  );
};

/**
 * Read-only access: the list stays fully visible, the create action is disabled with a tooltip
 * that names who can create tokens, the row menu is gone, and an info `Alert` explains
 * the state for as long as it holds.
 */
export const NoPermission: StoryFn = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const matching = TOKENS.filter(token => matchesSearch(token, query));
  const counts = countByStatus(matching);
  const rows = status === 'all' ? matching : matching.filter(token => token.status === status);

  return (
    <Page name='settings-api-tokens' fullSize fixedHeight data-testid='api-tokens-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>API tokens</PageTitle>
          <PageDescription>
            Tokens let scripts, CI pipelines and integrations call the Wallarm API on behalf of your
            organization.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button size='medium' disabled data-testid='api-tokens-create'>
                  Create token
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Only administrators can create tokens.</TooltipContent>
          </Tooltip>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or prefix'
          className='w-[320px]'
          data-testid='api-tokens-search'
        />
        <SegmentedTabs value={status} onChange={setStatus} data-testid='api-tokens-status-tabs'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>
              All <NumericBadge>{counts.all}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='active'>
              Active <NumericBadge>{counts.active}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expiring'>
              Expiring soon <NumericBadge>{counts.expiring}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expired'>
              Expired <NumericBadge>{counts.expired}</NumericBadge>
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>

      <PageContent>
        <VStack gap={12} align='stretch'>
          <Alert color='info' data-testid='api-tokens-read-only'>
            <AlertIcon />
            <AlertContent>
              <AlertTitle>You have read-only access</AlertTitle>
              <AlertDescription>
                Ask an administrator to create, rotate or revoke tokens for you.
              </AlertDescription>
            </AlertContent>
          </Alert>
          <Table
            aria-label='API tokens'
            data={rows}
            columns={READ_COLUMNS}
            getRowId={getTokenId}
            data-testid='api-tokens-table'
          />
        </VStack>
      </PageContent>
    </Page>
  );
};

/**
 * Partial failure: the tokens loaded but their usage data did not. A warning `Alert` says what is
 * missing and offers "Retry"; the affected cells show the em dash instead of hiding rows.
 */
export const PartialFailure: StoryFn = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [usageLoaded, setUsageLoaded] = useState(false);

  const tokens = usageLoaded
    ? TOKENS
    : TOKENS.map(token =>
        USAGE_UNAVAILABLE.includes(token.id)
          ? { ...token, lastUsedAt: null, lastUsedIp: null, lastUsedCountry: null }
          : token,
      );
  const matching = tokens.filter(token => matchesSearch(token, query));
  const counts = countByStatus(matching);
  const rows = status === 'all' ? matching : matching.filter(token => token.status === status);

  const handleRetry = () => {
    onRetry();
    setUsageLoaded(true);
  };

  return (
    <Page name='settings-api-tokens' fullSize fixedHeight data-testid='api-tokens-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>API tokens</PageTitle>
          <PageDescription>
            Tokens let scripts, CI pipelines and integrations call the Wallarm API on behalf of your
            organization.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={onCreateToken} data-testid='api-tokens-create'>
            Create token
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or prefix'
          className='w-[320px]'
          data-testid='api-tokens-search'
        />
        <SegmentedTabs value={status} onChange={setStatus} data-testid='api-tokens-status-tabs'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>
              All <NumericBadge>{counts.all}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='active'>
              Active <NumericBadge>{counts.active}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expiring'>
              Expiring soon <NumericBadge>{counts.expiring}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='expired'>
              Expired <NumericBadge>{counts.expired}</NumericBadge>
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>

      <PageContent>
        <VStack gap={12} align='stretch'>
          {!usageLoaded && (
            <Alert color='warning' data-testid='api-tokens-partial-failure'>
              <AlertIcon />
              <AlertContent>
                <AlertTitle>Usage data is missing for 3 tokens</AlertTitle>
                <AlertDescription>
                  The usage service didn't respond. Tokens and their scopes are up to date.
                </AlertDescription>
              </AlertContent>
              <AlertControls>
                <Button
                  variant='secondary'
                  color='neutral'
                  size='small'
                  onClick={handleRetry}
                  data-testid='api-tokens-retry'
                >
                  <RefreshCcw />
                  Retry
                </Button>
              </AlertControls>
            </Alert>
          )}
          <Table
            aria-label='API tokens'
            data={rows}
            columns={COLUMNS}
            getRowId={getTokenId}
            data-testid='api-tokens-table'
          />
        </VStack>
      </PageContent>
    </Page>
  );
};

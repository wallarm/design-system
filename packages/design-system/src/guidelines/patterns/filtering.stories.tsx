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
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogFooterControls,
  DialogHeader,
  DialogTitle,
} from '../../components/Dialog';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateMessage,
  EmptyStateTitle,
} from '../../components/EmptyState';
import { Field, FieldDescription, FieldLabel } from '../../components/Field';
import {
  createFilterCascadeCollection,
  FilterCascade,
  FilterCascadeContent,
  FilterCascadeItems,
  type FilterCascadeLevelData,
  FilterCascadeLevels,
  FilterCascadeParentItem,
  FilterCascadeSearch,
  FilterCascadeTrigger,
  type FilterCascadeValueChangeDetails,
} from '../../components/FilterCascade';
import {
  FilterDropdown,
  FilterDropdownAllOption,
  FilterDropdownContent,
  FilterDropdownEmpty,
  FilterDropdownFooter,
  FilterDropdownGroup,
  FilterDropdownGroupLabel,
  FilterDropdownOption,
  FilterDropdownSearch,
  FilterDropdownSelected,
  FilterDropdownTrigger,
  type FilterDropdownValueChangeDetails,
  useFilterDropdown,
} from '../../components/FilterDropdown';
import { NumericBadge } from '../../components/NumericBadge';
import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderGroup,
  PageTitle,
  PageToolbar,
} from '../../components/Page';
import { SearchInput } from '../../components/SearchInput';
import { SegmentedControl, SegmentedControlItem } from '../../components/SegmentedControl';
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from '../../components/SegmentedTabs';
import {
  createListCollection,
  Select,
  SelectContent,
  SelectEmptyState,
  SelectHeader,
  SelectInput,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
  SelectSearchInput,
  useSelectSearch,
} from '../../components/Select';
import type {
  TableCellContext,
  TableColumnDef,
  TableRowSelectionState,
} from '../../components/Table';
import { Table, TableEmptyState } from '../../components/Table';
import { FilterX, List, SearchX, UserPlus, Workflow } from '../../icons';

type AttackType = 'sqli' | 'xss' | 'rce' | 'ptrav' | 'ssrf';
type AttackStatus = 'blocked' | 'monitored';

interface Attack {
  id: string;
  type: AttackType;
  status: AttackStatus;
  path: string;
  source: string;
  deployment: string;
  application: string;
  hits: number;
}

const ATTACKS: Attack[] = [
  {
    id: 'atk-7f2a',
    type: 'sqli',
    status: 'blocked',
    path: 'POST /api/v2/login',
    source: '185.220.101.34',
    deployment: 'prod-eu',
    application: 'prod-eu-api',
    hits: 1284,
  },
  {
    id: 'atk-7f31',
    type: 'xss',
    status: 'blocked',
    path: 'GET /search?q=',
    source: '45.155.205.12',
    deployment: 'prod-eu',
    application: 'prod-eu-checkout',
    hits: 412,
  },
  {
    id: 'atk-7f44',
    type: 'rce',
    status: 'blocked',
    path: 'POST /api/v2/upload',
    source: '193.142.146.7',
    deployment: 'prod-us',
    application: 'prod-us-api',
    hits: 96,
  },
  {
    id: 'atk-7f52',
    type: 'ptrav',
    status: 'monitored',
    path: 'GET /static/../../etc/passwd',
    source: '89.248.165.52',
    deployment: 'prod-us',
    application: 'prod-us-mobile',
    hits: 57,
  },
  {
    id: 'atk-7f60',
    type: 'ssrf',
    status: 'monitored',
    path: 'POST /api/v1/webhooks',
    source: '162.247.74.200',
    deployment: 'staging',
    application: 'staging-checkout',
    hits: 23,
  },
  {
    id: 'atk-7f6b',
    type: 'sqli',
    status: 'monitored',
    path: 'GET /api/v1/orders?id=',
    source: '103.251.167.10',
    deployment: 'staging',
    application: 'staging-checkout',
    hits: 18,
  },
  {
    id: 'atk-7f7d',
    type: 'xss',
    status: 'blocked',
    path: 'POST /api/v2/comments',
    source: '185.220.101.34',
    deployment: 'prod-us',
    application: 'prod-us-mobile',
    hits: 341,
  },
  {
    id: 'atk-7f88',
    type: 'sqli',
    status: 'blocked',
    path: 'POST /graphql',
    source: '45.155.205.12',
    deployment: 'prod-eu',
    application: 'prod-eu-api',
    hits: 702,
  },
];

const SCOPES = [
  {
    value: 'prod-eu',
    label: 'Production EU',
    children: [
      { value: 'prod-eu-api', label: 'api-gateway' },
      { value: 'prod-eu-checkout', label: 'checkout' },
    ],
  },
  {
    value: 'prod-us',
    label: 'Production US',
    children: [
      { value: 'prod-us-api', label: 'api-gateway' },
      { value: 'prod-us-mobile', label: 'mobile-api' },
    ],
  },
  {
    value: 'staging',
    label: 'Staging',
    children: [{ value: 'staging-checkout', label: 'checkout' }],
  },
];

interface Application {
  value: string;
  label: string;
  deployment: string;
  attacks: number;
}

const APPLICATIONS: Application[] = [
  { value: 'eu-api', label: 'api-gateway', deployment: 'Production EU', attacks: 1986 },
  { value: 'eu-checkout', label: 'checkout', deployment: 'Production EU', attacks: 412 },
  { value: 'eu-billing', label: 'billing', deployment: 'Production EU', attacks: 87 },
  { value: 'eu-auth', label: 'auth-service', deployment: 'Production EU', attacks: 264 },
  { value: 'us-api', label: 'api-gateway', deployment: 'Production US', attacks: 96 },
  { value: 'us-mobile', label: 'mobile-api', deployment: 'Production US', attacks: 398 },
  { value: 'us-search', label: 'search', deployment: 'Production US', attacks: 141 },
  { value: 'us-webhooks', label: 'webhooks', deployment: 'Production US', attacks: 12 },
  { value: 'stg-checkout', label: 'checkout', deployment: 'Staging', attacks: 41 },
  { value: 'stg-admin', label: 'admin-panel', deployment: 'Staging', attacks: 5 },
];

interface ScopeNode {
  id: string;
  name: string;
  kind: 'deployment' | 'application';
  policies: number;
}

const DEPLOYMENTS: ScopeNode[] = [
  { id: 'prod-eu', name: 'Production EU', kind: 'deployment', policies: 4 },
  { id: 'prod-us', name: 'Production US', kind: 'deployment', policies: 1 },
  { id: 'staging', name: 'Staging', kind: 'deployment', policies: 0 },
];

const DEPLOYMENT_APPLICATIONS: Record<string, ScopeNode[]> = {
  'prod-eu': [
    { id: 'prod-eu-api', name: 'api-gateway', kind: 'application', policies: 2 },
    { id: 'prod-eu-checkout', name: 'checkout', kind: 'application', policies: 0 },
  ],
  'prod-us': [
    { id: 'prod-us-api', name: 'api-gateway', kind: 'application', policies: 1 },
    { id: 'prod-us-mobile', name: 'mobile-api', kind: 'application', policies: 0 },
  ],
  staging: [{ id: 'staging-checkout', name: 'checkout', kind: 'application', policies: 0 }],
};

/** Stands in for the API: a deployment's applications arrive a moment after it is opened. */
const fetchApplications = (deploymentId: string) =>
  new Promise<ScopeNode[]>(resolve =>
    setTimeout(() => resolve(DEPLOYMENT_APPLICATIONS[deploymentId] ?? []), 400),
  );

const TIME_ZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (UTC+00:00)' },
  { value: 'Europe/Lisbon', label: 'Lisbon (UTC+00:00)' },
  { value: 'Europe/Berlin', label: 'Berlin (UTC+01:00)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+01:00)' },
  { value: 'Europe/Helsinki', label: 'Helsinki (UTC+02:00)' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+04:00)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (UTC+05:30)' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+08:00)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+09:00)' },
  { value: 'America/New_York', label: 'New York (UTC−05:00)' },
  { value: 'America/Chicago', label: 'Chicago (UTC−06:00)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC−08:00)' },
];

interface Member {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'invited';
}

const MEMBERS: Member[] = [
  { id: 'u-1042', name: 'Maria Lopez', email: 'maria.lopez@acme-bank.com', status: 'active' },
  {
    id: 'u-1043',
    name: 'Daniel Okafor',
    email: 'daniel.okafor@acme-bank.com',
    status: 'active',
  },
  { id: 'u-1051', name: 'Priya Raman', email: 'priya.raman@acme-bank.com', status: 'invited' },
  {
    id: 'u-1058',
    name: 'Tomás Herrera',
    email: 'tomas.herrera@acme-bank.com',
    status: 'active',
  },
  {
    id: 'u-1064',
    name: 'Kenji Watanabe',
    email: 'kenji.watanabe@acme-bank.com',
    status: 'invited',
  },
  { id: 'u-1071', name: 'Lea Novak', email: 'lea.novak@acme-bank.com', status: 'active' },
  { id: 'u-1077', name: 'Omar Haddad', email: 'omar.haddad@acme-bank.com', status: 'active' },
];

const onTimeZoneSaved = fn().mockName('onTimeZoneSaved');
const onAddUsers = fn().mockName('onAddUsers');

const getAttackId = (attack: Attack) => attack.id;
const getMemberId = (member: Member) => member.id;

/**
 * `useFilterDropdown().groups` is only readable inside `FilterDropdown`, so the menu is its own
 * component; one per app serves every searchable filter.
 */
const ApplicationMenu = () => {
  const { groups } = useFilterDropdown<Application>();

  return (
    <FilterDropdownContent>
      <FilterDropdownSearch />
      <FilterDropdownSelected<Application>>
        {item => <FilterDropdownOption item={item} hint={item.attacks} />}
      </FilterDropdownSelected>
      {groups.map(([group, items]) => (
        <FilterDropdownGroup key={group}>
          {group && <FilterDropdownGroupLabel>{group}</FilterDropdownGroupLabel>}
          {items.map(item => (
            <FilterDropdownOption key={item.value} item={item} hint={item.attacks} />
          ))}
        </FilterDropdownGroup>
      ))}
      <FilterDropdownEmpty />
      <FilterDropdownFooter />
    </FilterDropdownContent>
  );
};

const meta = {
  title: 'Patterns/Filtering',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when narrowing a list or table by attributes, or picking values from a long list — filter chips, hierarchical scope, query builder, searchable select, picker dialog.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * Every pick applies at once. When the filters match nothing, the table offers "Reset filters",
 * which clears the search and every filter.
 */
export const Default: StoryFn = () => {
  const [query, setQuery] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [scope, setScope] = useState<string[]>([]);
  const [view, setView] = useState('table');

  const TYPE_LABELS: Record<AttackType, string> = {
    sqli: 'SQL injection',
    xss: 'XSS',
    rce: 'RCE',
    ptrav: 'Path traversal',
    ssrf: 'SSRF',
  };
  const typeItems = Object.entries(TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
    count: ATTACKS.filter(attack => attack.type === value).length,
  }));
  const typeOptions = createListCollection({ items: typeItems });
  const statusOptions = createListCollection({
    items: [
      { value: 'blocked', label: 'Blocked' },
      { value: 'monitored', label: 'Monitored' },
    ],
  });
  const scopeOptions = createFilterCascadeCollection(SCOPES);

  const renderType = ({ row }: TableCellContext<Attack, unknown>) => TYPE_LABELS[row.original.type];

  const renderStatus = ({ row }: TableCellContext<Attack, unknown>) =>
    row.original.status === 'blocked' ? (
      <Badge variant='dotted' type='secondary' color='red'>
        Blocked
      </Badge>
    ) : (
      <Badge variant='dotted' type='secondary' color='yellow'>
        Monitored
      </Badge>
    );

  const columns: TableColumnDef<Attack>[] = [
    { accessorKey: 'type', header: 'Type', size: 160, cell: renderType },
    { accessorKey: 'path', header: 'Request', size: 280 },
    { accessorKey: 'source', header: 'Source IP', size: 160 },
    { accessorKey: 'status', header: 'Status', size: 140, cell: renderStatus },
    { accessorKey: 'hits', header: 'Hits', size: 100 },
  ];

  const search = query.trim().toLowerCase();
  const rows = ATTACKS.filter(
    attack =>
      (attack.path.toLowerCase().includes(search) || attack.source.includes(search)) &&
      (types.length === 0 || types.includes(attack.type)) &&
      (status.length === 0 || status.includes(attack.status)) &&
      (scope.length === 0 || attack.deployment === scope[0]) &&
      (scope.length < 2 || attack.application === scope[1]),
  );

  const handleTypesChange = (details: FilterDropdownValueChangeDetails) => setTypes(details.value);
  const handleStatusChange = (details: FilterDropdownValueChangeDetails) =>
    setStatus(details.value);
  const handleScopeChange = (details: FilterCascadeValueChangeDetails) => setScope(details.value);

  const handleReset = () => {
    setQuery('');
    setTypes([]);
    setStatus([]);
    setScope([]);
  };

  return (
    <Page name='attacks' fullSize fixedHeight data-testid='attacks-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>Attacks</PageTitle>
          <PageDescription>
            Malicious requests the filtering nodes detected in the last 7 days.
          </PageDescription>
        </PageHeaderGroup>
      </PageHeader>

      <PageToolbar>
        <div className='flex items-center gap-8'>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder='Search request or IP'
            className='w-[320px]'
            data-testid='attacks-search'
          />
          <FilterDropdown
            label='Type'
            multiple
            collection={typeOptions}
            value={types}
            onValueChange={handleTypesChange}
            data-testid='attacks-type-filter'
          >
            <FilterDropdownTrigger />
            <FilterDropdownContent>
              {/* Under 8 options the menu has no search, so the options are listed directly.
                  From 8, render them from `useFilterDropdown().groups` in a child component. */}
              {typeItems.map(item => (
                <FilterDropdownOption key={item.value} item={item} hint={item.count} />
              ))}
              <FilterDropdownFooter />
            </FilterDropdownContent>
          </FilterDropdown>
          <FilterDropdown
            label='Status'
            allLabel='All statuses'
            collection={statusOptions}
            value={status}
            onValueChange={handleStatusChange}
            data-testid='attacks-status-filter'
          >
            <FilterDropdownTrigger />
            <FilterDropdownContent>
              <FilterDropdownAllOption />
              {statusOptions.items.map(item => (
                <FilterDropdownOption key={item.value} item={item} />
              ))}
            </FilterDropdownContent>
          </FilterDropdown>
          <FilterCascade
            label='Scope'
            collection={scopeOptions}
            parentLabel='Deployment level'
            value={scope}
            onValueChange={handleScopeChange}
            data-testid='attacks-scope-filter'
          >
            <FilterCascadeTrigger />
            <FilterCascadeContent />
          </FilterCascade>
        </div>
        <SegmentedControl
          value={view}
          onChange={setView}
          className='ml-auto'
          data-testid='attacks-view-toggle'
        >
          <SegmentedControlItem value='table'>
            <List />
            <span className='sr-only'>Table view</span>
          </SegmentedControlItem>
          <SegmentedControlItem value='schema'>
            <Workflow />
            <span className='sr-only'>Schema view</span>
          </SegmentedControlItem>
        </SegmentedControl>
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='Attacks'
          data={rows}
          columns={columns}
          getRowId={getAttackId}
          data-testid='attacks-table'
        >
          <TableEmptyState>
            <EmptyState type='collection-empty' data-testid='attacks-no-results'>
              <EmptyStateIllustration>
                <SearchX />
              </EmptyStateIllustration>
              <EmptyStateMessage>
                <EmptyStateTitle>No results found</EmptyStateTitle>
                <EmptyStateDescription>
                  No attacks match your search or filters.
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
 * Options are grouped by deployment and carry attack counts. On reopen, picked options are
 * pinned under «Selected»; a query with no match shows an empty message and keeps the menu open.
 */
export const SearchableFilter: StoryFn = () => {
  const [applications, setApplications] = useState<string[]>([]);
  const applicationOptions = createListCollection({
    items: APPLICATIONS,
    groupBy: item => item.deployment,
  });

  const handleApplicationsChange = (details: FilterDropdownValueChangeDetails) =>
    setApplications(details.value);

  return (
    <div className='p-24'>
      <FilterDropdown
        label='Application'
        multiple
        collection={applicationOptions}
        value={applications}
        onValueChange={handleApplicationsChange}
        data-testid='applications-filter'
      >
        <FilterDropdownTrigger />
        <ApplicationMenu />
      </FilterDropdown>
    </div>
  );
};

/**
 * Each option shows its policy count, "No policies" for zero. ✕ on the trigger returns to every
 * scope, not one level up.
 */
export const ScopeFilter: StoryFn = () => {
  const [scope, setScope] = useState<string[]>([]);
  const scopes = createFilterCascadeCollection(DEPLOYMENTS, {
    getValue: node => node.id,
    getLabel: node => node.name,
    hasChildren: node => node.kind === 'deployment',
    getIcon: node => (
      <span
        aria-hidden
        className={
          node.kind === 'deployment'
            ? 'size-6 rounded-full bg-badge-sky-strong'
            : 'size-6 rounded-full bg-badge-teal-strong'
        }
      />
    ),
    getDescription: node =>
      node.policies === 0
        ? 'No policies'
        : `${node.policies} ${node.policies === 1 ? 'policy' : 'policies'}`,
  });

  const loadApplications = (deployment: ScopeNode) => fetchApplications(deployment.id);
  const handleScopeChange = (details: FilterCascadeValueChangeDetails) => setScope(details.value);
  const renderLevel = (level: FilterCascadeLevelData) =>
    level.depth === 0 ? (
      <FilterCascadeItems />
    ) : (
      <>
        <FilterCascadeParentItem />
        <FilterCascadeItems />
      </>
    );

  return (
    <div className='p-24'>
      <FilterCascade
        label='Scope'
        collection={scopes}
        loadChildren={loadApplications}
        parentLabel='Deployment level'
        value={scope}
        onValueChange={handleScopeChange}
        data-testid='scope-filter'
      >
        <FilterCascadeTrigger />
        <FilterCascadeContent>
          <FilterCascadeSearch placeholder='Search' />
          <FilterCascadeLevels>{renderLevel}</FilterCascadeLevels>
        </FilterCascadeContent>
      </FilterCascade>
    </div>
  );
};

/**
 * A settings field saves on pick, with no Save button. A query with no match shows
 * `SelectEmptyState` and keeps the menu open.
 */
export const SearchableSelect: StoryFn = () => {
  const [timeZone, setTimeZone] = useState('UTC');
  const timeZones = createListCollection({ items: TIME_ZONES });
  const { searchValue, onSearchChange, filteredCollection } = useSelectSearch(timeZones);

  const handleTimeZoneChange = (details: { value: string[] }) => {
    const next = details.value[0] ?? timeZone;
    setTimeZone(next);
    onTimeZoneSaved(next);
  };

  return (
    <div className='w-[400px] p-24'>
      <Field>
        <FieldLabel>Time zone</FieldLabel>
        <Select
          collection={timeZones}
          value={[timeZone]}
          positioning={{ sameWidth: true }}
          onValueChange={handleTimeZoneChange}
          data-testid='timezone-select'
        >
          <SelectInput placeholder='Choose a time zone' data-testid='timezone-input' />
          <SelectPositioner className='min-w-full max-w-full'>
            <SelectHeader>
              <SelectSearchInput value={searchValue} onChange={onSearchChange} />
            </SelectHeader>
            <SelectContent>
              {filteredCollection.size === 0 ? (
                <SelectEmptyState description={`No results for "${searchValue}"`} />
              ) : (
                filteredCollection.items.map(item => (
                  <SelectOption key={item.value} item={item}>
                    <SelectOptionText>{item.label}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                ))
              )}
            </SelectContent>
          </SelectPositioner>
        </Select>
        <FieldDescription>
          Dates in reports and on the Attacks page use this time zone.
        </FieldDescription>
      </Field>
    </div>
  );
};

/**
 * Search and status tabs sit over a selectable `Table`. Picked rows stay picked while the search
 * changes, because rows are keyed by `getRowId`.
 */
export const PickerDialog: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selection, setSelection] = useState<TableRowSelectionState>({});

  const renderMember = ({ row }: TableCellContext<Member, unknown>) => (
    <Avatar size='md'>
      <AvatarFallback name={row.original.name} />
      <AvatarContent>
        <AvatarName>{row.original.name}</AvatarName>
        <AvatarDescription>{row.original.email}</AvatarDescription>
      </AvatarContent>
    </Avatar>
  );

  const renderStatus = ({ row }: TableCellContext<Member, unknown>) =>
    row.original.status === 'active' ? 'Active' : 'Invited';

  const columns: TableColumnDef<Member>[] = [
    { accessorKey: 'name', header: 'User', size: 520, cell: renderMember },
    { accessorKey: 'status', header: 'Status', size: 200, cell: renderStatus },
  ];

  const search = query.trim().toLowerCase();
  const matching = MEMBERS.filter(
    member =>
      member.name.toLowerCase().includes(search) || member.email.toLowerCase().includes(search),
  );
  const activeCount = matching.filter(member => member.status === 'active').length;
  const invitedCount = matching.length - activeCount;
  const rows = status === 'all' ? matching : matching.filter(member => member.status === status);
  const count = Object.keys(selection).length;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery('');
      setStatus('all');
      setSelection({});
    }
  };
  const handleOpen = () => setOpen(true);
  const handleAdd = () => {
    onAddUsers(Object.keys(selection));
    handleOpenChange(false);
  };

  return (
    <div className='p-24'>
      <Button size='medium' onClick={handleOpen} data-testid='members-add'>
        <UserPlus />
        Add users
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange} width={960} data-testid='members-picker'>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add users to Security team</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className='flex flex-col gap-8'>
              <div className='flex items-center gap-12'>
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder='Search name or email'
                  className='flex-1'
                  data-testid='members-search'
                />
                <SegmentedTabs
                  value={status}
                  onChange={setStatus}
                  data-testid='members-status-tabs'
                >
                  <SegmentedTabsList>
                    <SegmentedTabsTrigger value='all'>
                      All <NumericBadge>{matching.length}</NumericBadge>
                    </SegmentedTabsTrigger>
                    <SegmentedTabsTrigger value='active'>
                      Active <NumericBadge>{activeCount}</NumericBadge>
                    </SegmentedTabsTrigger>
                    <SegmentedTabsTrigger value='invited'>
                      Invited <NumericBadge>{invitedCount}</NumericBadge>
                    </SegmentedTabsTrigger>
                  </SegmentedTabsList>
                </SegmentedTabs>
              </div>
              <Table
                aria-label='Users to add'
                data={rows}
                columns={columns}
                getRowId={getMemberId}
                rowSelection={selection}
                onRowSelectionChange={setSelection}
                data-testid='members-table'
              >
                {rows.length === 0 && (
                  <EmptyState type='collection-empty' data-testid='members-no-results'>
                    <EmptyStateMessage>
                      <EmptyStateTitle>No users found</EmptyStateTitle>
                      <EmptyStateDescription>No users match your search.</EmptyStateDescription>
                    </EmptyStateMessage>
                  </EmptyState>
                )}
              </Table>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogFooterControls>
              <DialogClose asChild>
                <Button variant='ghost' color='neutral' size='large'>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                size='large'
                disabled={count === 0}
                onClick={handleAdd}
                data-testid='members-confirm'
              >
                {count === 0 ? 'Add users' : `Add ${count} ${count === 1 ? 'user' : 'users'}`}
              </Button>
            </DialogFooterControls>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import { useState } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { fn } from 'storybook/test';

import { Button } from '../../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateMessage,
  EmptyStateTitle,
} from '../../components/EmptyState';
import { Heading } from '../../components/Heading';
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
import type { TableColumnDef } from '../../components/Table';
import { Table, TableEmptyState } from '../../components/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/Tabs';
import { Text } from '../../components/Text';
import { Bell, CheckCheck, FilterX, History, Link2, SearchX, Shapes } from '../../icons';

interface Trigger {
  id: string;
  name: string;
  condition: string;
  action: string;
}

const TRIGGERS: Trigger[] = [
  {
    id: 'tr-201',
    name: 'Brute-force on /login',
    condition: 'More than 30 attacks in 1 minute',
    action: 'Denylist the IP for 1 hour',
  },
  {
    id: 'tr-202',
    name: 'New API endpoint discovered',
    condition: 'API Discovery finds a new endpoint',
    action: 'Notify #api-security in Slack',
  },
  {
    id: 'tr-203',
    name: 'High-risk vulnerability',
    condition: 'A high-risk vulnerability is detected',
    action: 'Create a Jira issue',
  },
];

const TRIGGER_COLUMNS: TableColumnDef<Trigger>[] = [
  { accessorKey: 'name', header: 'Name', size: 280 },
  { accessorKey: 'condition', header: 'Condition', size: 320 },
  { accessorKey: 'action', header: 'Action', size: 280 },
];

interface MappingRule {
  id: string;
  claim: string;
  grants: string;
}

// The identity provider has no mapping rules yet.
const MAPPING_RULES: MappingRule[] = [];

const MAPPING_RULE_COLUMNS: TableColumnDef<MappingRule>[] = [
  { accessorKey: 'claim', header: 'Claim', size: 280 },
  { accessorKey: 'grants', header: 'Grants', size: 280 },
];

const onCreateTrigger = fn().mockName('onCreateTrigger');

const getTriggerId = (trigger: Trigger) => trigger.id;

const getMappingRuleId = (rule: MappingRule) => rule.id;

const meta = {
  title: 'Patterns/Empty states',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when a table, nested table, tab, section, column or menu has no content and you must pick the EmptyState scale, copy and action.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * The header, toolbar and column headers stay visible. Typing a search switches the copy to
 * "No results found" with "Reset filters": the app passes its own flag for the cause.
 */
export const Default: StoryFn = () => {
  const [query, setQuery] = useState('');

  const isFiltered = query.trim() !== '';

  const handleReset = () => setQuery('');

  return (
    <Page name='triggers' fullSize fixedHeight data-testid='triggers-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>Triggers</PageTitle>
          <PageDescription>
            Automatic reactions to attacks, incidents and new API endpoints.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={onCreateTrigger} data-testid='triggers-create'>
            Create trigger
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search triggers'
          className='w-320'
          data-testid='triggers-search'
        />
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='Triggers'
          data={[]}
          columns={TRIGGER_COLUMNS}
          getRowId={getTriggerId}
          data-testid='triggers-table'
        >
          <TableEmptyState>
            {isFiltered ? (
              <EmptyState data-testid='triggers-no-results'>
                <EmptyStateIllustration>
                  <SearchX />
                </EmptyStateIllustration>
                <EmptyStateMessage>
                  <EmptyStateTitle>No results found</EmptyStateTitle>
                  <EmptyStateDescription>
                    Try resetting your search or filters.
                  </EmptyStateDescription>
                </EmptyStateMessage>
                <EmptyStateActions>
                  <Button size='medium' variant='outline' color='neutral' onClick={handleReset}>
                    <FilterX />
                    Reset filters
                  </Button>
                </EmptyStateActions>
              </EmptyState>
            ) : (
              <EmptyState data-testid='triggers-empty-state'>
                <EmptyStateIllustration>
                  <Bell />
                </EmptyStateIllustration>
                <EmptyStateMessage>
                  <EmptyStateTitle>No triggers yet</EmptyStateTitle>
                  <EmptyStateDescription>
                    Create one to block an IP or notify your team when an attack matches its
                    condition.
                  </EmptyStateDescription>
                </EmptyStateMessage>
              </EmptyState>
            )}
          </TableEmptyState>
        </Table>
      </PageContent>
    </Page>
  );
};

/**
 * The table has rows: "Reset filters" clears the search and they come back.
 */
export const NoResults: StoryFn = () => {
  const [query, setQuery] = useState('graphql');

  const search = query.trim().toLowerCase();
  const rows = TRIGGERS.filter(trigger => trigger.name.toLowerCase().includes(search));

  const handleReset = () => setQuery('');

  return (
    <Page name='triggers' fullSize fixedHeight data-testid='triggers-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>Triggers</PageTitle>
          <PageDescription>
            Automatic reactions to attacks, incidents and new API endpoints.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={onCreateTrigger} data-testid='triggers-create'>
            Create trigger
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search triggers'
          className='w-320'
          data-testid='triggers-search'
        />
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='Triggers'
          data={rows}
          columns={TRIGGER_COLUMNS}
          getRowId={getTriggerId}
          data-testid='triggers-table'
        >
          <TableEmptyState>
            <EmptyState data-testid='triggers-no-results'>
              <EmptyStateIllustration>
                <SearchX />
              </EmptyStateIllustration>
              <EmptyStateMessage>
                <EmptyStateTitle>No results found</EmptyStateTitle>
                <EmptyStateDescription>Try resetting your search or filters.</EmptyStateDescription>
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
 * No `TableEmptyState` here: its 128px vertical padding is too tall for a section.
 */
export const SectionTable: StoryFn = () => {
  const isLoading = false;

  return (
    <div className='flex w-640 flex-col gap-12 p-24' data-testid='mapping-rules-section'>
      <Heading size='lg' weight='medium'>
        Mapping rules
      </Heading>
      <Table
        aria-label='Mapping rules'
        data={MAPPING_RULES}
        columns={MAPPING_RULE_COLUMNS}
        getRowId={getMappingRuleId}
        isLoading={isLoading}
        data-testid='mapping-rules-table'
      >
        {MAPPING_RULES.length === 0 && !isLoading && (
          <EmptyState data-testid='mapping-rules-empty-state'>
            <EmptyStateIllustration>
              <Shapes />
            </EmptyStateIllustration>
            <EmptyStateMessage>
              <EmptyStateTitle>No rules yet</EmptyStateTitle>
              <EmptyStateDescription>
                Create one to grant a role or a group from a claim this provider sends.
              </EmptyStateDescription>
            </EmptyStateMessage>
          </EmptyState>
        )}
      </Table>
    </div>
  );
};

/**
 * The section header stays visible. **Never** "No operations yet".
 */
export const Dependency: StoryFn = () => (
  <div className='flex w-640 flex-col gap-12 p-24' data-testid='operations-section'>
    <Heading size='lg' weight='medium'>
      Operations
    </Heading>
    <EmptyState data-testid='operations-empty-state'>
      <EmptyStateIllustration>
        <Link2 />
      </EmptyStateIllustration>
      <EmptyStateMessage>
        <EmptyStateTitle>Select a service first</EmptyStateTitle>
        <EmptyStateDescription>Choose a service to pick its operations.</EmptyStateDescription>
      </EmptyStateMessage>
    </EmptyState>
  </div>
);

/**
 * A notification panel: no action, and every tab stays visible.
 */
export const EmptyTabs: StoryFn = () => {
  const [tab, setTab] = useState('unread');

  return (
    <div className='w-400 p-24'>
      <Tabs value={tab} onChange={setTab} data-testid='notifications-tabs'>
        <TabsList>
          <TabsTrigger value='unread'>Unread</TabsTrigger>
          <TabsTrigger value='read'>Read</TabsTrigger>
        </TabsList>
        <TabsContent value='unread'>
          <EmptyState data-testid='notifications-unread-empty'>
            <EmptyStateIllustration>
              <CheckCheck />
            </EmptyStateIllustration>
            <EmptyStateMessage>
              <EmptyStateTitle>You're all caught up</EmptyStateTitle>
              <EmptyStateDescription>
                New attacks and incidents will show up here.
              </EmptyStateDescription>
            </EmptyStateMessage>
          </EmptyState>
        </TabsContent>
        <TabsContent value='read'>
          <EmptyState data-testid='notifications-read-empty'>
            <EmptyStateIllustration>
              <History />
            </EmptyStateIllustration>
            <EmptyStateMessage>
              <EmptyStateTitle>Nothing read yet</EmptyStateTitle>
              <EmptyStateDescription>
                Notifications you open move to this tab.
              </EmptyStateDescription>
            </EmptyStateMessage>
          </EmptyState>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * `type='no-results'` has no illustration. Centre it in the column or the card body.
 */
export const SmallContainers: StoryFn = () => (
  <div className='flex gap-16 p-24'>
    <div
      className='flex h-320 w-280 flex-col gap-8 rounded-12 border border-border-primary-light p-12'
      data-testid='incidents-column-open'
    >
      <div className='flex items-center gap-8'>
        <Text size='sm' weight='medium'>
          Open
        </Text>
        <NumericBadge>1</NumericBadge>
      </div>
      <div className='flex flex-col gap-4 rounded-8 border border-border-primary p-12'>
        <Text size='sm' weight='medium'>
          SQL injection on /api/v2/payments
        </Text>
        <Text size='xs' color='secondary'>
          payments.acme-bank.com
        </Text>
      </div>
    </div>
    <div
      className='flex h-320 w-280 flex-col gap-8 rounded-12 border border-border-primary-light p-12'
      data-testid='incidents-column-in-progress'
    >
      <div className='flex items-center gap-8'>
        <Text size='sm' weight='medium'>
          In progress
        </Text>
        <NumericBadge>0</NumericBadge>
      </div>
      <div className='flex flex-1 items-center justify-center'>
        <EmptyState type='no-results' data-testid='incidents-column-empty'>
          <EmptyStateMessage>
            <EmptyStateTitle>Nothing runs here yet</EmptyStateTitle>
          </EmptyStateMessage>
        </EmptyState>
      </div>
    </div>
    <Card className='h-320 w-400' data-testid='attacks-chart'>
      <CardHeader>
        <CardTitle>Attacks by type</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center'>
        <EmptyState type='no-results' data-testid='attacks-chart-empty'>
          <EmptyStateMessage>
            <EmptyStateDescription>No data found for selected period</EmptyStateDescription>
          </EmptyStateMessage>
        </EmptyState>
      </CardContent>
    </Card>
  </div>
);

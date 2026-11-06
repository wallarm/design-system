import { useState } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Button } from '../../components/Button';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateMessage,
  EmptyStateTitle,
} from '../../components/EmptyState';
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
import { Chart, ChartHeader, ChartTitle } from '../../components/SimpleCharts';
import type { TableColumnDef } from '../../components/Table';
import { Table, TableEmptyState } from '../../components/Table';
import { Text } from '../../components/Text';
import { CloudOff, Lock, RefreshCcw } from '../../icons';

interface Trigger {
  id: string;
  name: string;
  condition: string;
  action: string;
}

interface RoleRule {
  id: string;
  claim: string;
  role: string;
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
];

const TRIGGER_COLUMNS: TableColumnDef<Trigger>[] = [
  { accessorKey: 'name', header: 'Name', size: 280 },
  { accessorKey: 'condition', header: 'Condition', size: 320 },
  { accessorKey: 'action', header: 'Action', size: 280 },
];

const RULE_COLUMNS: TableColumnDef<RoleRule>[] = [
  { accessorKey: 'claim', header: 'Claim', size: 300 },
  { accessorKey: 'role', header: 'Role', size: 200 },
];

const onCreateTrigger = fn().mockName('onCreateTrigger');
const onRetryRules = fn().mockName('onRetryRules');
const onRetryChart = fn().mockName('onRetryChart');
const onReconnect = fn().mockName('onReconnect');

const getTriggerId = (trigger: Trigger) => trigger.id;
const getRuleId = (rule: RoleRule) => rule.id;

const meta = {
  title: 'Patterns/Error states',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when content could not load or the user may not see it: a failed request, no permission, a lost connection. Built from the same EmptyState parts as an empty state.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * The list failed to load. The header, the create action and the search stay; the table keeps
 * its columns and shows the error in place of the rows. "Try again" refetches; while it runs,
 * the table shows its `isLoading` skeleton, not the error.
 */
export const Default: StoryFn = () => {
  const [status, setStatus] = useState<'error' | 'ready'>('error');

  const handleRetry = () => setStatus('ready');

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
          <Button size='medium' onClick={onCreateTrigger}>
            Create trigger
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput placeholder='Search triggers' className='w-320' />
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='Triggers'
          data={status === 'ready' ? TRIGGERS : []}
          columns={TRIGGER_COLUMNS}
          getRowId={getTriggerId}
          data-testid='triggers-table'
        >
          <TableEmptyState>
            <EmptyState data-testid='triggers-error'>
              <EmptyStateIllustration>
                <CloudOff />
              </EmptyStateIllustration>
              <EmptyStateMessage>
                <EmptyStateTitle>Couldn't load triggers</EmptyStateTitle>
                <EmptyStateDescription>
                  The server didn't respond. Your triggers are safe; try again in a moment.
                </EmptyStateDescription>
              </EmptyStateMessage>
              <EmptyStateActions>
                <Button size='medium' variant='outline' color='neutral' onClick={handleRetry}>
                  <RefreshCcw />
                  Try again
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
 * No permission: retrying would fail the same way, so there is no button. The description names
 * the permission and who grants it. The create action goes too: the user can't use it.
 */
export const NoAccess: StoryFn = () => (
  <Page name='triggers' fullSize fixedHeight data-testid='triggers-page'>
    <PageHeader>
      <PageHeaderGroup className='flex-1'>
        <PageTitle>Triggers</PageTitle>
        <PageDescription>
          Automatic reactions to attacks, incidents and new API endpoints.
        </PageDescription>
      </PageHeaderGroup>
    </PageHeader>

    <PageContent>
      <Table
        aria-label='Triggers'
        data={[]}
        columns={TRIGGER_COLUMNS}
        getRowId={getTriggerId}
        data-testid='triggers-table'
      >
        <TableEmptyState>
          <EmptyState data-testid='triggers-no-access'>
            <EmptyStateIllustration>
              <Lock />
            </EmptyStateIllustration>
            <EmptyStateMessage>
              <EmptyStateTitle>You can't view triggers</EmptyStateTitle>
              <EmptyStateDescription>
                Ask an administrator of your company for the Triggers permission.
              </EmptyStateDescription>
            </EmptyStateMessage>
          </EmptyState>
        </TableEmptyState>
      </Table>
    </PageContent>
  </Page>
);

/**
 * A table inside a drawer or a section failed: `EmptyState` sits right in the `Table`, the
 * columns stay, and "Try again" is the one action. The rest of the drawer keeps working.
 */
export const Section: StoryFn = () => (
  <div className='w-640 p-24'>
    <Table
      aria-label='Role rules'
      data={[]}
      columns={RULE_COLUMNS}
      getRowId={getRuleId}
      data-testid='rules-table'
    >
      <EmptyState data-testid='rules-error'>
        <EmptyStateIllustration>
          <CloudOff />
        </EmptyStateIllustration>
        <EmptyStateMessage>
          <EmptyStateTitle>Couldn't load role rules</EmptyStateTitle>
          <EmptyStateDescription>Something went wrong on our side.</EmptyStateDescription>
        </EmptyStateMessage>
        <EmptyStateActions>
          <Button size='medium' variant='outline' color='neutral' onClick={onRetryRules}>
            <RefreshCcw />
            Try again
          </Button>
        </EmptyStateActions>
      </EmptyState>
    </Table>
  </div>
);

/**
 * Small containers use `type='no-results'`: a chart card keeps its title and says the data didn't
 * load; a panel that depends on a lost connection names it and offers to reconnect.
 */
export const SmallContainers: StoryFn = () => (
  <div className='flex gap-16 p-24'>
    <div className='w-400'>
      <Chart className='h-220' data-testid='attacks-chart'>
        <ChartHeader>
          <ChartTitle>Attacks by type</ChartTitle>
        </ChartHeader>
        <div className='flex flex-1 items-center justify-center'>
          <EmptyState type='no-results' data-testid='attacks-chart-error'>
            <EmptyStateMessage>
              <EmptyStateDescription>Couldn't load data for this period</EmptyStateDescription>
            </EmptyStateMessage>
            <EmptyStateActions>
              <Button size='small' variant='outline' color='neutral' onClick={onRetryChart}>
                Try again
              </Button>
            </EmptyStateActions>
          </EmptyState>
        </div>
      </Chart>
    </div>
    <div
      className='flex h-220 w-280 flex-col gap-8 rounded-12 border border-border-primary-light p-12'
      data-testid='jira-panel'
    >
      <Text size='sm' weight='medium'>
        Jira issues
      </Text>
      <div className='flex flex-1 items-center justify-center'>
        <EmptyState type='no-results' data-testid='jira-panel-error'>
          <EmptyStateMessage>
            <EmptyStateTitle>Jira is disconnected</EmptyStateTitle>
          </EmptyStateMessage>
          <EmptyStateActions>
            <Button size='small' variant='outline' color='neutral' onClick={onReconnect}>
              Reconnect
            </Button>
          </EmptyStateActions>
        </EmptyState>
      </div>
    </div>
  </div>
);

import { useState } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Button } from '../../components/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemText,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu';
import {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderGroup,
  PageTitle,
} from '../../components/Page';
import type { TableCellContext, TableColumnDef, TableRow } from '../../components/Table';
import { Table } from '../../components/Table';
import { ToastActions, useToast } from '../../components/Toast';
import { Ellipsis } from '../../icons';

interface Channel {
  id: string;
  name: string;
  provider: string;
  events: string;
  link: string;
}

const CHANNELS: Channel[] = [
  {
    id: 'ch-soc-alerts',
    name: '#soc-alerts',
    provider: 'Slack',
    events: 'Attacks, Vulnerabilities',
    link: 'https://my.wallarm.com/integrations/ch-soc-alerts',
  },
  {
    id: 'ch-oncall',
    name: 'Security on-call',
    provider: 'PagerDuty',
    events: 'Incidents',
    link: 'https://my.wallarm.com/integrations/ch-oncall',
  },
  {
    id: 'ch-siem',
    name: 'SIEM ingest',
    provider: 'Splunk',
    events: 'Attacks, Incidents, System events',
    link: 'https://my.wallarm.com/integrations/ch-siem',
  },
  {
    id: 'ch-weekly',
    name: 'Weekly report',
    provider: 'Email',
    events: 'Weekly summary',
    link: 'https://my.wallarm.com/integrations/ch-weekly',
  },
];

const ONCALL_LINK = 'https://my.wallarm.com/integrations/ch-oncall';

const onOpenDestination = fn().mockName('onOpenDestination');
const onDeleteChannel = fn().mockName('onDeleteChannel');

// Stand-ins for the app's API calls: a test request that takes a moment and resolves or fails.
const sendTestNotification = () => new Promise<void>(resolve => setTimeout(resolve, 1500));
const sendRejectedTestNotification = () =>
  new Promise<void>((_, reject) =>
    setTimeout(
      () => reject(new Error('Splunk rejected the request: HEC token is invalid or disabled.')),
      1500,
    ),
  );

const getChannelId = (channel: Channel) => channel.id;

const meta = {
  title: 'Patterns/Feedback toasts',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when a mutation finishes (row menu, bulk bar, dialog confirm, autosave, test run) and the app must report the result with a transient toast.',
      },
    },
  },
} satisfies Meta;

export default meta;

// The host shell gives a page its height; 640px stands in for it on whole-page stories.
const hostShell: StoryFn['decorators'] = [
  Story => (
    <div className='h-640'>
      <Story />
    </div>
  ),
];

/**
 * The whole page, with every toast from the one app-root `Toaster`: create, then send test, copy
 * link and delete from each row's menu. The parts below show each toast on its own.
 */
export const Default: StoryFn = () => {
  const toast = useToast();
  const [channels, setChannels] = useState(CHANNELS);
  const [deleteTarget, setDeleteTarget] = useState<Channel | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleCreate = () => {
    toast.create({
      id: 'channel-created',
      title: 'Channel created',
      description: 'Route notifications through this channel in a destination.',
      type: 'default',
      actions: (
        <ToastActions>
          <Button variant='secondary' size='small' color='neutral-alt' onClick={onOpenDestination}>
            Go to destination
          </Button>
        </ToastActions>
      ),
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    onDeleteChannel(deleteTarget);
    setChannels(channels.filter(channel => channel.id !== deleteTarget.id));
    setDeleteOpen(false);
    toast.create({ id: `delete-${deleteTarget.id}`, title: 'Channel deleted', type: 'default' });
  };

  const renderMenuAction = (row: TableRow<Channel>) => {
    const channel = row.original;

    const handleTest = async () => {
      const id = toast.create({
        id: `test-${channel.id}`,
        title: 'Testing channel…',
        type: 'loading',
      });
      try {
        await sendTestNotification();
        toast.update({ id, title: `Test delivered via ${channel.provider}`, type: 'success' });
      } catch (error) {
        toast.update({
          id,
          title: 'Test failed',
          description: error instanceof Error ? error.message : undefined,
          type: 'error',
          duration: 10000,
        });
      }
    };

    const handleCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(channel.link);
        toast.create({ id: 'copy-link', title: 'Link copied', type: 'default' });
      } catch {
        toast.create({ id: 'copy-link', title: 'Copy failed', type: 'error' });
      }
    };

    const handleDelete = () => {
      setDeleteTarget(channel);
      setDeleteOpen(true);
    };

    return (
      <DropdownMenu data-testid='channel-actions'>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            aria-label={`Actions for ${channel.name}`}
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleTest}>
            <DropdownMenuItemText>Send test</DropdownMenuItemText>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleCopyLink}>
            <DropdownMenuItemText>Copy link</DropdownMenuItemText>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onSelect={handleDelete}>
            <DropdownMenuItemText>Delete channel</DropdownMenuItemText>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const columns: TableColumnDef<Channel>[] = [
    { accessorKey: 'name', header: 'Name', size: 240, meta: { renderMenuAction } },
    { accessorKey: 'provider', header: 'Provider', size: 160 },
    { accessorKey: 'events', header: 'Events', size: 320 },
  ];

  return (
    <Page name='integrations-channels' fullSize fixedHeight data-testid='channels-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>Notification channels</PageTitle>
          <PageDescription>
            Where Wallarm sends attack, incident and system notifications.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={handleCreate} data-testid='channels-create'>
            Create channel
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <Table
          aria-label='Notification channels'
          data={channels}
          columns={columns}
          getRowId={getChannelId}
          data-testid='channels-table'
        />
      </PageContent>

      <Dialog
        width={400}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        data-testid='channels-delete-dialog'
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete channel?</DialogTitle>
            <DialogDescription>
              Wallarm stops sending notifications to {deleteTarget?.name}. You can't undo this.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost' color='neutral'>
                Cancel
              </Button>
            </DialogClose>
            <Button color='destructive' onClick={handleConfirmDelete}>
              Delete channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

Default.decorators = hostShell;

/** The description switches the toast to the extended layout, so it stays 10000 ms. */
export const NextStep: StoryFn = () => {
  const toast = useToast();

  const handleCreate = () => {
    toast.create({
      id: 'channel-created',
      title: 'Channel created',
      description: 'Route notifications through this channel in a destination.',
      type: 'default',
      actions: (
        <ToastActions>
          <Button variant='secondary' size='small' color='neutral-alt' onClick={onOpenDestination}>
            Go to destination
          </Button>
        </ToastActions>
      ),
    });
  };

  return (
    <Page name='integrations-channels' data-testid='channels-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>Notification channels</PageTitle>
          <PageDescription>
            Where Wallarm sends attack, incident and system notifications.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={handleCreate} data-testid='channels-create'>
            Create channel
          </Button>
        </PageActions>
      </PageHeader>
    </Page>
  );
};

/** The loading toast has no timer; the 5000 ms timer starts when `update` resolves it. */
export const TestDelivered: StoryFn = () => {
  const toast = useToast();

  const handleTest = async () => {
    const id = toast.create({
      id: 'test-ch-soc-alerts',
      title: 'Testing channel…',
      type: 'loading',
    });
    try {
      await sendTestNotification();
      toast.update({ id, title: 'Test delivered via Slack', type: 'success' });
    } catch (error) {
      toast.update({
        id,
        title: 'Test failed',
        description: error instanceof Error ? error.message : undefined,
        type: 'error',
        duration: 10000,
      });
    }
  };

  return (
    <Page name='integrations-channel' data-testid='channel-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>#soc-alerts</PageTitle>
          <PageDescription>Slack channel. Receives attacks and vulnerabilities.</PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button
            size='medium'
            variant='outline'
            color='neutral'
            onClick={handleTest}
            data-testid='channel-send-test'
          >
            Send test
          </Button>
        </PageActions>
      </PageHeader>
    </Page>
  );
};

/** The action goes in `title` and the provider's cause in `description`. */
export const TestFailed: StoryFn = () => {
  const toast = useToast();

  const handleTest = async () => {
    const id = toast.create({ id: 'test-ch-siem', title: 'Testing channel…', type: 'loading' });
    try {
      await sendRejectedTestNotification();
      toast.update({ id, title: 'Test delivered via Splunk', type: 'success' });
    } catch (error) {
      toast.update({
        id,
        title: 'Test failed',
        description: error instanceof Error ? error.message : undefined,
        type: 'error',
        duration: 10000,
      });
    }
  };

  return (
    <Page name='integrations-channel' data-testid='channel-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>SIEM ingest</PageTitle>
          <PageDescription>
            Splunk HTTP Event Collector. Receives attacks, incidents and system events.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button
            size='medium'
            variant='outline'
            color='neutral'
            onClick={handleTest}
            data-testid='channel-send-test'
          >
            Send test
          </Button>
        </PageActions>
      </PageHeader>
    </Page>
  );
};

/** If the clipboard is blocked, the same id turns the toast into an error. */
export const CopyLink: StoryFn = () => {
  const toast = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(ONCALL_LINK);
      toast.create({ id: 'copy-link', title: 'Link copied', type: 'default' });
    } catch {
      toast.create({ id: 'copy-link', title: 'Copy failed', type: 'error' });
    }
  };

  return (
    <Page name='integrations-channel' data-testid='channel-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>Security on-call</PageTitle>
          <PageDescription>PagerDuty service. Receives incidents.</PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button
            size='medium'
            variant='outline'
            color='neutral'
            onClick={handleCopyLink}
            data-testid='channel-copy-link'
          >
            Copy link
          </Button>
        </PageActions>
      </PageHeader>
    </Page>
  );
};

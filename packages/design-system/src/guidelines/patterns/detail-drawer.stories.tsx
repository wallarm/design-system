import { useState } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  Alert,
  AlertContent,
  AlertControls,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '../../components/Alert';
import { Attribute, AttributeLabel, AttributeValue } from '../../components/Attribute';
import { Button } from '../../components/Button';
import { InlineCodeSnippet } from '../../components/CodeSnippet';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerResizeHandle,
  DrawerTitle,
} from '../../components/Drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemText,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu';
import { EmptyState, EmptyStateMessage, EmptyStateTitle } from '../../components/EmptyState';
import { FormatDateTime } from '../../components/FormatDateTime';
import { Heading } from '../../components/Heading';
import { NumericBadge } from '../../components/NumericBadge';
import { Page, PageContent, PageHeader, PageHeaderGroup, PageTitle } from '../../components/Page';
import { Separator } from '../../components/Separator';
import { HStack, VStack } from '../../components/Stack';
import type { TableCellContext, TableColumnDef } from '../../components/Table';
import { Table } from '../../components/Table';
import { Tabs, TabsContent, TabsLineActions, TabsList, TabsTrigger } from '../../components/Tabs';
import { Tag } from '../../components/Tag';
import { ChevronDown, Plus } from '../../icons';

interface RoleRule {
  id: string;
  claim: string;
  value: string;
  role: string;
}

interface Domain {
  id: string;
  name: string;
  verifiedAt: string;
}

interface Provider {
  id: string;
  name: string;
  protocol: string;
  issuer: string;
  clientId: string;
  defaultRole: string | null;
  createdAt: string;
  rules: RoleRule[];
  domains: Domain[];
}

const OKTA: Provider = {
  id: 'sso-okta',
  name: 'Okta',
  protocol: 'OpenID Connect',
  issuer: 'https://acme-bank.okta.com/oauth2/default',
  clientId: '0oa8f2k1x9QdLp7Zt5d7',
  defaultRole: 'Read only',
  createdAt: '2026-03-12T09:24:00Z',
  rules: [
    { id: 'r-1', claim: 'groups', value: 'secops-admins', role: 'Administrator' },
    { id: 'r-2', claim: 'groups', value: 'secops-analysts', role: 'Security analyst' },
    { id: 'r-3', claim: 'groups', value: 'platform-ci', role: 'Deploy' },
  ],
  domains: [
    { id: 'd-1', name: 'acme-bank.com', verifiedAt: '2026-03-12T09:40:00Z' },
    { id: 'd-2', name: 'acme-bank.co.uk', verifiedAt: '2026-04-02T14:05:00Z' },
  ],
};

const ENTRA: Provider = {
  id: 'sso-entra',
  name: 'Microsoft Entra ID',
  protocol: 'SAML 2.0',
  issuer: 'https://sts.windows.net/7c1f3e2a-55b0-4d8e-9a61-2f0d4b9c8e13/',
  clientId: 'spn:4b1d7e90-2c3a-4f5e-8d6b-a0c9e1f2b3d4',
  defaultRole: null,
  createdAt: '2026-06-30T16:12:00Z',
  rules: [{ id: 'r-4', claim: 'roles', value: 'Wallarm.Auditor', role: 'Read only' }],
  domains: [{ id: 'd-3', name: 'acme-insurance.com', verifiedAt: '2026-07-01T08:30:00Z' }],
};

const GOOGLE: Provider = {
  id: 'sso-google',
  name: 'Google Workspace',
  protocol: 'OpenID Connect',
  issuer: 'https://accounts.google.com',
  clientId: '381204779513-k2v9t0c8.apps.googleusercontent.com',
  defaultRole: 'API developer',
  createdAt: '2026-10-21T11:48:00Z',
  rules: [],
  domains: [],
};

const PROVIDERS: Provider[] = [OKTA, ENTRA, GOOGLE];

const onEditProvider = fn().mockName('onEditProvider');
const onDisableProvider = fn().mockName('onDisableProvider');
const onGoToAuditLog = fn().mockName('onGoToAuditLog');
const onDeleteProvider = fn().mockName('onDeleteProvider');
const onCreateRule = fn().mockName('onCreateRule');
const onRestoreVersion = fn().mockName('onRestoreVersion');
const onSaveDrawerWidth = fn().mockName('onSaveDrawerWidth');

const getProviderId = (provider: Provider) => provider.id;
const getItemId = (item: { id: string }) => item.id;

const meta = {
  title: 'Patterns/Detail drawer',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when a row click opens a read-only view of one entity in a side panel, with key-value attributes, sections, tabs and a nested table.',
      },
    },
  },
} satisfies Meta;

export default meta;

// The host shell gives a page its height; 640px stands in for it.
const hostShell: StoryFn['decorators'] = [
  Story => (
    <div className='h-640'>
      <Story />
    </div>
  ),
];

/**
 * Click a provider name: one shared, non-modal drawer opens and the row stays marked. The header
 * has a single "Actions" menu; the body has horizontal attributes (a code value, a secret, a
 * timestamp), then full-width tabs with counts, each with an inset nested table. Google Workspace
 * has no rules, so its table keeps the headers and shows a short empty state.
 */
export const Default: StoryFn = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('rules');

  const provider = PROVIDERS.find(item => item.id === selectedId) ?? null;

  const renderClaim = ({ row }: TableCellContext<RoleRule, unknown>) => (
    <InlineCodeSnippet code={`${row.original.claim} = ${row.original.value}`} size='md' />
  );
  const renderRole = ({ row }: TableCellContext<RoleRule, unknown>) => (
    <Tag>{row.original.role}</Tag>
  );
  const renderVerifiedAt = ({ row }: TableCellContext<Domain, unknown>) => (
    <FormatDateTime value={row.original.verifiedAt} format='date' />
  );

  const columns: TableColumnDef<Provider>[] = [
    { accessorKey: 'name', header: 'Name', size: 260 },
    { accessorKey: 'protocol', header: 'Protocol', size: 180 },
    { accessorKey: 'issuer', header: 'Issuer', size: 360 },
  ];
  const ruleColumns: TableColumnDef<RoleRule>[] = [
    { id: 'claim', header: 'Claim', size: 300, cell: renderClaim },
    { accessorKey: 'role', header: 'Role', size: 200, cell: renderRole },
  ];
  const domainColumns: TableColumnDef<Domain>[] = [
    { accessorKey: 'name', header: 'Domain', size: 300 },
    { accessorKey: 'verifiedAt', header: 'Verified', size: 200, cell: renderVerifiedAt },
  ];

  const handleMasterCellClick = (id: string) => {
    setSelectedId(id);
    setOpen(true);
  };
  const handleEdit = () => onEditProvider(provider);
  const handleDisable = () => onDisableProvider(provider);
  const handleGoToAuditLog = () => onGoToAuditLog(provider);
  const handleDelete = () => onDeleteProvider(provider);
  const handleCreateRule = () => onCreateRule(provider);

  return (
    <Page name='settings-sso' fullSize fixedHeight data-testid='providers-page'>
      <PageHeader>
        <PageHeaderGroup>
          <PageTitle>SSO providers</PageTitle>
        </PageHeaderGroup>
      </PageHeader>

      <PageContent>
        <Table
          aria-label='SSO providers'
          data={PROVIDERS}
          columns={columns}
          getRowId={getProviderId}
          activeRowId={open ? selectedId : null}
          onMasterCellClick={handleMasterCellClick}
          data-testid='providers-table'
        />
      </PageContent>

      <Drawer
        open={open}
        onOpenChange={setOpen}
        modal={false}
        overlay={false}
        closeOnOutsideClick={false}
        width={640}
        data-testid='provider-drawer'
      >
        <DrawerContent>
          <DrawerResizeHandle />
          <DrawerHeader>
            <DrawerTitle>{provider?.name}</DrawerTitle>
            <DropdownMenu data-testid='provider-actions'>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' color='neutral' size='small'>
                  Actions <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={handleEdit}>
                  <DropdownMenuItemText>Edit provider</DropdownMenuItemText>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleDisable}>
                  <DropdownMenuItemText>Disable provider</DropdownMenuItemText>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleGoToAuditLog}>
                  <DropdownMenuItemText>Go to audit log</DropdownMenuItemText>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant='destructive' onSelect={handleDelete}>
                  <DropdownMenuItemText>Delete provider</DropdownMenuItemText>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DrawerHeader>

          <DrawerBody>
            {provider && (
              <>
                <VStack gap={6} className='pb-8' data-testid='provider-attributes'>
                  <Attribute orientation='horizontal'>
                    <AttributeLabel width={140}>Protocol</AttributeLabel>
                    <AttributeValue>{provider.protocol}</AttributeValue>
                  </Attribute>
                  <Attribute orientation='horizontal'>
                    <AttributeLabel width={140}>Issuer URL</AttributeLabel>
                    <AttributeValue>
                      <InlineCodeSnippet code={provider.issuer} size='md' />
                    </AttributeValue>
                  </Attribute>
                  <Attribute orientation='horizontal'>
                    <AttributeLabel width={140}>Client ID</AttributeLabel>
                    <AttributeValue>
                      <InlineCodeSnippet code={provider.clientId} size='md' />
                    </AttributeValue>
                  </Attribute>
                  <Attribute orientation='horizontal'>
                    <AttributeLabel width={140}>Client secret</AttributeLabel>
                    <AttributeValue>Set — never shown</AttributeValue>
                  </Attribute>
                  <Attribute orientation='horizontal' isEmpty={!provider.defaultRole}>
                    <AttributeLabel width={140}>Default role</AttributeLabel>
                    <AttributeValue>
                      {provider.defaultRole && <Tag>{provider.defaultRole}</Tag>}
                    </AttributeValue>
                  </Attribute>
                  <Attribute orientation='horizontal'>
                    <AttributeLabel width={140}>Created at</AttributeLabel>
                    <AttributeValue>
                      <FormatDateTime
                        value={provider.createdAt}
                        format='datetime'
                        layout='inline'
                      />
                    </AttributeValue>
                  </Attribute>
                </VStack>

                <Separator spacing={4} />

                <Tabs value={tab} onChange={setTab} data-testid='provider-tabs'>
                  <div className='-mx-24'>
                    <TabsList>
                      <TabsTrigger value='rules'>
                        Role rules <NumericBadge>{provider.rules.length}</NumericBadge>
                      </TabsTrigger>
                      <TabsTrigger value='domains'>
                        Domains <NumericBadge>{provider.domains.length}</NumericBadge>
                      </TabsTrigger>
                      <TabsLineActions>
                        <Button size='small' onClick={handleCreateRule}>
                          <Plus /> Create rule
                        </Button>
                      </TabsLineActions>
                    </TabsList>
                  </div>
                  <TabsContent value='rules'>
                    <div className='-mx-8 pt-8'>
                      <Table
                        aria-label='Role rules'
                        data={provider.rules}
                        columns={ruleColumns}
                        getRowId={getItemId}
                        data-testid='provider-rules-table'
                      >
                        {provider.rules.length === 0 && (
                          <EmptyState type='collection-empty' data-testid='provider-rules-empty'>
                            <EmptyStateMessage>
                              <EmptyStateTitle>No role rules yet</EmptyStateTitle>
                            </EmptyStateMessage>
                          </EmptyState>
                        )}
                      </Table>
                    </div>
                  </TabsContent>
                  <TabsContent value='domains'>
                    <div className='-mx-8 pt-8'>
                      <Table
                        aria-label='Domains'
                        data={provider.domains}
                        columns={domainColumns}
                        getRowId={getItemId}
                        data-testid='provider-domains-table'
                      >
                        {provider.domains.length === 0 && (
                          <EmptyState type='collection-empty'>
                            <EmptyStateMessage>
                              <EmptyStateTitle>No domains yet</EmptyStateTitle>
                            </EmptyStateMessage>
                          </EmptyState>
                        )}
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Page>
  );
};

Default.decorators = hostShell;

/**
 * Drag the left edge to resize between 400 and 1130px; `onResizeEnd` gets the final width to
 * persist. The close X comes built in, so there is no footer and no close button of your own.
 */
export const Header: StoryFn = () => {
  const [open, setOpen] = useState(true);

  const handleEdit = () => onEditProvider(OKTA);
  const handleDisable = () => onDisableProvider(OKTA);
  const handleGoToAuditLog = () => onGoToAuditLog(OKTA);
  const handleDelete = () => onDeleteProvider(OKTA);

  return (
    <Drawer open={open} onOpenChange={setOpen} width={640} data-testid='provider-drawer'>
      <DrawerContent>
        <DrawerResizeHandle onResizeEnd={onSaveDrawerWidth} />
        <DrawerHeader>
          <DrawerTitle>{OKTA.name}</DrawerTitle>
          <DropdownMenu data-testid='provider-actions'>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' color='neutral' size='small'>
                Actions <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={handleEdit}>
                <DropdownMenuItemText>Edit provider</DropdownMenuItemText>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDisable}>
                <DropdownMenuItemText>Disable provider</DropdownMenuItemText>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleGoToAuditLog}>
                <DropdownMenuItemText>Go to audit log</DropdownMenuItemText>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant='destructive' onSelect={handleDelete}>
                <DropdownMenuItemText>Delete provider</DropdownMenuItemText>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DrawerHeader>
        <DrawerBody>
          <VStack gap={6} className='pb-8'>
            <Attribute orientation='horizontal'>
              <AttributeLabel width={140}>Protocol</AttributeLabel>
              <AttributeValue>{OKTA.protocol}</AttributeValue>
            </Attribute>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

Header.decorators = hostShell;

/**
 * Every row is horizontal with the same 140px label. Entra ID has no default role, so that row
 * stays and shows the empty marker; the codes copy on click.
 */
export const Attributes: StoryFn = () => {
  const [open, setOpen] = useState(true);

  return (
    <Drawer open={open} onOpenChange={setOpen} width={640} data-testid='provider-drawer'>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{ENTRA.name}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <VStack gap={6} className='pb-8' data-testid='provider-attributes'>
            <Attribute orientation='horizontal'>
              <AttributeLabel width={140}>Client ID</AttributeLabel>
              <AttributeValue>
                <InlineCodeSnippet code={ENTRA.clientId} size='md' />
              </AttributeValue>
            </Attribute>
            <Attribute orientation='horizontal'>
              <AttributeLabel width={140}>Client secret</AttributeLabel>
              <AttributeValue>Set — never shown</AttributeValue>
            </Attribute>
            <Attribute orientation='horizontal' isEmpty={!ENTRA.defaultRole}>
              <AttributeLabel width={140}>Default role</AttributeLabel>
              <AttributeValue>{ENTRA.defaultRole && <Tag>{ENTRA.defaultRole}</Tag>}</AttributeValue>
            </Attribute>
            <Attribute orientation='horizontal'>
              <AttributeLabel width={140}>Created at</AttributeLabel>
              <AttributeValue>
                <FormatDateTime value={ENTRA.createdAt} format='datetime' layout='inline' />
              </AttributeValue>
            </Attribute>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

Attributes.decorators = hostShell;

/**
 * The first group needs no title. Each later group starts with a `Separator` and a header row; the
 * action applies to that section only.
 */
export const Section: StoryFn = () => {
  const [open, setOpen] = useState(true);

  const handleEditDefaults = () => onEditProvider(OKTA);

  return (
    <Drawer open={open} onOpenChange={setOpen} width={640} data-testid='provider-drawer'>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{OKTA.name}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <VStack gap={6} className='pb-8'>
            <Attribute orientation='horizontal'>
              <AttributeLabel width={140}>Protocol</AttributeLabel>
              <AttributeValue>{OKTA.protocol}</AttributeValue>
            </Attribute>
            <Attribute orientation='horizontal'>
              <AttributeLabel width={140}>Issuer URL</AttributeLabel>
              <AttributeValue>
                <InlineCodeSnippet code={OKTA.issuer} size='md' />
              </AttributeValue>
            </Attribute>
          </VStack>

          <Separator spacing={4} />

          <HStack
            justify='between'
            align='center'
            className='py-8'
            data-testid='provider-defaults-section'
          >
            <Heading as='h3' size='md' weight='medium'>
              Defaults
            </Heading>
            <Button size='small' variant='outline' color='neutral' onClick={handleEditDefaults}>
              Edit defaults
            </Button>
          </HStack>
          <VStack gap={6} className='pb-8'>
            <Attribute orientation='horizontal' isEmpty={!OKTA.defaultRole}>
              <AttributeLabel width={140}>Default role</AttributeLabel>
              <AttributeValue>{OKTA.defaultRole && <Tag>{OKTA.defaultRole}</Tag>}</AttributeValue>
            </Attribute>
            <Attribute orientation='horizontal'>
              <AttributeLabel width={140}>Created at</AttributeLabel>
              <AttributeValue>
                <FormatDateTime value={OKTA.createdAt} format='datetime' layout='inline' />
              </AttributeValue>
            </Attribute>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

Section.decorators = hostShell;

/**
 * Google Workspace has no rules yet: the table keeps its headers and shows a one-line empty state
 * with no action, since "Create rule" already sits on the tab line.
 */
export const NestedTable: StoryFn = () => {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState('rules');

  const renderClaim = ({ row }: TableCellContext<RoleRule, unknown>) => (
    <InlineCodeSnippet code={`${row.original.claim} = ${row.original.value}`} size='md' />
  );
  const renderRole = ({ row }: TableCellContext<RoleRule, unknown>) => (
    <Tag>{row.original.role}</Tag>
  );

  const ruleColumns: TableColumnDef<RoleRule>[] = [
    { id: 'claim', header: 'Claim', size: 300, cell: renderClaim },
    { accessorKey: 'role', header: 'Role', size: 200, cell: renderRole },
  ];

  const handleCreateRule = () => onCreateRule(GOOGLE);

  return (
    <Drawer open={open} onOpenChange={setOpen} width={640} data-testid='provider-drawer'>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{GOOGLE.name}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <Tabs value={tab} onChange={setTab} data-testid='provider-tabs'>
            <div className='-mx-24'>
              <TabsList>
                <TabsTrigger value='rules'>
                  Role rules <NumericBadge>{GOOGLE.rules.length}</NumericBadge>
                </TabsTrigger>
                <TabsLineActions>
                  <Button size='small' onClick={handleCreateRule}>
                    <Plus /> Create rule
                  </Button>
                </TabsLineActions>
              </TabsList>
            </div>
            <TabsContent value='rules'>
              <div className='-mx-8 pt-8'>
                <Table
                  aria-label='Role rules'
                  data={GOOGLE.rules}
                  columns={ruleColumns}
                  getRowId={getItemId}
                  data-testid='provider-rules-table'
                >
                  {GOOGLE.rules.length === 0 && (
                    <EmptyState type='collection-empty' data-testid='provider-rules-empty'>
                      <EmptyStateMessage>
                        <EmptyStateTitle>No role rules yet</EmptyStateTitle>
                      </EmptyStateMessage>
                    </EmptyState>
                  )}
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

NestedTable.decorators = hostShell;

/**
 * The entity is still loading: every `Attribute` shows its skeleton and the nested table shows
 * three skeleton rows. No `Loader` over the body, and the header keeps its title.
 */
export const Loading: StoryFn = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const provider = PROVIDERS.find(item => item.id === selectedId) ?? null;

  const columns: TableColumnDef<Provider>[] = [
    { accessorKey: 'name', header: 'Name', size: 260 },
    { accessorKey: 'protocol', header: 'Protocol', size: 180 },
    { accessorKey: 'issuer', header: 'Issuer', size: 360 },
  ];
  const ruleColumns: TableColumnDef<RoleRule>[] = [
    { accessorKey: 'value', header: 'Claim', size: 300 },
    { accessorKey: 'role', header: 'Role', size: 200 },
  ];

  const handleMasterCellClick = (id: string) => {
    setSelectedId(id);
    setOpen(true);
  };

  return (
    <Page name='settings-sso' fullSize fixedHeight data-testid='providers-page'>
      <PageHeader>
        <PageHeaderGroup>
          <PageTitle>SSO providers</PageTitle>
        </PageHeaderGroup>
      </PageHeader>

      <PageContent>
        <Table
          aria-label='SSO providers'
          data={PROVIDERS}
          columns={columns}
          getRowId={getProviderId}
          activeRowId={open ? selectedId : null}
          onMasterCellClick={handleMasterCellClick}
          data-testid='providers-table'
        />
      </PageContent>

      <Drawer
        open={open}
        onOpenChange={setOpen}
        modal={false}
        overlay={false}
        closeOnOutsideClick={false}
        width={640}
        data-testid='provider-drawer'
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{provider?.name}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <VStack gap={6} className='pb-8' data-testid='provider-attributes'>
              <Attribute orientation='horizontal' loading>
                <AttributeLabel width={140}>Protocol</AttributeLabel>
                <AttributeValue>{provider?.protocol}</AttributeValue>
              </Attribute>
              <Attribute orientation='horizontal' loading>
                <AttributeLabel width={140}>Issuer URL</AttributeLabel>
                <AttributeValue>{provider?.issuer}</AttributeValue>
              </Attribute>
              <Attribute orientation='horizontal' loading>
                <AttributeLabel width={140}>Client ID</AttributeLabel>
                <AttributeValue>{provider?.clientId}</AttributeValue>
              </Attribute>
              <Attribute orientation='horizontal' loading>
                <AttributeLabel width={140}>Created at</AttributeLabel>
                <AttributeValue>{provider?.createdAt}</AttributeValue>
              </Attribute>
            </VStack>
            <Separator spacing={4} />
            <div className='-mx-8 pt-8'>
              <Table
                aria-label='Role rules'
                data={[]}
                columns={ruleColumns}
                getRowId={getItemId}
                isLoading
                skeletonCount={3}
                data-testid='provider-rules-table'
              />
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Page>
  );
};

Loading.decorators = hostShell;

/**
 * Viewing an old version: an info `Alert` comes first in the body with "Back to current" and
 * "Restore", and the header "Actions" menu is disabled until the reader goes back.
 */
export const OldVersion: StoryFn = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isOldVersion, setIsOldVersion] = useState(true);

  const provider = PROVIDERS.find(item => item.id === selectedId) ?? null;
  // The old version had a default role that was removed later.
  const defaultRole = isOldVersion ? 'Security analyst' : provider?.defaultRole;

  const columns: TableColumnDef<Provider>[] = [
    { accessorKey: 'name', header: 'Name', size: 260 },
    { accessorKey: 'protocol', header: 'Protocol', size: 180 },
    { accessorKey: 'issuer', header: 'Issuer', size: 360 },
  ];

  const handleMasterCellClick = (id: string) => {
    setSelectedId(id);
    setIsOldVersion(true);
    setOpen(true);
  };
  const handleBackToCurrent = () => setIsOldVersion(false);
  const handleRestore = () => onRestoreVersion(provider);
  const handleEdit = () => onEditProvider(provider);
  const handleDelete = () => onDeleteProvider(provider);

  return (
    <Page name='settings-sso' fullSize fixedHeight data-testid='providers-page'>
      <PageHeader>
        <PageHeaderGroup>
          <PageTitle>SSO providers</PageTitle>
        </PageHeaderGroup>
      </PageHeader>

      <PageContent>
        <Table
          aria-label='SSO providers'
          data={PROVIDERS}
          columns={columns}
          getRowId={getProviderId}
          activeRowId={open ? selectedId : null}
          onMasterCellClick={handleMasterCellClick}
          data-testid='providers-table'
        />
      </PageContent>

      <Drawer
        open={open}
        onOpenChange={setOpen}
        modal={false}
        overlay={false}
        closeOnOutsideClick={false}
        width={640}
        data-testid='provider-drawer'
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{provider?.name}</DrawerTitle>
            <DropdownMenu data-testid='provider-actions'>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' color='neutral' size='small' disabled={isOldVersion}>
                  Actions <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={handleEdit}>
                  <DropdownMenuItemText>Edit provider</DropdownMenuItemText>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant='destructive' onSelect={handleDelete}>
                  <DropdownMenuItemText>Delete provider</DropdownMenuItemText>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DrawerHeader>

          <DrawerBody>
            {isOldVersion && (
              <Alert color='info' data-testid='provider-version-alert'>
                <AlertIcon />
                <AlertContent>
                  <AlertTitle>You are viewing the version from Oct 28, 2026</AlertTitle>
                  <AlertDescription>Changes made after it are not shown.</AlertDescription>
                </AlertContent>
                <AlertControls>
                  <Button
                    variant='secondary'
                    color='neutral'
                    size='small'
                    onClick={handleBackToCurrent}
                  >
                    Back to current
                  </Button>
                  <Button variant='secondary' color='neutral' size='small' onClick={handleRestore}>
                    Restore
                  </Button>
                </AlertControls>
              </Alert>
            )}
            {provider && (
              <VStack gap={6} className='pt-12 pb-8' data-testid='provider-attributes'>
                <Attribute orientation='horizontal'>
                  <AttributeLabel width={140}>Protocol</AttributeLabel>
                  <AttributeValue>{provider.protocol}</AttributeValue>
                </Attribute>
                <Attribute orientation='horizontal'>
                  <AttributeLabel width={140}>Client ID</AttributeLabel>
                  <AttributeValue>
                    <InlineCodeSnippet code={provider.clientId} size='md' />
                  </AttributeValue>
                </Attribute>
                <Attribute orientation='horizontal' isEmpty={!defaultRole}>
                  <AttributeLabel width={140}>Default role</AttributeLabel>
                  <AttributeValue>{defaultRole && <Tag>{defaultRole}</Tag>}</AttributeValue>
                </Attribute>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Page>
  );
};

OldVersion.decorators = hostShell;

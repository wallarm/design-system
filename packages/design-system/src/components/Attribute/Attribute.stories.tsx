import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Copy, Filter } from '../../icons';
import { Badge } from '../Badge';
import { Code } from '../Code';
import { InlineCodeSnippet } from '../CodeSnippet';
import { FormatDateTime } from '../FormatDateTime';
import { Ip, IpAddress, IpCountry, IpList, IpProvider } from '../Ip';
import { Link } from '../Link';
import { OverflowList } from '../OverflowList';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Tag } from '../Tag';
import { Text } from '../Text';
import { Attribute, type AttributeProps } from './Attribute';
import { AttributeActions } from './AttributeActions';
import { AttributeActionsContent } from './AttributeActionsContent';
import { AttributeActionsItem } from './AttributeActionsItem';
import { AttributeActionsTarget } from './AttributeActionsTarget';
import { AttributeEmptyDescription } from './AttributeEmptyDescription';
import { AttributeLabel } from './AttributeLabel';
import { AttributeLabelDescription } from './AttributeLabelDescription';
import { AttributeLabelInfo } from './AttributeLabelInfo';
import { AttributeValue } from './AttributeValue';

const meta = {
  title: 'Data Display/Attribute',
  component: Attribute,
  subcomponents: {
    AttributeLabel,
    AttributeLabelDescription,
    AttributeLabelInfo,
    AttributeValue,
    AttributeEmptyDescription,
    AttributeActions,
    AttributeActionsTarget,
    AttributeActionsContent,
    AttributeActionsItem,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays a labeled read-only value for a single object attribute. ' +
          'Used in detail panels, drawers, and forms to present structured information. ' +
          'The value slot accepts text, badges, tags, code snippets, links, and other display components.',
      },
    },
  },
} satisfies Meta<typeof Attribute>;

export default meta;

const renderOverflowPopover = (items: string[]) => (
  <Popover>
    <PopoverTrigger asChild>
      <Tag>+{items.length}</Tag>
    </PopoverTrigger>
    <PopoverContent minWidth='auto' minHeight='auto' maxWidth='240px'>
      <div className='flex flex-col gap-4'>
        {items.map(item => (
          <Text key={item} size='sm'>
            {item}
          </Text>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

const renderActionsItems = () => (
  <AttributeActionsContent>
    <AttributeActionsItem
      onSelect={() => {
        /* story mock */
      }}
    >
      <Filter />
      Investigate by this value
    </AttributeActionsItem>
    <AttributeActionsItem
      onSelect={() => {
        /* story mock */
      }}
    >
      <Copy />
      Copy value
    </AttributeActionsItem>
  </AttributeActionsContent>
);

export const Default: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>Request ID</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>abc-123-def-456</Text>
      </AttributeValue>
    </Attribute>
  </div>
);

export const WithDescription: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>
        Created at
        <AttributeLabelDescription>
          The time when the request was first received
        </AttributeLabelDescription>
      </AttributeLabel>
      <AttributeValue>
        <Text size='sm'>April 9, 2026, 14:32</Text>
      </AttributeValue>
    </Attribute>
  </div>
);

export const WithInfo: StoryFn<AttributeProps> = () => (
  <div className='w-[400px] flex flex-col gap-16'>
    <Attribute>
      <AttributeLabel>
        Request ID
        <AttributeLabelInfo>Unique identifier assigned to each incoming request</AttributeLabelInfo>
      </AttributeLabel>
      <AttributeValue>
        <Text size='sm'>abc-123-def-456</Text>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>
        <AttributeLabelInfo>Unique identifier assigned to each incoming request</AttributeLabelInfo>
        Request ID
      </AttributeLabel>
      <AttributeValue>
        <Text size='sm'>abc-123-def-456</Text>
      </AttributeValue>
    </Attribute>
  </div>
);

export const WithLink: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>
        Source
        <Link href='#' size='md'>
          View docs
        </Link>
      </AttributeLabel>
      <AttributeValue>
        <Text size='sm'>API Gateway</Text>
      </AttributeValue>
    </Attribute>
  </div>
);

/**
 * All empty-state variants in vertical orientation:
 *   1. Manual composition — `AttributeLabelDescription` always visible, value
 *      composed by the consumer (no `isEmpty` flag).
 *   2. `isEmpty` alone — value becomes em-dash, `AttributeValue` children are
 *      ignored, label stays bare.
 *   3. `isEmpty` + `<AttributeEmptyDescription>` — description renders only
 *      while `isEmpty` is true; outside that state it returns null.
 *   4. Same as (3), with `ReactNode` content (text + link) inside the
 *      description.
 */
export const Empty: StoryFn<AttributeProps> = () => (
  <div className='w-[400px] flex flex-col gap-16'>
    <Attribute>
      <AttributeLabel>
        Region
        <AttributeLabelDescription>Manual composition</AttributeLabelDescription>
      </AttributeLabel>
      <AttributeValue />
    </Attribute>

    <Attribute isEmpty>
      <AttributeLabel>Region</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>This text is replaced by the em-dash placeholder</Text>
      </AttributeValue>
    </Attribute>

    <Attribute isEmpty>
      <AttributeLabel>
        Owner
        <AttributeEmptyDescription>Not yet assigned</AttributeEmptyDescription>
      </AttributeLabel>
      <AttributeValue />
    </Attribute>

    <Attribute isEmpty>
      <AttributeLabel>
        SSO provider
        <AttributeEmptyDescription>
          Not connected —{' '}
          <Link href='#' size='md'>
            set up integration
          </Link>
        </AttributeEmptyDescription>
      </AttributeLabel>
      <AttributeValue />
    </Attribute>
  </div>
);

export const Loading: StoryFn<AttributeProps> = () => (
  <div className='w-[400px] flex flex-col gap-16'>
    <Attribute loading>
      <AttributeLabel>Created at</AttributeLabel>
      <AttributeValue />
    </Attribute>
    <Attribute loading>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue />
    </Attribute>
  </div>
);

export const Composition: StoryFn<AttributeProps> = () => (
  <div className='grid grid-cols-2 gap-x-8 gap-y-16 w-[874px]'>
    <Attribute>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue>
        <Badge color='red' variant='dotted'>
          Blocked
        </Badge>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>First seen</AttributeLabel>
      <AttributeValue>
        <FormatDateTime value='2026-04-03T10:15:00Z' format='relative' />
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Attack type</AttributeLabel>
      <AttributeValue>
        <OverflowList
          className='gap-4'
          items={['XSS', 'BOLA', 'SQL Injection', 'Scanner', 'CSRF', 'XXE', 'RCE', 'LFI', 'IDOR']}
          itemRenderer={item => <Tag key={item}>{item}</Tag>}
          overflowRenderer={renderOverflowPopover}
        />
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Sessions</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>3 sessions</Text>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Users</AttributeLabel>
      <AttributeValue>
        <OverflowList
          className='gap-4'
          items={[
            'artem@acme.com',
            'uxd@acme.com',
            'ops@acme.com',
            'security@acme.com',
            'admin@acme.com',
          ]}
          itemRenderer={item => <Tag key={item}>{item}</Tag>}
          overflowRenderer={renderOverflowPopover}
        />
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>IPs</AttributeLabel>
      <AttributeValue>
        <IpList>
          <Ip>
            <IpCountry code='US' />
            <IpAddress>142.198.167.52</IpAddress>
            <IpProvider>Azure</IpProvider>
          </Ip>
          <Ip>
            <IpCountry code='US' />
            <IpAddress>34.74.73.20</IpAddress>
            <IpProvider>AWS</IpProvider>
          </Ip>
          <Ip>
            <IpCountry code='DE' />
            <IpAddress>34.74.73.20</IpAddress>
            <IpProvider>GCP</IpProvider>
          </Ip>
          <Ip>
            <IpCountry code='NL' />
            <IpAddress>10.0.0.1</IpAddress>
          </Ip>
          <Ip>
            <IpCountry code='JP' />
            <IpAddress>192.168.1.1</IpAddress>
          </Ip>
        </IpList>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Source IP</AttributeLabel>
      <AttributeValue>
        <Ip>
          <IpCountry code='US' />
          <IpAddress>142.198.167.52</IpAddress>
          <IpProvider>Azure</IpProvider>
        </Ip>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Created at</AttributeLabel>
      <AttributeValue>
        <FormatDateTime value='2026-04-02T14:03:00Z' format='datetime' />
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Documentation</AttributeLabel>
      <AttributeValue>
        <Link href='#' size='md'>
          View full report
        </Link>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Payload (inline)</AttributeLabel>
      <AttributeValue>
        <InlineCodeSnippet code='{ "action": "login", "user_id": 42 }' size='sm' />
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Payload (code)</AttributeLabel>
      <AttributeValue>
        <Code size='s'>{'{ "action": "login", "user_id": 42 }'}</Code>
      </AttributeValue>
    </Attribute>
  </div>
);

export const WithActions: StoryFn<AttributeProps> = () => (
  <div className='grid grid-cols-2 gap-x-8 gap-y-16 w-[874px]'>
    <Attribute>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue>
        <AttributeActions data-testid='attribute-with-actions'>
          <AttributeActionsTarget>
            <Badge color='red' variant='dotted'>
              Blocked
            </Badge>
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>First seen</AttributeLabel>
      <AttributeValue>
        <AttributeActions>
          <AttributeActionsTarget>
            <FormatDateTime value='2026-04-03T10:15:00Z' format='relative' />
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Attack type</AttributeLabel>
      <AttributeValue>
        <AttributeActions>
          <AttributeActionsTarget>
            <OverflowList
              className='gap-4'
              items={[
                'XSS',
                'BOLA',
                'SQL Injection',
                'Scanner',
                'CSRF',
                'XXE',
                'RCE',
                'LFI',
                'IDOR',
              ]}
              itemRenderer={item => <Tag key={item}>{item}</Tag>}
              overflowRenderer={renderOverflowPopover}
            />
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Sessions</AttributeLabel>
      <AttributeValue>
        <AttributeActions>
          <AttributeActionsTarget>
            <Text size='sm'>3 sessions</Text>
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Users</AttributeLabel>
      <AttributeValue>
        <AttributeActions>
          <AttributeActionsTarget>
            <OverflowList
              className='gap-4'
              items={[
                'artem@acme.com',
                'uxd@acme.com',
                'ops@acme.com',
                'security@acme.com',
                'admin@acme.com',
              ]}
              itemRenderer={item => <Tag key={item}>{item}</Tag>}
              overflowRenderer={renderOverflowPopover}
            />
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>IPs</AttributeLabel>
      <AttributeValue>
        <AttributeActions>
          <AttributeActionsTarget>
            <IpList>
              <Ip>
                <IpCountry code='US' />
                <IpAddress>142.198.167.52</IpAddress>
                <IpProvider>Azure</IpProvider>
              </Ip>
              <Ip>
                <IpCountry code='US' />
                <IpAddress>34.74.73.20</IpAddress>
                <IpProvider>AWS</IpProvider>
              </Ip>
              <Ip>
                <IpCountry code='DE' />
                <IpAddress>34.74.73.20</IpAddress>
                <IpProvider>GCP</IpProvider>
              </Ip>
              <Ip>
                <IpCountry code='NL' />
                <IpAddress>10.0.0.1</IpAddress>
              </Ip>
              <Ip>
                <IpCountry code='JP' />
                <IpAddress>192.168.1.1</IpAddress>
              </Ip>
            </IpList>
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Source IP</AttributeLabel>
      <AttributeValue>
        <AttributeActions>
          <AttributeActionsTarget>
            <Ip>
              <IpCountry code='US' />
              <IpAddress>142.198.167.52</IpAddress>
              <IpProvider>Azure</IpProvider>
            </Ip>
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Created at</AttributeLabel>
      <AttributeValue>
        <AttributeActions>
          <AttributeActionsTarget>
            <FormatDateTime value='2026-04-02T14:03:00Z' format='datetime' />
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Documentation</AttributeLabel>
      <AttributeValue>
        <AttributeActions>
          <AttributeActionsTarget>
            <Link href='#' size='md'>
              View full report
            </Link>
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Payload (inline)</AttributeLabel>
      <AttributeValue>
        <AttributeActions>
          <AttributeActionsTarget>
            <InlineCodeSnippet code='{ "action": "login", "user_id": 42 }' size='sm' />
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Payload (code)</AttributeLabel>
      <AttributeValue>
        <AttributeActions>
          <AttributeActionsTarget>
            <Code size='s'>{'{ "action": "login", "user_id": 42 }'}</Code>
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>
  </div>
);

export const Horizontal: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute orientation='horizontal'>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue>
        <Badge color='red' variant='dotted'>
          Blocked
        </Badge>
      </AttributeValue>
    </Attribute>
  </div>
);

export const HorizontalTruncation: StoryFn<AttributeProps> = () => (
  <div className='w-[500px] flex flex-col gap-8'>
    <Attribute orientation='horizontal'>
      <AttributeLabel width={256}>Short</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>Fits in 256px label cell</Text>
      </AttributeValue>
    </Attribute>
    <Attribute orientation='horizontal'>
      <AttributeLabel width={256}>
        This label text is much longer than 256 pixels and must be truncated
      </AttributeLabel>
      <AttributeValue>
        <Text size='sm'>Value</Text>
      </AttributeValue>
    </Attribute>
    <Attribute orientation='horizontal'>
      <AttributeLabel>Users</AttributeLabel>
      <AttributeValue>
        <Text size='sm' truncate>
          artem@acme.com, uxd@acme.com, ops@acme.com, security@acme.com, admin@acme.com
        </Text>
      </AttributeValue>
    </Attribute>
  </div>
);

export const HorizontalComposition: StoryFn<AttributeProps> = () => (
  <div className='grid grid-cols-2 gap-x-8 gap-y-6 w-[874px]'>
    <Attribute orientation='horizontal'>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue>
        <Badge color='red' variant='dotted'>
          Blocked
        </Badge>
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>First seen</AttributeLabel>
      <AttributeValue>
        <FormatDateTime value='2026-04-03T10:15:00Z' format='relative' />
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>Attack type</AttributeLabel>
      <AttributeValue>
        <OverflowList
          className='gap-4'
          items={['XSS', 'BOLA', 'SQL Injection', 'Scanner', 'CSRF', 'XXE', 'RCE', 'LFI', 'IDOR']}
          itemRenderer={item => <Tag key={item}>{item}</Tag>}
          overflowRenderer={renderOverflowPopover}
        />
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>Last seen</AttributeLabel>
      <AttributeValue>
        <FormatDateTime value='2025-04-02T14:03:00Z' format='date' />
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>Sessions</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>3 sessions</Text>
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>Users</AttributeLabel>
      <AttributeValue>
        <OverflowList
          className='gap-4'
          items={[
            'artem@acme.com',
            'uxd@acme.com',
            'ops@acme.com',
            'security@acme.com',
            'admin@acme.com',
          ]}
          itemRenderer={item => <Tag key={item}>{item}</Tag>}
          overflowRenderer={renderOverflowPopover}
        />
      </AttributeValue>
    </Attribute>

    <div className='col-span-2'>
      <Attribute orientation='horizontal'>
        <AttributeLabel>IPs</AttributeLabel>
        <AttributeValue>
          <IpList type='horizontal'>
            <Ip>
              <IpCountry code='US' />
              <IpAddress>142.198.167.52</IpAddress>
              <IpProvider>Azure</IpProvider>
            </Ip>
            <Ip>
              <IpCountry code='US' />
              <IpAddress>34.74.73.20</IpAddress>
              <IpProvider>AWS</IpProvider>
            </Ip>
            <Ip>
              <IpCountry code='DE' />
              <IpAddress>34.74.73.20</IpAddress>
              <IpProvider>GCP</IpProvider>
            </Ip>
          </IpList>
        </AttributeValue>
      </Attribute>
    </div>
  </div>
);

export const HorizontalLoading: StoryFn<AttributeProps> = () => (
  <div className='w-[400px] flex flex-col gap-8'>
    <Attribute orientation='horizontal' loading>
      <AttributeLabel>Created at</AttributeLabel>
      <AttributeValue />
    </Attribute>
    <Attribute orientation='horizontal' loading>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue />
    </Attribute>
  </div>
);

/**
 * All empty-state variants in horizontal orientation. Same four cases as
 * `Empty`, just with `orientation='horizontal'` and `AttributeLabel width=160`
 * to leave room for descriptions (DS clamp: 100..256px).
 */
export const HorizontalEmpty: StoryFn<AttributeProps> = () => (
  <div className='w-[400px] flex flex-col gap-8'>
    <Attribute orientation='horizontal'>
      <AttributeLabel width={160}>
        Region
        <AttributeLabelDescription>Manual composition</AttributeLabelDescription>
      </AttributeLabel>
      <AttributeValue />
    </Attribute>

    <Attribute orientation='horizontal' isEmpty>
      <AttributeLabel width={160}>Region</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>This text is replaced by the em-dash placeholder</Text>
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal' isEmpty>
      <AttributeLabel width={160}>
        Owner
        <AttributeEmptyDescription>Not yet assigned</AttributeEmptyDescription>
      </AttributeLabel>
      <AttributeValue />
    </Attribute>

    <Attribute orientation='horizontal' isEmpty>
      <AttributeLabel width={160}>
        SSO provider
        <AttributeEmptyDescription>
          Not connected —{' '}
          <Link href='#' size='md'>
            set up integration
          </Link>
        </AttributeEmptyDescription>
      </AttributeLabel>
      <AttributeValue />
    </Attribute>
  </div>
);

const renderActionsAttributes = (disableNestedInteractive: boolean) => (
  <>
    <Attribute orientation='horizontal'>
      <AttributeLabel>Source IP</AttributeLabel>
      <AttributeValue>
        <AttributeActions data-testid='attr-source-ip'>
          <AttributeActionsTarget disableNestedInteractive={disableNestedInteractive}>
            <Text size='sm'>142.198.167.52</Text>
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue>
        <AttributeActions data-testid='attr-badge'>
          <AttributeActionsTarget disableNestedInteractive={disableNestedInteractive}>
            <Badge color='red' variant='dotted'>
              Blocked
            </Badge>
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>IPs</AttributeLabel>
      <AttributeValue>
        <AttributeActions data-testid='attr-ip-overflow'>
          <AttributeActionsTarget disableNestedInteractive={disableNestedInteractive}>
            <IpList type='horizontal'>
              <Ip>
                <IpCountry code='US' />
                <IpAddress>142.198.167.52</IpAddress>
                <IpProvider>Azure</IpProvider>
              </Ip>
              <Ip>
                <IpCountry code='US' />
                <IpAddress>34.74.73.20</IpAddress>
                <IpProvider>AWS</IpProvider>
              </Ip>
              <Ip>
                <IpCountry code='DE' />
                <IpAddress>34.74.73.20</IpAddress>
                <IpProvider>GCP</IpProvider>
              </Ip>
              <Ip>
                <IpCountry code='NL' />
                <IpAddress>10.0.0.1</IpAddress>
              </Ip>
              <Ip>
                <IpCountry code='JP' />
                <IpAddress>192.168.1.1</IpAddress>
              </Ip>
            </IpList>
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>Payload</AttributeLabel>
      <AttributeValue>
        <AttributeActions data-testid='attr-code-snippet'>
          <AttributeActionsTarget disableNestedInteractive={disableNestedInteractive}>
            <InlineCodeSnippet code='{ "action": "login", "user_id": 42 }' size='sm' />
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>Documentation</AttributeLabel>
      <AttributeValue>
        <AttributeActions data-testid='attr-link'>
          <AttributeActionsTarget disableNestedInteractive={disableNestedInteractive}>
            <Link href='#' size='md'>
              View full report
            </Link>
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>Tags</AttributeLabel>
      <AttributeValue>
        <AttributeActions data-testid='attr-tags'>
          <AttributeActionsTarget disableNestedInteractive={disableNestedInteractive}>
            <OverflowList
              className='gap-4'
              items={['production', 'us-east-1', 'critical', 'tier-1', 'public', 'monitored']}
              itemRenderer={item => <Tag key={item}>{item}</Tag>}
              overflowRenderer={renderOverflowPopover}
            />
          </AttributeActionsTarget>
          {renderActionsItems()}
        </AttributeActions>
      </AttributeValue>
    </Attribute>
  </>
);

export const HorizontalWithActions: StoryFn<AttributeProps> = () => (
  <div className='w-[400px] flex flex-col gap-8'>{renderActionsAttributes(false)}</div>
);
HorizontalWithActions.storyName = 'Horizontal With Actions (default — copy on text, menu outside)';

export const HorizontalWithActionsMenuOnly: StoryFn<AttributeProps> = () => (
  <div className='w-[400px] flex flex-col gap-8'>{renderActionsAttributes(true)}</div>
);
HorizontalWithActionsMenuOnly.storyName =
  'Horizontal With Actions (disableNestedInteractive — menu only)';

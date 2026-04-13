import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Badge } from '../Badge';
import { Code } from '../Code';
import { InlineCodeSnippet } from '../CodeSnippet';
import { FormatDateTime } from '../FormatDateTime';
import { Ip, IpAddress, IpCountry, IpList, IpProvider } from '../Ip';
import { Link } from '../Link';
import { Tag } from '../Tag';
import { Text } from '../Text';
import { Attribute, type AttributeProps } from './Attribute';
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

export const WithInfoRight: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>
        Request ID
        <AttributeLabelInfo>Unique identifier assigned to each incoming request</AttributeLabelInfo>
      </AttributeLabel>
      <AttributeValue>
        <Text size='sm'>abc-123-def-456</Text>
      </AttributeValue>
    </Attribute>
  </div>
);

export const WithInfoLeft: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
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

export const Empty: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>
        Region
        <AttributeLabelDescription>Not yet assigned</AttributeLabelDescription>
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

export const WithBadge: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue>
        <Badge color='green'>Active</Badge>
      </AttributeValue>
    </Attribute>
  </div>
);

export const WithTags: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>Tags</AttributeLabel>
      <AttributeValue>
        <div className='flex items-center gap-4 flex-wrap'>
          <Tag>production</Tag>
          <Tag>us-east-1</Tag>
          <Tag>critical</Tag>
        </div>
      </AttributeValue>
    </Attribute>
  </div>
);

export const WithCodeSnippet: StoryFn<AttributeProps> = () => (
  <div className='w-[400px] flex flex-col gap-16'>
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

export const WithLink_Value: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>Documentation</AttributeLabel>
      <AttributeValue>
        <Link href='#' size='md'>
          View full report
        </Link>
      </AttributeValue>
    </Attribute>
  </div>
);

export const WithDateTime: StoryFn<AttributeProps> = () => (
  <div className='w-[400px] flex flex-col gap-16'>
    <Attribute>
      <AttributeLabel>Created at (relative)</AttributeLabel>
      <AttributeValue>
        <FormatDateTime value='2026-04-02T14:03:00Z' />
      </AttributeValue>
    </Attribute>
    <Attribute>
      <AttributeLabel>Created at (absolute)</AttributeLabel>
      <AttributeValue>
        <FormatDateTime value='2026-04-02T14:03:00Z' format='datetime' />
      </AttributeValue>
    </Attribute>
  </div>
);

export const WithIP: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
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
        <FormatDateTime value='2026-04-03T10:15:00Z' />
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Attack type</AttributeLabel>
      <AttributeValue>
        <div className='flex items-center gap-4 flex-wrap'>
          <Tag>XSS</Tag>
          <Tag>BOLA</Tag>
          <Tag>SQL Injection</Tag>
          <Tag>Scanner</Tag>
          <Tag>+5</Tag>
        </div>
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
        <div className='flex items-center gap-4'>
          <Text size='sm'>artem@acme.com, uxd@acme.com</Text>
          <Tag>+3</Tag>
        </div>
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
  </div>
);

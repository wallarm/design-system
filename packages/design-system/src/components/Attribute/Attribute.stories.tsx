import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Badge } from '../Badge';
import { Code } from '../Code';
import { Link } from '../Link';
import { Text } from '../Text';
import { Attribute, type AttributeProps } from './Attribute';
import { AttributeLabel } from './AttributeLabel';
import { AttributeValue } from './AttributeValue';

const meta = {
  title: 'Data Display/Attribute',
  component: Attribute,
  subcomponents: {
    AttributeLabel,
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
      <AttributeLabel description='The time when the request was first received'>
        Created at
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
      <AttributeLabel info='Unique identifier assigned to each incoming request'>
        Request ID
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
      <AttributeLabel info='Unique identifier assigned to each incoming request' infoSide='left'>
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
      <AttributeLabel
        link={
          <Link href='#' size='md'>
            View docs
          </Link>
        }
      >
        Source
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
      <AttributeLabel description='Not yet assigned'>Region</AttributeLabel>
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
        <div className='flex items-center gap-4'>
          <Badge color='slate'>production</Badge>
          <Badge color='slate'>us-east-1</Badge>
          <Badge color='slate'>critical</Badge>
        </div>
      </AttributeValue>
    </Attribute>
  </div>
);

export const WithCodeSnippet: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>Payload</AttributeLabel>
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
        <Text size='sm' decoration='dashed'>
          Week ago
        </Text>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Attack type</AttributeLabel>
      <AttributeValue>
        <div className='flex items-center gap-4 flex-wrap'>
          <Badge color='slate'>XSS</Badge>
          <Badge color='slate'>BOLA</Badge>
          <Badge color='slate'>SQL Injection</Badge>
          <Badge color='slate'>Scanner</Badge>
          <Badge color='slate'>+5</Badge>
        </div>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Last seen</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>2 Apr, 2026 14:03</Text>
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
          <Badge color='slate'>+3</Badge>
        </div>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>IPs</AttributeLabel>
      <AttributeValue>
        <div className='flex items-center gap-4 flex-wrap col-span-2'>
          <Text size='sm'>142.198.167.52</Text>
          <Badge color='sky'>Azure</Badge>
          <Text size='sm'>34.74.73.20</Text>
          <Badge color='amber'>AWS</Badge>
          <Text size='sm'>34.74.73.20</Text>
          <Badge color='teal'>GCP</Badge>
          <Badge color='slate'>+5</Badge>
        </div>
      </AttributeValue>
    </Attribute>
  </div>
);

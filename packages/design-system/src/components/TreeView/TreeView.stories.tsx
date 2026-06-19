import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Circle, CircleCheck, LoaderCircle, Search, Settings } from '../../icons';
import { Code } from '../Code';
import { Text } from '../Text';
import { TreeView, type TreeViewProps } from './TreeView';
import type { TreeViewNode } from './types';

const meta = {
  title: 'Navigation/TreeView',
  component: TreeView,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'TreeView renders a vertical line indicator with depth-based indentation for nested item groups. Pass a data-driven `nodes` array to define the tree structure.',
      },
    },
  },
  argTypes: {
    indent: { control: 'number' },
  },
} satisfies Meta<typeof TreeView>;

export default meta;

const basicNodes: TreeViewNode[] = [
  { id: '1', label: 'Item 1' },
  { id: '2', label: 'Item 2' },
  { id: '3', label: 'Item 3' },
];

export const Basic: StoryFn<TreeViewProps> = args => (
  <div className='w-240'>
    <TreeView {...args} nodes={basicNodes} />
  </div>
);

const nestedNodes: TreeViewNode[] = [
  { id: '1', label: 'Level 1 - Item 1' },
  {
    id: '2',
    label: 'Level 1 - Item 2',
    children: [
      { id: '2.1', label: 'Level 2 - Item 1' },
      {
        id: '2.2',
        label: 'Level 2 - Item 2',
        children: [
          { id: '2.2.1', label: 'Level 3 - Item 1' },
          { id: '2.2.2', label: 'Level 3 - Item 2' },
        ],
      },
    ],
  },
  { id: '3', label: 'Level 1 - Item 3' },
];

export const Nested: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView {...args} nodes={nestedNodes} />
  </div>
);

const iconNodes: TreeViewNode[] = [
  {
    id: '1',
    icon: <CircleCheck size='md' className='text-text-secondary' />,
    label: (
      <Text size='xs' color='secondary'>
        Thought for 5s
      </Text>
    ),
  },
  {
    id: '2',
    icon: <Search size='md' className='text-text-secondary' />,
    label: (
      <Text size='xs' color='secondary'>
        Searched for ABC
      </Text>
    ),
  },
  {
    id: '3',
    icon: <Settings size='md' className='text-text-secondary' />,
    label: (
      <Text size='xs' color='secondary'>
        Created ABC
      </Text>
    ),
  },
  {
    id: '4',
    icon: <LoaderCircle size='md' className='text-text-secondary' />,
    label: (
      <Text size='xs' color='secondary'>
        Working...
      </Text>
    ),
  },
];

export const WithIcons: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView gap={12} {...args} nodes={iconNodes} />
  </div>
);

const iconNestedNodes: TreeViewNode[] = [
  {
    id: '1',
    icon: <Circle size='md' className='text-text-secondary' />,
    label: (
      <Text size='xs' color='secondary'>
        Chain item
      </Text>
    ),
    children: [
      {
        id: '1.1',
        icon: <Circle size='md' className='text-text-secondary' />,
        label: (
          <Text size='xs' color='secondary'>
            Chain item
          </Text>
        ),
      },
      {
        id: '1.2',
        icon: <Circle size='md' className='text-text-secondary' />,
        label: (
          <Text size='xs' color='secondary'>
            Chain item
          </Text>
        ),
        action: (
          <Code size='xs' color='secondary'>
            Metric
          </Code>
        ),
        children: [
          {
            id: '1.2.1',
            icon: <Circle size='md' className='text-text-secondary' />,
            label: (
              <Text size='xs' color='secondary'>
                Chain item
              </Text>
            ),
          },
          {
            id: '1.2.2',
            icon: <CircleCheck size='md' className='text-text-secondary' />,
            label: (
              <Text size='xs' color='secondary'>
                Chain item
              </Text>
            ),
            action: (
              <Code size='xs' color='secondary'>
                Metric
              </Code>
            ),
          },
          {
            id: '1.2.3',
            icon: <Circle size='md' className='text-text-secondary' />,
            label: (
              <Text size='xs' color='secondary'>
                Chain item
              </Text>
            ),
          },
          {
            id: '1.2.4',
            icon: <Circle size='md' className='text-text-secondary' />,
            label: (
              <Text size='xs' color='secondary'>
                Chain item
              </Text>
            ),
            action: (
              <Code size='xs' color='secondary'>
                Metric
              </Code>
            ),
          },
        ],
      },
    ],
  },
  {
    id: '2',
    icon: <CircleCheck size='md' className='text-text-secondary' />,
    label: (
      <Text size='xs' color='secondary'>
        Worked for 3m 45s
      </Text>
    ),
  },
];

export const WithIconsNested: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView gap={8} {...args} nodes={iconNestedNodes} />
  </div>
);

const collapsibleNodes: TreeViewNode[] = [
  {
    id: '1',
    collapsible: true,
    label: (
      <Text size='xs' color='secondary'>
        Thought for 5s
      </Text>
    ),
    content: (
      <div className='flex flex-col gap-8'>
        <Text size='xs' color='secondary'>
          I'll fetch your custom rules so I can pick one and explain it to you.
        </Text>
        <Text size='xs' color='secondary'>
          Great! I found several custom rules. Let me pick one and explain it in detail. I'll go
          with rule ID 59133856 — it's a good example of a scoped rule with clear intent.
        </Text>
      </div>
    ),
  },
  {
    id: '2',
    collapsible: true,
    icon: <Search size='md' className='text-text-secondary' />,
    label: (
      <Text size='xs' color='secondary'>
        Searched for ABC
      </Text>
    ),
    content: (
      <Text size='xs' color='secondary'>
        Search results...
      </Text>
    ),
  },
  {
    id: '3',
    collapsible: true,
    icon: <Settings size='md' className='text-text-secondary' />,
    label: (
      <Text size='xs' color='secondary'>
        Created ABC
      </Text>
    ),
    content: (
      <Text size='xs' color='secondary'>
        Details about the created resource...
      </Text>
    ),
  },
  {
    id: '4',
    icon: <CircleCheck size='md' className='text-text-secondary' />,
    label: (
      <Text size='xs' color='secondary'>
        Worked for 3m 45s
      </Text>
    ),
  },
];

export const Collapsible: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView gap={8} {...args} nodes={collapsibleNodes} defaultExpandedValue={['1']} />
  </div>
);

const collapsibleWithActionsNodes: TreeViewNode[] = [
  {
    id: '1',
    icon: <CircleCheck size='md' className='text-text-secondary' />,
    label: (
      <Text size='xs' color='secondary'>
        Thought for 5s
      </Text>
    ),
    action: (
      <Code size='xs' color='secondary'>
        3.2s
      </Code>
    ),
    collapsible: true,
    children: [
      {
        id: '1.1',
        collapsible: true,
        icon: <Search size='md' className='text-text-secondary' />,
        label: (
          <Text size='xs' color='secondary'>
            Searched for API docs
          </Text>
        ),
        action: (
          <Code size='xs' color='secondary'>
            0.8s
          </Code>
        ),
        content: (
          <Text size='xs' color='secondary'>
            Found 3 relevant endpoints in the documentation.
          </Text>
        ),
      },
      {
        id: '1.2',
        icon: <Settings size='md' className='text-text-secondary' />,
        label: (
          <Text size='xs' color='secondary'>
            Tool execution
          </Text>
        ),
        collapsible: true,
        children: [
          {
            id: '1.2.1',
            icon: <Circle size='md' className='text-text-secondary' />,
            label: (
              <Text size='xs' color='secondary'>
                Processing batch
              </Text>
            ),
            children: [
              {
                id: '1.2.1.1',
                icon: <CircleCheck size='md' className='text-text-secondary' />,
                label: (
                  <Text size='xs' color='secondary'>
                    Validated input
                  </Text>
                ),
              },
              {
                id: '1.2.1.2',
                icon: <CircleCheck size='md' className='text-text-secondary' />,
                label: (
                  <Text size='xs' color='secondary'>
                    Transformed data
                  </Text>
                ),
                action: (
                  <Code size='xs' color='secondary'>
                    0.3s
                  </Code>
                ),
              },
            ],
          },
          {
            id: '1.2.2',
            collapsible: true,
            icon: <Circle size='md' className='text-text-secondary' />,
            label: (
              <Text size='xs' color='secondary'>
                Applied changes
              </Text>
            ),
            action: (
              <Code size='xs' color='secondary'>
                1.5s
              </Code>
            ),
            content: (
              <Text size='xs' color='secondary'>
                Updated 12 records in the database with the new configuration.
              </Text>
            ),
          },
        ],
      },
    ],
  },
  {
    id: '2',
    icon: <CircleCheck size='md' className='text-text-secondary' />,
    label: (
      <Text size='xs' color='secondary'>
        Completed analysis
      </Text>
    ),
  },
];

export const CollapsibleWithActions: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView gap={8} {...args} nodes={collapsibleWithActionsNodes} />
  </div>
);

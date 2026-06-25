import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Circle, CircleCheck, LoaderCircle, Search, Settings } from '../../icons';
import { Code } from '../Code';
import { Text } from '../Text';
import { Tree, type TreeProps } from './Tree';
import { TreeItem } from './TreeItem';
import { TreeItemContent } from './TreeItemContent';
import { TreeItemHeader } from './TreeItemHeader';

const meta = {
  title: 'Navigation/Tree',
  component: Tree,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Tree renders a vertical line indicator with depth-based indentation for nested item groups. Uses a compound component pattern with `<Tree>`, `<TreeItem>`, `<TreeItemHeader>`, and `<TreeItemContent>`.',
      },
    },
  },
  argTypes: {
    indent: { control: 'number' },
  },
} satisfies Meta<typeof Tree>;

export default meta;

export const Basic: StoryFn<TreeProps> = args => (
  <div className='w-240'>
    <Tree {...args}>
      <TreeItem>
        <TreeItemHeader>Item 1</TreeItemHeader>
      </TreeItem>
      <TreeItem>
        <TreeItemHeader>Item 2</TreeItemHeader>
      </TreeItem>
      <TreeItem>
        <TreeItemHeader>Item 3</TreeItemHeader>
      </TreeItem>
    </Tree>
  </div>
);

export const Nested: StoryFn<TreeProps> = args => (
  <div className='w-320'>
    <Tree {...args}>
      <TreeItem>
        <TreeItemHeader>Level 1 - Item 1</TreeItemHeader>
      </TreeItem>
      <TreeItem>
        <TreeItemHeader>Level 1 - Item 2</TreeItemHeader>
        <Tree>
          <TreeItem>
            <TreeItemHeader>Level 2 - Item 1</TreeItemHeader>
          </TreeItem>
          <TreeItem>
            <TreeItemHeader>Level 2 - Item 2</TreeItemHeader>
            <Tree>
              <TreeItem>
                <TreeItemHeader>Level 3 - Item 1</TreeItemHeader>
              </TreeItem>
              <TreeItem>
                <TreeItemHeader>Level 3 - Item 2</TreeItemHeader>
              </TreeItem>
            </Tree>
          </TreeItem>
        </Tree>
      </TreeItem>
      <TreeItem>
        <TreeItemHeader>Level 1 - Item 3</TreeItemHeader>
      </TreeItem>
    </Tree>
  </div>
);

export const WithIcons: StoryFn<TreeProps> = args => (
  <div className='w-320'>
    <Tree gap={12} {...args}>
      <TreeItem>
        <TreeItemHeader icon={<CircleCheck size='md' className='text-text-secondary' />}>
          <Text size='xs' color='secondary'>
            Thought for 5s
          </Text>
        </TreeItemHeader>
      </TreeItem>
      <TreeItem>
        <TreeItemHeader icon={<Search size='md' className='text-text-secondary' />}>
          <Text size='xs' color='secondary'>
            Searched for ABC
          </Text>
        </TreeItemHeader>
      </TreeItem>
      <TreeItem>
        <TreeItemHeader icon={<Settings size='md' className='text-text-secondary' />}>
          <Text size='xs' color='secondary'>
            Created ABC
          </Text>
        </TreeItemHeader>
      </TreeItem>
      <TreeItem>
        <TreeItemHeader icon={<LoaderCircle size='md' className='text-text-secondary' />}>
          <Text size='xs' color='secondary'>
            Working...
          </Text>
        </TreeItemHeader>
      </TreeItem>
    </Tree>
  </div>
);

export const WithIconsNested: StoryFn<TreeProps> = args => (
  <div className='w-320'>
    <Tree gap={12} {...args}>
      <TreeItem>
        <TreeItemHeader icon={<Circle size='md' className='text-text-secondary' />}>
          <Text size='xs' color='secondary'>
            Chain item
          </Text>
        </TreeItemHeader>
        <Tree>
          <TreeItem>
            <TreeItemHeader icon={<Circle size='md' className='text-text-secondary' />}>
              <Text size='xs' color='secondary'>
                Chain item
              </Text>
            </TreeItemHeader>
          </TreeItem>
          <TreeItem>
            <TreeItemHeader
              icon={<Circle size='md' className='text-text-secondary' />}
              action={
                <Code size='xs' color='secondary'>
                  Metric
                </Code>
              }
            >
              <Text size='xs' color='secondary'>
                Chain item
              </Text>
            </TreeItemHeader>
            <Tree>
              <TreeItem>
                <TreeItemHeader icon={<Circle size='md' className='text-text-secondary' />}>
                  <Text size='xs' color='secondary'>
                    Chain item
                  </Text>
                </TreeItemHeader>
              </TreeItem>
              <TreeItem>
                <TreeItemHeader
                  icon={<CircleCheck size='md' className='text-text-secondary' />}
                  action={
                    <Code size='xs' color='secondary'>
                      Metric
                    </Code>
                  }
                >
                  <Text size='xs' color='secondary'>
                    Chain item
                  </Text>
                </TreeItemHeader>
              </TreeItem>
              <TreeItem>
                <TreeItemHeader icon={<Circle size='md' className='text-text-secondary' />}>
                  <Text size='xs' color='secondary'>
                    Chain item
                  </Text>
                </TreeItemHeader>
              </TreeItem>
              <TreeItem>
                <TreeItemHeader
                  icon={<Circle size='md' className='text-text-secondary' />}
                  action={
                    <Code size='xs' color='secondary'>
                      Metric
                    </Code>
                  }
                >
                  <Text size='xs' color='secondary'>
                    Chain item
                  </Text>
                </TreeItemHeader>
              </TreeItem>
            </Tree>
          </TreeItem>
        </Tree>
      </TreeItem>
      <TreeItem>
        <TreeItemHeader icon={<CircleCheck size='md' className='text-text-secondary' />}>
          <Text size='xs' color='secondary'>
            Worked for 3m 45s
          </Text>
        </TreeItemHeader>
      </TreeItem>
    </Tree>
  </div>
);

export const Collapsible: StoryFn<TreeProps> = args => (
  <div className='w-320'>
    <Tree gap={8} {...args}>
      <TreeItem collapsible defaultOpen>
        <TreeItemHeader>
          <Text size='xs' color='secondary'>
            Thought for 5s
          </Text>
        </TreeItemHeader>
        <TreeItemContent>
          <div className='flex flex-col gap-8'>
            <Text size='xs' color='secondary'>
              I'll fetch your custom rules so I can pick one and explain it to you.
            </Text>
            <Text size='xs' color='secondary'>
              Great! I found several custom rules. Let me pick one and explain it in detail. I'll go
              with rule ID 59133856 — it's a good example of a scoped rule with clear intent.
            </Text>
          </div>
        </TreeItemContent>
      </TreeItem>
      <TreeItem collapsible defaultOpen={false}>
        <TreeItemHeader icon={<Search size='md' className='text-text-secondary' />}>
          <Text size='xs' color='secondary'>
            Searched for ABC
          </Text>
        </TreeItemHeader>
        <TreeItemContent>
          <Text size='xs' color='secondary'>
            Search results...
          </Text>
        </TreeItemContent>
      </TreeItem>
      <TreeItem collapsible defaultOpen={false}>
        <TreeItemHeader icon={<Settings size='md' className='text-text-secondary' />}>
          <Text size='xs' color='secondary'>
            Created ABC
          </Text>
        </TreeItemHeader>
        <TreeItemContent>
          <Text size='xs' color='secondary'>
            Details about the created resource...
          </Text>
        </TreeItemContent>
      </TreeItem>
      <TreeItem>
        <TreeItemHeader icon={<CircleCheck size='md' className='text-text-secondary' />}>
          <Text size='xs' color='secondary'>
            Worked for 3m 45s
          </Text>
        </TreeItemHeader>
      </TreeItem>
    </Tree>
  </div>
);

export const CollapsibleWithActions: StoryFn<TreeProps> = args => (
  <div className='w-320'>
    <Tree gap={8} {...args}>
      <TreeItem collapsible>
        <TreeItemHeader
          icon={<CircleCheck size='md' className='text-text-secondary' />}
          action={
            <Code size='xs' color='secondary'>
              3.2s
            </Code>
          }
        >
          <Text size='xs' color='secondary'>
            Thought for 5s
          </Text>
        </TreeItemHeader>
        <TreeItemContent>
          <Tree>
            <TreeItem collapsible defaultOpen={false}>
              <TreeItemHeader
                icon={<Search size='md' className='text-text-secondary' />}
                action={
                  <Code size='xs' color='secondary'>
                    0.8s
                  </Code>
                }
              >
                <Text size='xs' color='secondary'>
                  Searched for API docs
                </Text>
              </TreeItemHeader>
              <TreeItemContent>
                <Text size='xs' color='secondary'>
                  Found 3 relevant endpoints in the documentation.
                </Text>
              </TreeItemContent>
            </TreeItem>
            <TreeItem collapsible>
              <TreeItemHeader icon={<Settings size='md' className='text-text-secondary' />}>
                <Text size='xs' color='secondary'>
                  Tool execution
                </Text>
              </TreeItemHeader>
              <TreeItemContent>
                <Tree>
                  <TreeItem>
                    <TreeItemHeader icon={<Circle size='md' className='text-text-secondary' />}>
                      <Text size='xs' color='secondary'>
                        Processing batch
                      </Text>
                    </TreeItemHeader>
                    <Tree>
                      <TreeItem>
                        <TreeItemHeader
                          icon={<CircleCheck size='md' className='text-text-secondary' />}
                        >
                          <Text size='xs' color='secondary'>
                            Validated input
                          </Text>
                        </TreeItemHeader>
                      </TreeItem>
                      <TreeItem>
                        <TreeItemHeader
                          icon={<CircleCheck size='md' className='text-text-secondary' />}
                          action={
                            <Code size='xs' color='secondary'>
                              0.3s
                            </Code>
                          }
                        >
                          <Text size='xs' color='secondary'>
                            Transformed data
                          </Text>
                        </TreeItemHeader>
                      </TreeItem>
                    </Tree>
                  </TreeItem>
                  <TreeItem collapsible>
                    <TreeItemHeader
                      icon={<Circle size='md' className='text-text-secondary' />}
                      action={
                        <Code size='xs' color='secondary'>
                          1.5s
                        </Code>
                      }
                    >
                      <Text size='xs' color='secondary'>
                        Applied changes
                      </Text>
                    </TreeItemHeader>
                    <TreeItemContent>
                      <Text size='xs' color='secondary'>
                        Updated 12 records in the database with the new configuration.
                      </Text>
                    </TreeItemContent>
                  </TreeItem>
                </Tree>
              </TreeItemContent>
            </TreeItem>
          </Tree>
        </TreeItemContent>
      </TreeItem>
      <TreeItem>
        <TreeItemHeader icon={<CircleCheck size='md' className='text-text-secondary' />}>
          <Text size='xs' color='secondary'>
            Completed analysis
          </Text>
        </TreeItemHeader>
      </TreeItem>
    </Tree>
  </div>
);

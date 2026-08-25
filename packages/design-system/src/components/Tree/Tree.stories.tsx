import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Circle, CircleCheck, LoaderCircle, Search, Settings } from '../../icons';
import { Code } from '../Code';
import { Text } from '../Text';
import { Tree, type TreeProps } from './Tree';
import { TreeItem } from './TreeItem';
import { TreeItemContent } from './TreeItemContent';
import { TreeItemHeader } from './TreeItemHeader';

const DESCRIPTION = [
  'Draws structure: a vertical rail and depth indentation around nested content, with optional per-item collapse.',
  'It shows a hierarchy rather than letting you work in one — reach for `TreeView` when rows need selecting, keyboard navigation or disabled states, and for `Accordion` when the levels are sections rather than a tree.',
].join(' ');

const meta = {
  title: 'Navigation/Tree',
  component: Tree,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    indent: { control: 'number' },
  },
} satisfies Meta<typeof Tree>;

export default meta;

/** One level: the rail and the indentation, with the items composed from `TreeItemHeader` and `TreeItemContent`. */
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

/** Nesting a `Tree` inside an item adds a depth, and each depth draws its own rail so the ancestry stays readable. */
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

/** `TreeItemHeader`’s `icon` prop sits before the label at every depth, which is how a status or a type reads down a branch. */
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

/** The same icons four levels deep — the case that shows whether the indentation is still legible at depth. */
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

/** `collapsible` on an item turns its header into a toggle, open by default. It is per item, not a tree-wide setting. */
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

/** `TreeItemHeader`’s `action` slot holds a control on the right of the row, which is where a per-branch action belongs. */
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

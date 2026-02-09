import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { CircleDashed, Ellipsis } from '../../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { NumericBadge } from '../NumericBadge';
import { SegmentedTabs } from './SegmentedTabs';
import { SegmentedTabsButton } from './SegmentedTabsButton';
import { SegmentedTabsContent } from './SegmentedTabsContent';
import { SegmentedTabsList } from './SegmentedTabsList';
import { SegmentedTabsSeparator } from './SegmentedTabsSeparator';
import { SegmentedTabsTrigger } from './SegmentedTabsTrigger';
import { SegmentedTabsTriggerButton } from './SegmentedTabsTriggerButton';

const meta = {
  title: 'Navigation/SegmentedTabs',
  component: SegmentedTabs,
  subcomponents: {
    SegmentedTabsButton,
    SegmentedTabsContent,
    SegmentedTabsList,
    SegmentedTabsSeparator,
    SegmentedTabsTrigger,
    SegmentedTabsTriggerButton,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An enhanced segmented control with actionable hover buttons. ' +
          'Each item can show a three-dot action button on hover that can trigger dropdown menus.',
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'text' },
      description: 'Currently selected value',
    },
    onChange: {
      description: 'Callback when selection changes',
      action: 'onChange',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Whether the segmented tabs should take full width',
      defaultValue: false,
    },
  },
} satisfies Meta<typeof SegmentedTabs>;

export default meta;

type Story = StoryFn<typeof meta>;

export const Basic: Story = () => (
  <SegmentedTabs defaultValue='react'>
    <SegmentedTabsList>
      <SegmentedTabsTrigger value='react'>React</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='vue'>Vue</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='solid'>Solid</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='svelte'>Svelte</SegmentedTabsTrigger>
    </SegmentedTabsList>
    <SegmentedTabsContent value='react'>React Content</SegmentedTabsContent>
    <SegmentedTabsContent value='vue'>Vue Content</SegmentedTabsContent>
    <SegmentedTabsContent value='solid'>Solid Content</SegmentedTabsContent>
    <SegmentedTabsContent value='svelte'>Svelte Content</SegmentedTabsContent>
  </SegmentedTabs>
);

export const Disabled: Story = () => (
  <SegmentedTabs defaultValue='react'>
    <SegmentedTabsList>
      <SegmentedTabsTrigger value='react' disabled>
        React
      </SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='vue'>Vue</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='solid'>Solid</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='svelte'>Svelte</SegmentedTabsTrigger>
    </SegmentedTabsList>
    <SegmentedTabsContent value='react'>React Content</SegmentedTabsContent>
    <SegmentedTabsContent value='vue'>Vue Content</SegmentedTabsContent>
    <SegmentedTabsContent value='solid'>Solid Content</SegmentedTabsContent>
    <SegmentedTabsContent value='svelte'>Svelte Content</SegmentedTabsContent>
  </SegmentedTabs>
);

export const WithNumericBadge: Story = () => (
  <SegmentedTabs defaultValue='react'>
    <SegmentedTabsList>
      <SegmentedTabsTrigger value='react'>React</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='vue'>
        Vue
        <NumericBadge>1</NumericBadge>
      </SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='solid'>Solid</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='svelte'>Svelte</SegmentedTabsTrigger>
    </SegmentedTabsList>
    <SegmentedTabsContent value='react'>React Content</SegmentedTabsContent>
    <SegmentedTabsContent value='vue'>Vue Content</SegmentedTabsContent>
    <SegmentedTabsContent value='solid'>Solid Content</SegmentedTabsContent>
    <SegmentedTabsContent value='svelte'>Svelte Content</SegmentedTabsContent>
  </SegmentedTabs>
);

export const WithIcons: Story = () => (
  <SegmentedTabs defaultValue='react'>
    <SegmentedTabsList>
      <SegmentedTabsTrigger value='react'>
        <CircleDashed />
        React
      </SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='vue'>
        <CircleDashed />
      </SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='solid'>
        <CircleDashed />
        Solid
        <NumericBadge>1</NumericBadge>
      </SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='svelte'>
        <CircleDashed />
        <NumericBadge>1</NumericBadge>
      </SegmentedTabsTrigger>
    </SegmentedTabsList>
    <SegmentedTabsContent value='react'>React Content</SegmentedTabsContent>
    <SegmentedTabsContent value='vue'>Vue Content</SegmentedTabsContent>
    <SegmentedTabsContent value='solid'>Solid Content</SegmentedTabsContent>
    <SegmentedTabsContent value='svelte'>Svelte Content</SegmentedTabsContent>
  </SegmentedTabs>
);

export const WithContextAction: Story = () => (
  <SegmentedTabs defaultValue='react'>
    <SegmentedTabsList>
      <SegmentedTabsTrigger value='react'>
        React
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SegmentedTabsTriggerButton />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Action 1</DropdownMenuItem>
            <DropdownMenuItem>Action 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SegmentedTabsTrigger>

      <SegmentedTabsTrigger value='vue'>
        Vue
        <NumericBadge>1</NumericBadge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SegmentedTabsTriggerButton />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Action 1</DropdownMenuItem>
            <DropdownMenuItem>Action 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SegmentedTabsTrigger>

      <SegmentedTabsTrigger value='solid'>
        Solid
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SegmentedTabsTriggerButton />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Action 1</DropdownMenuItem>
            <DropdownMenuItem>Action 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SegmentedTabsTrigger>

      <SegmentedTabsTrigger value='svelte'>
        Svelte
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SegmentedTabsTriggerButton />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Action 1</DropdownMenuItem>
            <DropdownMenuItem>Action 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SegmentedTabsTrigger>
    </SegmentedTabsList>
    <SegmentedTabsContent value='react'>React Content</SegmentedTabsContent>
    <SegmentedTabsContent value='vue'>Vue Content</SegmentedTabsContent>
    <SegmentedTabsContent value='solid'>Solid Content</SegmentedTabsContent>
    <SegmentedTabsContent value='svelte'>Svelte Content</SegmentedTabsContent>
  </SegmentedTabs>
);

export const WithSeparator: Story = () => (
  <SegmentedTabs defaultValue='react'>
    <SegmentedTabsList>
      <SegmentedTabsTrigger value='react'>React</SegmentedTabsTrigger>

      <SegmentedTabsTrigger value='vue'>
        Vue
        <NumericBadge>1</NumericBadge>
      </SegmentedTabsTrigger>

      <SegmentedTabsTrigger value='svelte'>Svelte</SegmentedTabsTrigger>

      <SegmentedTabsSeparator />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SegmentedTabsButton>
            <Ellipsis />
            More
          </SegmentedTabsButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Action 1</DropdownMenuItem>
          <DropdownMenuItem>Action 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SegmentedTabsList>
    <SegmentedTabsContent value='react'>React Content</SegmentedTabsContent>
    <SegmentedTabsContent value='vue'>Vue Content</SegmentedTabsContent>
    <SegmentedTabsContent value='solid'>Solid Content</SegmentedTabsContent>
    <SegmentedTabsContent value='svelte'>Svelte Content</SegmentedTabsContent>
  </SegmentedTabs>
);

export const FullWidth: Story = () => (
  <div className='min-w-800'>
    <SegmentedTabs defaultValue='react' fullWidth>
      <SegmentedTabsList>
        <SegmentedTabsTrigger value='react'>React</SegmentedTabsTrigger>
        <SegmentedTabsTrigger value='vue'>Vue</SegmentedTabsTrigger>
        <SegmentedTabsTrigger value='solid'>Solid</SegmentedTabsTrigger>
        <SegmentedTabsTrigger value='svelte'>Svelte</SegmentedTabsTrigger>
      </SegmentedTabsList>
      <SegmentedTabsContent value='react'>React Content</SegmentedTabsContent>
      <SegmentedTabsContent value='vue'>Vue Content</SegmentedTabsContent>
      <SegmentedTabsContent value='solid'>Solid Content</SegmentedTabsContent>
      <SegmentedTabsContent value='svelte'>Svelte Content</SegmentedTabsContent>
    </SegmentedTabs>
  </div>
);

export const Controlled: Story = () => {
  const [value, setValue] = useState<string>('vue');

  return (
    <SegmentedTabs value={value} onChange={setValue}>
      <SegmentedTabsList>
        <SegmentedTabsTrigger value='react'>React</SegmentedTabsTrigger>

        <SegmentedTabsTrigger value='vue'>Vue</SegmentedTabsTrigger>

        <SegmentedTabsTrigger value='solid'>Solid</SegmentedTabsTrigger>

        <SegmentedTabsTrigger value='svelte'>Svelte</SegmentedTabsTrigger>
      </SegmentedTabsList>
      <SegmentedTabsContent value='react'>React Content</SegmentedTabsContent>
      <SegmentedTabsContent value='vue'>Vue Content</SegmentedTabsContent>
      <SegmentedTabsContent value='solid'>Solid Content</SegmentedTabsContent>
      <SegmentedTabsContent value='svelte'>Svelte Content</SegmentedTabsContent>
    </SegmentedTabs>
  );
};

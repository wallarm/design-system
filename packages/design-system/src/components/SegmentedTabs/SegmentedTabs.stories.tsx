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

const DESCRIPTION = [
  'The pill-skinned tab set: it owns its panels like `Tabs` but wears `SegmentedControl`’s look. Reach for it for scoped views of a single collection — All / Active / Blocked — or as a second level under primary `Tabs`, never as a page’s main tabs.',
  'The line against `SegmentedControl` is whether selecting changes *which* content shows (here) or only *how the same content looks* (there). Keep the set short: overflow goes to a “More” menu, since these pills do not scroll.',
].join(' ');

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
        component: DESCRIPTION,
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

/** The smallest set — pills and their panels, with the selected pill sliding under the label. */
export const Basic: Story = () => (
  <SegmentedTabs defaultValue='react' data-testid='segmented-tabs'>
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

/** A disabled pill stays visible but unselectable, for a scope that exists and currently has nothing to show. */
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

/** A `NumericBadge` in the pill turns a scope into a count, which is most of the value of this pattern over plain tabs. */
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

/** An icon beside the label, for scopes that read faster as symbols. */
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

/** A pill can carry its own action button — the three-dot menu appears on hover, which is how a saved view gets rename and delete without leaving the row. */
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

/** `SegmentedTabsSeparator` splits the fixed presets from what follows, which is the seam the overflow menu sits behind. */
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

/** The `indicator` dot marks a saved or custom view, so a user-made scope is distinguishable from the built-in ones. */
export const WithIndicator: Story = () => (
  <SegmentedTabs defaultValue='all'>
    <SegmentedTabsList>
      <SegmentedTabsTrigger value='all'>All Attacks</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='critical' indicator>
        Critical
      </SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='api'>API Abuse</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value='custom' indicator>
        Custom View
      </SegmentedTabsTrigger>
    </SegmentedTabsList>
    <SegmentedTabsContent value='all'>All Attacks Content</SegmentedTabsContent>
    <SegmentedTabsContent value='critical'>Critical Content</SegmentedTabsContent>
    <SegmentedTabsContent value='api'>API Abuse Content</SegmentedTabsContent>
    <SegmentedTabsContent value='custom'>Custom View Content</SegmentedTabsContent>
  </SegmentedTabs>
);

/** `fullWidth` stretches the row to its container, for a toolbar where the pills should span rather than huddle left. */
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

/** `value` and `onChange` when the scope lives outside the component — in the URL, or shared with a filter. */
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

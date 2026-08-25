import { useState } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { CircleDashed, Earth, Ellipsis, LayoutDashboard, Search } from '../../icons';
import { Button } from '../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { NumericBadge } from '../NumericBadge';
import { VStack } from '../Stack';
import { Tabs } from './Tabs';
import { TabsButton } from './TabsButton';
import { TabsContent } from './TabsContent';
import { TabsLineActions } from './TabsLineActions';
import { TabsList } from './TabsList';
import { TabsSeparator } from './TabsSeparator';
import { TabsTrigger } from './TabsTrigger';

const DESCRIPTION = [
  'Switches between a few peer sections of one page without going anywhere — `Tabs` owns the panels, which is what separates it from `SegmentedControl`.',
  'Underline tabs are the default for a page’s primary division; reach for `SegmentedTabs` for scoped views of one collection or a second level below these, `SegmentedControl` for a toggle that owns no panel, and `Accordion` when the sections should be open at once.',
].join(' ');

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  subcomponents: {
    TabsButton,
    TabsContent,
    TabsLineActions,
    TabsList,
    TabsSeparator,
    TabsTrigger,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },

  args: { onChange: fn() },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryFn<typeof meta>;

/** The smallest complete set: every `TabsTrigger` value pairs with a `TabsContent` of the same value, and the panel mounts the first time it opens. */
export const Basic: Story = () => (
  <div className='w-600'>
    <Tabs defaultValue='1' data-testid='tabs'>
      <TabsList>
        <TabsTrigger value='1'>Tab 1</TabsTrigger>
        <TabsTrigger value='2'>Tab 2</TabsTrigger>
        <TabsTrigger value='3'>Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value='1'>Content for Tab 1</TabsContent>
      <TabsContent value='2'>Content for Tab 2</TabsContent>
      <TabsContent value='3'>Content for Tab 3</TabsContent>
    </Tabs>
  </div>
);

/** `grayscale` mutes the active underline and label for a bar that should sit quieter than the content it introduces. */
export const Variants: Story = () => (
  <div className='w-600'>
    <VStack gap={32}>
      <Tabs defaultValue='1'>
        <TabsList>
          <TabsTrigger value='1'>Tab 1 (Default)</TabsTrigger>
          <TabsTrigger value='2'>Tab 2 (Default)</TabsTrigger>
          <TabsTrigger value='3'>Tab 3 (Default)</TabsTrigger>
        </TabsList>
        <TabsContent value='1'>Content for Tab 1</TabsContent>
        <TabsContent value='2'>Content for Tab 2</TabsContent>
        <TabsContent value='3'>Content for Tab 3</TabsContent>
      </Tabs>

      <Tabs defaultValue='1' variant='grayscale'>
        <TabsList>
          <TabsTrigger value='1'>Tab 1 (Grayscale)</TabsTrigger>
          <TabsTrigger value='2'>Tab 2 (Grayscale)</TabsTrigger>
          <TabsTrigger value='3'>Tab 3 (Grayscale)</TabsTrigger>
        </TabsList>
        <TabsContent value='1'>Content for Tab 1</TabsContent>
        <TabsContent value='2'>Content for Tab 2</TabsContent>
        <TabsContent value='3'>Content for Tab 3</TabsContent>
      </Tabs>
    </VStack>
  </div>
);

/** An icon before the label, for a set where the words alone are slow to scan. */
export const Icons: Story = () => (
  <div className='w-600'>
    <Tabs defaultValue='1'>
      <TabsList>
        <TabsTrigger value='1'>
          <CircleDashed />
          Tab 1
        </TabsTrigger>
        <TabsTrigger value='2'>
          Tab 2
          <CircleDashed />
        </TabsTrigger>
        <TabsTrigger value='3'>
          <CircleDashed />
          Tab 3
          <CircleDashed />
        </TabsTrigger>
      </TabsList>
      <TabsContent value='1'>Content for Tab 1</TabsContent>
      <TabsContent value='2'>Content for Tab 2</TabsContent>
      <TabsContent value='3'>Content for Tab 3</TabsContent>
    </Tabs>
  </div>
);

/** Icons with no labels — only for a set the reader already knows, and each trigger still needs an accessible name. */
export const IconsOnly: Story = () => (
  <div className='w-600'>
    <Tabs defaultValue='1'>
      <TabsList>
        <TabsTrigger value='1'>
          <LayoutDashboard />
        </TabsTrigger>
        <TabsTrigger value='2'>
          <Search />
        </TabsTrigger>
        <TabsTrigger value='3'>
          <Earth />
        </TabsTrigger>
      </TabsList>
      <TabsContent value='1'>Content for Tab 1</TabsContent>
      <TabsContent value='2'>Content for Tab 2</TabsContent>
      <TabsContent value='3'>Content for Tab 3</TabsContent>
    </Tabs>
  </div>
);

/** A count in the trigger, which is what turns a tab into a status: how much is waiting behind it. */
export const Badge: Story = () => (
  <div className='w-600'>
    <Tabs defaultValue='1'>
      <TabsList>
        <TabsTrigger value='1'>
          <CircleDashed />
          Tab 1<NumericBadge>2 </NumericBadge>
        </TabsTrigger>
        <TabsTrigger value='2'>
          Tab 2<NumericBadge>2 </NumericBadge>
        </TabsTrigger>
        <TabsTrigger value='3'>
          <CircleDashed />
          Tab 3
          <CircleDashed />
          <NumericBadge>2 </NumericBadge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value='1'>Content for Tab 1</TabsContent>
      <TabsContent value='2'>Content for Tab 2</TabsContent>
      <TabsContent value='3'>Content for Tab 3</TabsContent>
    </Tabs>
  </div>
);

/** `medium` and `small`. `Tabs` is the one in the switcher family with a size — the segmented pills are fixed height. */
export const Sizes: Story = () => (
  <div className='w-600'>
    <VStack gap={32}>
      <Tabs defaultValue='1' size='medium'>
        <TabsList>
          <TabsTrigger value='1'>Tab 1</TabsTrigger>
          <TabsTrigger value='2'>Tab 2</TabsTrigger>
          <TabsTrigger value='3'>Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value='1'>Content for Tab 1</TabsContent>
        <TabsContent value='2'>Content for Tab 2</TabsContent>
        <TabsContent value='3'>Content for Tab 3</TabsContent>
      </Tabs>

      <Tabs defaultValue='1' size='small'>
        <TabsList>
          <TabsTrigger value='1'>Tab 1</TabsTrigger>
          <TabsTrigger value='2'>Tab 2</TabsTrigger>
          <TabsTrigger value='3'>Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value='1'>Content for Tab 1</TabsContent>
        <TabsContent value='2'>Content for Tab 2</TabsContent>
        <TabsContent value='3'>Content for Tab 3</TabsContent>
      </Tabs>
    </VStack>
  </div>
);

/** Past the available width the list scrolls sideways with arrow buttons rather than wrapping, so the bar stays one line however many tabs there are. */
export const Scrollable: Story = () => (
  <div className='w-400'>
    <Tabs defaultValue='1'>
      <TabsList>
        {new Array(20).fill(null).map((_, index) => {
          const key = index + 1;
          return (
            <TabsTrigger key={key} value={String(key)}>
              Tab {key}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {new Array(20).fill(null).map((_, index) => {
        const key = index + 1;
        return (
          <TabsContent key={key} value={String(key)}>
            Content for Tab {key}
          </TabsContent>
        );
      })}
    </Tabs>
  </div>
);

/** `value` plus `onChange` when something outside the tabs decides which one is open — a route, or a step in a flow. */
export const Controlled: Story = () => {
  const [value, setValue] = useState('1');

  return (
    <Tabs value={value} onChange={setValue}>
      <TabsList>
        <TabsTrigger value='1'>Tab 1</TabsTrigger>
        <TabsTrigger value='2'>Tab 2</TabsTrigger>
        <TabsTrigger value='3'>Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value='1'>Content for Tab 1</TabsContent>
      <TabsContent value='2'>Content for Tab 2</TabsContent>
      <TabsContent value='3'>Content for Tab 3</TabsContent>
    </Tabs>
  );
};

/** A disabled trigger keeps its place but drops out of the keyboard order. Prefer hiding a tab that has nothing behind it. */
export const Disabled: Story = () => (
  <Tabs defaultValue='1'>
    <TabsList>
      <TabsTrigger value='1'>Tab 1</TabsTrigger>
      <TabsTrigger value='2' disabled>
        Tab 2 (Disabled)
      </TabsTrigger>
      <TabsTrigger value='3'>Tab 3</TabsTrigger>
      <TabsTrigger value='4'>Tab 4</TabsTrigger>
    </TabsList>
    <TabsContent value='1'>Content for Tab 1</TabsContent>
    <TabsContent value='2'>Content for Tab 2</TabsContent>
    <TabsContent value='3'>Content for Tab 3</TabsContent>
    <TabsContent value='4'>Content for Tab 4</TabsContent>
  </Tabs>
);

/** `TabsSeparator` groups the triggers inside one bar, for when two of them belong together more than the rest. */
export const WithSeparator: Story = () => (
  <div className='w-600'>
    <Tabs defaultValue='1'>
      <TabsList>
        <TabsTrigger value='1'>Tab 1</TabsTrigger>
        <TabsTrigger value='2'>Tab 2</TabsTrigger>
        <TabsTrigger value='3'>Tab 3</TabsTrigger>
        <TabsSeparator />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TabsButton>
              <Ellipsis />
              More
            </TabsButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Action 1</DropdownMenuItem>
            <DropdownMenuItem>Action 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TabsList>
      <TabsContent value='1'>Content for Tab 1</TabsContent>
      <TabsContent value='2'>Content for Tab 2</TabsContent>
      <TabsContent value='3'>Content for Tab 3</TabsContent>
    </Tabs>
  </div>
);

/** `TabsLineActions` puts controls on the right of the bar itself, which is where an action about the whole section belongs rather than inside a panel. */
export const WithLineActions: Story = () => (
  <div className='w-600'>
    <Tabs defaultValue='1'>
      <TabsList>
        <TabsTrigger value='1'>Tab 1</TabsTrigger>
        <TabsTrigger value='2'>Tab 2</TabsTrigger>
        <TabsTrigger value='3'>Tab 3</TabsTrigger>
        <TabsSeparator />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TabsButton>
              <Ellipsis />
              More
            </TabsButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Action 1</DropdownMenuItem>
            <DropdownMenuItem>Action 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TabsLineActions>
          <Button variant='ghost' color='neutral' size='medium'>
            <CircleDashed />
          </Button>

          <TabsSeparator mx={8} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='secondary' color='brand' size='medium'>
                <CircleDashed />
                Button
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Action 1</DropdownMenuItem>
              <DropdownMenuItem>Action 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TabsLineActions>
      </TabsList>
      <TabsContent value='1'>Content for Tab 1</TabsContent>
      <TabsContent value='2'>Content for Tab 2</TabsContent>
      <TabsContent value='3'>Content for Tab 3</TabsContent>
    </Tabs>
  </div>
);

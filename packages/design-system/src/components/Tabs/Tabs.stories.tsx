import { useState } from 'react';

import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import {
  CircleDashed,
  Earth,
  Ellipsis,
  LayoutDashboard,
  Search,
} from '../../icons';
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
  },

  args: { onChange: fn() },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryFn<typeof meta>;

export const Basic: Story = () => (
  <div className="w-600">
    <Tabs defaultValue="1">
      <TabsList>
        <TabsTrigger value="1">Tab 1</TabsTrigger>
        <TabsTrigger value="2">Tab 2</TabsTrigger>
        <TabsTrigger value="3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="1">Content for Tab 1</TabsContent>
      <TabsContent value="2">Content for Tab 2</TabsContent>
      <TabsContent value="3">Content for Tab 3</TabsContent>
    </Tabs>
  </div>
);

export const Variants: Story = () => (
  <div className="w-600">
    <VStack spacing={32}>
      <Tabs defaultValue="1">
        <TabsList>
          <TabsTrigger value="1">Tab 1 (Default)</TabsTrigger>
          <TabsTrigger value="2">Tab 2 (Default)</TabsTrigger>
          <TabsTrigger value="3">Tab 3 (Default)</TabsTrigger>
        </TabsList>
        <TabsContent value="1">Content for Tab 1</TabsContent>
        <TabsContent value="2">Content for Tab 2</TabsContent>
        <TabsContent value="3">Content for Tab 3</TabsContent>
      </Tabs>

      <Tabs defaultValue="1" variant="grayscale">
        <TabsList>
          <TabsTrigger value="1">Tab 1 (Grayscale)</TabsTrigger>
          <TabsTrigger value="2">Tab 2 (Grayscale)</TabsTrigger>
          <TabsTrigger value="3">Tab 3 (Grayscale)</TabsTrigger>
        </TabsList>
        <TabsContent value="1">Content for Tab 1</TabsContent>
        <TabsContent value="2">Content for Tab 2</TabsContent>
        <TabsContent value="3">Content for Tab 3</TabsContent>
      </Tabs>
    </VStack>
  </div>
);

export const Icons: Story = () => (
  <div className="w-600">
    <Tabs defaultValue="1">
      <TabsList>
        <TabsTrigger value="1">
          <CircleDashed />
          Tab 1
        </TabsTrigger>
        <TabsTrigger value="2">
          Tab 2
          <CircleDashed />
        </TabsTrigger>
        <TabsTrigger value="3">
          <CircleDashed />
          Tab 3
          <CircleDashed />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="1">Content for Tab 1</TabsContent>
      <TabsContent value="2">Content for Tab 2</TabsContent>
      <TabsContent value="3">Content for Tab 3</TabsContent>
    </Tabs>
  </div>
);

export const IconsOnly: Story = () => (
  <div className="w-600">
    <Tabs defaultValue="1">
      <TabsList>
        <TabsTrigger value="1">
          <LayoutDashboard />
        </TabsTrigger>
        <TabsTrigger value="2">
          <Search />
        </TabsTrigger>
        <TabsTrigger value="3">
          <Earth />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="1">Content for Tab 1</TabsContent>
      <TabsContent value="2">Content for Tab 2</TabsContent>
      <TabsContent value="3">Content for Tab 3</TabsContent>
    </Tabs>
  </div>
);

export const Badge: Story = () => (
  <div className="w-600">
    <Tabs defaultValue="1">
      <TabsList>
        <TabsTrigger value="1">
          <CircleDashed />
          Tab 1<NumericBadge>2 </NumericBadge>
        </TabsTrigger>
        <TabsTrigger value="2">
          Tab 2<NumericBadge>2 </NumericBadge>
        </TabsTrigger>
        <TabsTrigger value="3">
          <CircleDashed />
          Tab 3
          <CircleDashed />
          <NumericBadge>2 </NumericBadge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="1">Content for Tab 1</TabsContent>
      <TabsContent value="2">Content for Tab 2</TabsContent>
      <TabsContent value="3">Content for Tab 3</TabsContent>
    </Tabs>
  </div>
);

export const Sizes: Story = () => (
  <div className="w-600">
    <VStack spacing={32}>
      <Tabs defaultValue="1" size="medium">
        <TabsList>
          <TabsTrigger value="1">Tab 1</TabsTrigger>
          <TabsTrigger value="2">Tab 2</TabsTrigger>
          <TabsTrigger value="3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="1">Content for Tab 1</TabsContent>
        <TabsContent value="2">Content for Tab 2</TabsContent>
        <TabsContent value="3">Content for Tab 3</TabsContent>
      </Tabs>

      <Tabs defaultValue="1" size="small">
        <TabsList>
          <TabsTrigger value="1">Tab 1</TabsTrigger>
          <TabsTrigger value="2">Tab 2</TabsTrigger>
          <TabsTrigger value="3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="1">Content for Tab 1</TabsContent>
        <TabsContent value="2">Content for Tab 2</TabsContent>
        <TabsContent value="3">Content for Tab 3</TabsContent>
      </Tabs>
    </VStack>
  </div>
);

export const Scrollable: Story = () => (
  <div className="w-400">
    <Tabs defaultValue="1">
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

export const Controlled: Story = () => {
  const [value, setValue] = useState('1');

  return (
    <Tabs value={value} onChange={setValue}>
      <TabsList>
        <TabsTrigger value="1">Tab 1</TabsTrigger>
        <TabsTrigger value="2">Tab 2</TabsTrigger>
        <TabsTrigger value="3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="1">Content for Tab 1</TabsContent>
      <TabsContent value="2">Content for Tab 2</TabsContent>
      <TabsContent value="3">Content for Tab 3</TabsContent>
    </Tabs>
  );
};

export const Disabled: Story = () => (
  <Tabs defaultValue="1">
    <TabsList>
      <TabsTrigger value="1">Tab 1</TabsTrigger>
      <TabsTrigger value="2" disabled>
        Tab 2 (Disabled)
      </TabsTrigger>
      <TabsTrigger value="3">Tab 3</TabsTrigger>
      <TabsTrigger value="4">Tab 4</TabsTrigger>
    </TabsList>
    <TabsContent value="1">Content for Tab 1</TabsContent>
    <TabsContent value="2">Content for Tab 2</TabsContent>
    <TabsContent value="3">Content for Tab 3</TabsContent>
    <TabsContent value="4">Content for Tab 4</TabsContent>
  </Tabs>
);

export const WithSeparator: Story = () => (
  <div className="w-600">
    <Tabs defaultValue="1">
      <TabsList>
        <TabsTrigger value="1">Tab 1</TabsTrigger>
        <TabsTrigger value="2">Tab 2</TabsTrigger>
        <TabsTrigger value="3">Tab 3</TabsTrigger>
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
      <TabsContent value="1">Content for Tab 1</TabsContent>
      <TabsContent value="2">Content for Tab 2</TabsContent>
      <TabsContent value="3">Content for Tab 3</TabsContent>
    </Tabs>
  </div>
);

export const WithLineActions: Story = () => (
  <div className="w-600">
    <Tabs defaultValue="1">
      <TabsList>
        <TabsTrigger value="1">Tab 1</TabsTrigger>
        <TabsTrigger value="2">Tab 2</TabsTrigger>
        <TabsTrigger value="3">Tab 3</TabsTrigger>
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
          <Button variant="ghost" color="neutral" size="medium">
            <CircleDashed />
          </Button>

          <TabsSeparator mx={8} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" color="brand" size="medium">
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
      <TabsContent value="1">Content for Tab 1</TabsContent>
      <TabsContent value="2">Content for Tab 2</TabsContent>
      <TabsContent value="3">Content for Tab 3</TabsContent>
    </Tabs>
  </div>
);

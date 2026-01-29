import { useState } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { PanelRight } from '../../icons';
import { Button } from '../Button';
import { HStack, VStack } from '../Stack';
import { Switch, SwitchControl, SwitchLabel } from '../Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Tabs';
import { Text } from '../Text';
import { TooltipProvider } from '../Tooltip';

import { DRAWER_SIZES, DRAWER_WIDTH_CONSTRAINTS } from './constants';
import { Drawer, type DrawerProps } from './Drawer';
import { DrawerBody } from './DrawerBody';
import { DrawerClose } from './DrawerClose';
import { DrawerContent } from './DrawerContent';
import { DrawerFooter } from './DrawerFooter';
import { DrawerFooterControls } from './DrawerFooterControls';
import { DrawerHeader } from './DrawerHeader';
import { DrawerResizeHandle } from './DrawerResizeHandle';
import { DrawerTitle } from './DrawerTitle';
import { DrawerTrigger } from './DrawerTrigger';

const meta = {
  title: 'Overlay/Drawer',
  component: Drawer,
  subcomponents: {
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    DrawerClose,
    DrawerResizeHandle,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An animated slide-out panel that appears from the right side of the screen. Follows the compound component pattern for flexible composition.',
      },
    },
  },
  argTypes: {
    open: {
      control: { type: 'boolean' },
      description: 'Whether the drawer is open',
    },
    width: {
      control: { type: 'number' },
      description: `Initial width of the drawer. Presets: small=${DRAWER_SIZES.small}, medium=${DRAWER_SIZES.medium}, large=${DRAWER_SIZES.large}`,
      defaultValue: DRAWER_SIZES.small,
    },
    minWidth: {
      control: { type: 'number' },
      description: 'Minimum width when resizing',
      defaultValue: DRAWER_WIDTH_CONSTRAINTS.min,
    },
    maxWidth: {
      control: { type: 'number' },
      description: 'Maximum width when resizing',
      defaultValue: DRAWER_WIDTH_CONSTRAINTS.max,
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Drawer>;

export default meta;

/** Content placeholder styled like Figma designs - fills available space */
const ContentPlaceholder = ({
  fillHeight = false,
  height,
}: {
  fillHeight?: boolean;
  height?: number;
}) => (
  <div
    className={`w-full rounded-12 bg-[#f1f5f9] ${fillHeight ? 'flex-1 min-h-0' : ''}`}
    style={
      height
        ? { height: `${height}px` }
        : fillHeight
          ? undefined
          : { height: '200px' }
    }
  />
);

/** Basic uncontrolled drawer */
export const Basic: StoryFn<DrawerProps> = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open Drawer</Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
        </DrawerHeader>

        <DrawerBody>
          <ContentPlaceholder fillHeight />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

/** Minimal example */
export const WithFooter: StoryFn<DrawerProps> = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open Drawer</Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer's title</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <ContentPlaceholder fillHeight />
        </DrawerBody>
        <DrawerFooter>
          <DrawerFooterControls>
            <Button variant="ghost" color="neutral" size="large">
              Button
            </Button>
            <Button variant="primary" color="brand" size="large">
              Button
            </Button>
          </DrawerFooterControls>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/** With footer left actions */
export const WithFooterLeftActions: StoryFn<DrawerProps> = () => (
  <Drawer>
    <DrawerTrigger asChild>
      <Button>Open with Footer Actions</Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Footer with Left Actions</DrawerTitle>
      </DrawerHeader>

      <DrawerBody>
        <ContentPlaceholder fillHeight />
      </DrawerBody>

      <DrawerFooter>
        <DrawerFooterControls placement="left">
          <Switch>
            <SwitchControl />
            <SwitchLabel>Remember choice</SwitchLabel>
          </Switch>
        </DrawerFooterControls>

        <DrawerClose asChild>
          <Button variant="ghost" color="neutral" size="large">
            Cancel
          </Button>
        </DrawerClose>
        <Button variant="primary" color="brand" size="large">
          Apply
        </Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
);

WithFooterLeftActions.parameters = {
  docs: {
    description: {
      story:
        'Footer can have actions on both left and right sides. Use flexbox utilities to position elements.',
    },
  },
};

/** Drawer with different sizes - Small */
export const Sizes: StoryFn<DrawerProps> = () => (
  <HStack spacing={8} justify="center">
    <Drawer width={DRAWER_SIZES.small}>
      <DrawerTrigger asChild>
        <Button>Open Small ({DRAWER_SIZES.small}px)</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Small Drawer ({DRAWER_SIZES.small}px)</DrawerTitle>
        </DrawerHeader>

        <DrawerBody>
          <ContentPlaceholder fillHeight />
        </DrawerBody>
      </DrawerContent>
    </Drawer>

    <Drawer width={DRAWER_SIZES.medium}>
      <DrawerTrigger asChild>
        <Button>Open Medium ({DRAWER_SIZES.medium}px)</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Medium Drawer ({DRAWER_SIZES.medium}px)</DrawerTitle>
        </DrawerHeader>

        <DrawerBody>
          <ContentPlaceholder fillHeight />
        </DrawerBody>
      </DrawerContent>
    </Drawer>

    <Drawer width={DRAWER_SIZES.large}>
      <DrawerTrigger asChild>
        <Button>Open Large ({DRAWER_SIZES.large}px)</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Large Drawer ({DRAWER_SIZES.large}px)</DrawerTitle>
        </DrawerHeader>

        <DrawerBody>
          <ContentPlaceholder fillHeight />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  </HStack>
);

/** Custom width with percentage */
export const CustomSizes: StoryFn<DrawerProps> = () => {
  return (
    <HStack spacing={8} justify="center">
      <Drawer width="50%">
        <DrawerTrigger asChild>
          <Button>50% Width</Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>50% Width Drawer</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <div className="py-12">
              <p>This drawer takes 50% of the viewport width.</p>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer width={1000}>
        <DrawerTrigger asChild>
          <Button>1000px Width</Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>1000px Width Drawer</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <div className="py-12">
              <p>This drawer has a fixed width of 1000px.</p>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </HStack>
  );
};

/** Resizable drawer */
export const Resizable: StoryFn<DrawerProps> = () => {
  return (
    <VStack spacing={12}>
      <Drawer width={800}>
        <DrawerTrigger asChild>
          <Button>Open Resizable Drawer (as number)</Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerResizeHandle />
          <DrawerHeader>
            <DrawerTitle>Resizable Drawer</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <div className="py-12">
              <p className="mb-16">Drag the left edge to resize this drawer.</p>
              <ContentPlaceholder height={300} />
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer width="900px">
        <DrawerTrigger asChild>
          <Button>Open Resizable Drawer (900px)</Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerResizeHandle />
          <DrawerHeader>
            <DrawerTitle>Resizable Drawer with "900px" width</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <div className="py-12">
              <p className="mb-16">
                Width is set as "900px" string. Drag the left edge to resize.
              </p>
              <ContentPlaceholder height={300} />
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer width="50%">
        <DrawerTrigger asChild>
          <Button>Open Resizable Drawer (50%)</Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerResizeHandle />
          <DrawerHeader>
            <DrawerTitle>Resizable Drawer with 50% width</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <div className="py-12">
              <p className="mb-16">
                Width is set as "50%". Drag the left edge to resize - it will
                convert to pixels.
              </p>
              <ContentPlaceholder height={300} />
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </VStack>
  );
};

/** Drawer with scrollable content */
export const Scrollable: StoryFn<DrawerProps> = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open Drawer with Scroll</Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Scrollable Content</DrawerTitle>
        </DrawerHeader>

        <DrawerBody>
          <div className="flex flex-col gap-16 py-12">
            {Array.from({ length: 20 }).map((_, i) => (
              <ContentPlaceholder key={i} height={100} />
            ))}
          </div>
        </DrawerBody>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="ghost" color="neutral" size="large">
              Close
            </Button>
          </DrawerClose>
          <Button variant="primary" color="brand" size="large">
            Confirm
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/** Controlled drawer with external state */
export const Controlled: StoryFn<DrawerProps> = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Controlled Drawer</Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Controlled Drawer</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <div className="py-12">
              <p className="mb-16">This drawer is controlled externally.</p>
              <ContentPlaceholder />
            </div>
          </DrawerBody>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost" color="neutral" size="large">
                Cancel
              </Button>
            </DrawerClose>
            <Button variant="primary" color="brand" size="large">
              Save Changes
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

/** No closable on ESC */
export const NoClosableOnEsc: StoryFn<DrawerProps> = () => {
  return (
    <Drawer closeOnEscape={false}>
      <DrawerTrigger asChild>
        <Button>Open Drawer</Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
        </DrawerHeader>

        <DrawerBody>
          <ContentPlaceholder fillHeight />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

/** Without overlay */
export const NoOverlay: StoryFn<DrawerProps> = () => {
  return (
    <Drawer overlay={false}>
      <DrawerTrigger asChild>
        <Button>Open without Overlay</Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>No Overlay</DrawerTitle>
        </DrawerHeader>

        <DrawerBody>
          <div className="py-12">
            <p>This drawer has no overlay backdrop.</p>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

/** Nested drawers with push-back effect */
export const WithNested: StoryFn<DrawerProps> = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>1st level drawer</Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>[Level 1] Main Drawer</DrawerTitle>

          {/* Level 2 drawer */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" color="neutral" size="small">
                <PanelRight />
                2nd level drawer
              </Button>
            </DrawerTrigger>

            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>[Level 2] Detail View</DrawerTitle>
                {/* Level 3 drawer */}
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="ghost" color="neutral" size="small">
                      <PanelRight />
                      3nd level drawer
                    </Button>
                  </DrawerTrigger>

                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>[Level 3] Deep Nested</DrawerTitle>
                    </DrawerHeader>

                    <DrawerBody>
                      <VStack spacing={12} align="start">
                        <Text>Level 3! Unlimited nesting works.</Text>
                        <ContentPlaceholder height={150} />
                      </VStack>
                    </DrawerBody>

                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button size="large" variant="ghost" color="neutral">
                          Back
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </DrawerHeader>

              <DrawerBody>
                <VStack spacing={12} align="start">
                  <Text>
                    This is Level 2 drawer. Main drawer is pushed back. You can
                    go deeper:
                  </Text>

                  <ContentPlaceholder height={150} />
                </VStack>
              </DrawerBody>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="ghost" color="neutral" size="large">
                    Back
                  </Button>
                </DrawerClose>
                <Button variant="primary" color="brand" size="large">
                  Apply
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={12} align="start">
            <Text>
              This is Level 1 drawer. Click below to open nested drawers:
            </Text>

            <ContentPlaceholder height={300} />
          </VStack>
        </DrawerBody>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="ghost" color="neutral" size="large">
              Cancel
            </Button>
          </DrawerClose>
          <Button variant="primary" color="brand" size="large">
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/** With tabs */
export const WithTabs: StoryFn<DrawerProps> = () => {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <Drawer width={960}>
      <DrawerTrigger asChild>
        <Button>Open Drawer with Tabs</Button>
      </DrawerTrigger>

      <DrawerContent>
        <Tabs value={activeTab} onChange={setActiveTab} asChild>
          <DrawerHeader>
            <DrawerTitle>Tabbed Content</DrawerTitle>
          </DrawerHeader>

          <TabsList>
            <TabsTrigger value="tab1">General</TabsTrigger>
            <TabsTrigger value="tab2">Settings</TabsTrigger>
            <TabsTrigger value="tab3">Advanced</TabsTrigger>
          </TabsList>

          <DrawerBody>
            <div className="pt-12">
              <TabsContent value="tab1">
                <h3 className="text-lg font-medium mb-8">General Settings</h3>
                <ContentPlaceholder height={300} />
              </TabsContent>
              <TabsContent value="tab2">
                <h3 className="text-lg font-medium mb-8">Configuration</h3>
                <ContentPlaceholder height={300} />
              </TabsContent>
              <TabsContent value="tab3">
                <h3 className="text-lg font-medium mb-8">Advanced Options</h3>
                <ContentPlaceholder height={300} />
              </TabsContent>
            </div>
          </DrawerBody>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost" color="neutral" size="large">
                Cancel
              </Button>
            </DrawerClose>
            <Button variant="primary" color="brand" size="large">
              Apply Settings
            </Button>
          </DrawerFooter>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
};

import { useState } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { PanelRight } from '../../icons';
import { Attribute, AttributeLabel, AttributeValue } from '../Attribute';
import { Button } from '../Button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { OverflowList } from '../OverflowList';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import {
  Select,
  SelectButton,
  SelectContent,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../Select';
import { HStack, VStack } from '../Stack';
import { Switch, SwitchControl, SwitchLabel } from '../Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Tabs';
import { Tag } from '../Tag';
import { Text } from '../Text';
import { DRAWER_SIZES, DRAWER_WIDTH_CONSTRAINTS } from './constants';
import { Drawer, type DrawerProps } from './Drawer';
import { DrawerBody } from './DrawerBody';
import { DrawerClose } from './DrawerClose';
import { DrawerContent } from './DrawerContent';
import { DrawerDescription } from './DrawerDescription';
import { DrawerFooter } from './DrawerFooter';
import { DrawerFooterControls } from './DrawerFooterControls';
import { DrawerHeader } from './DrawerHeader';
import { DrawerResizeHandle } from './DrawerResizeHandle';
import { DrawerTitle } from './DrawerTitle';
import { DrawerTrigger } from './DrawerTrigger';

const DESCRIPTION = [
  'A side panel for work the reader does alongside the page — its differentiator is that it can run non-modal, so with `modal={false}` they can keep using what is behind it.',
  'Reach for `Dialog` when the panel is a decision to resolve now, since that is the same panel with the exit closed off.',
].join(' ');

const meta = {
  title: 'Overlay/Drawer',
  component: Drawer,
  subcomponents: {
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerDescription,
    DrawerBody,
    DrawerFooter,
    DrawerClose,
    DrawerResizeHandle,
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
  decorators: [],
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
    className={`w-full rounded-12 bg-bg-surface-5 ${fillHeight ? 'flex-1 min-h-0' : ''}`}
    style={height ? { height: `${height}px` } : fillHeight ? undefined : { height: '200px' }}
  />
);

/**
 * Trigger, content, title. The title is what a screen reader announces, so it is never
 * optional.
 */
export const Basic: StoryFn<DrawerProps> = () => {
  return (
    <Drawer data-testid='drawer'>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          Open Drawer
        </Button>
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

/**
 * `DrawerFooter` for the actions that commit the work. It stays put while the body scrolls.
 */
export const WithFooter: StoryFn<DrawerProps> = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          Open Drawer
        </Button>
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
            <Button variant='ghost' color='neutral' size='large'>
              Button
            </Button>
            <Button variant='primary' color='brand' size='large'>
              Button
            </Button>
          </DrawerFooterControls>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * `DrawerDescription` under the title, wired to `aria-describedby` so it is read with the panel
 * rather than after it. `DrawerHeader` stacks the two, keeping the close button right-aligned.
 */
export const WithDescription: StoryFn<DrawerProps> = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          Open Drawer
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer's title</DrawerTitle>
          <DrawerDescription>Description TBD</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <ContentPlaceholder fillHeight />
        </DrawerBody>
        <DrawerFooter>
          <DrawerFooterControls>
            <Button variant='ghost' color='neutral' size='large'>
              Button
            </Button>
            <Button variant='primary' color='brand' size='large'>
              Button
            </Button>
          </DrawerFooterControls>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * A left-aligned secondary action, separated from the committing pair on the right.
 */
export const WithFooterLeftActions: StoryFn<DrawerProps> = () => (
  <Drawer>
    <DrawerTrigger asChild>
      <Button variant='outline' color='neutral'>
        Open with Footer Actions
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Footer with Left Actions</DrawerTitle>
      </DrawerHeader>

      <DrawerBody>
        <ContentPlaceholder fillHeight />
      </DrawerBody>

      <DrawerFooter>
        <DrawerFooterControls placement='left'>
          <Switch>
            <SwitchControl />
            <SwitchLabel>Remember choice</SwitchLabel>
          </Switch>
        </DrawerFooterControls>

        <DrawerClose asChild>
          <Button variant='ghost' color='neutral' size='large'>
            Cancel
          </Button>
        </DrawerClose>
        <Button variant='primary' color='brand' size='large'>
          Apply
        </Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
);

/**
 * The standard widths. A drawer earns more width than a dialog because the reader is working in
 * it rather than answering it.
 */
export const Sizes: StoryFn<DrawerProps> = () => (
  <HStack gap={8} justify='center'>
    <Drawer width={DRAWER_SIZES.small}>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          Open Small ({DRAWER_SIZES.small}px)
        </Button>
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
        <Button variant='outline' color='neutral'>
          Open Medium ({DRAWER_SIZES.medium}px)
        </Button>
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
        <Button variant='outline' color='neutral'>
          Open Large ({DRAWER_SIZES.large}px)
        </Button>
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

/**
 * Explicit width bounds for content the standard steps do not fit.
 */
export const CustomSizes: StoryFn<DrawerProps> = () => {
  return (
    <HStack gap={8} justify='center'>
      <Drawer width='50%'>
        <DrawerTrigger asChild>
          <Button variant='outline' color='neutral'>
            50% Width
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>50% Width Drawer</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <div className='py-12'>
              <p>This drawer takes 50% of the viewport width.</p>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer width={1000}>
        <DrawerTrigger asChild>
          <Button variant='outline' color='neutral'>
            1000px Width
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>1000px Width Drawer</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <div className='py-12'>
              <p>This drawer has a fixed width of 1000px.</p>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </HStack>
  );
};

/**
 * `DrawerResizeHandle` lets the reader set the width themselves — the part `Dialog`
 * deliberately does not export, because a decision does not need resizing.
 */
export const Resizable: StoryFn<DrawerProps> = () => {
  return (
    <VStack gap={12}>
      <Drawer width={800}>
        <DrawerTrigger asChild>
          <Button variant='outline' color='neutral'>
            Open Resizable Drawer (as number)
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerResizeHandle />
          <DrawerHeader>
            <DrawerTitle>Resizable Drawer</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <div className='py-12'>
              <p className='mb-16'>Drag the left edge to resize this drawer.</p>
              <ContentPlaceholder height={300} />
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer width='900px'>
        <DrawerTrigger asChild>
          <Button variant='outline' color='neutral'>
            Open Resizable Drawer (900px)
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerResizeHandle />
          <DrawerHeader>
            <DrawerTitle>Resizable Drawer with "900px" width</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <div className='py-12'>
              <p className='mb-16'>Width is set as "900px" string. Drag the left edge to resize.</p>
              <ContentPlaceholder height={300} />
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer width='50%'>
        <DrawerTrigger asChild>
          <Button variant='outline' color='neutral'>
            Open Resizable Drawer (50%)
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerResizeHandle />
          <DrawerHeader>
            <DrawerTitle>Resizable Drawer with 50% width</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <div className='py-12'>
              <p className='mb-16'>
                Width is set as "50%". Drag the left edge to resize - it will convert to pixels.
              </p>
              <ContentPlaceholder height={300} />
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </VStack>
  );
};

const DRAWER_TAGS = [
  'api-abuse',
  'account-takeover',
  'credential-stuffing',
  'XSS',
  'SQL Injection',
  'CSRF',
  'scanner',
  'brute-force',
  'data-exfiltration',
];

const renderDrawerOverflow = (items: string[]) => (
  <Popover>
    <PopoverTrigger asChild>
      <Tag>+{items.length}</Tag>
    </PopoverTrigger>
    <PopoverContent minWidth='auto' minHeight='auto' maxWidth='240px'>
      <div className='flex flex-col gap-4'>
        {items.map(item => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

/**
 * Resizing with content that reflows, which is the case worth testing: the panel is only useful
 * at its new width if what is inside adapts.
 */
export const ResizableWithOverflowList: StoryFn<DrawerProps> = () => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer width={480} open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          Open Resizable Drawer with OverflowList
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerResizeHandle />
        <DrawerHeader>
          <DrawerTitle>Resizable Drawer with OverflowList</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <p className='mb-16'>Drag the left edge — the tag list reflows live.</p>
          <Attribute>
            <AttributeLabel>Attack types</AttributeLabel>
            <AttributeValue>
              <OverflowList
                className='gap-4'
                items={DRAWER_TAGS}
                itemRenderer={item => <Tag key={item}>{item}</Tag>}
                overflowRenderer={renderDrawerOverflow}
              />
            </AttributeValue>
          </Attribute>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * The body scrolls between a fixed header and footer, so the actions never scroll away from the
 * work.
 */
export const Scrollable: StoryFn<DrawerProps> = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          Open Drawer with Scroll
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Scrollable Content</DrawerTitle>
        </DrawerHeader>

        <DrawerBody>
          <div className='flex flex-col gap-16 py-12'>
            {Array.from({ length: 20 }).map((_, i) => (
              <ContentPlaceholder key={i} height={100} />
            ))}
          </div>
        </DrawerBody>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant='ghost' color='neutral' size='large'>
              Close
            </Button>
          </DrawerClose>
          <Button variant='primary' color='brand' size='large'>
            Confirm
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * Owning `open`, for a panel something outside it opens or closes.
 */
export const Controlled: StoryFn<DrawerProps> = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant='outline' color='neutral' onClick={() => setOpen(true)}>
        Open Controlled Drawer
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Controlled Drawer</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <div className='py-12'>
              <p className='mb-16'>This drawer is controlled externally.</p>
              <ContentPlaceholder />
            </div>
          </DrawerBody>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant='ghost' color='neutral' size='large'>
                Cancel
              </Button>
            </DrawerClose>
            <Button variant='primary' color='brand' size='large'>
              Save Changes
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

/**
 * Escape disabled, for a panel holding unsaved work where a reflex keystroke would lose it.
 */
export const NoClosableOnEsc: StoryFn<DrawerProps> = () => {
  return (
    <Drawer closeOnEscape={false}>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          Open Drawer
        </Button>
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

/**
 * Without the backdrop, which is how a drawer reads as non-blocking. Pair it with
 * `modal={false}` if the page behind should also stay usable.
 */
export const NoOverlay: StoryFn<DrawerProps> = () => {
  return (
    <Drawer overlay={false}>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          Open without Overlay
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>No Overlay</DrawerTitle>
        </DrawerHeader>

        <DrawerBody>
          <div className='py-12'>
            <p>This drawer has no overlay backdrop.</p>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * A drawer from a drawer: same family, so the outer one steps back and the depth is legible.
 */
export const WithNested: StoryFn<DrawerProps> = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          1st level drawer
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>[Level 1] Main Drawer</DrawerTitle>

          {/* Level 2 drawer */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant='ghost' color='neutral' size='small'>
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
                    <Button variant='ghost' color='neutral' size='small'>
                      <PanelRight />
                      3nd level drawer
                    </Button>
                  </DrawerTrigger>

                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>[Level 3] Deep Nested</DrawerTitle>
                    </DrawerHeader>

                    <DrawerBody>
                      <VStack gap={12} align='start'>
                        <Text>Level 3! Unlimited nesting works.</Text>
                        <ContentPlaceholder height={150} />
                      </VStack>
                    </DrawerBody>

                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button size='large' variant='ghost' color='neutral'>
                          Back
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </DrawerHeader>

              <DrawerBody>
                <VStack gap={12} align='start'>
                  <Text>
                    This is Level 2 drawer. Main drawer is pushed back. You can go deeper:
                  </Text>

                  <ContentPlaceholder height={150} />
                </VStack>
              </DrawerBody>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant='ghost' color='neutral' size='large'>
                    Back
                  </Button>
                </DrawerClose>
                <Button variant='primary' color='brand' size='large'>
                  Apply
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </DrawerHeader>

        <DrawerBody>
          <VStack gap={12} align='start'>
            <Text>This is Level 1 drawer. Click below to open nested drawers:</Text>

            <ContentPlaceholder height={300} />
          </VStack>
        </DrawerBody>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant='ghost' color='neutral' size='large'>
              Cancel
            </Button>
          </DrawerClose>
          <Button variant='primary' color='brand' size='large'>
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * A dialog opened from a drawer — different family, so the drawer stays put rather than
 * scaling. That separation is what `kind` exists for.
 */
export const WithNestedDialog: StoryFn<DrawerProps> = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          Open drawer with dialog inside
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer stays in place</DrawerTitle>
        </DrawerHeader>

        <DrawerBody>
          <VStack gap={12} align='start'>
            <Text>Opening the dialog below must not scale or shift this drawer.</Text>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant='outline' color='neutral'>
                  Open dialog
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog over a drawer</DialogTitle>
                </DialogHeader>

                <DialogBody>
                  <ContentPlaceholder height={150} />
                </DialogBody>
              </DialogContent>
            </Dialog>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * A `Select` inside a drawer, checking its menu escapes the panel instead of being clipped.
 */
export const WithNestedSelect: StoryFn<DrawerProps> = () => {
  const collection = createListCollection({
    items: [
      { label: 'React', value: 'react' },
      { label: 'Vue', value: 'vue' },
      { label: 'Angular', value: 'angular' },
    ],
  });

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          Open drawer with nested select
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>[Level 1] Main Drawer</DrawerTitle>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant='ghost' color='neutral' size='small'>
                <PanelRight />
                Open nested drawer
              </Button>
            </DrawerTrigger>

            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>[Level 2] With Select</DrawerTitle>
              </DrawerHeader>

              <DrawerBody>
                <VStack gap={12} align='start'>
                  <Select collection={collection} data-testid='nested-select'>
                    <SelectButton />

                    <SelectPositioner>
                      <SelectContent>
                        {collection.items.map(item => (
                          <SelectOption key={item.value} item={item}>
                            <SelectOptionText>{item.label}</SelectOptionText>
                            <SelectOptionIndicator />
                          </SelectOption>
                        ))}
                      </SelectContent>
                    </SelectPositioner>
                  </Select>

                  <DropdownMenu data-testid='nested-dropdown'>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' color='neutral'>
                        Open menu
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>First action</DropdownMenuItem>
                      <DropdownMenuItem>Second action</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </VStack>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </DrawerHeader>

        <DrawerBody>
          <ContentPlaceholder height={200} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * Tabs inside a drawer, which suits a panel with several facets of one subject.
 */
export const WithTabs: StoryFn<DrawerProps> = () => {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <Drawer width={960}>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          Open Drawer with Tabs
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <Tabs value={activeTab} onChange={setActiveTab} asChild>
          <DrawerHeader>
            <DrawerTitle>Tabbed Content</DrawerTitle>
          </DrawerHeader>

          <TabsList>
            <TabsTrigger value='tab1'>General</TabsTrigger>
            <TabsTrigger value='tab2'>Settings</TabsTrigger>
            <TabsTrigger value='tab3'>Advanced</TabsTrigger>
          </TabsList>

          <DrawerBody>
            <div className='pt-12'>
              <TabsContent value='tab1'>
                <h3 className='text-lg font-medium mb-8'>General Settings</h3>
                <ContentPlaceholder height={300} />
              </TabsContent>
              <TabsContent value='tab2'>
                <h3 className='text-lg font-medium mb-8'>Configuration</h3>
                <ContentPlaceholder height={300} />
              </TabsContent>
              <TabsContent value='tab3'>
                <h3 className='text-lg font-medium mb-8'>Advanced Options</h3>
                <ContentPlaceholder height={300} />
              </TabsContent>
            </div>
          </DrawerBody>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant='ghost' color='neutral' size='large'>
                Cancel
              </Button>
            </DrawerClose>
            <Button variant='primary' color='brand' size='large'>
              Apply Settings
            </Button>
          </DrawerFooter>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
};

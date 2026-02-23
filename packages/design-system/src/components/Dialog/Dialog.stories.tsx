import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { PanelRight } from '../../icons';
import { Button } from '../Button';
import { HStack, VStack } from '../Stack';
import { Switch, SwitchControl, SwitchLabel } from '../Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Tabs';
import { Text } from '../Text';
import { DIALOG_SIZES, DIALOG_WIDTH_CONSTRAINTS } from './constants';
import { Dialog, type DialogProps } from './Dialog';
import { DialogBody } from './DialogBody';
import { DialogClose } from './DialogClose';
import { DialogContent } from './DialogContent';
import { DialogFooter } from './DialogFooter';
import { DialogFooterControls } from './DialogFooterControls';
import { DialogHeader } from './DialogHeader';
import { DialogTitle } from './DialogTitle';
import { DialogTrigger } from './DialogTrigger';

const meta = {
  title: 'Overlay/Dialog',
  component: Dialog,
  subcomponents: {
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogFooterControls,
    DialogClose,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An animated modal dialog that appears from the right side of the screen. Built on top of Drawer without resize functionality.',
      },
    },
  },
  argTypes: {
    open: {
      control: { type: 'boolean' },
      description: 'Whether the dialog is open',
    },
    width: {
      control: { type: 'number' },
      description: `Initial width of the dialog. Presets: small=${DIALOG_SIZES.small}, medium=${DIALOG_SIZES.medium}, large=${DIALOG_SIZES.large}`,
      defaultValue: DIALOG_SIZES.small,
    },
    minWidth: {
      control: { type: 'number' },
      description: 'Minimum width',
      defaultValue: DIALOG_WIDTH_CONSTRAINTS.min,
    },
    maxWidth: {
      control: { type: 'number' },
      description: 'Maximum width',
      defaultValue: DIALOG_WIDTH_CONSTRAINTS.max,
    },
  },
  decorators: [],
} satisfies Meta<typeof Dialog>;

export default meta;

/** Content placeholder styled like Figma designs - fills available space */
const ContentPlaceholder = ({ height }: { fillHeight?: boolean; height?: number }) => (
  <div
    className='w-full rounded-12 bg-[#f1f5f9]'
    style={height ? { height: `${height}px` } : { height: '200px' }}
  />
);

/** Basic uncontrolled dialog */
export const Basic: StoryFn<DialogProps> = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <ContentPlaceholder />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

/** Minimal example */
export const WithFooter: StoryFn<DialogProps> = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog's title</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <ContentPlaceholder />
        </DialogBody>

        <DialogFooter>
          <DialogFooterControls>
            <Button variant='ghost' color='neutral' size='large'>
              Button
            </Button>
            <Button variant='primary' color='brand' size='large'>
              Button
            </Button>
          </DialogFooterControls>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** With footer left actions */
export const WithFooterLeftActions: StoryFn<DialogProps> = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button>Open with Footer Actions</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Footer with Left Actions</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <ContentPlaceholder />
      </DialogBody>

      <DialogFooter>
        <DialogFooterControls placement='left'>
          <Switch>
            <SwitchControl />
            <SwitchLabel>Remember choice</SwitchLabel>
          </Switch>
        </DialogFooterControls>

        <DialogClose asChild>
          <Button variant='ghost' color='neutral' size='large'>
            Cancel
          </Button>
        </DialogClose>
        <Button variant='primary' color='brand' size='large'>
          Apply
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

WithFooterLeftActions.parameters = {
  docs: {
    description: {
      story:
        'Footer can have actions on both left and right sides. Use flexbox utilities to position elements.',
    },
  },
};

/** Dialog with different sizes - Small */
export const Sizes: StoryFn<DialogProps> = () => (
  <HStack spacing={8} justify='center'>
    <Dialog width={DIALOG_SIZES.small}>
      <DialogTrigger asChild>
        <Button>Open Small ({DIALOG_SIZES.small}px)</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Small Dialog ({DIALOG_SIZES.small}px)</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <ContentPlaceholder />
        </DialogBody>
      </DialogContent>
    </Dialog>

    <Dialog width={DIALOG_SIZES.medium}>
      <DialogTrigger asChild>
        <Button>Open Medium ({DIALOG_SIZES.medium}px)</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Medium Dialog ({DIALOG_SIZES.medium}px)</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <ContentPlaceholder />
        </DialogBody>
      </DialogContent>
    </Dialog>

    <Dialog width={DIALOG_SIZES.large}>
      <DialogTrigger asChild>
        <Button>Open Large ({DIALOG_SIZES.large}px)</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Large Dialog ({DIALOG_SIZES.large}px)</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <ContentPlaceholder />
        </DialogBody>
      </DialogContent>
    </Dialog>
  </HStack>
);

/** Custom width with percentage */
export const CustomSizes: StoryFn<DialogProps> = () => {
  return (
    <HStack spacing={8} justify='center'>
      <Dialog width='50%'>
        <DialogTrigger asChild>
          <Button>50% Width</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>50% Width Dialog</DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className='py-12'>
              <p>This dialog takes 50% of the viewport width.</p>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog width={1000}>
        <DialogTrigger asChild>
          <Button>1000px Width</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>1000px Width Dialog</DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className='py-12'>
              <p>This dialog has a fixed width of 1000px.</p>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </HStack>
  );
};

/** Dialog with scrollable content */
export const Scrollable: StoryFn<DialogProps> = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog with Scroll</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scrollable Content</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className='flex flex-col gap-16 py-12'>
            {Array.from({ length: 20 }).map((_, i) => (
              <ContentPlaceholder key={i} height={100} />
            ))}
          </div>
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost' color='neutral' size='large'>
              Close
            </Button>
          </DialogClose>
          <Button variant='primary' color='brand' size='large'>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Controlled dialog with external state */
export const Controlled: StoryFn<DialogProps> = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Controlled Dialog</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className='py-12'>
              <p className='mb-16'>This dialog is controlled externally.</p>
              <ContentPlaceholder />
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost' color='neutral' size='large'>
                Cancel
              </Button>
            </DialogClose>
            <Button variant='primary' color='brand' size='large'>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/** No closable on ESC */
export const NoClosableOnEsc: StoryFn<DialogProps> = () => {
  return (
    <Dialog closeOnEscape={false}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <ContentPlaceholder />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

/** Without overlay */
export const NoOverlay: StoryFn<DialogProps> = () => {
  return (
    <VStack spacing={12}>
      <Text>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
        galley of type and scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
        It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
        passages, and more recently with desktop publishing software like Aldus PageMaker including
        versions of Lorem Ipsum. Why do we use it? It is a long established fact that a reader will
        be distracted by the readable content of a page when looking at its layout. The point of
        using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed
        to using 'Content here, content here', making it look like readable English. Many desktop
        publishing packages and web page editors now use Lorem Ipsum as their default model text,
        and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various
        versions have evolved over the years, sometimes by accident, sometimes on purpose (injected
        humour and the like).
      </Text>

      <Dialog overlay={false}>
        <DialogTrigger asChild>
          <Button>Open without Overlay</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Overlay</DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className='py-12'>
              <p>This dialog has no overlay backdrop.</p>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Text>
        Where does it come from? Contrary to popular belief, Lorem Ipsum is not simply random text.
        It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years
        old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up
        one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going
        through the cites of the word in classical literature, discovered the undoubtable source.
        Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The
        Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the
        theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem
        ipsum dolor sit amet..", comes from a line in section 1.10.32. The standard chunk of Lorem
        Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and
        1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact
        original form, accompanied by English versions from the 1914 translation by H. Rackham.
      </Text>
    </VStack>
  );
};

/** Nested dialogs with push-back effect */
export const WithNested: StoryFn<DialogProps> = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>1st level dialog</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>[Level 1] Main Dialog</DialogTitle>

          {/* Level 2 dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='ghost' color='neutral' size='small'>
                <PanelRight />
                2nd level dialog
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>[Level 2] Detail View</DialogTitle>
                {/* Level 3 dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='ghost' color='neutral' size='small'>
                      <PanelRight />
                      3nd level dialog
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>[Level 3] Deep Nested</DialogTitle>
                    </DialogHeader>

                    <DialogBody>
                      <VStack spacing={12} align='start'>
                        <Text>Level 3! Unlimited nesting works.</Text>
                        <ContentPlaceholder height={150} />
                      </VStack>
                    </DialogBody>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button size='large' variant='ghost' color='neutral'>
                          Back
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DialogHeader>

              <DialogBody>
                <VStack spacing={12} align='start'>
                  <Text>This is Level 2 dialog. Main dialog is pushed back.</Text>

                  <ContentPlaceholder height={150} />
                </VStack>
              </DialogBody>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='ghost' color='neutral' size='large'>
                    Back
                  </Button>
                </DialogClose>
                <Button variant='primary' color='brand' size='large'>
                  Apply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DialogHeader>

        <DialogBody>
          <VStack spacing={12} align='start'>
            <Text>This is Level 1 dialog. Click above to open nested dialogs:</Text>

            <ContentPlaceholder height={150} />
          </VStack>
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost' color='neutral' size='large'>
              Cancel
            </Button>
          </DialogClose>
          <Button variant='primary' color='brand' size='large'>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** With tabs */
export const WithTabs: StoryFn<DialogProps> = () => {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <Dialog width={960}>
      <DialogTrigger asChild>
        <Button>Open Dialog with Tabs</Button>
      </DialogTrigger>

      <DialogContent>
        <Tabs value={activeTab} onChange={setActiveTab} asChild>
          <DialogHeader>
            <DialogTitle>Tabbed Content</DialogTitle>
          </DialogHeader>

          <TabsList>
            <TabsTrigger value='tab1'>General</TabsTrigger>
            <TabsTrigger value='tab2'>Settings</TabsTrigger>
            <TabsTrigger value='tab3'>Advanced</TabsTrigger>
          </TabsList>

          <DialogBody>
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
          </DialogBody>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost' color='neutral' size='large'>
              Cancel
            </Button>
          </DialogClose>
          <Button variant='primary' color='brand' size='large'>
            Apply Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { useRef } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  Activity,
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonAlert,
  TriangleAlert,
} from '../../icons';
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
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../Drawer';
import { HStack, VStack } from '../Stack';
import { ToastActions, Toaster, useToast } from './index';

const DESCRIPTION = [
  'A transient notification fired from `useToast()` — you never place one in the tree, and a single `Toaster` at the app root owns placement, stacking and the timer.',
  'Because it disappears, nothing may live only here: reach for a `Dialog` when the reader has to decide, `Banner` for standing account state, and `Alert` for a message that belongs to a region. Actions on a toast stay optional for the same reason.',
].join(' ');

const meta = {
  title: 'Messaging/Toast',
  component: Toaster,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;

const STATIC_DURATION = Number.MAX_SAFE_INTEGER;

// Helper component to demonstrate toast usage
const ToastDemo = () => {
  const toast = useToast();

  const types = [
    {
      label: 'Success',
      icon: <CircleCheck />,
      type: 'success' as const,
      title: 'Success!',
      description: 'Your changes have been saved successfully.',
    },
    {
      label: 'Error',
      icon: <OctagonAlert />,
      type: 'error' as const,
      title: 'Error occurred',
      description: 'Something went wrong. Please try again.',
    },
    {
      label: 'Warning',
      icon: <TriangleAlert />,
      type: 'warning' as const,
      title: 'Warning',
      description: 'This action cannot be undone.',
    },
    {
      label: 'Info',
      icon: <Info />,
      type: 'info' as const,
      title: 'New update available',
      description: 'Version 2.1.0 is now available for download.',
    },
    {
      label: 'Loading',
      icon: <LoaderCircle />,
      type: 'loading' as const,
      title: 'Loading...',
      description: 'Please wait while we process your request.',
    },
    {
      label: 'Default',
      icon: null,
      type: 'default' as const,
      title: 'Default toast',
      description: 'This is a default toast without an icon.',
    },
  ];

  return (
    <VStack gap={16} align='start'>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>timed</p>
        <HStack gap={8} wrap>
          {types.map(({ label, icon, type, title, description }) => (
            <Button
              key={label}
              variant='outline'
              color='neutral'
              onClick={() => toast.create({ title, variant: 'extended', description, type })}
            >
              {icon}
              {label}
            </Button>
          ))}
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>static — no timer</p>
        <HStack gap={8} wrap>
          {types.map(({ label, icon, type, title, description }) => (
            <Button
              key={label}
              variant='secondary'
              color='neutral'
              onClick={() =>
                toast.create({
                  title,
                  variant: 'extended',
                  description,
                  type,
                  duration: STATIC_DURATION,
                })
              }
            >
              {icon}
              {label}
            </Button>
          ))}
        </HStack>
      </VStack>
    </VStack>
  );
};

/** Every `type` from one place: the icon and colour come from it, and `default` has none. The second row fires the same toasts with the timer stopped, which is what the screenshot tests use. */
export const Basic: StoryFn = () => {
  return <ToastDemo />;
};

/** A toast fired from inside a `Drawer`, and again from a `Dialog` on top of it, to prove it renders above every open overlay rather than behind them. */
export const WithNestedOverlays: StoryFn = () => {
  const toast = useToast();

  const fireToast = () =>
    toast.create({
      title: 'Saved',
      description: 'This toast must render above every open overlay.',
      type: 'success',
      duration: STATIC_DURATION,
    });

  return (
    <Drawer data-testid='overlay-drawer'>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          Open drawer
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>[Level 1] Drawer</DrawerTitle>
        </DrawerHeader>

        <DrawerBody>
          <VStack gap={12} align='start'>
            <Button variant='outline' color='neutral' onClick={fireToast}>
              Show toast from drawer
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant='ghost' color='neutral'>
                  Open nested dialog
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>[Level 2] Dialog</DialogTitle>
                </DialogHeader>

                <DialogBody>
                  <Button variant='outline' color='neutral' onClick={fireToast}>
                    Show toast from nested dialog
                  </Button>
                </DialogBody>
              </DialogContent>
            </Dialog>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

/** A loading toast has no timer and no progress bar, so it will not clear itself: `update()` the same id to resolve it to success or error. */
export const UpdateLoadingToSuccess: StoryFn = () => {
  const toast = useToast();
  const id = useRef<string | undefined>(undefined);

  const createToast = (duration?: number) => {
    id.current = toast.create({
      title: 'Loading',
      description: 'Loading ...',
      type: 'loading',
      variant: 'extended',
      duration,
    });
  };

  const updateToast = (duration?: number) => {
    if (!id.current) {
      return;
    }

    toast.update({
      id: id.current,
      title: 'Success',
      description: 'Success!',
      type: 'success',
      variant: 'extended',
      duration,
    });
  };

  return (
    <VStack gap={16} align='start'>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>timed</p>
        <HStack gap={8} wrap>
          <Button variant='outline' color='neutral' onClick={() => createToast()}>
            Create loading toast
          </Button>
          <Button variant='outline' color='neutral' onClick={() => updateToast()}>
            Update to success
          </Button>
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>static — no timer</p>
        <HStack gap={8} wrap>
          <Button variant='secondary' color='neutral' onClick={() => createToast(STATIC_DURATION)}>
            Create loading toast
          </Button>
          <Button variant='secondary' color='neutral' onClick={() => updateToast(STATIC_DURATION)}>
            Update to success
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
};

/** `simple` is a one-line title for about five seconds. One action is the norm and two is the ceiling — they have to be optional, since the toast leaves on its own. */
export const SimpleWithActions: StoryFn = () => {
  const toast = useToast();

  const single = (duration?: number) =>
    toast.create({
      title: 'Message sent',
      type: 'success',
      variant: 'simple',
      duration,
      actions: (
        <ToastActions>
          <Button variant='secondary' size='small' color='neutral-alt' onClick={() => {}}>
            Undo
          </Button>
        </ToastActions>
      ),
    });

  const double = (duration?: number) =>
    toast.create({
      title: 'Connection restored',
      type: 'info',
      variant: 'simple',
      duration,
      actions: (
        <ToastActions>
          <Button variant='secondary' size='small' color='neutral-alt' onClick={() => {}}>
            View
          </Button>
          <Button variant='secondary' size='small' color='neutral-alt' onClick={() => {}}>
            Dismiss
          </Button>
        </ToastActions>
      ),
    });

  return (
    <VStack gap={16} align='start'>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>timed</p>
        <HStack gap={8} wrap>
          <Button variant='outline' color='neutral' onClick={() => single()}>
            Simple Toast with Action
          </Button>
          <Button variant='outline' color='neutral' onClick={() => double()}>
            Simple Toast with Two Actions
          </Button>
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>static — no timer</p>
        <HStack gap={8} wrap>
          <Button variant='secondary' color='neutral' onClick={() => single(STATIC_DURATION)}>
            Simple Toast with Action
          </Button>
          <Button variant='secondary' color='neutral' onClick={() => double(STATIC_DURATION)}>
            Simple Toast with Two Actions
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
};

/** `extended` adds a description and about ten seconds, for the cases where one sentence of context genuinely helps. */
export const ExtendedWithActions: StoryFn = () => {
  const toast = useToast();

  const single = (duration?: number) =>
    toast.create({
      title: 'Extended Toast',
      description: 'This is an extended toast with default layout.',
      type: 'success',
      variant: 'extended',
      duration,
      actions: (
        <ToastActions>
          <Button variant='secondary' size='small' color='neutral-alt' onClick={() => {}}>
            Action
          </Button>
        </ToastActions>
      ),
    });

  const double = (duration?: number) =>
    toast.create({
      title: 'File processed',
      description: 'Your file has been processed successfully.',
      type: 'info',
      variant: 'extended',
      duration,
      actions: (
        <ToastActions>
          <Button variant='secondary' size='small' color='neutral-alt' onClick={() => {}}>
            View
          </Button>
          <Button variant='secondary' size='small' color='neutral-alt' onClick={() => {}}>
            Download
          </Button>
        </ToastActions>
      ),
    });

  return (
    <VStack gap={16} align='start'>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>timed</p>
        <HStack gap={8} wrap>
          <Button variant='outline' color='neutral' onClick={() => single()}>
            Extended Toast with Action
          </Button>
          <Button variant='outline' color='neutral' onClick={() => double()}>
            Extended Toast with Two Actions
          </Button>
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>static — no timer</p>
        <HStack gap={8} wrap>
          <Button variant='secondary' color='neutral' onClick={() => single(STATIC_DURATION)}>
            Extended Toast with Action
          </Button>
          <Button variant='secondary' color='neutral' onClick={() => double(STATIC_DURATION)}>
            Extended Toast with Two Actions
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
};

/** The title clamps to one line simple, two extended, and the description to four, with the full text in a tooltip. Pre-truncating your own copy fights it. */
export const LongText: StoryFn = () => {
  const toast = useToast();

  const longTitle =
    'This is a very very very long title that will be truncated after a certain number of lines';
  const veryLongTitle = longTitle.repeat(4);
  const longDescription =
    'This is a very long description that will be truncated after a certain number of lines. ' +
    'Hover over the description to see the full text in a tooltip. ' +
    'This allows for better space management while still providing access to all the information.'.repeat(
      2,
    );

  const simpleLong = (duration?: number) =>
    toast.create({ title: longTitle, variant: 'simple', type: 'info', duration });

  const extendedLong = (duration?: number) =>
    toast.create({
      title: veryLongTitle,
      variant: 'extended',
      description: longDescription,
      type: 'info',
      duration,
    });

  return (
    <VStack gap={16} align='start'>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>timed</p>
        <HStack gap={8} wrap>
          <Button variant='outline' color='neutral' onClick={() => simpleLong()}>
            Simple with long title
          </Button>
          <Button variant='outline' color='neutral' onClick={() => extendedLong()}>
            Extended with long text
          </Button>
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>static — no timer</p>
        <HStack gap={8} wrap>
          <Button variant='secondary' color='neutral' onClick={() => simpleLong(STATIC_DURATION)}>
            Simple with long title
          </Button>
          <Button variant='secondary' color='neutral' onClick={() => extendedLong(STATIC_DURATION)}>
            Extended with long text
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
};

/** `closable: false` takes the X away, which is only right for an in-flight loading toast the reader must not lose. */
export const WithoutCloseButton: StoryFn = () => {
  const toast = useToast();

  const create = (duration?: number) =>
    toast.create({
      title: 'Non-closable toast',
      variant: 'extended',
      description: 'This toast cannot be closed manually.',
      type: 'info',
      closable: false,
      duration,
    });

  return (
    <VStack gap={16} align='start'>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>timed</p>
        <HStack gap={8} wrap>
          <Button variant='outline' color='neutral' onClick={() => create()}>
            Non-closable Toast
          </Button>
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>static — no timer</p>
        <HStack gap={8} wrap>
          <Button variant='secondary' color='neutral' onClick={() => create(STATIC_DURATION)}>
            Non-closable Toast
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
};

/** A custom `icon` replaces the type’s own. It inherits the type colour unless it sets one, so the first here is deliberately purple and the second is not. */
export const CustomIcon: StoryFn = () => {
  const toast = useToast();

  const withColor = (duration?: number) =>
    toast.create({
      title: 'Custom icon toast',
      variant: 'extended',
      description: 'This toast uses a custom icon that overrides the type-based icon.',
      type: 'success',
      icon: <Activity size='lg' className='text-purple-500' />,
      duration,
    });

  const withoutColor = (duration?: number) =>
    toast.create({
      title: 'Custom icon with action',
      variant: 'extended',
      description: 'You can use any icon component as a custom icon.',
      type: 'info',
      icon: <Activity />,
      duration,
    });

  return (
    <VStack gap={16} align='start'>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>timed</p>
        <HStack gap={8} wrap>
          <Button variant='outline' color='neutral' onClick={() => withColor()}>
            Custom Icon with own color
          </Button>
          <Button variant='outline' color='neutral' onClick={() => withoutColor()}>
            Custom Icon without color
          </Button>
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <p className='sb-annotation'>static — no timer</p>
        <HStack gap={8} wrap>
          <Button variant='secondary' color='neutral' onClick={() => withColor(STATIC_DURATION)}>
            Custom Icon with own color
          </Button>
          <Button variant='secondary' color='neutral' onClick={() => withoutColor(STATIC_DURATION)}>
            Custom Icon without color
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
};

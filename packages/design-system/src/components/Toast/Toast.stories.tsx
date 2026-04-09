import { useRef } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Activity } from '../../icons';
import { Button } from '../Button';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { ToastActions, Toaster, useToast } from './index';

const meta = {
  title: 'Messaging/Toast',
  component: Toaster,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toast component for displaying notifications. ' +
          'Built on top of Ark UI Toast with custom styling and features. ' +
          'Supports extended and simple layouts, icons, actions, and customizable descriptions.',
      },
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;

/** Duration used for screenshot-friendly toasts (no progress bar animation) */
const STATIC_DURATION = Number.MAX_SAFE_INTEGER;

// Helper component to demonstrate toast usage
const ToastDemo = () => {
  const toast = useToast();

  const types = [
    {
      label: 'Success',
      type: 'success' as const,
      title: 'Success!',
      description: 'Your changes have been saved successfully.',
    },
    {
      label: 'Error',
      type: 'error' as const,
      title: 'Error occurred',
      description: 'Something went wrong. Please try again.',
    },
    {
      label: 'Warning',
      type: 'warning' as const,
      title: 'Warning',
      description: 'This action cannot be undone.',
    },
    {
      label: 'Info',
      type: 'info' as const,
      title: 'New update available',
      description: 'Version 2.1.0 is now available for download.',
    },
    {
      label: 'Loading',
      type: 'loading' as const,
      title: 'Loading...',
      description: 'Please wait while we process your request.',
    },
    {
      label: 'Default',
      type: 'default' as const,
      title: 'Default toast',
      description: 'This is a default toast without an icon.',
    },
  ];

  return (
    <VStack gap={16} align='start'>
      <VStack gap={4} align='start'>
        <Text size='sm' color='secondary' weight='medium'>
          With timeout animation
        </Text>
        <HStack gap={8} wrap>
          {types.map(({ label, type, title, description }) => (
            <Button
              key={label}
              onClick={() => toast.create({ title, variant: 'extended', description, type })}
            >
              {label} Toast
            </Button>
          ))}
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <Text size='sm' color='secondary' weight='medium'>
          Static (for screenshots)
        </Text>
        <HStack gap={8} wrap>
          {types.map(({ label, type, title, description }) => (
            <Button
              key={label}
              variant='secondary'
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
              {label} Toast
            </Button>
          ))}
        </HStack>
      </VStack>
    </VStack>
  );
};

export const Basic: StoryFn = () => {
  return <ToastDemo />;
};

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
        <Text size='sm' color='secondary' weight='medium'>
          With timeout animation
        </Text>
        <HStack gap={8} wrap>
          <Button onClick={() => createToast()}>Create loading toast</Button>
          <Button onClick={() => updateToast()}>Update to success</Button>
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <Text size='sm' color='secondary' weight='medium'>
          Static (for screenshots)
        </Text>
        <HStack gap={8} wrap>
          <Button variant='secondary' onClick={() => createToast(STATIC_DURATION)}>
            Create loading toast
          </Button>
          <Button variant='secondary' onClick={() => updateToast(STATIC_DURATION)}>
            Update to success
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
};

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
        <Text size='sm' color='secondary' weight='medium'>
          With timeout animation
        </Text>
        <HStack gap={8} wrap>
          <Button onClick={() => single()}>Simple Toast with Action</Button>
          <Button onClick={() => double()}>Simple Toast with Two Actions</Button>
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <Text size='sm' color='secondary' weight='medium'>
          Static (for screenshots)
        </Text>
        <HStack gap={8} wrap>
          <Button variant='secondary' onClick={() => single(STATIC_DURATION)}>
            Simple Toast with Action
          </Button>
          <Button variant='secondary' onClick={() => double(STATIC_DURATION)}>
            Simple Toast with Two Actions
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
};

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
        <Text size='sm' color='secondary' weight='medium'>
          With timeout animation
        </Text>
        <HStack gap={8} wrap>
          <Button onClick={() => single()}>Extended Toast with Action</Button>
          <Button onClick={() => double()}>Extended Toast with Two Actions</Button>
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <Text size='sm' color='secondary' weight='medium'>
          Static (for screenshots)
        </Text>
        <HStack gap={8} wrap>
          <Button variant='secondary' onClick={() => single(STATIC_DURATION)}>
            Extended Toast with Action
          </Button>
          <Button variant='secondary' onClick={() => double(STATIC_DURATION)}>
            Extended Toast with Two Actions
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
};

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
        <Text size='sm' color='secondary' weight='medium'>
          With timeout animation
        </Text>
        <HStack gap={8} wrap>
          <Button onClick={() => simpleLong()}>Simple with long title</Button>
          <Button onClick={() => extendedLong()}>Extended with long text</Button>
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <Text size='sm' color='secondary' weight='medium'>
          Static (for screenshots)
        </Text>
        <HStack gap={8} wrap>
          <Button variant='secondary' onClick={() => simpleLong(STATIC_DURATION)}>
            Simple with long title
          </Button>
          <Button variant='secondary' onClick={() => extendedLong(STATIC_DURATION)}>
            Extended with long text
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
};

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
        <Text size='sm' color='secondary' weight='medium'>
          With timeout animation
        </Text>
        <HStack gap={8} wrap>
          <Button onClick={() => create()}>Non-closable Toast</Button>
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <Text size='sm' color='secondary' weight='medium'>
          Static (for screenshots)
        </Text>
        <HStack gap={8} wrap>
          <Button variant='secondary' onClick={() => create(STATIC_DURATION)}>
            Non-closable Toast
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
};

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
        <Text size='sm' color='secondary' weight='medium'>
          With timeout animation
        </Text>
        <HStack gap={8} wrap>
          <Button onClick={() => withColor()}>Custom Icon with own color</Button>
          <Button onClick={() => withoutColor()}>Custom Icon without color</Button>
        </HStack>
      </VStack>
      <VStack gap={4} align='start'>
        <Text size='sm' color='secondary' weight='medium'>
          Static (for screenshots)
        </Text>
        <HStack gap={8} wrap>
          <Button variant='secondary' onClick={() => withColor(STATIC_DURATION)}>
            Custom Icon with own color
          </Button>
          <Button variant='secondary' onClick={() => withoutColor(STATIC_DURATION)}>
            Custom Icon without color
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
};

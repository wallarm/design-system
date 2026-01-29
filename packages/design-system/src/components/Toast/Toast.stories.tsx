import { useRef } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { Activity } from '../../icons';
import { Button } from '../Button';

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

// Helper component to demonstrate toast usage
const ToastDemo = () => {
  const toast = useToast();

  return (
    <div className="flex flex-col gap-12">
      <div className="flex gap-8 flex-wrap">
        <Button
          onClick={() =>
            toast.create({
              title: 'Success!',
              variant: 'extended',
              description: 'Your changes have been saved successfully.',
              type: 'success',
            })
          }
        >
          Success Toast
        </Button>
        <Button
          onClick={() =>
            toast.create({
              title: 'Error occurred',
              variant: 'extended',
              description: 'Something went wrong. Please try again.',
              type: 'error',
            })
          }
        >
          Error Toast
        </Button>
        <Button
          onClick={() =>
            toast.create({
              title: 'Warning',
              variant: 'extended',
              description: 'This action cannot be undone.',
              type: 'warning',
            })
          }
        >
          Warning Toast
        </Button>
        <Button
          onClick={() =>
            toast.create({
              title: 'New update available',
              variant: 'extended',
              description: 'Version 2.1.0 is now available for download.',
              type: 'info',
            })
          }
        >
          Info Toast
        </Button>
        <Button
          onClick={() =>
            toast.create({
              title: 'Loading...',
              variant: 'extended',
              description: 'Please wait while we process your request.',
              type: 'loading',
            })
          }
        >
          Loading Toast
        </Button>
        <Button
          onClick={() =>
            toast.create({
              title: 'Default toast',
              variant: 'extended',
              description: 'This is a default toast without an icon.',
              type: 'default',
            })
          }
        >
          Default Toast
        </Button>
      </div>
    </div>
  );
};

export const Basic: StoryFn = () => {
  return <ToastDemo />;
};

export const UpdateLoadingToSuccess: StoryFn = () => {
  const toast = useToast();
  const id = useRef<string | undefined>(undefined);

  const createToast = () => {
    id.current = toast.create({
      title: 'Loading',
      description: 'Loading ...',
      type: 'loading',
      variant: 'extended',
    });
  };

  const updateToast = () => {
    if (!id.current) {
      return;
    }

    toast.update({
      id: id.current,
      title: 'Success',
      description: 'Success!',
      type: 'success',
      variant: 'extended',
    });
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex gap-8 flex-wrap">
        <Button onClick={createToast}>Create loading toast</Button>
        <Button onClick={updateToast}>Update to success</Button>
      </div>
    </div>
  );
};

export const SimpleWithActions: StoryFn = () => {
  const toast = useToast();

  return (
    <div className="flex flex-col gap-12">
      <div className="flex gap-8 flex-wrap">
        <Button
          onClick={() =>
            toast.create({
              title: 'Message sent',
              type: 'success',
              variant: 'simple',
              actions: (
                <ToastActions>
                  <Button
                    variant="secondary"
                    size="small"
                    color="neutral-alt"
                    onClick={() => console.log('Undo clicked')}
                  >
                    Undo
                  </Button>
                </ToastActions>
              ),
            })
          }
        >
          Simple Toast with Action
        </Button>
        <Button
          onClick={() =>
            toast.create({
              title: 'Connection restored',
              type: 'info',
              variant: 'simple',
              actions: (
                <ToastActions>
                  <Button
                    variant="secondary"
                    size="small"
                    color="neutral-alt"
                    onClick={() => console.log('View clicked')}
                  >
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    color="neutral-alt"
                    onClick={() => console.log('Dismiss clicked')}
                  >
                    Dismiss
                  </Button>
                </ToastActions>
              ),
            })
          }
        >
          Simple Toast with Two Actions
        </Button>
      </div>
    </div>
  );
};

export const ExtendedWithActions: StoryFn = () => {
  const toast = useToast();

  return (
    <div className="flex flex-col gap-12">
      <div className="flex gap-8 flex-wrap">
        <Button
          onClick={() =>
            toast.create({
              title: 'Extended Toast',
              description: 'This is an extended toast with default layout.',
              type: 'success',
              variant: 'extended',
              actions: (
                <ToastActions>
                  <Button
                    variant="secondary"
                    size="small"
                    color="neutral-alt"
                    onClick={() => console.log('Action clicked')}
                  >
                    Action
                  </Button>
                </ToastActions>
              ),
            })
          }
        >
          Extended Toast with Action
        </Button>
        <Button
          onClick={() =>
            toast.create({
              title: 'File processed',
              description: 'Your file has been processed successfully.',
              type: 'info',
              variant: 'extended',
              actions: (
                <ToastActions>
                  <Button
                    variant="secondary"
                    size="small"
                    color="neutral-alt"
                    onClick={() => console.log('View clicked')}
                  >
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    color="neutral-alt"
                    onClick={() => console.log('Download clicked')}
                  >
                    Download
                  </Button>
                </ToastActions>
              ),
            })
          }
        >
          Extended Toast with Two Actions
        </Button>
      </div>
    </div>
  );
};

export const LongText: StoryFn = () => {
  const toast = useToast();

  return (
    <div className="flex flex-col gap-12">
      <div className="flex gap-8 flex-wrap">
        <Button
          onClick={() =>
            toast.create({
              title:
                'This is a very very very long title that will be truncated after a certain number of lines',
              variant: 'simple',
              type: 'info',
            })
          }
        >
          Simple with long title
        </Button>
        <Button
          onClick={() =>
            toast.create({
              title:
                'This is a very very very long title that will be truncated after a certain number of lines' +
                'This is a very very very long title that will be truncated after a certain number of lines' +
                'This is a very very very long title that will be truncated after a certain number of lines' +
                'This is a very very very long title that will be truncated after a certain number of lines',
              variant: 'extended',
              description:
                'This is a very long description that will be truncated after a certain number of lines. ' +
                'Hover over the description to see the full text in a tooltip. ' +
                'This allows for better space management while still providing access to all the information.' +
                'This allows for better space management while still providing access to all the information.' +
                'This allows for better space management while still providing access to all the information.' +
                'This allows for better space management while still providing access to all the information.',
              type: 'info',
            })
          }
        >
          Extended with long text
        </Button>
      </div>
    </div>
  );
};

export const WithoutCloseButton: StoryFn = () => {
  const toast = useToast();

  return (
    <div className="flex flex-col gap-12">
      <div className="flex gap-8 flex-wrap">
        <Button
          onClick={() =>
            toast.create({
              title: 'Non-closable toast',
              variant: 'extended',
              description: 'This toast cannot be closed manually.',
              type: 'info',
              closable: false,
            })
          }
        >
          Non-closable Toast
        </Button>
      </div>
    </div>
  );
};

export const CustomIcon: StoryFn = () => {
  const toast = useToast();

  return (
    <div className="flex flex-col gap-12">
      <div className="flex gap-8 flex-wrap">
        <Button
          onClick={() =>
            toast.create({
              title: 'Custom icon toast',
              variant: 'extended',
              description:
                'This toast uses a custom icon that overrides the type-based icon.',
              type: 'success',
              icon: <Activity size="lg" className="text-purple-500" />,
            })
          }
        >
          Custom Icon with own color
        </Button>
        <Button
          onClick={() =>
            toast.create({
              title: 'Custom icon with action',
              variant: 'extended',
              description: 'You can use any icon component as a custom icon.',
              type: 'info',
              icon: <Activity />,
            })
          }
        >
          Custom Icon without color
        </Button>
      </div>
    </div>
  );
};

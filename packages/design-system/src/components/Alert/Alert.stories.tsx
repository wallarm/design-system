import { useState } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { Button } from '../Button';
import { Code } from '../Code';

import { Alert, type AlertProps } from './Alert';
import { AlertClose } from './AlertClose';
import { AlertContent } from './AlertContent';
import { AlertControls } from './AlertControls';
import { AlertDescription } from './AlertDescription';
import { AlertIcon } from './AlertIcon';
import { AlertTitle } from './AlertTitle';

const meta = {
  title: 'Messaging/Alert',
  component: Alert,
  subcomponents: {
    AlertClose,
    AlertContent,
    AlertControls,
    AlertDescription,
    AlertIcon,
    AlertTitle,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Alert component for displaying important messages. ' +
          'Supports 5 color variants: primary (neutral), destructive, info, warning, and success. ' +
          'Use compound components: AlertIcon, AlertContent, AlertClose, AlertControls, AlertActions.',
      },
    },
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['primary', 'destructive', 'info', 'warning', 'success'],
      description: 'Color variant of the alert',
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;

export const AllColors: StoryFn<AlertProps> = () => (
  <div className="flex flex-col gap-16 w-[600px]">
    <Alert color="primary">
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Primary Alert</AlertTitle>
        <AlertDescription>
          This is a neutral alert for general information.
        </AlertDescription>
      </AlertContent>
    </Alert>

    <Alert color="destructive">
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Destructive Alert</AlertTitle>
        <AlertDescription>
          This alert indicates an error or dangerous action.
        </AlertDescription>
      </AlertContent>
    </Alert>

    <Alert color="info">
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Info Alert</AlertTitle>
        <AlertDescription>
          This alert provides informational content to the user.
        </AlertDescription>
      </AlertContent>
    </Alert>

    <Alert color="warning">
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Warning Alert</AlertTitle>
        <AlertDescription>
          This alert warns the user about potential issues.
        </AlertDescription>
      </AlertContent>
    </Alert>

    <Alert color="success">
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Success Alert</AlertTitle>
        <AlertDescription>
          This alert confirms a successful action or operation.
        </AlertDescription>
      </AlertContent>
    </Alert>
  </div>
);

export const TitleOnly: StoryFn<AlertProps> = () => {
  return (
    <div className="flex flex-col gap-16 w-[600px]">
      <Alert color="primary">
        <AlertIcon />
        <AlertContent>
          <AlertTitle>Alert with title only</AlertTitle>
        </AlertContent>
      </Alert>

      <Alert color="info">
        <AlertIcon />
        <AlertContent>
          <AlertTitle>Information message without description</AlertTitle>
        </AlertContent>
      </Alert>
    </div>
  );
};

export const WithCloseButton: StoryFn<AlertProps> = () => {
  const [showInfo, setShowInfo] = useState(true);
  const [showWarning, setShowWarning] = useState(true);

  return (
    <div className="flex flex-col gap-16 w-[600px]">
      {showInfo && (
        <Alert color="info">
          <AlertIcon />
          <AlertContent>
            <AlertTitle>Dismissable Alert</AlertTitle>
            <AlertDescription>
              This alert can be closed by clicking the X button.
            </AlertDescription>
          </AlertContent>
          <AlertClose onClick={() => setShowInfo(false)} />
        </Alert>
      )}

      {showWarning && (
        <Alert color="warning">
          <AlertIcon />
          <AlertContent>
            <AlertTitle>Warning with close</AlertTitle>
          </AlertContent>
          <AlertClose onClick={() => setShowWarning(false)} />
        </Alert>
      )}
    </div>
  );
};

export const WithControls: StoryFn<AlertProps> = () => {
  return (
    <div className="flex flex-col gap-16 w-[600px]">
      <Alert color="info">
        <AlertIcon />
        <AlertContent>
          <AlertTitle>Alert with Two Action Buttons</AlertTitle>
          <AlertDescription>
            This alert has two action buttons on the right side without a close
            button.
          </AlertDescription>
        </AlertContent>
        <AlertControls>
          <Button variant="secondary" color="neutral" size="small">
            Learn more
          </Button>
          <Button variant="secondary" color="neutral" size="small">
            Dismiss
          </Button>
        </AlertControls>
      </Alert>

      <Alert color="info">
        <AlertIcon />
        <AlertContent>
          <AlertTitle>Alert with Actions and Close</AlertTitle>
          <AlertDescription>
            This alert has action buttons and a close button.
          </AlertDescription>
        </AlertContent>
        <AlertControls>
          <Button variant="secondary" color="neutral" size="small">
            Learn more
          </Button>
        </AlertControls>
        <AlertClose />
      </Alert>

      <Alert color="destructive">
        <AlertIcon />
        <AlertContent>
          <AlertTitle>Critical Error</AlertTitle>
          <AlertDescription>
            An error occurred that requires your attention.
          </AlertDescription>
        </AlertContent>
        <AlertControls>
          <Button variant="secondary" color="destructive" size="small">
            Fix now
          </Button>
        </AlertControls>
        <AlertClose />
      </Alert>
    </div>
  );
};

export const WithBottomActions: StoryFn<AlertProps> = () => {
  return (
    <div className="flex flex-col gap-16 w-[600px]">
      <Alert color="info">
        <AlertIcon />
        <AlertContent>
          <AlertTitle>Alert with Bottom Actions</AlertTitle>
          <AlertDescription>
            This alert has action buttons at the bottom of the content area.
          </AlertDescription>
          <AlertControls>
            <Button variant="secondary" color="neutral" size="small">
              Primary Action
            </Button>
            <Button variant="secondary" color="neutral" size="small">
              Secondary
            </Button>
          </AlertControls>
        </AlertContent>
        <AlertClose />
      </Alert>

      <Alert color="destructive">
        <AlertIcon />
        <AlertContent>
          <AlertTitle>Destructive Alert with Actions</AlertTitle>
          <AlertDescription>
            This error requires immediate action. Please review and take
            necessary steps.
          </AlertDescription>
          <AlertControls>
            <Button variant="secondary" color="destructive" size="small">
              Delete
            </Button>
            <Button variant="secondary" color="neutral" size="small">
              Cancel
            </Button>
          </AlertControls>
        </AlertContent>
      </Alert>
    </div>
  );
};

export const MinMaxWidth: StoryFn<AlertProps> = () => {
  return (
    <div className="flex flex-col gap-16">
      <div>
        <p className="text-sm text-text-secondary mb-8">
          Default min width (256px) - Short content
        </p>
        <Alert color="info">
          <AlertIcon />
          <AlertContent>
            <AlertTitle>Short</AlertTitle>
          </AlertContent>
        </Alert>
      </div>

      <div>
        <p className="text-sm text-text-secondary mb-8">
          Default max width (980px) - Long content
        </p>
        <Alert color="warning">
          <AlertIcon />
          <AlertContent>
            <AlertTitle>
              This is a very long alert title that demonstrates the maximum
              width behavior of the component
            </AlertTitle>
            <AlertDescription>
              This is an extended description that shows how the alert handles
              longer content. The alert should respect its maximum width of
              980px and the text should wrap appropriately within the available
              space.
            </AlertDescription>
          </AlertContent>
          <AlertClose />
        </Alert>
      </div>

      <div>
        <p className="text-sm text-text-secondary mb-8">
          Custom maxWidth={500}
        </p>
        <Alert color="success" maxWidth={500}>
          <AlertIcon />
          <AlertContent>
            <AlertTitle>
              This is a very long alert title that demonstrates the custom
              maximum width behavior
            </AlertTitle>
            <AlertDescription>
              This alert has a custom maxWidth of 500px set via prop.
            </AlertDescription>
          </AlertContent>
          <AlertClose />
        </Alert>
      </div>
    </div>
  );
};

export const MaxLines: StoryFn<AlertProps> = () => {
  const longTitle =
    'This is a very long title that should be truncated after a certain number of lines. It keeps going and going to demonstrate the line clamp functionality. We need even more text to ensure it exceeds the maximum number of lines allowed.';
  const longDescription =
    'This is a very long description that demonstrates the text truncation feature. The description can be quite lengthy and should be limited to a maximum of 4 lines by default. When the text exceeds this limit, it will be truncated with an ellipsis. This behavior ensures that the alert remains compact and does not take up too much vertical space on the page. Additional text is added here to make sure the truncation is visible.';

  return (
    <div className="flex flex-col gap-16 w-600">
      <div>
        <p className="text-sm text-text-secondary mb-8">
          Default (4 lines max)
        </p>
        <Alert color="info">
          <AlertIcon />
          <AlertContent>
            <AlertTitle lineClamp={4}>{longTitle}</AlertTitle>
            <AlertDescription lineClamp={4}>{longDescription}</AlertDescription>
          </AlertContent>
        </Alert>
      </div>

      <div>
        <p className="text-sm text-text-secondary mb-8">Custom (2 lines max)</p>
        <Alert color="warning">
          <AlertIcon />
          <AlertContent>
            <AlertTitle lineClamp={2}>{longTitle}</AlertTitle>
            <AlertDescription lineClamp={2}>{longDescription}</AlertDescription>
          </AlertContent>
        </Alert>
      </div>

      <div>
        <p className="text-sm text-text-secondary mb-8">No truncation</p>
        <Alert color="success">
          <AlertIcon />
          <AlertContent>
            <AlertTitle>{longTitle}</AlertTitle>
            <AlertDescription>{longDescription}</AlertDescription>
          </AlertContent>
        </Alert>
      </div>
    </div>
  );
};

export const WithCode: StoryFn<AlertProps> = () => (
  <div className="flex flex-col gap-16 w-700">
    <Alert color="destructive">
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Message goes here</AlertTitle>
        <AlertDescription>Description goes here</AlertDescription>
        <div className="pt-8">
          <Code size="s" color="destructive">
            Optional code output
          </Code>
        </div>
      </AlertContent>
    </Alert>

    <Alert color="destructive">
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Syntax Error in Configuration</AlertTitle>
        <AlertDescription>
          An error occurred while parsing the configuration file.
        </AlertDescription>

        <div className="pt-8">
          <Code size="s" color="destructive">
            Error: Unexpected token at line 42, column 15
          </Code>
        </div>
      </AlertContent>
      <AlertClose />
    </Alert>
  </div>
);

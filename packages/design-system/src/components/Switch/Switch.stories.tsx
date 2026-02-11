import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Info } from '../../icons';
import { VStack } from '../Stack';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { Switch } from './Switch';
import { SwitchControl } from './SwitchControl';
import { SwitchDescription } from './SwitchDescription';
import { SwitchLabel } from './SwitchLabel';

const meta = {
  title: 'Inputs/Switch',
  component: Switch,
  subcomponents: { SwitchControl, SwitchLabel, SwitchDescription },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Switch>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => (
  <Switch>
    <SwitchControl />
    <SwitchLabel>Enable notifications </SwitchLabel>
  </Switch>
);

export const Checked: StoryFn<typeof meta> = () => (
  <Switch checked>
    <SwitchControl />
    <SwitchLabel>Enable notifications</SwitchLabel>
  </Switch>
);

export const Disabled: StoryFn<typeof meta> = () => (
  <VStack>
    <Switch disabled>
      <SwitchControl />
      <SwitchLabel>Enable notifications</SwitchLabel>
    </Switch>

    <Switch checked disabled>
      <SwitchControl />
      <SwitchLabel>Enable notifications</SwitchLabel>
    </Switch>
  </VStack>
);

export const WithDescription: StoryFn<typeof meta> = () => (
  <Switch>
    <SwitchControl />
    <SwitchLabel>Enable notifications</SwitchLabel>
    <SwitchDescription>Receive notifications about updates and new features.</SwitchDescription>
  </Switch>
);

export const Multiple: StoryFn<typeof meta> = () => (
  <VStack align='start'>
    <Switch>
      <SwitchControl />
      <SwitchLabel>
        Email notifications{' '}
        <Tooltip>
          <TooltipTrigger>
            <Info />
          </TooltipTrigger>
          <TooltipContent>Additional information</TooltipContent>
        </Tooltip>
      </SwitchLabel>
      <SwitchDescription>Receive email notifications about important updates.</SwitchDescription>
    </Switch>

    <Switch checked>
      <SwitchControl />
      <SwitchLabel>
        Push notifications{' '}
        <Tooltip>
          <TooltipTrigger>
            <Info />
          </TooltipTrigger>
          <TooltipContent>Additional information</TooltipContent>
        </Tooltip>
      </SwitchLabel>
      <SwitchDescription>Get push notifications on your mobile device.</SwitchDescription>
    </Switch>

    <Switch>
      <SwitchControl />
      <SwitchLabel>
        SMS notifications{' '}
        <Tooltip>
          <TooltipTrigger>
            <Info />
          </TooltipTrigger>
          <TooltipContent>Additional information</TooltipContent>
        </Tooltip>
      </SwitchLabel>
      <SwitchDescription>Receive SMS notifications for critical alerts.</SwitchDescription>
    </Switch>
  </VStack>
);

export const AccessibilityMode: StoryFn<typeof meta> = () => (
  <VStack>
    <Switch a11yMode>
      <SwitchControl />
      <SwitchLabel>Enable notifications</SwitchLabel>
    </Switch>

    <Switch a11yMode checked>
      <SwitchControl />
      <SwitchLabel>Enable notifications</SwitchLabel>
    </Switch>
  </VStack>
);

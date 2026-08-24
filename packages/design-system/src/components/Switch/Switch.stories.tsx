import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Info } from '../../icons';
import { VStack } from '../Stack';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { Switch } from './Switch';
import { SwitchControl } from './SwitchControl';
import { SwitchDescription } from './SwitchDescription';
import { SwitchLabel } from './SwitchLabel';

const DESCRIPTION = [
  'Turns one setting on or off, and takes effect the moment it is flipped — reach for `Checkbox` when the answer is submitted with a form, and `ToggleButton` when the control belongs in a toolbar rather than a settings list.',
  'Because there is no Save to undo it, avoid a switch for anything destructive or slow.',
].join(' ');

const meta = {
  title: 'Inputs/Switch',
  component: Switch,
  subcomponents: { SwitchControl, SwitchLabel, SwitchDescription },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;

/**
 * `SwitchControl` plus `SwitchLabel`. Name the thing being switched rather than the action, since
 * the control already carries the verb: "Email notifications", not "Enable notifications".
 */
export const Basic: StoryFn<typeof meta> = args => (
  <Switch {...args} data-testid='switch'>
    <SwitchControl />
    <SwitchLabel>Enable notifications </SwitchLabel>
  </Switch>
);

/**
 * The on state. The track fills with brand and the thumb travels, so on and off differ by
 * both colour and position.
 */
export const Checked: StoryFn<typeof meta> = () => (
  <Switch checked>
    <SwitchControl />
    <SwitchLabel>Enable notifications</SwitchLabel>
  </Switch>
);

/**
 * Dimmed and not clickable, in both states. A disabled switch still shows where the setting
 * stands, which is the point of showing it at all.
 */
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

/**
 * `SwitchDescription` adds a second line and switches the row to a grid, so the text aligns
 * with the label rather than the track.
 */
export const WithDescription: StoryFn<typeof meta> = () => (
  <Switch>
    <SwitchControl />
    <SwitchLabel>Enable notifications</SwitchLabel>
    <SwitchDescription>Receive notifications about updates and new features.</SwitchDescription>
  </Switch>
);

/**
 * Several switches in a column. They are independent settings, not a choice between
 * options — if only one may be on, that is a `Radio` group.
 */
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

/**
 * `a11yMode` draws a tick or a cross inside the track, so the state survives being read
 * without colour. Worth turning on wherever the setting matters more than the aesthetic.
 */
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

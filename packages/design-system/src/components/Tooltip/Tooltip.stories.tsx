import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ChevronRight } from '../../icons';
import { Button } from '../Button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../Dialog';
import { Kbd } from '../Kbd';
import { Text } from '../Text';
import { Tooltip } from './Tooltip';
import { TooltipContent } from './TooltipContent';
import { TooltipTrigger } from './TooltipTrigger';

const DESCRIPTION = [
  'A short label on hover or focus, for naming something the interface cannot afford to spell out — an icon button, a truncated value.',
  'It holds no interactive content and cannot be reached by keyboard beyond its trigger, so anything the reader needs to click belongs in a `Popover`.',
].join(' ');

const meta = {
  title: 'Overlay/Tooltip',
  component: Tooltip,
  subcomponents: { TooltipContent, TooltipTrigger },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

/**
 * Trigger and content. Keep it to a few words: a tooltip that needs reading is a tooltip nobody
 * reads.
 */
export const Basic: StoryFn<typeof meta> = () => (
  <Tooltip data-testid='tooltip'>
    <TooltipTrigger asChild>
      <Button variant='outline' color='neutral'>
        <ChevronRight />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Right</TooltipContent>
  </Tooltip>
);

/**
 * A second line for a consequence rather than a name. This is the ceiling — past it, the
 * content wants a `Popover`.
 */
export const WithDescription: StoryFn<typeof meta> = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant='outline' color='neutral'>
        <ChevronRight />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <Text size='xs' weight='medium'>
        Title
      </Text>
      <Text size='xs'>Description</Text>
    </TooltipContent>
  </Tooltip>
);

/**
 * A tooltip on a trigger that also opens a dialog, checking the tooltip dismisses rather than
 * hanging over the panel.
 */
export const WithNestedDialog: StoryFn<typeof meta> = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant='outline' color='neutral'>
        Open dialog with nested tooltip
      </Button>
    </DialogTrigger>

    <DialogContent>
      <DialogHeader>
        <DialogTitle>[Level 1] Main Dialog</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='ghost' color='neutral' size='small'>
              Open nested dialog
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>[Level 2] With Tooltip</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <Tooltip data-testid='nested-tooltip' interactive>
                <TooltipTrigger asChild>
                  <Button variant='outline' color='neutral'>
                    Hover me
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tooltip above the dialog</TooltipContent>
              </Tooltip>
            </DialogBody>
          </DialogContent>
        </Dialog>
      </DialogBody>
    </DialogContent>
  </Dialog>
);

/**
 * A `Kbd` inside the tooltip, which is the convention for naming a control and its shortcut in
 * one breath.
 */
export const WithKbd: StoryFn<typeof meta> = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant='outline' color='neutral'>
        <ChevronRight />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      Add instance <Kbd>⌘</Kbd>
    </TooltipContent>
  </Tooltip>
);

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

const meta = {
  title: 'Overlay/Tooltip',
  component: Tooltip,
  subcomponents: { TooltipContent, TooltipTrigger },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

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

export const WithNestedDialog: StoryFn<typeof meta> = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button>Open dialog with nested tooltip</Button>
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

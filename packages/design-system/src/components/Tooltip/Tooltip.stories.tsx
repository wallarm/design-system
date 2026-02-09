import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ChevronRight } from '../../icons';
import { Button } from '../Button';
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
  <Tooltip>
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

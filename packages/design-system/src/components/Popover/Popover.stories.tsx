import { useId, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  Alert,
  AlertContent,
  AlertControls,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '../Alert';
import { Button } from '../Button';
import { VStack } from '../Stack';
import { Text } from '../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { Popover } from './Popover';
import { PopoverContent } from './PopoverContent';
import { PopoverTrigger } from './PopoverTrigger';

const DESCRIPTION = [
  'A small panel anchored to what opened it, for content the reader can act on — a form, a set of controls, a detail with a link in it.',
  'Reach for `Tooltip` when the content is only a label, and `Drawer` when it is a task rather than a detail.',
].join(' ');

const meta = {
  title: 'Overlay/Popover',
  component: Popover,
  subcomponents: { PopoverContent, PopoverTrigger },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;

/**
 * Trigger and content. It takes focus, which is the whole difference from a tooltip.
 */
export const Basic: StoryFn<typeof meta> = () => (
  <Popover data-testid='popover'>
    <PopoverTrigger asChild>
      <Button variant='outline' color='neutral'>
        Click me
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      <VStack gap={12}>
        <Text size='sm'>This action will remove all and every bit!</Text>

        <Alert color='warning'>
          <AlertIcon />
          <AlertContent>
            <AlertTitle>Message goes here</AlertTitle>
            <AlertDescription>
              {'Description goes here \nDescription goes here \nDescription goes here'}
            </AlertDescription>
            <AlertControls>
              <Button variant='secondary' color='neutral' size='small'>
                Button
              </Button>
              <Button variant='secondary' color='neutral' size='small'>
                Button
              </Button>
            </AlertControls>
          </AlertContent>
        </Alert>
      </VStack>
    </PopoverContent>
  </Popover>
);

/**
 * A tooltip on the popover's own trigger — the label explains what opens, the popover holds
 * what you do.
 */
export const WithTooltip: StoryFn<typeof meta> = () => {
  const triggerId = useId();
  const [open, setOpen] = useState(false);

  return (
    <Popover
      data-testid='with-tooltip-popover'
      open={open}
      onOpenChange={setOpen}
      ids={{ trigger: triggerId }}
    >
      {/* Sharing `ids.trigger` lets both machines resolve the same DOM node as
          their own anchor, so the tooltip positions correctly with no wrapper. */}
      <Tooltip data-testid='with-tooltip-tooltip' disabled={open} ids={{ trigger: triggerId }}>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button data-testid='popover-tooltip-trigger' variant='outline' color='neutral'>
              Actions
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent>More actions</TooltipContent>
      </Tooltip>
      <PopoverContent>
        <Text size='sm'>Popover content</Text>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Width bounds, for content that varies. Let it size to the content rather than pinning it, or
 * short content sits in an empty box.
 */
export const MinMaxWidth: StoryFn<typeof meta> = () => (
  <VStack gap={32}>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' color='neutral'>
          Min Width
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Text size='xs' weight='medium'>
          Lorem Ipsum
        </Text>
      </PopoverContent>
    </Popover>

    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' color='neutral'>
          Max Width
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Text size='xs' weight='medium'>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industry's standard dummy text ever since the 1500s, when an unknown printer took
          a galley of type and scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting, remaining essentially
          unchanged. It was popularised in the 1960s with the release of Letraset sheets containing
          Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
          PageMaker including versions of Lorem Ipsum. Why do we use it? It is a long established
          fact that a reader will be distracted by the readable content of a page when looking at
          its layout.
        </Text>
      </PopoverContent>
    </Popover>
  </VStack>
);

/**
 * Height bounds with scrolling past the cap. If it scrolls often, the content has outgrown a
 * popover.
 */
export const MinMaxHeight: StoryFn<typeof meta> = () => (
  <VStack gap={32}>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' color='neutral'>
          Min Height
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Text size='xs' weight='medium'>
          Lorem Ipsum
        </Text>
      </PopoverContent>
    </Popover>

    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' color='neutral'>
          Max Height
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <VStack gap={12}>
          <Text size='xs' weight='medium'>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
            has been the industry's standard dummy text ever since the 1500s, when an unknown
            printer took a galley of type and scrambled it to make a type specimen book. It has
            survived not only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s with the release of
            Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
            publishing software like Aldus PageMaker including versions of Lorem Ipsum. Why do we
            use it? It is a long established fact that a reader will be distracted by the readable
            content of a page when looking at its layout. The point of using Lorem Ipsum is that it
            has a more-or-less normal distribution of letters, as opposed to using 'Content here,
            content here', making it look like readable English. Many desktop publishing packages
            and web page editors now use Lorem Ipsum as their default model text, and a search for
            'lorem ipsum' will uncover many web sites still in their infancy. Various versions have
            evolved over the years, sometimes by accident, sometimes on purpose (injected humour and
            the like). Where does it come from? Contrary to popular belief, Lorem Ipsum is not
            simply random text. It has roots in a piece of classical Latin literature from 45 BC,
            making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney
            College in Virginia, looked up one of the more obscure Latin words, consectetur, from a
            Lorem Ipsum passage, and going through the cites of the word in classical literature,
            discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33
            of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in
            45 BC. This book is a treatise on the theory of ethics, very popular during the
            Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a
            line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is
            reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus
            Bonorum et Malorum" by Cicero are also reproduced in their exact original form,
            accompanied by English versions from the 1914 translation by H. Rackham.
          </Text>

          <Text size='xs' weight='medium'>
            Where does it come from? Contrary to popular belief, Lorem Ipsum is not simply random
            text. It has roots in a piece of classical Latin literature from 45 BC, making it over
            2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in
            Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum
            passage, and going through the cites of the word in classical literature, discovered the
            undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus
            Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This
            book is a treatise on the theory of ethics, very popular during the Renaissance. The
            first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section
            1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for
            those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by
            Cicero are also reproduced in their exact original form, accompanied by English versions
            from the 1914 translation by H. Rackham.
          </Text>
        </VStack>
      </PopoverContent>
    </Popover>
  </VStack>
);

import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Heading } from '../Heading';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { Separator } from './Separator';

const DESCRIPTION = [
  'A 1px rule for the places where whitespace alone does not show that one group has ended — reach for `Stack` gaps first, because a drawn line is a statement.',
  'Most families ship their own (`DropdownMenuSeparator`, `SelectSeparator`, `FieldSeparator`, `NavRailSeparator` and the rest) already carrying that context’s defaults; the raw primitive is for generic content.',
  'It is decorative by default, so set `decorative={false}` only when the line marks a boundary a screen-reader user should hear.',
].join(' ');

const meta = {
  title: 'Primitives/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;

/** Both orientations in one frame. `spacing` carries the gap around the rule, so never wrap it in a margin `div`, and the vertical one stretches to its row — which means the row has to have a height. */
export const Basic: StoryFn<typeof meta> = () => (
  <VStack>
    <Heading>Separator examples</Heading>
    <Text>Wallarm Design System component library.</Text>
    <Separator spacing={16} />
    <HStack gap={0}>
      <Text>Blog</Text>
      <Separator decorative orientation='vertical' spacing={16} />
      <Text>Docs</Text>
      <Separator decorative orientation='vertical' spacing={16} />
      <Text>Source</Text>
    </HStack>
  </VStack>
);

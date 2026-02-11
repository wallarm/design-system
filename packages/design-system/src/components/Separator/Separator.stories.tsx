import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Heading } from '../Heading';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { Separator } from './Separator';

const meta = {
  title: 'Primitives/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Separator>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => (
  <VStack>
    <Heading>Separator examples</Heading>
    <Text>Wallarm Design System component library.</Text>
    <Separator spacing={16} />
    <HStack spacing={0}>
      <Text>Blog</Text>
      <Separator decorative orientation='vertical' spacing={16} />
      <Text>Docs</Text>
      <Separator decorative orientation='vertical' spacing={16} />
      <Text>Source</Text>
    </HStack>
  </VStack>
);

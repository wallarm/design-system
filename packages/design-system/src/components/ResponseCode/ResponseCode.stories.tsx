import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { ResponseCode } from './ResponseCode';

const meta = {
  title: 'Data Display/ResponseCode',
  component: ResponseCode,
  parameters: { layout: 'centered' },
  args: {
    code: 200,
    size: 'medium',
  },
  argTypes: {
    code: {
      control: 'number',
    },
    size: {
      control: 'select',
      options: ['medium', 'large'],
    },
  },
} satisfies Meta<typeof ResponseCode>;

export default meta;

export const Playground: StoryFn<typeof meta> = args => <ResponseCode {...args} />;

export const AllCategories: StoryFn<typeof meta> = () => (
  <VStack align='start' gap={8}>
    <ResponseCode code={100} />
    <ResponseCode code={200} />
    <ResponseCode code={300} />
    <ResponseCode code={400} />
    <ResponseCode code={500} />
  </VStack>
);

export const RealWorldCodes: StoryFn<typeof meta> = () => (
  <VStack align='start' gap={8}>
    <HStack gap={8}>
      <ResponseCode code={100} />
      <ResponseCode code={101} />
    </HStack>
    <HStack gap={8}>
      <ResponseCode code={200} />
      <ResponseCode code={201} />
      <ResponseCode code={204} />
    </HStack>
    <HStack gap={8}>
      <ResponseCode code={301} />
      <ResponseCode code={302} />
      <ResponseCode code={304} />
    </HStack>
    <HStack gap={8}>
      <ResponseCode code={400} />
      <ResponseCode code={401} />
      <ResponseCode code={403} />
      <ResponseCode code={404} />
      <ResponseCode code={429} />
    </HStack>
    <HStack gap={8}>
      <ResponseCode code={500} />
      <ResponseCode code={502} />
      <ResponseCode code={503} />
      <ResponseCode code={504} />
    </HStack>
  </VStack>
);

export const Sizes: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <HStack align='center' gap={8}>
      <ResponseCode code={100} size='medium' />
      <ResponseCode code={200} size='medium' />
      <ResponseCode code={301} size='medium' />
      <ResponseCode code={404} size='medium' />
      <ResponseCode code={500} size='medium' />
    </HStack>
    <HStack align='center' gap={8}>
      <ResponseCode code={100} size='large' />
      <ResponseCode code={200} size='large' />
      <ResponseCode code={301} size='large' />
      <ResponseCode code={404} size='large' />
      <ResponseCode code={500} size='large' />
    </HStack>
  </VStack>
);

export const UnknownCodeFallsBackToSlate: StoryFn<typeof meta> = () => (
  <HStack align='center' gap={8}>
    <ResponseCode code={0} />
    <ResponseCode code={42} />
    <ResponseCode code={999} />
    <ResponseCode code='???' />
  </HStack>
);

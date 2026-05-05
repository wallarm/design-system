import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { HTTP_METHODS } from './constants';
import { HttpMethod } from './HttpMethod';

const meta = {
  title: 'Data Display/HttpMethod',
  component: HttpMethod,
  parameters: { layout: 'centered' },
  args: {
    method: 'GET',
    size: 'medium',
  },
  argTypes: {
    method: {
      control: 'select',
      options: [...HTTP_METHODS, 'TRACE'],
    },
    size: {
      control: 'select',
      options: ['medium', 'large'],
    },
  },
} satisfies Meta<typeof HttpMethod>;

export default meta;

export const Playground: StoryFn<typeof meta> = args => <HttpMethod {...args} />;

export const AllMethods: StoryFn<typeof meta> = () => (
  <VStack align='start' gap={8}>
    {HTTP_METHODS.map(method => (
      <HttpMethod key={method} method={method} />
    ))}
    <HttpMethod method='OTHER' />
  </VStack>
);

export const Sizes: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <HStack align='center' gap={8}>
      {HTTP_METHODS.map(method => (
        <HttpMethod key={method} method={method} size='medium' />
      ))}
    </HStack>
    <HStack align='center' gap={8}>
      {HTTP_METHODS.map(method => (
        <HttpMethod key={method} method={method} size='large' />
      ))}
    </HStack>
  </VStack>
);

export const UnknownMethodFallsBackToSlate: StoryFn<typeof meta> = () => (
  <HStack align='center' gap={8}>
    <HttpMethod method='TRACE' />
    <HttpMethod method='CONNECT' />
    <HttpMethod method='LINK' />
  </HStack>
);

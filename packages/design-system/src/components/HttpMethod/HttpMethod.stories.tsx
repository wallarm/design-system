import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { HTTP_METHODS } from './constants';
import { HttpMethod } from './HttpMethod';

const DESCRIPTION = [
  'Renders an HTTP method as a fixed-colour code `Badge` — the colour is part of the vocabulary rather than a choice: safe reads green, destructive rose, the technical verbs slate.',
  'A verb outside the seven known ones prints verbatim in slate, so nothing unexpected is swallowed; reach for `Badge` itself when what you are labelling is not a method.',
].join(' ');

const meta = {
  title: 'Data Display/HttpMethod',
  component: HttpMethod,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
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

/**
 * One badge on the controls, for trying a method or a size the stories below do not cover.
 */
export const Playground: StoryFn<typeof meta> = args => <HttpMethod {...args} />;

/**
 * The seven methods with their locked colours, and an unrecognised verb underneath taking
 * the slate fallback.
 */
export const AllMethods: StoryFn<typeof meta> = () => (
  <VStack align='start' gap={8}>
    {HTTP_METHODS.map(method => (
      <HttpMethod key={method} method={method} />
    ))}
    <HttpMethod method='OTHER' />
  </VStack>
);

/**
 * `medium`, the default, is a 20px badge; `large` adds vertical padding to reach 24px and
 * leaves the code type at 12px, so it is about air in the row, not emphasis.
 */
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

/**
 * `TRACE`, `CONNECT` and `LINK` are real verbs with no colour of their own, so they come
 * out slate rather than being dropped or rewritten.
 */
export const UnknownMethodFallsBackToSlate: StoryFn<typeof meta> = () => (
  <HStack align='center' gap={8}>
    <HttpMethod method='TRACE' />
    <HttpMethod method='CONNECT' />
    <HttpMethod method='LINK' />
  </HStack>
);

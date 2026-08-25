import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { ResponseCode } from './ResponseCode';

const DESCRIPTION = [
  'Renders an HTTP status code as a code `Badge` coloured by its class — green for success, blue for a redirect, amber for a client error, red for a server error, slate for informational.',
  'A mask counts as well as a number, so `2XX` or `40X` from a filter suggestion takes the colour of its leading digit, and anything outside 100–599 falls back to slate rather than guessing. Pairs with `HttpMethod`.',
].join(' ');

const meta = {
  title: 'Data Display/ResponseCode',
  component: ResponseCode,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
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

/**
 * One badge on the controls, for checking which class a particular code lands in.
 */
export const Playground: StoryFn<typeof meta> = args => <ResponseCode {...args} />;

/**
 * The five classes at their round numbers. This is the colour vocabulary, and like
 * `HttpMethod` it is fixed rather than chosen per screen.
 */
export const AllCategories: StoryFn<typeof meta> = () => (
  <VStack align='start' gap={8}>
    <ResponseCode code={100} />
    <ResponseCode code={200} />
    <ResponseCode code={300} />
    <ResponseCode code={400} />
    <ResponseCode code={500} />
  </VStack>
);

/**
 * The codes that actually turn up in logs, a row per class — every code in a row shares its
 * colour, so the eye sorts by severity before it reads the number.
 */
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

/**
 * `medium` is the default; `large` adds vertical padding and leaves the code type where it
 * is, exactly as on `HttpMethod`.
 */
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

/**
 * The wildcard forms, which is what a filter chip shows when the query matches a whole
 * class rather than one code.
 */
export const WildcardGroups: StoryFn<typeof meta> = () => (
  <VStack align='start' gap={8}>
    <ResponseCode code='1XX' />
    <ResponseCode code='2XX' />
    <ResponseCode code='3XX' />
    <ResponseCode code='4XX' />
    <ResponseCode code='5XX' />
  </VStack>
);

/**
 * `0`, `42`, `999` and `???` all fall outside 100–599, so each is printed verbatim in slate
 * — an unrecognised code is shown, never swallowed.
 */
export const UnknownCodeFallsBackToSlate: StoryFn<typeof meta> = () => (
  <HStack align='center' gap={8}>
    <ResponseCode code={0} />
    <ResponseCode code={42} />
    <ResponseCode code={999} />
    <ResponseCode code='???' />
  </HStack>
);

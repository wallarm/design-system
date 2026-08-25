import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { Country } from './Country';
import { CountryFlag } from './CountryFlag';
import { CountryName } from './CountryName';

const DESCRIPTION = [
  'Shows one country from its ISO 3166-1 alpha-2 code — `CountryFlag`, `CountryName`, or both — and only ever a country: a flag names a place, not a language.',
  'Compose the name next to the flag wherever the reader could be in any doubt, and expect an unrecognised code to drop the flag and print the code itself.',
].join(' ');

const meta: Meta<typeof Country> = {
  title: 'Data Display/Country',
  component: Country,
  subcomponents: {
    CountryFlag,
    CountryName,
  },
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  args: {
    code: 'US',
    size: 'medium',
  },
  argTypes: {
    code: {
      control: 'text',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
  },
};

export default meta;

/**
 * Flag then name — the composition to reach for by default. `code` sits on the root and
 * reaches both children through context.
 */
export const Basic: StoryFn<typeof Country> = args => (
  <Country code={args.code} size={args.size}>
    <CountryFlag />
    <CountryName />
  </Country>
);

/**
 * `small` is the default: a 16px flag against `xs` type, where `medium` takes both a
 * step up to 20px and `sm`.
 */
export const Sizes: StoryFn<typeof Country> = () => (
  <HStack align='center' gap={16}>
    <Country code='US' size='small'>
      <CountryFlag />
      <CountryName />
    </Country>
    <Country code='US' size='medium'>
      <CountryFlag />
      <CountryName />
    </Country>
  </HStack>
);

/**
 * The flag on its own, for a cell whose column heading already says these are countries —
 * anywhere else, the reader is guessing.
 */
export const FlagOnly: StoryFn<typeof Country> = () => (
  <HStack gap={8}>
    <Country code='US'>
      <CountryFlag />
    </Country>
    <Country code='GB'>
      <CountryFlag />
    </Country>
    <Country code='DE'>
      <CountryFlag />
    </Country>
    <Country code='FR'>
      <CountryFlag />
    </Country>
    <Country code='JP'>
      <CountryFlag />
    </Country>
  </HStack>
);

/**
 * The name on its own, for a list being read rather than scanned, where a column of flags
 * would only add colour.
 */
export const NameOnly: StoryFn<typeof Country> = () => (
  <VStack gap={4}>
    <Country code='US'>
      <CountryName />
    </Country>
    <Country code='GB'>
      <CountryName />
    </Country>
    <Country code='DE'>
      <CountryName />
    </Country>
  </VStack>
);

/**
 * Ten countries together, which is really a check on consistency: every flag is cropped to
 * the same circle, so wide and tall designs still line up down the column.
 */
export const Examples: StoryFn<typeof Country> = () => (
  <VStack gap={8}>
    <Country code='US'>
      <CountryFlag />
      <CountryName />
    </Country>
    <Country code='GB'>
      <CountryFlag />
      <CountryName />
    </Country>
    <Country code='DE'>
      <CountryFlag />
      <CountryName />
    </Country>
    <Country code='FR'>
      <CountryFlag />
      <CountryName />
    </Country>
    <Country code='JP'>
      <CountryFlag />
      <CountryName />
    </Country>
    <Country code='RU'>
      <CountryFlag />
      <CountryName />
    </Country>
    <Country code='CN'>
      <CountryFlag />
      <CountryName />
    </Country>
    <Country code='BR'>
      <CountryFlag />
      <CountryName />
    </Country>
    <Country code='AU'>
      <CountryFlag />
      <CountryName />
    </Country>
    <Country code='CA'>
      <CountryFlag />
      <CountryName />
    </Country>
  </VStack>
);

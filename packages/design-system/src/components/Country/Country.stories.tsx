import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { Country } from './Country';
import { CountryFlag } from './CountryFlag';
import { CountryName } from './CountryName';

const meta: Meta<typeof Country> = {
  title: 'Data Display/Country',
  component: Country,
  subcomponents: {
    CountryFlag,
    CountryName,
  },
  parameters: {
    layout: 'centered',
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

export const Basic: StoryFn<typeof Country> = args => (
  <Country code={args.code} size={args.size}>
    <CountryFlag />
    <CountryName />
  </Country>
);

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

import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { Country } from './Country';

const meta: Meta<typeof Country> = {
  title: 'Data Display/Country',
  component: Country,
  parameters: {
    layout: 'centered',
  },
  args: {
    code: 'US',
    flag: true,
    name: true,
    size: 'medium',
  },
  argTypes: {
    code: {
      control: 'text',
    },
    flag: {
      control: 'boolean',
    },
    name: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
  },
};

export default meta;

export const Basic: StoryFn<typeof Country> = args => <Country {...args} />;

export const Sizes: StoryFn<typeof Country> = () => (
  <HStack align='center' spacing={16}>
    <Country code='US' size='small' />
    <Country code='US' size='medium' />
  </HStack>
);

export const FlagOnly: StoryFn<typeof Country> = () => (
  <HStack spacing={8}>
    <Country code='US' name={false} />
    <Country code='GB' name={false} />
    <Country code='DE' name={false} />
    <Country code='FR' name={false} />
    <Country code='JP' name={false} />
  </HStack>
);

export const NameOnly: StoryFn<typeof Country> = () => (
  <VStack spacing={4}>
    <Country code='US' flag={false} />
    <Country code='GB' flag={false} />
    <Country code='DE' flag={false} />
  </VStack>
);

export const Examples: StoryFn<typeof Country> = () => (
  <VStack spacing={8}>
    <Country code='US' />
    <Country code='GB' />
    <Country code='DE' />
    <Country code='FR' />
    <Country code='JP' />
    <Country code='RU' />
    <Country code='CN' />
    <Country code='BR' />
    <Country code='AU' />
    <Country code='CA' />
  </VStack>
);

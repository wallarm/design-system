import { useState } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack } from '../Stack';
import { SearchInput } from './SearchInput';

const DESCRIPTION =
  'A search field with a magnifying-glass icon and a clear button that appears once there is a value. ' +
  'Controlled only — pass `value` and `onChange`, and optionally `onClear` to react to the clear button specifically.';

const meta = {
  title: 'Inputs/SearchInput',
  component: SearchInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof SearchInput>;

export default meta;

/**
 * Empty by default — the search icon is always visible, and the placeholder reads "Search".
 */
export const Basic: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');
  return <SearchInput value={value} onChange={setValue} />;
};

/**
 * When the field has a value the clear button appears at the inline end.
 * Clicking it fires `onClear`, then `onChange('')`.
 */
export const WithValue: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('attacks');
  return <SearchInput value={value} onChange={setValue} onClear={fn()} />;
};

/**
 * A custom placeholder when "Search" is not descriptive enough.
 */
export const CustomPlaceholder: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');
  return <SearchInput value={value} onChange={setValue} placeholder='Filter by name…' />;
};

/**
 * Dimmed, with the clear button hidden even when a value is present — there is nothing the
 * reader can act on.
 */
export const Disabled: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('locked query');
  return <SearchInput value={value} onChange={setValue} disabled />;
};

/**
 * The same height scale as `Input`, so a search field lines up with the fields around it.
 */
export const Sizes: StoryFn<typeof meta> = () => {
  const [d, setD] = useState('');
  const [m, setM] = useState('');
  const [s, setS] = useState('');

  return (
    <HStack gap={16} align='start'>
      <SearchInput value={d} onChange={setD} placeholder='Default' size='default' />
      <SearchInput value={m} onChange={setM} placeholder='Medium' size='medium' />
      <SearchInput value={s} onChange={setS} placeholder='Small' size='small' />
    </HStack>
  );
};

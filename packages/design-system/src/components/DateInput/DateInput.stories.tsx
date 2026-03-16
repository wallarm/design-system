import { useState } from 'react';
import { getLocalTimeZone, today } from '@internationalized/date';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Calendar } from '../../icons';
import { Field } from '../Field/Field';
import { FieldAction } from '../Field/FieldAction';
import { FieldDescription } from '../Field/FieldDescription';
import { FieldError } from '../Field/FieldError';
import { FieldLabel } from '../Field/FieldLabel';
import { VStack } from '../Stack';
import { DateInput } from './DateInput';

const meta: Meta<typeof DateInput> = {
  title: 'Inputs Date/DateInput',
  component: DateInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['alpha'],
};

export default meta;

export const Default: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <DateInput />

      <DateInput disabled />

      <DateInput error />
    </VStack>
  );
};

export const WithIcon: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <DateInput icon={Calendar} />

      <DateInput icon={Calendar} disabled />

      <DateInput icon={Calendar} error />
    </VStack>
  );
};

export const WithPlaceholder: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <DateInput icon={Calendar} placeholder='Select a date' />

      <DateInput icon={Calendar} placeholder='Select a date' disabled />

      <DateInput icon={Calendar} placeholder='Select a date' error />
    </VStack>
  );
};

export const WithFieldComponents: StoryFn = () => {
  const [value, setValue] = useState<any>(null);
  const [errorValue, setErrorValue] = useState<any>(today(getLocalTimeZone()));

  const handleSetNow = () => {
    setValue(today(getLocalTimeZone()));
  };

  return (
    <div className='min-w-320'>
      <VStack spacing={24}>
        <Field>
          <FieldLabel>
            Label
            <FieldAction onClick={handleSetNow}>Set now</FieldAction>
          </FieldLabel>
          <DateInput
            icon={Calendar}
            placeholder='Select a date'
            value={value}
            onChange={setValue}
          />
          <FieldDescription>This is an input description.</FieldDescription>
        </Field>

        <Field invalid>
          <FieldLabel>Label</FieldLabel>
          <DateInput icon={Calendar} error value={errorValue} onChange={setErrorValue} />
          <FieldError>An error message.</FieldError>
        </Field>
      </VStack>
    </div>
  );
};

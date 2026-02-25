import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Info } from '../../icons';
import { Field, FieldDescription, FieldLabel } from '../Field';
import { HStack, VStack } from '../Stack';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { Checkbox } from './Checkbox';
import { CheckboxDescription } from './CheckboxDescription';
import { CheckboxGroup } from './CheckboxGroup';
import { CheckboxIndicator } from './CheckboxIndicator';
import { CheckboxLabel } from './CheckboxLabel';

const meta = {
  title: 'Inputs/Checkbox',
  component: Checkbox,
  subcomponents: {
    CheckboxGroup,
    CheckboxIndicator,
    CheckboxLabel,
    CheckboxDescription,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => (
  <Checkbox>
    <CheckboxIndicator />
    <CheckboxLabel>Accept terms and conditions</CheckboxLabel>
  </Checkbox>
);

export const Checked: StoryFn<typeof meta> = () => (
  <Checkbox checked>
    <CheckboxIndicator />
    <CheckboxLabel>Accept terms and conditions</CheckboxLabel>
  </Checkbox>
);

export const Indeterminate: StoryFn<typeof meta> = () => (
  <Checkbox checked='indeterminate'>
    <CheckboxIndicator />
    <CheckboxLabel>Accept terms and conditions</CheckboxLabel>
  </Checkbox>
);

export const Disabled: StoryFn<typeof meta> = () => (
  <VStack>
    <Checkbox disabled>
      <CheckboxIndicator />
      <CheckboxLabel>Accept terms and conditions</CheckboxLabel>
    </Checkbox>

    <Checkbox checked disabled>
      <CheckboxIndicator />
      <CheckboxLabel>Accept terms and conditions</CheckboxLabel>
    </Checkbox>

    <Checkbox checked='indeterminate' disabled>
      <CheckboxIndicator />
      <CheckboxLabel>Accept terms and conditions</CheckboxLabel>
    </Checkbox>
  </VStack>
);

export const WithDescription: StoryFn<typeof meta> = () => (
  <Checkbox>
    <CheckboxIndicator />
    <CheckboxLabel>
      Accept terms and conditions
      <Tooltip>
        <TooltipTrigger>
          <Info />
        </TooltipTrigger>
        <TooltipContent>Additional information</TooltipContent>
      </Tooltip>
    </CheckboxLabel>
    <CheckboxDescription>
      By clicking this checkbox, you agree to the terms and conditions.
    </CheckboxDescription>
  </Checkbox>
);

export const Group: StoryFn<typeof meta> = () => (
  <CheckboxGroup name='framework' defaultValue={['vue']}>
    <Checkbox value='react'>
      <CheckboxIndicator />
      <CheckboxLabel>React</CheckboxLabel>
    </Checkbox>

    <Checkbox value='solid'>
      <CheckboxIndicator />
      <CheckboxLabel>Solid</CheckboxLabel>
    </Checkbox>

    <Checkbox value='vue'>
      <CheckboxIndicator />
      <CheckboxLabel>Vue</CheckboxLabel>
    </Checkbox>

    <Checkbox value='svelte'>
      <CheckboxIndicator />
      <CheckboxLabel>Svelte</CheckboxLabel>
    </Checkbox>
  </CheckboxGroup>
);

export const Card: StoryFn<typeof meta> = () => (
  <CheckboxGroup variant='card' name='framework' defaultValue={['vue', 'angular']}>
    <Checkbox value='react'>
      <CheckboxIndicator />
      <CheckboxLabel>React</CheckboxLabel>
      <CheckboxDescription>
        By clicking this checkbox, you agree to the terms and conditions.
      </CheckboxDescription>
    </Checkbox>

    <Checkbox value='solid'>
      <CheckboxIndicator />
      <CheckboxLabel>
        Solid
        <Tooltip>
          <TooltipTrigger>
            <Info />
          </TooltipTrigger>
          <TooltipContent>Additional information</TooltipContent>
        </Tooltip>
      </CheckboxLabel>
      <CheckboxDescription>
        By clicking this checkbox, you agree to the terms and conditions.
      </CheckboxDescription>
    </Checkbox>

    <Checkbox value='vue'>
      <CheckboxIndicator />
      <CheckboxLabel>Vue</CheckboxLabel>
      <CheckboxDescription>
        By clicking this checkbox, you agree to the terms and conditions.
      </CheckboxDescription>
    </Checkbox>

    <Checkbox value='svelte' disabled>
      <CheckboxIndicator />
      <CheckboxLabel>Svelte</CheckboxLabel>
      <CheckboxDescription>
        By clicking this checkbox, you agree to the terms and conditions.
      </CheckboxDescription>
    </Checkbox>

    <Checkbox value='angular' disabled>
      <CheckboxIndicator />
      <CheckboxLabel>Angular</CheckboxLabel>
      <CheckboxDescription>
        By clicking this checkbox, you agree to the terms and conditions.
      </CheckboxDescription>
    </Checkbox>
  </CheckboxGroup>
);

export const FormField: StoryFn<typeof meta> = () => (
  <HStack align='start' gap={40}>
    <Field>
      <FieldLabel>
        Label{' '}
        <Tooltip>
          <TooltipTrigger>
            <Info />
          </TooltipTrigger>
          <TooltipContent>Additional information</TooltipContent>
        </Tooltip>
      </FieldLabel>

      <FieldDescription>This is an input description.</FieldDescription>

      <CheckboxGroup name='framework' defaultValue={['vue']}>
        <Checkbox value='react'>
          <CheckboxIndicator />
          <CheckboxLabel>React</CheckboxLabel>
        </Checkbox>

        <Checkbox value='solid'>
          <CheckboxIndicator />
          <CheckboxLabel>Solid</CheckboxLabel>
        </Checkbox>

        <Checkbox value='vue'>
          <CheckboxIndicator />
          <CheckboxLabel>Vue</CheckboxLabel>
        </Checkbox>

        <Checkbox value='svelte'>
          <CheckboxIndicator />
          <CheckboxLabel>Svelte</CheckboxLabel>
        </Checkbox>
      </CheckboxGroup>
    </Field>

    <Field>
      <FieldLabel>
        Label
        <Tooltip>
          <TooltipTrigger>
            <Info />
          </TooltipTrigger>
          <TooltipContent>Additional information</TooltipContent>
        </Tooltip>
      </FieldLabel>

      <FieldDescription>This is an input description.</FieldDescription>

      <CheckboxGroup variant='card' name='framework' defaultValue={['vue']}>
        <Checkbox value='react'>
          <CheckboxIndicator />
          <CheckboxLabel>React</CheckboxLabel>
        </Checkbox>

        <Checkbox value='solid'>
          <CheckboxIndicator />
          <CheckboxLabel>Solid</CheckboxLabel>
        </Checkbox>

        <Checkbox value='vue'>
          <CheckboxIndicator />
          <CheckboxLabel>Vue</CheckboxLabel>
        </Checkbox>

        <Checkbox value='svelte'>
          <CheckboxIndicator />
          <CheckboxLabel>Svelte</CheckboxLabel>
        </Checkbox>
      </CheckboxGroup>
    </Field>
  </HStack>
);

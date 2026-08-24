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

const DESCRIPTION = [
  'Collects any number of choices from a limited set, or turns a single option on or off — reach for `Radio` when only one choice is allowed, and `Switch` when the change takes effect immediately instead of on submit.',
  'Past roughly ten options, a `Select` reads better than a long column of boxes.',
].join(' ');

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
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

/**
 * The smallest useful composition — `CheckboxIndicator` plus `CheckboxLabel`. Keep labels to a few
 * words in sentence case, and reword rather than truncate.
 */
export const Basic: StoryFn<typeof meta> = () => (
  <Checkbox data-testid='checkbox'>
    <CheckboxIndicator />
    <CheckboxLabel>Accept terms and conditions</CheckboxLabel>
  </Checkbox>
);

/** The checked state. Pass `checked` to drive it from your own state, or `defaultChecked` to let the checkbox keep track of it. */
export const Checked: StoryFn<typeof meta> = () => (
  <Checkbox checked>
    <CheckboxIndicator />
    <CheckboxLabel>Accept terms and conditions</CheckboxLabel>
  </Checkbox>
);

/**
 * `checked='indeterminate'` is for a parent whose children are only partly selected. Set it
 * deliberately — a click never produces it — and clear it once every child is checked or unchecked.
 */
export const Indeterminate: StoryFn<typeof meta> = () => (
  <Checkbox checked='indeterminate'>
    <CheckboxIndicator />
    <CheckboxLabel>Accept terms and conditions</CheckboxLabel>
  </Checkbox>
);

/** All three states while disabled, so you can see that the indicator stays readable when the option cannot be changed. */
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

/** `CheckboxDescription` adds a second line under the label, and switches the row to a grid so that text lines up with the label rather than the box. */
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

/**
 * `CheckboxGroup` ties several checkboxes to one `name` and one array of values, and owns the spacing
 * between them. Every box stays independent: ticking one must never move another, unless it is a
 * parent selecting all of its children.
 */
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

/**
 * `variant='card'` gives every option its own bordered surface. Cards exist to carry a description —
 * that is what the extra room is for, and a card holding a bare label wastes it. Plain rows read
 * better for short lists of short labels.
 */
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

/** Wrapped in `Field`, so the label and description above the options come from `FieldLabel` and `FieldDescription`. Shown as plain rows and as cards. */
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

import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Info } from '../../icons';
import { Field, FieldDescription, FieldLabel } from '../Field';
import { HStack } from '../Stack';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { Radio } from './Radio';
import { RadioDescription } from './RadioDescription';
import { RadioGroup } from './RadioGroup';
import { RadioIndicator } from './RadioIndicator';
import { RadioLabel } from './RadioLabel';

const DESCRIPTION = [
  'Picks exactly one option from a set — reach for `Checkbox` when several answers can be true at once, and `Select` past roughly ten options.',
  'Radios cannot be cleared once chosen, so include the neutral answer as an option rather than expecting the reader to undo.',
].join(' ');

const meta = {
  title: 'Inputs/Radio',
  component: Radio,
  subcomponents: {
    RadioGroup,
    RadioIndicator,
    RadioLabel,
    RadioDescription,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof Radio>;

export default meta;

/**
 * `RadioGroup` ties the options to one `name` and one value; each `Radio` composes
 * `RadioIndicator` and `RadioLabel`. Give the group a `defaultValue` — an unset group makes the
 * reader answer a question they may not have.
 */
export const Basic: StoryFn<typeof meta> = () => (
  <RadioGroup name='framework' defaultValue='svelte'>
    <Radio value='react' data-testid='radio-react'>
      <RadioIndicator />
      <RadioLabel>React</RadioLabel>
      <RadioDescription>
        By selected this value, you agree to the terms and conditions.
      </RadioDescription>
    </Radio>

    <Radio value='solid'>
      <RadioIndicator />
      <RadioLabel>
        Solid
        <Tooltip>
          <TooltipTrigger>
            <Info />
          </TooltipTrigger>
          <TooltipContent>Additional information</TooltipContent>
        </Tooltip>
      </RadioLabel>
    </Radio>

    <Radio value='vue' disabled>
      <RadioIndicator />
      <RadioLabel>Vue</RadioLabel>
    </Radio>

    <Radio value='svelte'>
      <RadioIndicator />
      <RadioLabel>Svelte</RadioLabel>
    </Radio>
  </RadioGroup>
);

/**
 * `variant='card'` gives every option its own bordered surface. As with `Checkbox`, cards
 * exist to carry a `RadioDescription` — a card holding a bare label wastes the room it asks for.
 */
export const Card: StoryFn<typeof meta> = () => (
  <RadioGroup variant='card' name='framework' defaultValue='vue'>
    <Radio value='react'>
      <RadioIndicator />
      <RadioLabel>React</RadioLabel>
      <RadioDescription>
        By selected this value, you agree to the terms and conditions.
      </RadioDescription>
    </Radio>

    <Radio value='solid'>
      <RadioIndicator />
      <RadioLabel>
        Solid
        <Tooltip>
          <TooltipTrigger>
            <Info />
          </TooltipTrigger>
          <TooltipContent>Additional information</TooltipContent>
        </Tooltip>
      </RadioLabel>
    </Radio>

    <Radio value='vue' disabled>
      <RadioIndicator />
      <RadioLabel>Vue</RadioLabel>
      <RadioDescription>
        By selected this value, you agree to the terms and conditions.
      </RadioDescription>
    </Radio>

    <Radio value='svelte'>
      <RadioIndicator />
      <RadioLabel>Svelte</RadioLabel>
    </Radio>
  </RadioGroup>
);

/**
 * Wrapped in `Field`, so the question above the options comes from `FieldLabel` and
 * `FieldDescription`. Shown as plain rows and as cards.
 */
export const FormField: StoryFn<typeof meta> = () => (
  <HStack align='start' gap={40}>
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

      <RadioGroup name='framework' defaultValue='svelte'>
        <Radio value='react'>
          <RadioIndicator />
          <RadioLabel>React</RadioLabel>
          <RadioDescription>
            By selected this value, you agree to the terms and conditions.
          </RadioDescription>
        </Radio>

        <Radio value='solid'>
          <RadioIndicator />
          <RadioLabel>Solid</RadioLabel>
        </Radio>

        <Radio value='vue' disabled>
          <RadioIndicator />
          <RadioLabel>Vue</RadioLabel>
        </Radio>

        <Radio value='svelte'>
          <RadioIndicator />
          <RadioLabel>Svelte</RadioLabel>
        </Radio>
      </RadioGroup>
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

      <RadioGroup variant='card' name='framework' defaultValue='svelte'>
        <Radio value='react'>
          <RadioIndicator />
          <RadioLabel>React</RadioLabel>
          <RadioDescription>
            By selected this value, you agree to the terms and conditions.
          </RadioDescription>
        </Radio>

        <Radio value='solid'>
          <RadioIndicator />
          <RadioLabel>Solid</RadioLabel>
        </Radio>

        <Radio value='vue' disabled>
          <RadioIndicator />
          <RadioLabel>Vue</RadioLabel>
        </Radio>

        <Radio value='svelte'>
          <RadioIndicator />
          <RadioLabel>Svelte</RadioLabel>
        </Radio>
      </RadioGroup>
    </Field>
  </HStack>
);

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
  },
} satisfies Meta<typeof Radio>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => (
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

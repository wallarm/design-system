import type { FC, Ref } from 'react';
import { NumberInput as ArkUiNumberInput } from '@ark-ui/react/number-input';
import type { VariantProps } from 'class-variance-authority';
import { ChevronDown, ChevronUp } from '../../icons';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import {
  numberInputControlVariants,
  numberInputFieldVariants,
  numberInputRootVariants,
  numberInputTriggerVariants,
} from './classes';

// Ark UI's Root is a <div> (not a native <input>), so it carries no native
// `size` HTML attribute to collide with — unlike Input, which needed an
// explicit Omit (see Input.tsx) to avoid exactly that collision.
type NumberInputNativeProps = Omit<ArkUiNumberInput.RootProps, 'className' | 'invalid'>;

type NumberInputVariantsProps = VariantProps<typeof numberInputRootVariants>;

interface NumberInputBaseProps {
  error?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export type NumberInputProps = NumberInputNativeProps &
  NumberInputVariantsProps &
  NumberInputBaseProps &
  TestableProps;

export const NumberInput: FC<NumberInputProps> = ({
  error = false,
  size = 'default',
  defaultValue = '0',
  ...props
}) => (
  <ArkUiNumberInput.Root
    {...props}
    invalid={error}
    defaultValue={defaultValue}
    className={numberInputRootVariants({ size })}
  >
    <ArkUiNumberInput.Input className={numberInputFieldVariants({ size })} />
    <ArkUiNumberInput.Control
      className={cn(numberInputControlVariants({ size }), '[&_svg]:text-icon-secondary')}
    >
      <ArkUiNumberInput.IncrementTrigger className={numberInputTriggerVariants({ size })}>
        <ChevronUp />
      </ArkUiNumberInput.IncrementTrigger>
      <ArkUiNumberInput.DecrementTrigger className={numberInputTriggerVariants({ size })}>
        <ChevronDown />
      </ArkUiNumberInput.DecrementTrigger>
    </ArkUiNumberInput.Control>
  </ArkUiNumberInput.Root>
);

NumberInput.displayName = 'NumberInput';

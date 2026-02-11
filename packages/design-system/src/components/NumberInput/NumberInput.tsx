import type { FC, Ref } from 'react';
import { NumberInput as ArkUiNumberInput } from '@ark-ui/react/number-input';
import { ChevronDown, ChevronUp } from '../../icons';
import { cn } from '../../utils/cn';

type NumberInputNativeProps = Omit<ArkUiNumberInput.RootProps, 'className' | 'invalid'>;

interface NumberInputBaseProps {
  error?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export type NumberInputProps = NumberInputNativeProps & NumberInputBaseProps;

const numberInputTriggerClassNames = cn(
  // Base
  'w-16 h-14 px-2 py-1 rounded-2 transition-colors cursor-pointer',
  // State ---- hover
  'hover:bg-states-primary-hover',
  // State ---- disabled
  '[&[data-disabled]]:cursor-not-allowed [&[data-disabled]]:pointer-events-none',
);

export const NumberInput: FC<NumberInputProps> = ({
  error = false,
  defaultValue = '0',
  ...props
}) => (
  <ArkUiNumberInput.Root
    {...props}
    invalid={error}
    defaultValue={defaultValue}
    className={cn(
      // Dimensions
      'w-full h-36 has-[>textarea]:h-auto',

      // Layout
      'flex items-stretch border rounded-8 bg-component-input-bg relative',

      // Static state
      'border border-border-primary outline-none shadow-xs transition-[color,border,box-shadow]',
      '[&:not([data-disabled]):not([data-focus])]:hover:border-component-border-input-hover ',

      // Focus state.
      '[&[data-focus]:not([data-disabled])]:ring-3',
      '[&[data-focus]:not([data-disabled]):not([data-invalid])]:ring-focus-primary',
      '[&[data-focus]:not([data-disabled]):not([data-invalid])]:border-border-strong-primary',

      // Error state.
      'data-invalid:border-border-strong-danger data-invalid:ring-focus-destructive',
      '[&[data-invalid]:not([data-disabled])]:hover:border-border-strong-danger',
      '[&[data-invalid]:not([data-disabled]):not([data-focus])]:hover:ring-3',
      '[&[data-invalid]:not([data-disabled]):not([data-focus])]:hover:ring-focus-destructive-hover',
      '[&[data-invalid]:not([data-disabled])]:[&>input]:hover:ring-0',

      // Disabled state.
      'data-disabled:opacity-50',
      'data-disabled:cursor-not-allowed',
      'data-disabled:*:cursor-not-allowed',
    )}
  >
    <ArkUiNumberInput.Input
      className={cn(
        // Layout
        'flex-1 h-full px-12 py-8',
        // Visual
        'rounded-none border-0 bg-transparent shadow-none outline-none',
        // Text
        'font-sans font-normal text-sm text-text-primary placeholder:text-text-secondary',
      )}
    />
    <ArkUiNumberInput.Control
      className={cn(
        // Layout
        'flex flex-col justify-center px-4 py-2',
        // Visual
        'bg-states-primary-default-alt border-l border-border-primary',
        // Icons
        '[&_svg]:icon-sm [&_svg]:text-icon-secondary [&_svg]:pointer-events-none',
      )}
    >
      <ArkUiNumberInput.IncrementTrigger className={numberInputTriggerClassNames}>
        <ChevronUp />
      </ArkUiNumberInput.IncrementTrigger>
      <ArkUiNumberInput.DecrementTrigger className={numberInputTriggerClassNames}>
        <ChevronDown />
      </ArkUiNumberInput.DecrementTrigger>
    </ArkUiNumberInput.Control>
  </ArkUiNumberInput.Root>
);

NumberInput.displayName = 'NumberInput';

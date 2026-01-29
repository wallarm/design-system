import type { FC } from 'react';

import { Select as ArkUiSelect, useSelectContext } from '@ark-ui/react/select';
import { cva } from 'class-variance-authority';

import { cn } from '../../../utils/cn';
import { OverflowList } from '../../OverflowList';
import { SelectArrow } from '../SelectArrow';
import { SelectValueText, type SelectValueTextProps } from '../SelectValueText';

import { SelectInputClear } from './SelectInputClear';
import { SelectInputItemRenderer } from './SelectInputItemRenderer';
import { SelectInputOverflowRenderer } from './SelectInputOverflowRenderer';

const selectInputVariants = cva(
  [
    // Layout & container
    'flex items-center gap-4 w-fit h-36 pr-12 rounded-8 border bg-component-input-bg shadow-xs transition-[colors,border,box-shadow]',

    // Typography
    'font-sans text-sm text-text-primary placeholder:text-text-secondary',

    // Focus styles for the root element
    'focus-visible:outline-none focus-visible:ring-3',

    // Disabled state — visuals
    'data-disabled:cursor-not-allowed',
    'data-disabled:opacity-50',

    // Disabled state — block all pointer interactions for children
    'data-disabled:[&_*]:pointer-events-none',

    // Disabled state — suppress any visible focus styles on children
    // (Note: CSS cannot fully prevent focus via keyboard, this is visual only)
    'data-disabled:[&_*]:focus:outline-none',
    'data-disabled:[&_*]:focus-visible:outline-none',
    'data-disabled:[&_*]:focus-within:outline-none',
    'data-disabled:[&_*]:ring-0',

    // Default border + hover border (hover applies only when NOT disabled)
    'border-border-primary not-focus-visible:hover:[&:not([data-disabled])]:border-component-border-input-hover',

    // Focus ring (applies only when NOT disabled)
    'focus-visible:[&:not([data-disabled]):not([data-invalid])]:ring-focus-primary',
    'focus-visible:[&:not([data-disabled]):not([data-invalid])]:border-border-strong-primary',

    // Opened state - base
    '[&[data-state=open]:not([data-disabled])]:ring-3',

    // Opened state - active
    '[&[data-state=open]:not([data-disabled])]:ring-focus-primary',
    '[&[data-state=open]:not([data-disabled])]:border-border-strong-primary',

    // Opened state - invalid
    '[&[data-state=open][data-invalid]:not([data-disabled])]:ring-focus-destructive',
    '[&[data-state=open][data-invalid]:not([data-disabled])]:border-border-strong-danger',

    // Invalid state — base border
    'data-invalid:border-border-strong-danger',

    // Invalid state + hover (hover applies only when NOT disabled)
    'data-invalid:hover:[&:not([data-disabled])]:border-border-strong-danger',
    'data-invalid:hover:[&:not([data-disabled])]:ring-3',
    'data-invalid:hover:[&:not([data-disabled])]:ring-focus-destructive-hover',

    // Invalid state + focus
    'data-invalid:focus-within:ring-focus-destructive',
  ],
  {
    variants: {
      multiple: {
        true: 'text-text-secondary',
        false: 'pl-12',
      },
      empty: {
        true: 'text-text-secondary',
      },
    },
    compoundVariants: [
      {
        multiple: true,
        empty: true,
        className: 'pl-12',
      },
    ],
  },
);

type SelectInputProps = Pick<SelectValueTextProps, 'placeholder'>;

export const SelectInput: FC<SelectInputProps> = ({
  placeholder = 'Choose...',
}) => {
  const { selectedItems, disabled, multiple } = useSelectContext();

  const isEmpty = selectedItems.length <= 0;

  return (
    <ArkUiSelect.Control className="w-full max-w-full">
      <ArkUiSelect.Trigger asChild>
        <div
          className={cn(
            selectInputVariants({ empty: isEmpty, multiple }),
            'w-full max-w-full gap-8',
          )}
          tabIndex={disabled ? -1 : 0}
        >
          {multiple && !isEmpty ? (
            <OverflowList
              className="flex items-center gap-4 flex-1 h-full pl-6 overflow-hidden"
              items={selectedItems}
              itemRenderer={SelectInputItemRenderer}
              overflowRenderer={SelectInputOverflowRenderer}
            />
          ) : (
            <SelectValueText placeholder={placeholder} />
          )}

          <SelectInputClear />

          <SelectArrow className="text-icon-secondary" />
        </div>
      </ArkUiSelect.Trigger>
    </ArkUiSelect.Control>
  );
};

SelectInput.displayName = 'SelectInput';

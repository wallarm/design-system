import type { FC } from 'react';

import { Select as ArkUiSelect, useSelectContext } from '@ark-ui/react/select';

import { Button, type ButtonProps } from '../Button';

import { SelectArrow } from './SelectArrow';
import { useSelectSharedContext } from './SelectSharedContext';
import { SelectValueIcon } from './SelectValueIcon';
import { SelectValueText, type SelectValueTextProps } from './SelectValueText';

type SelectButtonBaseProps = Omit<
  ButtonProps,
  'variant' | 'color' | 'size' | 'disabled'
>;

interface SelectButtonVariantProps {
  variant?: Exclude<ButtonProps['variant'], 'primary'>;
  color?: Exclude<ButtonProps['color'], 'destructive'>;
}

type SelectButtonProps = SelectButtonBaseProps &
  SelectButtonVariantProps &
  SelectValueTextProps;

export const SelectButton: FC<SelectButtonProps> = ({
  placeholder = 'Choose...',
  variant = 'outline',
  color = 'neutral',
  ...props
}) => {
  const { loading } = useSelectSharedContext();
  const { disabled } = useSelectContext();

  return (
    <ArkUiSelect.Control>
      <ArkUiSelect.Trigger asChild>
        <Button
          {...props}
          variant={variant}
          color={color}
          size="large"
          loading={loading}
          disabled={disabled}
          fullWidth
        >
          <SelectValueIcon />

          <SelectValueText placeholder={placeholder} />

          <SelectArrow />
        </Button>
      </ArkUiSelect.Trigger>
    </ArkUiSelect.Control>
  );
};

SelectButton.displayName = 'SelectButton';

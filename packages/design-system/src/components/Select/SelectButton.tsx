import type { FC } from 'react';
import { Select as ArkUiSelect, useSelectContext } from '@ark-ui/react/select';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { SelectArrow } from './SelectArrow';
import { useSelectSharedContext } from './SelectSharedContext';
import { SelectValueIcon } from './SelectValueIcon';
import { SelectValueText, type SelectValueTextProps } from './SelectValueText';

type SelectButtonBaseProps = Omit<ButtonProps, 'variant' | 'color' | 'size' | 'disabled'>;

export type SelectButtonSize = 'small' | 'medium' | 'default' | 'inline-edit';

// Select's own 24/32/36/28px scale ('small'|'medium'|'default'|'inline-edit')
// is independent of Button's ('small'|'medium'|'large'|'inline-edit') —
// translate at the call site rather than rename Button's own scale, which is
// used everywhere in the app.
const SELECT_BUTTON_SIZE_MAP: Record<SelectButtonSize, ButtonProps['size']> = {
  small: 'small',
  medium: 'medium',
  default: 'large',
  'inline-edit': 'inline-edit',
};

export interface SelectButtonVariantProps {
  variant?: Exclude<ButtonProps['variant'], 'primary'>;
  color?: Exclude<ButtonProps['color'], 'destructive'>;
  size?: SelectButtonSize;
}

type SelectButtonProps = SelectButtonBaseProps & SelectButtonVariantProps & SelectValueTextProps;

export const SelectButton: FC<SelectButtonProps> = ({
  placeholder = 'Choose...',
  variant = 'outline',
  color = 'neutral',
  size = 'default',
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('button', testIdProp);
  const { loading } = useSelectSharedContext();
  const { disabled } = useSelectContext();

  return (
    <ArkUiSelect.Control>
      <ArkUiSelect.Trigger asChild>
        <Button
          {...props}
          data-testid={testId}
          variant={variant}
          color={color}
          size={SELECT_BUTTON_SIZE_MAP[size]}
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

import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { NumberInput, type NumberInputProps } from '../NumberInput';
import { useAttributeEdit } from './AttributeEditContext';

type NumberInputValueChangeDetails = Parameters<NonNullable<NumberInputProps['onValueChange']>>[0];

export type AttributeEditNumberProps = Omit<NumberInputProps, 'value' | 'onValueChange' | 'error'>;

export const AttributeEditNumber: FC<AttributeEditNumberProps> = ({
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('edit-input', testIdProp);
  const { value, setValue, invalid } = useAttributeEdit<string>();
  return (
    <NumberInput
      {...props}
      data-testid={testId}
      value={value ?? ''}
      onValueChange={(details: NumberInputValueChangeDetails) => setValue(details.value)}
      error={invalid}
    />
  );
};

AttributeEditNumber.displayName = 'AttributeEditNumber';

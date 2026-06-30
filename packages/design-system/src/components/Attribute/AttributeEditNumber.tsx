import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { NumberInput, type NumberInputProps } from '../NumberInput';
import { useAttributeEdit } from './AttributeEditContext';

type NumberInputValueChangeDetails = Parameters<NonNullable<NumberInputProps['onValueChange']>>[0];

export type AttributeEditNumberProps = Omit<NumberInputProps, 'value' | 'onValueChange' | 'error'>;

/**
 * Analytics closed-target gap: `NumberInput` spreads consumer props onto its
 * Ark `Root` wrapper rather than the inner `<input>`, so `data-analytics-*`
 * land on the wrapper (click analytics still resolve via `closest()`, but the
 * attribute is not on the real focusable node). The durable fix is to forward
 * those attributes to the input inside `NumberInput`. See ./ANALYTICS_GAPS.md.
 */

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

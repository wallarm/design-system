import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Textarea, type TextareaProps } from '../Textarea';
import { useAttributeEdit } from './AttributeEditContext';

export type AttributeEditTextareaProps = Omit<TextareaProps, 'value' | 'onChange' | 'error'>;

export const AttributeEditTextarea: FC<AttributeEditTextareaProps> = ({
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('edit-input', testIdProp);
  const { value, setValue, invalid } = useAttributeEdit<string>();
  return (
    <Textarea
      {...props}
      data-testid={testId}
      value={value ?? ''}
      onChange={event => setValue(event.target.value)}
      error={invalid}
    />
  );
};

AttributeEditTextarea.displayName = 'AttributeEditTextarea';

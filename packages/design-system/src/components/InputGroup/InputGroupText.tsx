import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Text, type TextProps } from '../Text';

type InputGroupTextProps = Omit<TextProps, 'color' | 'size'>;

export const InputGroupText: FC<InputGroupTextProps> = props => {
  const testId = useTestId('text');

  return <Text data-testid={testId} {...props} color='secondary' size='sm' />;
};

InputGroupText.displayName = 'InputGroupText';

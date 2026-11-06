import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Text, type TextProps } from '../Text';

type InputGroupTextProps = Omit<TextProps, 'color' | 'size'>;

export const InputGroupText: FC<InputGroupTextProps> = props => {
  const testId = useTestId('text');

  return <Text {...props} color='secondary' size='sm' data-testid={testId} />;
};

InputGroupText.displayName = 'InputGroupText';

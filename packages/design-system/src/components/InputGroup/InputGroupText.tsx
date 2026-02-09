import type { FC } from 'react';
import { Text, type TextProps } from '../Text';

type InputGroupTextProps = Omit<TextProps, 'color' | 'size'>;

export const InputGroupText: FC<InputGroupTextProps> = props => {
  return <Text {...props} color='secondary' size='sm' />;
};

InputGroupText.displayName = 'InputGroupText';

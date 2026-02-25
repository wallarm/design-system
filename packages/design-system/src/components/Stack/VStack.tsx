import type { FC, Ref } from 'react';
import { Stack, type StackProps } from './Stack';

export interface VStackProps extends Omit<StackProps, 'direction'> {
  ref?: Ref<HTMLDivElement>;
}

export const VStack: FC<VStackProps> = ({ ref, ...props }) => {
  return <Stack ref={ref} direction='column' {...props} />;
};

VStack.displayName = 'VStack';

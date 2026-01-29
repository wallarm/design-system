import type { FC, Ref } from 'react';

import { Stack, type StackProps } from './Stack';

export interface VStackProps extends Omit<StackProps, 'direction'> {
  ref?: Ref<HTMLDivElement>;
}

export const VStack: FC<VStackProps> = ({ align = 'start', ref, ...props }) => {
  return <Stack ref={ref} align={align} direction="column" {...props} />;
};

VStack.displayName = 'VStack';

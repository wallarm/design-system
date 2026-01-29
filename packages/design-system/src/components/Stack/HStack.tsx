import type { FC } from 'react';

import { Stack, type StackProps } from './Stack';

export type HStackProps = Omit<StackProps, 'direction'>;

export const HStack: FC<HStackProps> = ({
  align = 'center',
  justify = 'start',
  ...props
}) => <Stack align={align} justify={justify} direction="row" {...props} />;

HStack.displayName = 'HStack';

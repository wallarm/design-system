import type { ComponentPropsWithRef, FC } from 'react';
import { cn } from '../../../utils/cn';
import { tableRowVariants } from '../classes';

export const Tr: FC<ComponentPropsWithRef<'tr'>> = ({ ref, className, ...props }) => (
  <tr ref={ref} className={cn(tableRowVariants(), className)} {...props} />
);
Tr.displayName = 'Tr';

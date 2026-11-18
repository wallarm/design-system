import type { ComponentPropsWithRef, FC } from 'react';
import { cn } from '../../../utils/cn';
import { tableRowVariants } from '../classes';

export const Tr: FC<ComponentPropsWithRef<'tr'>> = ({ ref, className, ...props }) => (
  // biome-ignore lint/a11y/noRedundantRoles: Explicit: window mode lays the table out as two role='presentation' tables, which would strip the implied role.
  <tr ref={ref} role='row' className={cn(tableRowVariants(), className)} {...props} />
);
Tr.displayName = 'Tr';

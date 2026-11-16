import type { ComponentPropsWithRef, FC } from 'react';
import { cn } from '../../../utils/cn';

export const TBody: FC<ComponentPropsWithRef<'tbody'>> = ({ ref, className, ...props }) => (
  // biome-ignore lint/a11y/noRedundantRoles: Explicit: window mode lays the table out as two role='presentation' tables, which would strip the implied role.
  <tbody ref={ref} role='rowgroup' className={cn(className)} {...props} />
);
TBody.displayName = 'TBody';

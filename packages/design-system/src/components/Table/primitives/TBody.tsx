import type { ComponentPropsWithRef, FC } from 'react';

import { cn } from '../../../utils/cn';

export const TBody: FC<ComponentPropsWithRef<'tbody'>> = ({ ref, className, ...props }) => (
  <tbody ref={ref} className={cn(className)} {...props} />
);
TBody.displayName = 'TBody';

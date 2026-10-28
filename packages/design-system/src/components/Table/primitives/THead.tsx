import type { ComponentPropsWithRef, FC } from 'react';

import { cn } from '../../../utils/cn';

export const THead: FC<ComponentPropsWithRef<'thead'>> = ({ ref, className, ...props }) => (
  <thead ref={ref} className={cn(className)} {...props} />
);
THead.displayName = 'THead';

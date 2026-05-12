import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type TopHeaderSeparatorProps = HTMLAttributes<HTMLDivElement>;

export const TopHeaderSeparator: FC<TopHeaderSeparatorProps> = ({ className, ...props }) => (
  <div
    {...props}
    role='none'
    data-slot='top-header-separator'
    className={cn('my-2 h-16 w-px bg-border-primary', className)}
  />
);

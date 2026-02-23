import { type ComponentPropsWithRef, forwardRef } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { tableHeadCellVariants } from '../classes';

type ThVariantProps = VariantProps<typeof tableHeadCellVariants>;
type ThProps = Omit<ComponentPropsWithRef<'th'>, keyof ThVariantProps> & ThVariantProps;

export const Th = forwardRef<HTMLTableCellElement, ThProps>(
  ({ className, interactive, sorted, pinned, lastPinnedLeft, draggable, ...props }, ref) => (
    <th
      ref={ref}
      scope='col'
      className={cn(
        tableHeadCellVariants({ interactive, sorted, pinned, lastPinnedLeft, draggable }),
        className,
      )}
      {...props}
    />
  ),
);
Th.displayName = 'Th';

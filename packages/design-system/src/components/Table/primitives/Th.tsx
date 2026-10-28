import type { ComponentPropsWithRef, FC } from 'react';

import type { VariantProps } from 'class-variance-authority';

import { cn } from '../../../utils/cn';
import { tableHeadCellVariants } from '../classes';

type ThVariantProps = VariantProps<typeof tableHeadCellVariants>;
type ThProps = Omit<ComponentPropsWithRef<'th'>, keyof ThVariantProps> & ThVariantProps;

export const Th: FC<ThProps> = ({
  ref,
  className,
  interactive,
  sorted,
  pinned,
  lastPinnedLeft,
  draggable,
  dragging,
  ...props
}) => (
  <th
    ref={ref}
    scope='col'
    className={cn(
      tableHeadCellVariants({ interactive, sorted, pinned, lastPinnedLeft, draggable, dragging }),
      className,
    )}
    {...props}
  />
);
Th.displayName = 'Th';

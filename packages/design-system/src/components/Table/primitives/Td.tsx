import { type ComponentPropsWithRef, forwardRef } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { tableBodyCellVariants } from '../classes';

type TdVariantProps = VariantProps<typeof tableBodyCellVariants>;
type TdProps = Omit<ComponentPropsWithRef<'td'>, keyof TdVariantProps> & TdVariantProps;

export const Td = forwardRef<HTMLTableCellElement, TdProps>(
  ({ className, pinned, lastPinnedLeft, expanded, ...props }, ref) => {
    const hasVariants =
      pinned !== undefined || lastPinnedLeft !== undefined || expanded !== undefined;

    return (
      <td
        ref={ref}
        className={cn(
          hasVariants ? tableBodyCellVariants({ pinned, lastPinnedLeft, expanded }) : undefined,
          className,
        )}
        {...props}
      />
    );
  },
);
Td.displayName = 'Td';

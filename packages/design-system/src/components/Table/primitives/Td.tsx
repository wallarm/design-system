import type { ComponentPropsWithRef, FC } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { tableBodyCellVariants } from '../classes';

type TdVariantProps = VariantProps<typeof tableBodyCellVariants>;
type TdProps = Omit<ComponentPropsWithRef<'td'>, keyof TdVariantProps> & TdVariantProps;

export const Td: FC<TdProps> = ({
  ref,
  className,
  pinned,
  lastPinnedLeft,
  expanded,
  lastRow,
  ...props
}) => {
  const hasVariants =
    pinned !== undefined ||
    lastPinnedLeft !== undefined ||
    expanded !== undefined ||
    lastRow !== undefined;

  return (
    <td
      ref={ref}
      // biome-ignore lint/a11y/noRedundantRoles: Explicit: window mode lays the table out as two role='presentation' tables, which would strip the implied role.
      role='cell'
      className={cn(
        hasVariants
          ? tableBodyCellVariants({ pinned, lastPinnedLeft, expanded, lastRow })
          : undefined,
        className,
      )}
      {...props}
    />
  );
};
Td.displayName = 'Td';

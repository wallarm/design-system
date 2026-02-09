import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type FieldGroupProps = HTMLAttributes<HTMLDivElement>;

export const FieldGroup: FC<FieldGroupProps> = ({ ...props }) => (
  <div
    {...props}
    data-slot='field-group'
    className={cn(
      'group/field-group @container/field-group flex w-full flex-col gap-16 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4',
    )}
  />
);

FieldGroup.displayName = 'FieldGroup';

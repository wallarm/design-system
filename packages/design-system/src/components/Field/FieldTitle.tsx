import type { FC, HTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

type FieldTitleProps = HTMLAttributes<HTMLDivElement>;

export const FieldTitle: FC<FieldTitleProps> = (props) => {
  return (
    <div
      {...props}
      data-slot="field-label"
      className={cn(
        'flex w-fit items-center gap-4 text-sm font-medium leading-snug group-data-[disabled=true]/field:opacity-50',
      )}
    />
  );
};

FieldTitle.displayName = 'FieldTitle';

import type { FC, FieldsetHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type FieldSetProps = FieldsetHTMLAttributes<HTMLFieldSetElement>;

export const FieldSet: FC<FieldSetProps> = ({ className, ...props }) => (
  <fieldset
    {...props}
    data-slot='field-set'
    className={cn(
      'flex flex-col gap-16',
      'max-w-full min-w-0',
      'has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
      className,
    )}
  />
);

FieldSet.displayName = 'FieldSet';

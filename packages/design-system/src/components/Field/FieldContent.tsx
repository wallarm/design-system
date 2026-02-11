import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type FieldContentProps = HTMLAttributes<HTMLDivElement>;

export const FieldContent: FC<FieldContentProps> = props => {
  return (
    <div
      {...props}
      data-slot='field-content'
      className={cn('group/field-content flex flex-1 flex-col gap-4 leading-snug')}
    />
  );
};

FieldContent.displayName = 'FieldContent';

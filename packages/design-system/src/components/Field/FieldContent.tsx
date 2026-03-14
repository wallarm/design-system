import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

type FieldContentProps = HTMLAttributes<HTMLDivElement>;

export const FieldContent: FC<FieldContentProps> = props => {
  const testId = useTestId('content');

  return (
    <div
      {...props}
      data-testid={testId}
      data-slot='field-content'
      className={cn('group/field-content flex flex-1 flex-col gap-4 leading-snug')}
    />
  );
};

FieldContent.displayName = 'FieldContent';

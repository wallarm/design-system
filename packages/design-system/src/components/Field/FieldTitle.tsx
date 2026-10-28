import type { FC, HTMLAttributes } from 'react';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

type FieldTitleProps = HTMLAttributes<HTMLDivElement>;

export const FieldTitle: FC<FieldTitleProps> = props => {
  const testId = useTestId('title');

  return (
    <div
      {...props}
      data-testid={testId}
      data-slot='field-label'
      className={cn(
        'flex w-fit items-center gap-4 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50',
      )}
    />
  );
};

FieldTitle.displayName = 'FieldTitle';

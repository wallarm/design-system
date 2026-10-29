import type { FC, HTMLAttributes } from 'react';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

type FieldDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const FieldDescription: FC<FieldDescriptionProps> = props => {
  const testId = useTestId('description');

  return (
    <p
      {...props}
      data-testid={testId}
      data-slot='field-description'
      className={cn(
        'text-sm leading-normal font-normal text-text-secondary group-has-[[data-orientation=horizontal]]/field:text-balance',
        'last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:mb-16',
      )}
    />
  );
};

FieldDescription.displayName = 'FieldDescription';

import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { approvalCardContentVariants } from './classes';

export interface ApprovalCardContentProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

export const ApprovalCardContent: FC<ApprovalCardContentProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('content', testIdProp);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='approval-card-content'
      data-testid={testId}
      className={cn(approvalCardContentVariants(), className)}
    />
  );
};

ApprovalCardContent.displayName = 'ApprovalCardContent';

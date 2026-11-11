import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { approvalCardActionsVariants } from './classes';

export interface ApprovalCardActionsProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

export const ApprovalCardActions: FC<ApprovalCardActionsProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('actions', testIdProp);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='approval-card-actions'
      data-testid={testId}
      className={cn(approvalCardActionsVariants(), className)}
    />
  );
};

ApprovalCardActions.displayName = 'ApprovalCardActions';

import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { emptyStateTitleVariants } from './classes';
import { useEmptyStateType } from './EmptyStateContext';

export interface EmptyStateTitleProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: Ref<HTMLParagraphElement>;
  children?: ReactNode;
}

export const EmptyStateTitle: FC<EmptyStateTitleProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('title');
  const type = useEmptyStateType();

  return (
    <p
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='empty-state-title'
      className={cn(emptyStateTitleVariants({ type }), className)}
    >
      {children}
    </p>
  );
};

EmptyStateTitle.displayName = 'EmptyStateTitle';

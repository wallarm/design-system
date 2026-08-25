import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { emptyStateIllustrationVariants } from './classes';

export interface EmptyStateIllustrationProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const EmptyStateIllustration: FC<EmptyStateIllustrationProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('illustration');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='empty-state-illustration'
      data-testid={testId}
      className={cn(emptyStateIllustrationVariants(), className)}
    >
      {children}
    </div>
  );
};

EmptyStateIllustration.displayName = 'EmptyStateIllustration';

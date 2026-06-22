import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

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
      className={cn(
        'text-text-secondary p-8 border border-border-primary bg-bg-light-primary rounded-full w-36 h-36 flex items-center justify-center',
        className,
      )}
    >
      {children}
    </div>
  );
};

EmptyStateIllustration.displayName = 'EmptyStateIllustration';

import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

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

  return (
    <p
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='empty-state-title'
      className={cn(
        'font-pixel text-base leading-base text-text-primary text-center break-words',
        className,
      )}
    >
      {children}
    </p>
  );
};

EmptyStateTitle.displayName = 'EmptyStateTitle';

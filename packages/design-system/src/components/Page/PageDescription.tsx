import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface PageDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: Ref<HTMLParagraphElement>;
}

export const PageDescription: FC<PageDescriptionProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('description');

  return (
    <p
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='page-description'
      className={cn('text-sm text-text-secondary', className)}
    >
      {children}
    </p>
  );
};

PageDescription.displayName = 'PageDescription';

import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface PageTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  ref?: Ref<HTMLHeadingElement>;
}

export const PageTitle: FC<PageTitleProps> = ({ ref, children, className, ...props }) => {
  const testId = useTestId('title');

  return (
    <h1
      data-testid={testId}
      {...props}
      ref={ref}
      data-slot='page-title'
      className={cn(
        'font-sans-display text-xl font-medium leading-28 text-text-primary truncate',
        className,
      )}
    >
      {children}
    </h1>
  );
};

PageTitle.displayName = 'PageTitle';

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
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='page-title'
      className={cn(
        'truncate font-sans-display text-xl leading-28 font-medium text-text-primary',
        className,
      )}
    >
      {children}
    </h1>
  );
};

PageTitle.displayName = 'PageTitle';

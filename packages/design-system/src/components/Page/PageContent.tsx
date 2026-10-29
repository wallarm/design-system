import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface PageContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Scrollable content area that fills the remaining vertical space.
 * Use `min-h-0` to allow flex-based shrinking within a `fixedHeight` Page.
 */
export const PageContent: FC<PageContentProps> = ({ ref, children, className, ...props }) => {
  const testId = useTestId('content');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='page-content'
      className={cn(
        'min-h-0 flex-1 overflow-auto px-24 pt-8 pb-24',
        '[:is([data-slot=page-header],[data-slot=page-toolbar])+&]:pt-6',
        className,
      )}
    >
      {children}
    </div>
  );
};

PageContent.displayName = 'PageContent';

import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface PageToolbarProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/** Row of filters (search, segmented tabs, …) placed between `PageHeader` and `PageContent`. */
export const PageToolbar: FC<PageToolbarProps> = ({ ref, children, className, ...props }) => {
  const testId = useTestId('toolbar');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='page-toolbar'
      className={cn(
        'flex items-center gap-12 px-24 pb-8 has-[+[data-slot=page-content]]:pb-6',
        className,
      )}
    >
      {children}
    </div>
  );
};

PageToolbar.displayName = 'PageToolbar';

import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface BannerContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Container for the Banner's main content (title row and description).
 *
 * Provides the flex column layout and takes up the remaining horizontal space.
 */
export const BannerContent: FC<BannerContentProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('content');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='banner-content'
      data-testid={testId}
      className={cn('flex flex-1 flex-col justify-center gap-0 min-w-0', className)}
    >
      {children}
    </div>
  );
};

BannerContent.displayName = 'BannerContent';

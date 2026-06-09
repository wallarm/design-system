import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface BannerControlsProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Trailing controls container for Banner.
 *
 * Use this to place action buttons and/or the BannerClose button on the right
 * side of the banner. Buttons should use size="small".
 */
export const BannerControls: FC<BannerControlsProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('controls');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='banner-controls'
      data-testid={testId}
      className={cn('flex items-center gap-8 shrink-0', className)}
    >
      {children}
    </div>
  );
};

BannerControls.displayName = 'BannerControls';

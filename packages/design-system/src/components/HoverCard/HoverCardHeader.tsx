import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';

/** Children: [media, HoverCardTitle, Badge?, HoverCardDescription?]. */
export interface HoverCardHeaderProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const HoverCardHeader: FC<HoverCardHeaderProps> = ({
  ref,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('header', testIdProp);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='hover-card-header'
      data-testid={testId}
      className={cn(
        // media | title | status; the media spans both rows. The last column takes the rest, so a description
        // wider than title + status never pushes the badge away from the name.
        'grid grid-cols-[auto_minmax(0,max-content)_1fr] items-center gap-x-8 [&>[data-slot=badge]]:justify-self-start',
        '[&>:first-child]:row-span-2 [&>:first-child]:mr-4',
        // The title opens column 2, so the Badge auto-places into column 3.
        '[&>[data-slot=hover-card-title]]:col-start-2',
        '[&>[data-slot=hover-card-description]]:col-start-2 [&>[data-slot=hover-card-description]]:col-span-2 [&>[data-slot=hover-card-description]]:row-start-2',
        className,
      )}
    >
      {children}
    </div>
  );
};

HoverCardHeader.displayName = 'HoverCardHeader';

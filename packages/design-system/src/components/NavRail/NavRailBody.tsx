import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface NavRailBodyProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const NavRailBody: FC<NavRailBodyProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('body');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='nav-rail-body'
      data-testid={testId}
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-none [scrollbar-width:thin]',
        className,
      )}
    >
      {children}
    </div>
  );
};

NavRailBody.displayName = 'NavRailBody';

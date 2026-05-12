import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface NavRailFooterProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const NavRailFooter: FC<NavRailFooterProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('footer');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='nav-rail-footer'
      data-testid={testId}
      className={cn('mt-auto flex flex-col gap-2', className)}
    >
      {children}
    </div>
  );
};

NavRailFooter.displayName = 'NavRailFooter';

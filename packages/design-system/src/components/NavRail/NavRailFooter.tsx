import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { navRailFooterVariants } from './classes';
import { useNavRailContext } from './NavRailContext';

export interface NavRailFooterProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const NavRailFooter: FC<NavRailFooterProps> = ({ ref, className, children, ...props }) => {
  const { mode } = useNavRailContext();
  const testId = useTestId('footer');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='nav-rail-footer'
      data-testid={testId}
      className={cn(navRailFooterVariants({ mode }), className)}
    >
      {children}
    </div>
  );
};

NavRailFooter.displayName = 'NavRailFooter';

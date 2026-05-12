import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { navRailVariants } from './classes';
import { NavRailContextProvider } from './NavRailContext';

export interface NavRailProps extends HTMLAttributes<HTMLElement>, TestableProps {
  ref?: Ref<HTMLElement>;
  children?: ReactNode;
  collapsed?: boolean;
}

export const NavRail: FC<NavRailProps> = ({
  ref,
  collapsed = false,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  return (
    <TestIdProvider value={testId}>
      <NavRailContextProvider value={{ collapsed }}>
        <nav
          {...props}
          ref={ref}
          aria-label='Global navigation'
          data-slot='nav-rail'
          data-testid={testId}
          className={cn(navRailVariants({ collapsed }), className)}
        >
          {children}
        </nav>
      </NavRailContextProvider>
    </TestIdProvider>
  );
};

NavRail.displayName = 'NavRail';

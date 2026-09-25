import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { navRailBodyVariants } from './classes';
import { useNavRailContext } from './NavRailContext';

export interface NavRailBodyProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const NavRailBody: FC<NavRailBodyProps> = ({ ref, className, children, ...props }) => {
  const { mode } = useNavRailContext();
  const testId = useTestId('body');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='nav-rail-body'
      data-testid={testId}
      className={cn(navRailBodyVariants({ mode }), className)}
    >
      {children}
    </div>
  );
};

NavRailBody.displayName = 'NavRailBody';

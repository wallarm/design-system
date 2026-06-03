import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useAppShellAppeared } from './AppShellContext';

export interface AppShellRailProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const AppShellRail: FC<AppShellRailProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('rail');
  const appeared = useAppShellAppeared();

  return (
    <div
      {...props}
      ref={ref}
      data-slot='app-shell-rail'
      data-testid={testId}
      className={cn(
        '[grid-area:rail] transition-opacity duration-200 ease-in-out',
        !appeared && 'opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
};

AppShellRail.displayName = 'AppShellRail';

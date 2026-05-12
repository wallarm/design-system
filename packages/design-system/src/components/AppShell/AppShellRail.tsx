import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface AppShellRailProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const AppShellRail: FC<AppShellRailProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('rail');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='app-shell-rail'
      data-testid={testId}
      className={cn('[grid-area:rail]', className)}
    >
      {children}
    </div>
  );
};

AppShellRail.displayName = 'AppShellRail';

import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const AppShell: FC<AppShellProps> = ({
  ref,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-slot='app-shell'
        data-testid={testId}
        className={cn(
          'grid h-screen overscroll-none [grid-template-areas:"header_header""rail_remote"] [grid-template-columns:auto_1fr] [grid-template-rows:auto_1fr] bg-component-app-shell-bg',
          className,
        )}
      >
        {children}
      </div>
    </TestIdProvider>
  );
};

AppShell.displayName = 'AppShell';

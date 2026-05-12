import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface AppShellRemoteProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const AppShellRemote: FC<AppShellRemoteProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('remote');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='app-shell-remote'
      data-testid={testId}
      className={cn(
        '[grid-area:remote] overflow-auto rounded-tl-12 border border-border-primary-light bg-bg-page-bg',
        className,
      )}
    >
      {children}
    </div>
  );
};

AppShellRemote.displayName = 'AppShellRemote';

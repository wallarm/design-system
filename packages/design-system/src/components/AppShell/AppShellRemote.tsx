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
        '[grid-area:remote] relative overflow-auto overscroll-none rounded-tl-12 border-t border-l border-border-primary-light bg-bg-page-bg',
        // With an open AppShellAside after it, the canvas no longer runs to the window edge, so
        // it becomes a card: rounded top corners and its own right border.
        'has-[~[data-slot=app-shell-aside][data-state=open]]:rounded-tr-12 has-[~[data-slot=app-shell-aside][data-state=open]]:border-r',
        // The corner and edge follow the shell's aside track on its timing.
        'transition-[border-top-right-radius,border-right-width] duration-(--app-shell-aside-duration) ease-(--app-shell-aside-ease) motion-reduce:transition-none',
        className,
      )}
    >
      {children}
    </div>
  );
};

AppShellRemote.displayName = 'AppShellRemote';

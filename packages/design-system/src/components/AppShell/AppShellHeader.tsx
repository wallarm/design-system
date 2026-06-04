import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useAppShellAppeared } from './AppShellContext';

export interface AppShellHeaderProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  children?: ReactNode;
}

export const AppShellHeader: FC<AppShellHeaderProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('header');
  const appeared = useAppShellAppeared();

  return (
    <header
      {...props}
      ref={ref}
      data-slot='app-shell-header'
      data-testid={testId}
      className={cn(
        '[grid-area:header] transition-opacity duration-500 ease-in-out',
        !appeared && 'opacity-0',
        className,
      )}
    >
      {children}
    </header>
  );
};

AppShellHeader.displayName = 'AppShellHeader';

import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface AppShellHeaderProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  children?: ReactNode;
}

export const AppShellHeader: FC<AppShellHeaderProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('header');

  return (
    <header
      {...props}
      ref={ref}
      data-slot='app-shell-header'
      data-testid={testId}
      className={cn('[grid-area:header]', className)}
    >
      {children}
    </header>
  );
};

AppShellHeader.displayName = 'AppShellHeader';

import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';

export interface RemoteShellProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const RemoteShell: FC<RemoteShellProps> = ({
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
        data-slot='remote-shell'
        data-testid={testId}
        className={cn(
          'grid h-full overflow-hidden [grid-template-areas:"panel_breadcrumb""panel_content"] [grid-template-columns:auto_1fr] [grid-template-rows:auto_1fr]',
          className,
        )}
      >
        {children}
      </div>
    </TestIdProvider>
  );
};

RemoteShell.displayName = 'RemoteShell';

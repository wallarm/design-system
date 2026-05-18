import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface RemoteShellPanelProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const RemoteShellPanel: FC<RemoteShellPanelProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('panel');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='remote-shell-panel'
      data-testid={testId}
      className={cn('[grid-area:panel] min-h-0', className)}
    >
      {children}
    </div>
  );
};

RemoteShellPanel.displayName = 'RemoteShellPanel';

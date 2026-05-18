import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface RemoteShellBreadcrumbProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const RemoteShellBreadcrumb: FC<RemoteShellBreadcrumbProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('breadcrumb');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='remote-shell-breadcrumb'
      data-testid={testId}
      className={cn('[grid-area:breadcrumb] flex items-center px-24 py-8', className)}
    >
      {children}
    </div>
  );
};

RemoteShellBreadcrumb.displayName = 'RemoteShellBreadcrumb';

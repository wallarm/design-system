import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Loader } from '../Loader';

export interface RemoteShellContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  isLoading?: boolean;
}

export const RemoteShellContent: FC<RemoteShellContentProps> = ({
  ref,
  className,
  children,
  isLoading,
  ...props
}) => {
  const testId = useTestId('content');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='remote-shell-content'
      data-testid={testId}
      className={cn(
        'min-h-0 [scrollbar-width:thin] overflow-auto overscroll-none [grid-area:content]',
        isLoading && 'flex items-center justify-center',
        className,
      )}
    >
      {isLoading ? <Loader size='3xl' color='brand' /> : children}
    </div>
  );
};

RemoteShellContent.displayName = 'RemoteShellContent';

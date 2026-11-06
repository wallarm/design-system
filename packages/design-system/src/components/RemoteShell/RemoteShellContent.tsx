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
        '[grid-area:content] min-h-0 overflow-auto overscroll-none [scrollbar-width:thin]',
        isLoading && 'flex items-center justify-center',
        className,
      )}
    >
      {isLoading ? <Loader size='3xl' color='brand' /> : children}
    </div>
  );
};

RemoteShellContent.displayName = 'RemoteShellContent';

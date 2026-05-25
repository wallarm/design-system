import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface RemoteShellContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const RemoteShellContent: FC<RemoteShellContentProps> = ({
  ref,
  className,
  children,
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
        '[grid-area:content] min-h-0 overflow-auto overscroll-none px-24 py-16 [scrollbar-width:thin]',
        className,
      )}
    >
      {children}
    </div>
  );
};

RemoteShellContent.displayName = 'RemoteShellContent';

import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

interface DropdownMenuFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export const DropdownMenuFooter: FC<DropdownMenuFooterProps> = ({ className, ...props }) => {
  const testId = useTestId('footer');

  return (
    <div
      data-testid={testId}
      className={cn(
        '-mx-8 -mb-8 mt-4 flex items-center justify-between gap-8 rounded-b-12 border-t border-border-primary-light px-8 py-8 text-sm text-text-secondary',
        className,
      )}
      {...props}
    />
  );
};

DropdownMenuFooter.displayName = 'DropdownMenuFooter';

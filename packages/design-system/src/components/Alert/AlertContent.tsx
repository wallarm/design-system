import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface AlertContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Container for Alert's main content (title, description, and bottom actions).
 *
 * Provides proper spacing and flex layout for child components.
 */
export const AlertContent: FC<AlertContentProps> = ({ ref, children, ...props }) => {
  const testId = useTestId('content');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      className={cn('flex-1 flex flex-col gap-0 py-2 **:data-[slot=alert-controls]:mt-8')}
    >
      {children}
    </div>
  );
};

AlertContent.displayName = 'AlertContent';

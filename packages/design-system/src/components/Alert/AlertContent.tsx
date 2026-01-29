import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';

export interface AlertContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Container for Alert's main content (title, description, and bottom actions).
 *
 * Provides proper spacing and flex layout for child components.
 */
export const AlertContent: FC<AlertContentProps> = ({
  ref,
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        'flex-1 flex flex-col gap-0 py-2 **:data-[slot=alert-controls]:mt-8',
      )}
    >
      {children}
    </div>
  );
};

AlertContent.displayName = 'AlertContent';

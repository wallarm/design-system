import type { FC, HTMLAttributes, Ref } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const alertControlsVariants = cva(cn('flex items-center gap-4 shrink-0'));

export type AlertControlsProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className'
> & {
  ref?: Ref<HTMLDivElement>;
};

/**
 * Controls container for Alert
 *
 * Use this to place action buttons.
 * Buttons should use variant="secondary" with color="neutral" or "destructive" and size="small".
 */
export const AlertControls: FC<AlertControlsProps> = ({ ref, ...props }) => (
  <div
    {...props}
    ref={ref}
    className={cn(alertControlsVariants())}
    data-slot="alert-controls"
  />
);

AlertControls.displayName = 'AlertControls';

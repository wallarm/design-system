import type { FC, HTMLAttributes, Ref } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

const alertControlsVariants = cva(cn('flex items-center gap-4 shrink-0'));

export type AlertControlsProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'> & {
  ref?: Ref<HTMLDivElement>;
};

/**
 * Controls container for Alert
 *
 * Use this to place action buttons.
 * Buttons should use variant="secondary" with color="neutral" or "destructive" and size="small".
 */
export const AlertControls: FC<AlertControlsProps> = ({ ref, ...props }) => {
  const testId = useTestId('controls');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      className={cn(alertControlsVariants())}
      data-slot='alert-controls'
    />
  );
};

AlertControls.displayName = 'AlertControls';

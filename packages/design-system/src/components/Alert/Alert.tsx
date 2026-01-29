import type { FC, Ref } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import type { AlertColor } from './AlertIcon';
import { ALERT_MAX_WIDTH, ALERT_MIN_WIDTH } from './const';

export type { AlertColor };

const alertVariants = cva(
  [
    'font-sans flex items-start gap-8',
    'rounded-12 border-1',
    'pl-16 pr-12 py-12',
  ],
  {
    variants: {
      color: {
        primary: 'bg-bg-surface-2 border-border-primary',
        destructive: 'bg-bg-light-danger border-border-danger',
        info: 'bg-bg-light-info border-border-info',
        warning: 'bg-bg-light-warning border-border-warning',
        success: 'bg-bg-light-success border-border-success',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  },
);

export interface AlertProps extends VariantProps<typeof alertVariants> {
  ref?: Ref<HTMLDivElement>;
  /** Color variant of the alert */
  color?: AlertColor;
  /** Minimum width in pixels (default: 256) */
  minWidth?: number;
  /** Maximum width in pixels (default: 980) */
  maxWidth?: number;
  /** Alert content */
  children?: React.ReactNode;
}

/**
 * Alert component for displaying important messages to users.
 *
 * Supports 5 color variants: primary (neutral), destructive, info, warning, and success.
 * Use compound components: AlertIcon, AlertContent, AlertClose, AlertControls, AlertActions.
 */
export const Alert: FC<AlertProps> = ({
  ref,
  color = 'primary',
  minWidth = ALERT_MIN_WIDTH,
  maxWidth = ALERT_MAX_WIDTH,
  children,
}) => {
  return (
    <div
      ref={ref}
      role="alert"
      data-color={color}
      className={alertVariants({ color })}
      style={{ minWidth, maxWidth }}
    >
      {children}
    </div>
  );
};

Alert.displayName = 'Alert';

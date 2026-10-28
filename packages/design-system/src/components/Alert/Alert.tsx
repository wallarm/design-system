import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { type TestableProps, TestIdProvider } from '../../utils/testId';
import type { AlertColor } from './AlertIcon';
import { ALERT_MAX_WIDTH, ALERT_MIN_WIDTH } from './const';

export type { AlertColor };

const alertVariants = cva(
  ['flex items-start gap-8 font-sans', 'rounded-12 border-1', 'py-12 pr-12 pl-16'],
  {
    variants: {
      color: {
        primary: 'border-border-primary bg-bg-surface-2',
        destructive: 'border-border-danger bg-bg-light-danger',
        info: 'border-border-info bg-bg-light-info',
        warning: 'border-border-warning bg-bg-light-warning',
        success: 'border-border-success bg-bg-light-success',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  },
);

export interface AlertProps
  extends
    VariantProps<typeof alertVariants>,
    Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Color variant of the alert */
  color?: AlertColor;
  /** Minimum width in pixels (default: 256) */
  minWidth?: number;
  /** Maximum width in pixels (default: 980) */
  maxWidth?: number;
  /** Alert content */
  children?: ReactNode;
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
  'data-testid': testId,
  ...props
}) => {
  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        role='alert'
        data-testid={testId}
        data-color={color}
        className={alertVariants({ color })}
        style={{ minWidth, maxWidth }}
      >
        {children}
      </div>
    </TestIdProvider>
  );
};

Alert.displayName = 'Alert';

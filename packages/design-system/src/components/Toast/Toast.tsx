import type { ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';

import { Toast as ArkToast } from '@ark-ui/react/toast';
import { cva } from 'class-variance-authority';

import {
  CircleCheckBig,
  Info,
  OctagonAlert,
  type SvgIconProps,
  TriangleAlert,
} from '../../icons';
import { cn } from '../../utils/cn';
import { Loader } from '../Loader';

import { ToastClose } from './ToastClose';
import { ToastDescription } from './ToastDescription';
import { ToastIcon } from './ToastIcon';
import { ToastTitle } from './ToastTitle';

const toastVariants = cva(
  'group relative flex min-w-[256px] max-w-[560px] items-start gap-12 rounded-12 bg-slate-800 p-12 pl-16 shadow-lg transition-all',
  {
    variants: {
      variant: {
        extended: 'flex-col',
        simple: 'flex-row items-center',
      },
    },
    defaultVariants: {
      variant: 'extended',
    },
  },
);

// Icon mapping based on toast type
const toastIconMap: Record<
  Exclude<NonNullable<ToastData['type']>, 'default' | 'loading'>,
  { component: React.ComponentType<SvgIconProps>; className: string }
> = {
  success: {
    component: CircleCheckBig,
    className: 'text-green-500',
  },
  error: {
    component: OctagonAlert,
    className: 'text-red-500',
  },
  warning: {
    component: TriangleAlert,
    className: 'text-amber-500',
  },
  info: {
    component: Info,
    className: 'text-blue-500',
  },
};

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default';
  actions?: ReactNode;
  icon?: ReactNode;
  variant?: 'extended' | 'simple';
  closable?: boolean;
  [key: string]: unknown; // Allow additional properties from Ark UI
}

export interface ToastProps {
  toast: ToastData;
}

export const Toast = ({ toast }: ToastProps) => {
  const toastVariant = toast.variant || 'simple';
  const isSimple = toastVariant === 'simple';
  const closable = toast.closable !== false;

  const getToastIcon = (): ReactNode | null => {
    const toastType = toast.type || 'default';

    // Handle custom icon with inheritance
    if (toast.icon) {
      if (isValidElement(toast.icon)) {
        const iconElement = toast.icon as ReactElement;
        const existingProps = (iconElement.props || {}) as Record<
          string,
          unknown
        >;

        // Determine color class based on toast type
        const colorClass =
          toastType !== 'default' && toastType !== 'loading'
            ? toastIconMap[toastType]?.className
            : null;

        // Check if className already has color (text-* pattern)
        const existingClassName = existingProps.className as string | undefined;
        const hasColorClass = existingClassName?.includes('text-') ?? false;

        // Build new props: preserve existing, add defaults only if not present
        const newProps: Record<string, unknown> = {
          ...existingProps,
          // Always set size to 'lg' if not provided
          size: existingProps.size || 'lg',
        };

        // Add color class only if:
        // 1. Toast type has a color (not default/loading)
        // 2. Icon doesn't already have a color class
        if (colorClass && !hasColorClass) {
          newProps.className = cn(existingClassName, colorClass);
        }

        return cloneElement(iconElement, newProps);
      }
      return toast.icon;
    }

    // Default icon based on type
    if (toastType === 'default') return null;
    if (toastType === 'loading') {
      return <Loader type="sonner" size="lg" color="primary-alt" />;
    }

    const iconConfig = toastIconMap[toastType];
    if (!iconConfig) return null;

    const IconComponent = iconConfig.component;
    return <IconComponent size="lg" className={iconConfig.className} />;
  };

  const toastIcon = getToastIcon();

  return (
    <ArkToast.Root
      key={toast.id}
      className={cn(toastVariants({ variant: toastVariant }))}
    >
      <div className={cn('flex w-full items-start gap-8 relative z-10')}>
        {toastIcon && <ToastIcon>{toastIcon}</ToastIcon>}

        <div
          className={cn(
            'flex-1 flex',
            isSimple ? 'flex-row gap-16 items-start' : 'flex-col gap-8',
          )}
        >
          <div className="flex-1 py-2">
            {toast.title && (
              <ToastTitle variant={toastVariant}>{toast.title}</ToastTitle>
            )}
            {!isSimple && toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
          </div>

          {toast.actions && toast.actions}
        </div>

        {closable && <ToastClose />}
      </div>
    </ArkToast.Root>
  );
};

Toast.displayName = 'Toast';

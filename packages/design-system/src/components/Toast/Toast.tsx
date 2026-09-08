import type { ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';
import { Toast as ArkToast } from '@ark-ui/react/toast';
import { cva } from 'class-variance-authority';
import { CircleCheck, Info, OctagonAlert, type SvgIconProps, TriangleAlert } from '../../icons';
import { cn } from '../../utils/cn';
import { TestIdProvider } from '../../utils/testId';
import { Loader } from '../Loader';
import { ToastClose } from './ToastClose';
import { ToastDescription } from './ToastDescription';
import { ToastIcon } from './ToastIcon';
import { ToastProgress } from './ToastProgress';
import { ToastTitle } from './ToastTitle';

const toastVariants = cva(
  'group relative flex min-w-[256px] max-w-[560px] items-start gap-12 rounded-16 bg-component-toast-bg p-12 pl-16 shadow-lg transition-all',
  {
    variants: {
      variant: {
        extended: 'flex-col',
        simple: 'flex-row items-center',
      },
    },
    defaultVariants: {
      variant: 'simple',
    },
  },
);

// Icon mapping based on toast type
const toastIconMap: Record<
  Exclude<NonNullable<ToastData['type']>, 'default' | 'loading'>,
  { component: React.ComponentType<SvgIconProps>; className: string }
> = {
  success: {
    component: CircleCheck,
    className: 'text-component-toast-ic-success',
  },
  error: {
    component: OctagonAlert,
    className: 'text-component-toast-ic-destructive',
  },
  warning: {
    component: TriangleAlert,
    className: 'text-component-toast-ic-warning',
  },
  info: {
    component: Info,
    className: 'text-component-toast-ic-info',
  },
};

export const SIMPLE_TOAST_DURATION_MS = 5000;
export const EXTENDED_TOAST_DURATION_MS = 10000;

/**
 * The fields a toast is actually made of.
 *
 * Kept apart from `ToastData` so they survive an `Omit`: an index signature
 * swallows every named field it is declared beside, which left
 * `ToastCreateOptions` — `Omit<ToastData, 'id'>` — checking nothing at all
 * (`toaster.create({ titl: 'x' })` compiled) and widening each field back to
 * `unknown` under the declaration compiler, invisibly to `tsc --noEmit`.
 */
export interface ToastFields {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default';
  actions?: ReactNode;
  icon?: ReactNode;
  /** Layout. A `description` forces `extended` and its longer timer. */
  variant?: 'extended' | 'simple';
  closable?: boolean;
  duration?: number;
}

// What the renderer receives: the fields above plus whatever Ark UI hands
// along with them. The escape hatch belongs on this side only — the toaster's
// own options are a closed set.
export interface ToastData extends ToastFields {
  [key: string]: unknown;
}

export interface ToastProps {
  toast: ToastData;
}

/**
 * Floating notification rendered by `Toaster`.
 *
 * Two layouts: `simple` is a one-line title, `extended` adds a description and
 * a longer timer. Passing a `description` selects `extended` on its own — see
 * `resolveToastVariant`.
 */
export const Toast = ({ toast }: ToastProps) => {
  const toastVariant = resolveToastVariant(toast.variant, toast.description);
  const isSimple = toastVariant === 'simple';
  const closable = toast.closable !== false;

  const getToastIcon = (): ReactNode | null => {
    const toastType = toast.type || 'default';

    // Handle custom icon with inheritance
    if (toast.icon) {
      if (isValidElement(toast.icon)) {
        const iconElement = toast.icon as ReactElement;
        const existingProps = (iconElement.props || {}) as Record<string, unknown>;

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
      return <Loader type='sonner' size='lg' color='primary-alt' />;
    }

    const iconConfig = toastIconMap[toastType];
    if (!iconConfig) return null;

    const IconComponent = iconConfig.component;
    return <IconComponent size='lg' className={iconConfig.className} />;
  };

  const toastIcon = getToastIcon();

  return (
    <ArkToast.Root
      key={toast.id}
      data-testid={toast.id}
      className={cn(toastVariants({ variant: toastVariant }))}
    >
      <TestIdProvider value={toast.id}>
        <div
          className={cn(
            'flex w-full gap-8 relative z-10',
            isSimple ? 'items-center' : 'items-start',
          )}
        >
          {toastIcon && <ToastIcon>{toastIcon}</ToastIcon>}

          <div
            className={cn(
              'flex-1 flex',
              isSimple ? 'flex-row gap-16 items-center' : 'flex-col gap-8',
            )}
          >
            <div className='flex-1 py-2'>
              {toast.title && <ToastTitle variant={toastVariant}>{toast.title}</ToastTitle>}
              {!isSimple && toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </div>

            {toast.actions && toast.actions}
          </div>

          {closable && <ToastClose />}
        </div>

        {toast.type !== 'loading' && (
          <ToastProgress
            duration={
              toast.duration ?? (isSimple ? SIMPLE_TOAST_DURATION_MS : EXTENDED_TOAST_DURATION_MS)
            }
          />
        )}
      </TestIdProvider>
    </ArkToast.Root>
  );
};

Toast.displayName = 'Toast';

// Which layout a toast ends up in.
//
// `simple` is a single row and renders the title ALONE, so a `description`
// handed to it would be dropped without a trace — and the description is
// usually the actionable half (an error's reason, what happens next). Losing
// the caller's text is never the better reading of the pair, so a description
// decides the layout whenever there is one; `variant` decides it otherwise.
//
// Shared with the toaster, which sizes the auto-dismiss timer off the same
// answer: text nobody has time to read is the other way to lose it.
//
// Kept as line comments deliberately: scripts/metadata publishes the first
// JSDoc block in the file as the COMPONENT's description.
export const resolveToastVariant = (
  variant: ToastFields['variant'],
  description: ToastFields['description'],
): NonNullable<ToastFields['variant']> =>
  description || variant === 'extended' ? 'extended' : 'simple';

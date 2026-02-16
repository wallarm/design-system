import type { FC } from 'react';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import {
  Toaster as ArkToaster,
  type CreateToasterReturn,
  createToaster,
} from '@ark-ui/react/toast';
import { cn } from '../../utils/cn';
import { Toast, type ToastData } from './Toast';

export interface ToastCreateOptions extends Omit<ToastData, 'id'> {
  duration?: number;
}

export interface TypedToaster extends Omit<CreateToasterReturn, 'create'> {
  create: (options: ToastCreateOptions) => string;
  __arkToaster: CreateToasterReturn;
}

const SIMPLE_TOAST_DURATION_MS = 5000;
const EXTENDED_TOAST_DURATION_MS = 10000;

const arkToaster = createToaster({
  overlap: true,
  gap: 12,
});

/**
 * @todo Should be refactored
 */
// eslint-disable-next-line react-refresh/only-export-components
export const toaster: TypedToaster = {
  ...arkToaster,
  __arkToaster: arkToaster,
  create: (options: ToastCreateOptions) => {
    return arkToaster.create({
      ...options,
      duration:
        options.duration ??
        (options.variant === 'extended' ? EXTENDED_TOAST_DURATION_MS : SIMPLE_TOAST_DURATION_MS),
    });
  },
};

export const Toaster: FC = () => {
  const arkToasterInstance = toaster.__arkToaster || toaster;

  return (
    <ArkUiPortal>
      <ArkToaster
        toaster={arkToasterInstance as CreateToasterReturn}
        className={cn(
          'fixed bottom-0 right-0 !z-[50] flex flex-col gap-12 p-24',
          // Group styles
          '[&_[data-scope=toast][data-part=group]]:flex [&_[data-scope=toast][data-part=group]]:flex-col [&_[data-scope=toast][data-part=group]]:gap-12 [&_[data-scope=toast][data-part=group]]:max-w-[560px] [&_[data-scope=toast][data-part=group]]:mx-auto',
          // Root styles with CSS variables for animations
          '[&_[data-scope=toast][data-part=root]]:[translate:var(--x)_var(--y)] [&_[data-scope=toast][data-part=root]]:scale-[var(--scale)] [&_[data-scope=toast][data-part=root]]:z-[var(--z-index)] [&_[data-scope=toast][data-part=root]]:h-[var(--height)] [&_[data-scope=toast][data-part=root]]:opacity-[var(--opacity)] [&_[data-scope=toast][data-part=root]]:[will-change:translate,opacity,scale] [&_[data-scope=toast][data-part=root]]:[transition:translate_300ms_ease,scale_300ms_ease,opacity_300ms_ease,height_300ms_ease,box-shadow_300ms_ease]',
          // Closed state transitions
          '[&_[data-scope=toast][data-part=root][data-state=closed]]:[transition:translate_300ms_ease,scale_300ms_ease,opacity_300ms_ease]',
          // Hide 4th+ children
          '[&_[data-scope=toast][data-part=root]:nth-child(n+4)]:hidden',
          // After pseudo-element base styles
          '[&_[data-scope=toast][data-part=root]]:after:content-[""] [&_[data-scope=toast][data-part=root]]:after:absolute [&_[data-scope=toast][data-part=root]]:after:inset-0 [&_[data-scope=toast][data-part=root]]:after:rounded-[inherit] [&_[data-scope=toast][data-part=root]]:after:pointer-events-none [&_[data-scope=toast][data-part=root]]:after:z-[1] [&_[data-scope=toast][data-part=root]]:after:opacity-0 [&_[data-scope=toast][data-part=root]]:after:[transition:opacity_300ms_ease]',
          // After pseudo-element for non-first, non-stack toasts
          '[&_[data-scope=toast][data-part=root]:not([data-first]):not([data-stack])]:after:[background:--alpha(var(--color-white)/50%)] [&_[data-scope=toast][data-part=root]:not([data-first]):not([data-stack])]:after:opacity-100',
          // After pseudo-element for 2nd child (non-stack)
          '[&_[data-scope=toast][data-part=root]:nth-child(2):not([data-stack])]:after:[background:--alpha(var(--color-white)/20%)] [&_[data-scope=toast][data-part=root]:nth-child(2):not([data-stack])]:after:opacity-100',
        )}
      >
        {toast => <Toast key={toast.id} toast={toast as ToastData} />}
      </ArkToaster>
    </ArkUiPortal>
  );
};

Toaster.displayName = 'Toaster';

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
  priority?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

export interface TypedToaster extends Omit<CreateToasterReturn, 'create' | 'update'> {
  create: (options: ToastCreateOptions) => string;
  update: (id: string, options: Partial<ToastCreateOptions>) => string;
  __arkToaster: CreateToasterReturn;
}

const SIMPLE_TOAST_DURATION_MS = 5000;
const EXTENDED_TOAST_DURATION_MS = 10000;

// @zag-js/toast >=1.41 (pulled in by @ark-ui/react 5.37) added a toast priority
// queue: `createToaster().create()` now looks up `[actionable, nonActionable]`
// priority pairs from a fixed internal map keyed by `type` and destructures the
// result unconditionally — see `getPriorityForType` in
// @zag-js/toast/dist/toast.store.mjs:
//   var priorities = { error: [1, 2], warning: [3, 6], loading: [4, 5], success: [5, 7], info: [6, 8] };
//   var getPriorityForType = (type, hasAction) => {
//     const [actionable, nonActionable] = priorities[type ?? DEFAULT_TYPE];
//     return hasAction ? actionable : nonActionable;
//   };
// Our own `type: 'default'` (rendered with no icon) isn't one of those keys, so
// `priorities['default']` is `undefined` and the destructure throws
// `TypeError: undefined is not iterable`, synchronously inside the onClick
// handler — the toast is never created. Only THIS one type needs a workaround;
// every other type (including an omitted `type`, which falls back to Ark's own
// built-in 'info' default — a valid key) is already handled safely by Ark's
// own lookup, so we let those flow through untouched (`priority: undefined`).
// Ark's public `priority` option (see `Options.priority` in
// @zag-js/toast/dist/toast.types.d.ts) is the documented bypass for that
// internal lookup — reusing the 'info' pair here since our 'default' toast is
// the same neutral, non-alerting variant.
const DEFAULT_TOAST_PRIORITY = { actionable: 6, nonActionable: 8 } as const;

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
      priority:
        options.priority ??
        (options.type === 'default'
          ? options.actions
            ? DEFAULT_TOAST_PRIORITY.actionable
            : DEFAULT_TOAST_PRIORITY.nonActionable
          : undefined),
    });
  },
  update: (id: string, options: Partial<ToastCreateOptions>) => {
    // Only inject a priority override when this update sets `type` to our
    // synthetic 'default' and doesn't already specify one explicitly — every
    // other type (including an update that doesn't touch `type` at all) is
    // left for Ark to handle exactly as it did before this fix.
    const priority =
      options.priority ??
      (options.type === 'default'
        ? options.actions
          ? DEFAULT_TOAST_PRIORITY.actionable
          : DEFAULT_TOAST_PRIORITY.nonActionable
        : undefined);

    return arkToaster.update(id, {
      ...options,
      ...(priority !== undefined ? { priority } : {}),
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
          // The region IS the hover/pause zone. Clamp it to the max toast width and
          // center it so pausing tracks the toast column, not the full viewport width.
          // (These were previously on a `[data-part=group]` descendant selector that
          // never matched — the region element itself carries data-part="group".)
          // The `!` on z is required to beat zag's inline zIndex on the region;
          // --toast-z-index keeps toasts above any drawer/dialog stack and its
          // overlays (positioners compute 50 + layer * 20) while staying below
          // tooltips. Safe to raise: zag sets pointer-events: none on the
          // region while it holds no toasts.
          'fixed bottom-0 right-0 !z-(--toast-z-index) flex flex-col gap-12 p-24 max-w-[560px] mx-auto',
          // Root styles with CSS variables for animations
          '[&_[data-scope=toast][data-part=root]]:[translate:var(--x)_var(--y)] [&_[data-scope=toast][data-part=root]]:scale-[var(--scale)] [&_[data-scope=toast][data-part=root]]:z-[var(--z-index)] [&_[data-scope=toast][data-part=root]]:h-[var(--height)] [&_[data-scope=toast][data-part=root]]:opacity-[var(--opacity)] [&_[data-scope=toast][data-part=root]]:[will-change:translate,opacity,scale]',
          // Match Drawer/Dialog timings: 300ms open, 150ms close
          '[&_[data-scope=toast][data-part=root]]:[transition-property:translate,scale,opacity,height,box-shadow] [&_[data-scope=toast][data-part=root]]:[transition-timing-function:ease] [&_[data-scope=toast][data-part=root]]:[transition-duration:300ms]',
          '[&_[data-scope=toast][data-part=root][data-state=closed]]:[transition-property:translate,scale,opacity] [&_[data-scope=toast][data-part=root][data-state=closed]]:[transition-timing-function:ease] [&_[data-scope=toast][data-part=root][data-state=closed]]:[transition-duration:150ms]',
          // Hide 4th+ children
          '[&_[data-scope=toast][data-part=root]:nth-child(n+4)]:hidden',
          // After pseudo-element base styles
          '[&_[data-scope=toast][data-part=root]]:after:content-[""] [&_[data-scope=toast][data-part=root]]:after:absolute [&_[data-scope=toast][data-part=root]]:after:inset-0 [&_[data-scope=toast][data-part=root]]:after:rounded-[inherit] [&_[data-scope=toast][data-part=root]]:after:pointer-events-none [&_[data-scope=toast][data-part=root]]:after:z-[1] [&_[data-scope=toast][data-part=root]]:after:opacity-0 [&_[data-scope=toast][data-part=root]]:after:[transition:opacity_300ms_ease]',
          '[&_[data-scope=toast][data-part=root][data-state=closed]]:after:[transition:opacity_150ms_ease]',
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

import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const avatarVariants = cva(
  cn(
    // Parts share one grid cell (like the NavRail plate), so the root's own tints show through.
    'group/avatar inline-grid shrink-0 place-items-center overflow-hidden align-middle *:col-start-1 *:row-start-1',
    'border border-border-primary bg-states-primary-hover text-icon-primary font-sans font-medium',
    'branded:border-border-brand branded:bg-states-brand-hover branded:text-icon-brand',
    // A visible photo drops the stroke (Figma Photo=On). The box is fixed-size and border-box, so
    // nothing moves — a transparent border would leave a 1px ring of plate tint around the photo.
    'has-[>img[data-state=visible]]:border-0',
    // With the edit overlay showing over the fallback, the icon swaps rather than stacking
    // (Figma 2159:1698) — the fallback steps aside on hover/focus of an enabled root, or when forced.
    // Gated through `hover:` / `focus-visible:` so they sit in the same `@media (hover: hover)` as the
    // overlay's `group-hover` — a raw `:hover` would leave an empty plate after a tap on touch devices.
    'hover:not-disabled:[&:has(>[data-slot=avatar-overlay])>[data-slot=avatar-fallback]]:invisible',
    'focus-visible:[&:has(>[data-slot=avatar-overlay])>[data-slot=avatar-fallback]]:invisible',
    '[&:has(>[data-slot=avatar-overlay][data-visible])>[data-slot=avatar-fallback]]:invisible',
    // Interactive root (asChild → <button>).
    'enabled:cursor-pointer disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
  ),
  {
    variants: {
      size: {
        xs: 'size-24 rounded-8 text-2xs',
        sm: 'size-32 rounded-12 text-xs',
      },
    },
    defaultVariants: { size: 'sm' },
  },
);

// Ark toggles visibility with the `hidden` attribute, which any display utility overrides.
export const avatarImageClassNames = cn('size-full object-cover data-[state=hidden]:hidden');

export const avatarFallbackClassNames = cn(
  'inline-flex items-center justify-center select-none data-[state=hidden]:hidden',
);

export const avatarOverlayClassNames = cn(
  'hidden size-full place-items-center text-icon-primary',
  // `group-disabled` is emitted after `group-hover`, so a disabled root shows no hover overlay —
  // unless it is forced (`visible`, e.g. the upload loader on a disabled trigger).
  'group-hover/avatar:grid group-focus-visible/avatar:grid group-disabled/avatar:not-data-[visible]:hidden',
  'data-[visible]:grid',
  'group-has-[>img[data-state=visible]]/avatar:bg-component-avatar-overlay',
);

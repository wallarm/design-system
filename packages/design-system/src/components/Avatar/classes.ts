import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

// The root is the row: the plate layers (image, fallback, overlay) share grid cell 1/1 and an
// optional AvatarContent takes column 2. Without content the grid has one track, so no gap shows
// and the box is exactly the plate.
export const avatarVariants = cva(
  cn(
    'group/avatar inline-grid shrink-0 items-center gap-x-6 align-middle font-sans',
    // Clamp only a user item, so its text can truncate; a bare plate stays exactly the plate size
    // (NavRail puts a 24px plate with -m-4 inside a 16px box).
    'has-[>[data-slot=avatar-content]]:max-w-full',
    // With the edit overlay showing over the fallback, the icon swaps rather than stacking
    // (Figma 2159:1698): the fallback keeps its plate (tint + stroke) but its content steps aside —
    // `text-transparent` for initials (a text node), `*:invisible` for an icon or custom children.
    // Gated through `hover:` / `focus-visible:` so they sit in the same `@media (hover: hover)` as the
    // overlay's `group-hover` — a raw `:hover` would leave an empty plate after a tap on touch devices.
    'hover:not-disabled:[&:has(>[data-slot=avatar-overlay])>[data-slot=avatar-fallback]]:text-transparent',
    'hover:not-disabled:[&:has(>[data-slot=avatar-overlay])>[data-slot=avatar-fallback]>*]:invisible',
    'focus-visible:[&:has(>[data-slot=avatar-overlay])>[data-slot=avatar-fallback]]:text-transparent',
    'focus-visible:[&:has(>[data-slot=avatar-overlay])>[data-slot=avatar-fallback]>*]:invisible',
    '[&:has(>[data-slot=avatar-overlay][data-visible])>[data-slot=avatar-fallback]]:text-transparent',
    '[&:has(>[data-slot=avatar-overlay][data-visible])>[data-slot=avatar-fallback]>*]:invisible',
    // Interactive root (as='button' / asChild → <button>).
    'enabled:cursor-pointer disabled:cursor-not-allowed',
    'focus-visible:ring-3 focus-visible:ring-focus-primary focus-visible:outline-none',
  ),
  {
    variants: {
      // The root carries the plate radius too: the focus ring follows the plate, or wraps the whole
      // row when AvatarContent is present.
      size: {
        sm: 'rounded-8',
        md: 'rounded-8',
        lg: 'rounded-12',
      },
    },
    defaultVariants: { size: 'lg' },
  },
);

export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>['size']>;

/** Box shared by every plate layer: one grid cell, the plate size and radius, clipped. */
export const avatarPlateVariants = cva('col-start-1 row-start-1 overflow-hidden', {
  variants: {
    size: {
      sm: 'size-20 rounded-8',
      md: 'size-24 rounded-8',
      lg: 'size-32 rounded-12',
    },
  },
  defaultVariants: { size: 'lg' },
});

// Ark toggles visibility with the `hidden` attribute, which any display utility overrides.
// The Photo plate keeps the tint under the image (Figma Type=Photo), visible through transparent photos.
export const avatarImageClassNames = cn(
  'bg-states-primary-hover object-cover data-[state=hidden]:hidden',
);

// The fallback is the plate itself (tint + stroke); Ark hides it once a photo is visible, so a
// photo never shows a stroke.
export const avatarFallbackVariants = cva(
  cn(
    'inline-flex items-center justify-center select-none data-[state=hidden]:hidden',
    'border border-border-primary bg-states-primary-hover text-xs font-medium',
    'branded:border-border-brand branded:bg-states-brand-hover',
  ),
  {
    variants: {
      // Initials are text; the icon is an icon. Both follow the Branded frame (Figma 12336:5504).
      initials: {
        true: 'text-text-primary branded:text-text-brand',
        false: 'text-icon-primary branded:text-icon-brand',
      },
    },
    defaultVariants: { initials: false },
  },
);

export const avatarOverlayClassNames = cn(
  'hidden place-items-center text-icon-primary',
  // `group-disabled` is emitted after `group-hover`, so a disabled root shows no hover overlay —
  // unless it is forced (`visible`, e.g. the upload loader on a disabled trigger).
  'group-hover/avatar:grid group-focus-visible/avatar:grid group-disabled/avatar:not-data-[visible]:hidden',
  'data-[visible]:grid',
  'group-has-[>img[data-state=visible]]/avatar:bg-component-avatar-overlay',
);

export const avatarContentClassNames = cn(
  'col-start-2 row-start-1 flex min-w-0 flex-col text-left',
);

// Per-size text lives here, so a size-specific change is a one-line edit.
export const avatarNameVariants = cva('truncate font-normal text-text-primary', {
  variants: {
    size: { sm: 'text-sm', md: 'text-sm', lg: 'text-sm' },
  },
  defaultVariants: { size: 'lg' },
});

export const avatarDescriptionVariants = cva('truncate font-normal text-text-secondary', {
  variants: {
    size: { sm: 'text-xs', md: 'text-xs', lg: 'text-xs' },
  },
  defaultVariants: { size: 'lg' },
});

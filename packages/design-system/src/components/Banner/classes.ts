import { cva } from 'class-variance-authority';

export type BannerColor = 'primary' | 'secondary' | 'destructive' | 'info' | 'warning';

/**
 * Root container styles.
 *
 * The Banner is full-width and edge-to-edge (no border, no radius) since it
 * renders at the very top of the page, above the header.
 *
 * NOTE: this component is tagged "No dark-ui" in Figma — it is not meant to
 * adapt to the dark theme. The semantic tokens below reflect the Figma
 * (light-mode) mapping; revisit if dark-mode behavior is ever specced.
 */
export const bannerVariants = cva(
  'font-sans flex w-full items-start justify-between gap-8 overflow-hidden pl-16 pr-12 py-12',
  {
    variants: {
      color: {
        primary: 'bg-component-toast-bg',
        secondary: 'bg-bg-surface-5',
        destructive: 'bg-bg-danger',
        info: 'bg-bg-info',
        warning: 'bg-bg-warning',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  },
);

// `py-2` keeps a single-line title 24px tall (20px line-height + 2+2), matching
// the icon block so the banner height is identical with and without a leading
// icon. Truncation (`truncate` for 1 line / `line-clamp-N` for more) is applied
// by the component based on the `lineClamp` prop.
export const bannerTitleVariants = cva('text-sm font-medium py-2 min-w-0 max-w-full', {
  variants: {
    color: {
      primary: 'text-text-primary-alt',
      secondary: 'text-text-primary',
      destructive: 'text-text-primary',
      info: 'text-text-primary',
      warning: 'text-text-primary',
    },
  },
  defaultVariants: {
    color: 'primary',
  },
});

export const bannerDescriptionVariants = cva('text-sm font-normal', {
  variants: {
    color: {
      primary: 'text-text-tertiary',
      secondary: 'text-text-secondary',
      destructive: 'text-text-secondary',
      info: 'text-text-secondary',
      warning: 'text-text-secondary',
    },
  },
  defaultVariants: {
    color: 'primary',
  },
});

export const bannerIconVariants = cva('shrink-0', {
  variants: {
    color: {
      primary: 'text-icon-primary-alt',
      secondary: 'text-icon-primary',
      destructive: 'text-icon-danger',
      info: 'text-icon-info',
      warning: 'text-icon-warning',
    },
  },
  defaultVariants: {
    color: 'primary',
  },
});

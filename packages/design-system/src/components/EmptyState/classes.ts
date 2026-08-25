import { cva } from 'class-variance-authority';

export type EmptyStateType = 'collection-empty' | 'no-results';

export const emptyStateVariants = cva('flex flex-col items-center text-center m-[0_auto]', {
  variants: {
    type: {
      'collection-empty': 'gap-16 py-24 max-w-[560px] min-w-[256px]',
      'no-results': 'gap-8 py-8 w-[240px]',
    },
  },
  defaultVariants: {
    type: 'collection-empty',
  },
});

/**
 * The medallion: a 36px raised tile holding a 16px glyph. `text-base` sets the
 * 16px em box, so an icon left at its default `size='inherit'` lands on spec
 * without every call site restating a size.
 *
 * There is deliberately no unframed variant — the spec never shows a bare glyph,
 * at either scale, so an illustration always carries the tile.
 *
 * The tile is `rounded-12`, not the 16px Figma reports. Figma draws it with
 * corner smoothing (an iOS-style squircle), which reads as flatter sides than
 * the same radius in CSS — a plain 16px radius on a 36px box collapses into a
 * circle. 12px matches the drawn silhouette.
 */
export const emptyStateIllustrationVariants = cva(
  'empty-state-medallion flex items-center justify-center shrink-0 size-36 rounded-12 border p-8 text-base text-icon-secondary',
);

export const emptyStateMessageVariants = cva('flex flex-col items-center', {
  variants: {
    type: {
      'collection-empty': 'gap-8',
      'no-results': 'gap-4',
    },
  },
  defaultVariants: {
    type: 'collection-empty',
  },
});

export const emptyStateTitleVariants = cva('text-center break-words', {
  variants: {
    type: {
      'collection-empty': 'font-pixel text-base leading-base text-text-primary',
      'no-results': 'font-sans-display text-sm font-medium text-text-secondary',
    },
  },
  defaultVariants: {
    type: 'collection-empty',
  },
});

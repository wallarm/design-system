import { cva } from 'class-variance-authority';

export type EmptyStateType = 'collection-empty' | 'no-results';

export const emptyStateVariants = cva('m-[0_auto] flex flex-col items-center text-center', {
  variants: {
    type: {
      'collection-empty': 'max-w-[560px] min-w-[256px] gap-16 py-24',
      'no-results': 'w-[240px] gap-8 py-8',
    },
  },
  defaultVariants: {
    type: 'collection-empty',
  },
});

/**
 * The medallion: a 36px raised tile holding a 20px glyph, which with `p-8` fills
 * the content box exactly — the hairline is an inset ring in the shadow list,
 * not a real border, so it doesn't eat into the padding. `text-xl` sets the
 * 20px em box, so an icon left at its default `size='inherit'` lands on spec
 * without every call site restating a size.
 *
 * The Figma master's placeholder is 16px at 10px padding, but every applied
 * instance and the medallion spec sheet itself use 20px at 8px — the file is
 * inconsistent here, and the 20/8 pairing is the one that fills the tile.
 *
 * There is deliberately no unframed variant — the spec never shows a bare glyph,
 * at either scale, so an illustration always carries the tile.
 *
 * `rounded-[15px]` is off the radius scale on purpose: it's the value Figma
 * reports for this node, and fitting a superellipse to the rendered outline
 * agrees — a plain circular corner at r=14.5 matches to 0.29px, and r=15 to
 * 0.35px, while the nearest token (16) is off by 0.73px. There is no corner
 * smoothing on this shape, so no `corner-shape` is needed.
 */
export const emptyStateIllustrationVariants = cva(
  'flex size-36 shrink-0 items-center justify-center rounded-[15px] empty-state-medallion p-8 text-xl text-icon-secondary',
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

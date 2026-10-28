import { cva } from 'class-variance-authority';

export const chainOfThoughtVariants = cva(
  'flex w-full list-none flex-col self-stretch text-xs leading-xs text-text-secondary',
);

// Hide only this step's own connector when it is the last step. A `group-last/step` variant on the
// connector would match ANY last ancestor step and hide every connector of a nested chain.
export const chainOfThoughtStepVariants = cva(
  'flex flex-col [&:last-child>[data-slot=chain-of-thought-connector]]:hidden',
  {
    variants: {
      simple: { true: 'not-first:mt-16', false: '' },
      // Mounted as `running` (live, not history): fade in and settle 4px down → 0. Only
      // opacity/translate, so the list's layout height lands in one frame (smooth-scroll safe).
      entered: {
        true: 'motion-safe:transition-[opacity,translate] motion-safe:duration-200 motion-safe:ease-out motion-safe:starting:translate-y-4 motion-safe:starting:opacity-0',
        false: '',
      },
    },
    defaultVariants: { simple: false, entered: false },
  },
);

export const chainOfThoughtRowVariants = cva('group/row flex w-full items-start gap-6 text-left', {
  variants: {
    interactive: {
      true: 'cursor-pointer rounded-4 outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
      false: '',
    },
  },
  defaultVariants: { interactive: false },
});

export const chainOfThoughtIconVariants = cva(
  'flex size-16 shrink-0 items-center justify-center text-icon-secondary [&_svg]:icon-md',
  {
    // `''` for running/done keeps the no-argument output byte-identical (AssistantMessageLoader).
    // Apply through `cn()` so `text-icon-danger` replaces the base `text-icon-secondary`.
    variants: {
      status: { running: '', done: '', error: 'text-icon-danger' },
    },
    defaultVariants: { status: 'done' },
  },
);

// running → done on an `entered` step: the paused shimmer stays underneath while the text fill
// fades transparent → secondary over it, so the shimmer fades out instead of snapping. Reduced
// motion / forced colors: `shimmer-text` already falls back to a plain color, so the fill is unset.
export const chainOfThoughtLabelVariants = cva('min-w-0 flex-1', {
  variants: {
    status: { running: 'shimmer-text', done: '', error: 'text-text-danger' },
    entered: {
      true: 'motion-safe:transition-[-webkit-text-fill-color,color] motion-safe:duration-200 motion-safe:ease-out',
      false: '',
    },
  },
  compoundVariants: [
    {
      entered: true,
      status: 'running',
      class: 'motion-safe:not-forced-colors:[-webkit-text-fill-color:transparent]',
    },
    {
      entered: true,
      status: 'done',
      class:
        'shimmer-text [animation-play-state:paused] motion-safe:not-forced-colors:[-webkit-text-fill-color:var(--color-text-secondary)]',
    },
  ],
  defaultVariants: { status: 'done', entered: false },
});

export const chainOfThoughtMetricVariants = cva(
  "ms-auto shrink-0 text-right font-mono [font-feature-settings:'liga'_0]",
);

export const chainOfThoughtLineVariants = cva(
  'flex w-16 shrink-0 justify-center py-2 before:w-px before:bg-border-primary',
  {
    variants: {
      // The step's connector shows when the next step mounts (display: none → flex), which
      // re-applies `@starting-style`: the line grows down from the row. `scale`, not `height`,
      // so layout does not move.
      entered: {
        true: 'motion-safe:origin-top motion-safe:transition-[scale] motion-safe:duration-200 motion-safe:ease-out motion-safe:starting:scale-y-0',
        false: '',
      },
    },
    defaultVariants: { entered: false },
  },
);

export const chainOfThoughtBodyVariants = cva(
  'flex min-w-0 flex-1 flex-col gap-16 py-12 pe-3 pl-6 [&_:is(h1,h2,h3,h4)]:font-medium [&_ul]:list-disc [&_ul]:ps-18',
);

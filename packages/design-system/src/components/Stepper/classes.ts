import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// A plain container: the bar styles live on the list, so the root can also hold step bodies
// and the Back / Next footer.
export const stepperVariants = cva('min-w-0');

export const stepperListVariants = cva('m-0 flex min-w-0 list-none items-start px-24 pb-12');

export const stepperItemVariants = cva('flex min-w-0 items-start');

// Two-column grid: the indicator spans both rows, the title sits on row 1 and the
// description on row 2, so a two-line step is 20 + 16 - 2 = 34px tall, as in Figma. The first
// row is an explicit 20px: with an `auto` row, Chrome gives the empty second row half the
// spanning indicator's height, so a one-line step would be 30px instead of 20px.
export const stepperTriggerVariants = cva(
  cn(
    'grid min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)] grid-rows-[20px] items-start gap-x-4 bg-transparent p-0 text-left',
    // Focus ring and radius follow BreadcrumbsItem, the closest text-like navigation trigger.
    'rounded-6 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
  ),
);

// Stepper keeps its compact 16px indicator and 12px check within NumericBadge's 20px height.
export const stepperIndicatorVariants = cva(
  "col-start-1 row-span-2 row-start-1 min-w-16 [font-feature-settings:'liga'_0] [&_svg]:icon-sm",
  {
    variants: {
      // Padding lives on each status, not the base: cva does not merge classes, so a base
      // `px-4 py-2` would beat upcoming's `px-3 py-1` in Tailwind's CSS order.
      status: {
        active: 'px-4 py-2',
        danger: 'px-4 py-2',
        // Figma keeps the badge 16px wide: the 12px check sits 2px from each edge.
        completed: 'px-2 py-2 text-icon-primary',
        // 16×20 including the border: the 1px border takes the place of 1px of padding.
        upcoming: 'px-3 py-1',
      },
    },
    defaultVariants: { status: 'upcoming' },
  },
);

export const stepperTitleVariants = cva(
  'col-start-2 row-start-1 block min-w-0 max-w-320 truncate font-sans font-normal text-sm',
  {
    variants: {
      status: {
        active: 'text-text-brand',
        danger: 'text-text-danger',
        completed: 'text-text-primary',
        upcoming: 'text-text-primary',
      },
    },
    defaultVariants: { status: 'upcoming' },
  },
);

// -mt-2 pulls the second row up so a two-line step is 34px tall.
export const stepperDescriptionVariants = cva(
  'col-start-2 row-start-2 -mt-2 block min-w-0 max-w-320 truncate font-sans text-text-secondary text-xs',
);

// h-20 + items-center keeps the line on the first 20px row, even on two-line items.
export const stepperSeparatorVariants = cva('flex h-20 w-32 shrink-0 items-center px-8');

export const stepperSeparatorLineClassNames = 'block h-px w-full bg-border-primary';

export const stepperContentVariants = cva('min-w-0');

import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// A plain container: the bar styles live on the list, so the root can also hold step bodies
// and the Back / Next footer.
export const stepperVariants = cva('min-w-0');

export const stepperListVariants = cva(
  'm-0 flex min-w-0 list-none items-start border-b-1 border-border-primary-light px-24 py-8',
);

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

// TODO(WDS-188): replace with the reworked NumericBadge. Upcoming mirrors NumericBadge `outline`
// colour tokens; its padding is px-3 (not NumericBadge's px-4) so the badge stays 16px wide.
export const stepperIndicatorVariants = cva(
  "col-start-1 row-span-2 row-start-1 inline-flex h-20 min-w-16 shrink-0 items-center justify-center rounded-full font-mono font-medium text-xs [font-feature-settings:'liga'_0]",
  {
    variants: {
      // Padding lives on each status, not the base: cva does not merge classes, so a base
      // `px-4 py-2` would beat upcoming's `px-3 py-1` in Tailwind's CSS order.
      status: {
        active: 'bg-states-brand-active px-4 py-2 text-text-brand',
        danger: 'bg-states-danger-active px-4 py-2 text-text-danger',
        // Figma keeps the badge 16px wide: the 12px check sits 2px from each edge.
        completed: 'bg-states-primary-active px-2 py-2 text-icon-primary',
        // 16×20 including the border: the 1px border takes the place of 1px of padding.
        upcoming:
          'border-1 border-border-primary bg-component-outline-button-bg px-3 py-1 text-text-primary',
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

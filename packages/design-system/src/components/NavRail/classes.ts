import { cva } from 'class-variance-authority';

export const navRailVariants = cva(
  'flex h-full shrink-0 flex-col overflow-hidden px-8 pt-6 pb-12 transition-[width] duration-200 ease-in-out',
  {
    variants: {
      mode: {
        expanded: 'w-[184px]',
        collapsed: 'w-[48px]',
        compact: 'w-[78px]',
      },
    },
    defaultVariants: { mode: 'expanded' },
  },
);

// Compact items are taller, so everything in the rail sits a little further apart.
const railGap = { expanded: 'gap-2', collapsed: 'gap-2', compact: 'gap-4' } as const;

export const navRailBodyVariants = cva(
  'flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-none [scrollbar-width:thin]',
  { variants: { mode: railGap }, defaultVariants: { mode: 'expanded' } },
);

export const navRailFooterVariants = cva('mt-auto flex flex-col', {
  variants: { mode: railGap },
  defaultVariants: { mode: 'expanded' },
});

// Each bar sits inside the item it stands in for, on the same pitch as the items, so nothing
// shifts when content arrives: 28px bars + 6px gap for 32px items, 38px bars + 8px gap for 42px.
export const navRailSkeletonVariants = cva('flex flex-col items-center py-2', {
  variants: { mode: { expanded: 'gap-6', collapsed: 'gap-6', compact: 'gap-8' } },
  defaultVariants: { mode: 'expanded' },
});

export const navRailItemVariants = cva(
  'overlay flex w-full cursor-pointer items-center rounded-10 text-sm text-text-primary transition-colors outline-none data-[state=open]:overlay-states-primary-active',
  {
    variants: {
      mode: {
        expanded: 'h-32 p-8',
        collapsed: 'h-32 p-8',
        // Icon over a label that may take two lines, so the height grows from 42px.
        compact: 'min-h-42 flex-col justify-center gap-2 px-8 py-6',
      },
      active: {
        // Branded: only the active item turns brand; inactive items stay neutral in every state.
        // The tooltip marks its trigger data-state=open on hover, so the open state is branded
        // too, or the neutral open fill above would turn the active item gray.
        true: 'overlay-states-primary-active branded:overlay-states-brand-active branded:data-[state=open]:overlay-states-brand-active branded:text-text-brand',
        false:
          'hover:overlay-states-primary-hover focus-visible:overlay-states-primary-hover active:overlay-states-primary-pressed',
      },
      // The signed-in user's item. In Branded its hover, pressed and open fills are brand; the name
      // stays text-primary and only the plate turns brand (NavRailItem).
      avatar: {
        true: 'branded:hover:overlay-states-brand-hover branded:focus-visible:overlay-states-brand-hover branded:active:overlay-states-brand-pressed branded:data-[state=open]:overlay-states-brand-active',
        false: '',
      },
    },
    defaultVariants: { mode: 'expanded', active: false, avatar: false },
  },
);

// Up to two lines, wrapping only at spaces. Each line that is still too long gets its own
// ellipsis (e.g. "API / Vulnera…"). The label is 56px wide inside a 62px item, so it overhangs
// the item's 8px side padding on purpose and still keeps 3px off the edge.
export const navRailItemCompactLabelClassName =
  'line-clamp-2 w-56 shrink-0 text-center text-2xs font-medium text-ellipsis break-normal';

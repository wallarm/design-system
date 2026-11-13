import { cn } from '../../utils/cn';

/** The overlay surface shared by PopoverContent and HoverCardContent. Internal, not exported from index.ts. */
export const popoverSurfaceClassNames = cn(
  // Visual
  'p-12 bg-bg-surface-2 rounded-12 border border-border-primary-light shadow-md text-text-primary',
  // Leveling: layer-aware so an overlay opened inside a nested drawer/dialog stacks above that
  // dialog's positioner — zag sets --layer-index inline on this node when it opens, and popper
  // mirrors the computed z-index into the positioner's --z-index (same mechanism as
  // DropdownMenu/Select, see DropdownMenu/classes.ts).
  'z-[calc(var(--drawer-positioner-z-index)+(var(--layer-index,0)*var(--drawer-level-ratio)))]',
  // Contain wheel chaining on this scroll container so wheel events past the scroll boundary don't
  // propagate to whatever scrollable lives below — overlays are portaled and frequently open above a
  // non-modal surface (e.g. a `modal={false}` Drawer), where chained scroll would otherwise move the
  // page underneath.
  'overscroll-contain',
  // Animations
  'animate-in fade-in-0 zoom-in-95 origin-(--transform-origin)',
  // Animation closed
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  // Animation per side
  'data-[side=bottom]:slide-in-from-top-2',
  'data-[side=left]:slide-in-from-right-2',
  'data-[side=right]:slide-in-from-left-2',
  'data-[side=top]:slide-in-from-bottom-2',
);

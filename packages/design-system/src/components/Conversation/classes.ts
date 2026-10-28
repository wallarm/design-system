import { cva } from 'class-variance-authority';

export const conversationVariants = cva('relative flex min-h-0 flex-1 flex-col');

/**
 * The scroller (ChatBody). `overflow-anchor: none`: browser scroll anchoring would shift
 * scrollTop on its own as content grows and fight the stick-to-bottom animator. Focus ring inset:
 * not clipped.
 */
export const conversationScrollerVariants = cva(
  'outline-none [overflow-anchor:none] focus-visible:ring-3 focus-visible:ring-focus-primary focus-visible:ring-inset',
);

/** The inner measured column: no gap — the 30px actions row spaces the messages (v1 §3.1). */
export const conversationContentVariants = cva('flex flex-col');

/** Zero-height focus target; its ring draws a bar at the end of the thread. */
export const conversationEndVariants = cva(
  'block shrink-0 outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
);

export const conversationEmptyStateVariants = cva('flex flex-col');

// Floats the stock Button. It lives on a wrapper, never on the Button: Button's hover overlay
// (`overlay-*`) sets `position: relative`, which would pull it into the flex flow on hover and
// shrink the log by 24px.
export const conversationScrollButtonVariants = cva(
  'absolute bottom-12 left-1/2 flex -translate-x-1/2',
);

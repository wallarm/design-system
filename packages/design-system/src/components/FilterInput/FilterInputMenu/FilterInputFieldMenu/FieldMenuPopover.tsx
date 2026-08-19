import { type FC, useEffect } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react';
import { PopoverContent } from '../../../Popover';
import { Separator } from '../../../Separator';
import { useFloatingRecomputeOn } from '../../hooks/useFloatingRecomputeOn';

export interface FieldMenuPopoverProps {
  /** Menu open AND a described field is highlighted. */
  open: boolean;
  /** Filter name, shown monospace, matching the menu label's casing. */
  title: string;
  /** Short "what it filters by" description. */
  description: string;
  /** Optional monospace example block (wildcards, path patterns, ranges, IDs). */
  example?: string;
  /** Live rect of the highlighted row the popover aligns to. */
  getAnchorRect: () => DOMRect | null;
  /** Highlighted id; a change pokes a reposition as the anchor swaps between rows. */
  repositionKey: string;
}

// Anchored to the right of the field menu, aligned to the highlighted row's top;
// flips to the left when the menu opens too close to the right viewport edge.
const POPOVER_POSITIONING: ArkUiPopover.RootProps['positioning'] = {
  placement: 'right-start',
  gutter: 8,
  flip: true,
  overflowPadding: 8,
};

/**
 * Discovery popover for the field-selection menu: on hover or keyboard focus of a
 * filter attribute, surfaces its title, description, and optional example (AS-1060).
 * Fully controlled by `open` + `getAnchorRect`; no trigger, never takes focus.
 */
export const FieldMenuPopover: FC<FieldMenuPopoverProps> = ({
  open,
  title,
  description,
  example,
  getAnchorRect,
  repositionKey,
}) => {
  useFloatingRecomputeOn(repositionKey, open);

  // A virtual anchor (getAnchorRect) isn't tracked by floating-ui's ancestor
  // scroll, so poke a reposition on any scroll (capture catches the menu's inner,
  // non-bubbling scroll), rAF-throttled.
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        window.dispatchEvent(new Event('resize'));
      });
    };
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [open]);

  return (
    <ArkUiPopover.Root
      open={open}
      positioning={{ ...POPOVER_POSITIONING, getAnchorRect }}
      // Passive panel: never take focus or self-close — visibility is owned by `open`.
      autoFocus={false}
      closeOnInteractOutside={false}
      closeOnEscape={false}
      modal={false}
      lazyMount
      unmountOnExit
    >
      <PopoverContent
        minWidth='240px'
        maxWidth='340px'
        // pointer-events-none: a stray hover over the panel must not affect the menu.
        className='gap-6 pointer-events-none'
        data-testid='field-menu-popover'
      >
        <p className='font-mono text-sm leading-sm text-text-primary'>{title}</p>
        <p className='text-xs leading-xs text-text-secondary'>{description}</p>
        {example && (
          <>
            <Separator spacing={8} />
            <pre className='m-0 font-mono text-xs leading-xs text-text-secondary whitespace-pre-wrap'>
              {example}
            </pre>
          </>
        )}
      </PopoverContent>
    </ArkUiPopover.Root>
  );
};

FieldMenuPopover.displayName = 'FieldMenuPopover';

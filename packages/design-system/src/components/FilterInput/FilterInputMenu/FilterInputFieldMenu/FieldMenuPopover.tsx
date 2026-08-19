import type { FC } from 'react';
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
  /** Live rect of the highlighted `_dd-item` the popover aligns to. */
  getAnchorRect: () => DOMRect | null;
  /**
   * Highlighted item id. floating-ui's autoUpdate only listens for resize/scroll,
   * not for a lateral anchor swap as the highlight moves between rows, so a change
   * here pokes a reposition (mirrors the menu's own `useFloatingRecomputeOn`).
   */
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
 * filter attribute, it surfaces that attribute's title, description, and optional
 * example block (AS-1060). Fully controlled by `open` + `getAnchorRect` — it has no
 * trigger of its own and never takes focus, so keyboard navigation stays in the
 * menu. Group headers are not navigable items, so they never drive it open.
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

  return (
    <ArkUiPopover.Root
      open={open}
      positioning={{ ...POPOVER_POSITIONING, getAnchorRect }}
      // Passive panel: never grab or trap focus (keyboard nav lives in the menu),
      // and never self-close — visibility is owned entirely by `open`.
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
        // Presentational only: pointer-events-none keeps a stray hover over the
        // panel from re-triggering menu highlight logic or trapping the pointer.
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

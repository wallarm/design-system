import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

/**
 * Root layout for the Slider control.
 *
 * Single fixed size for v1 — no `sm`/`md` axis (see
 * `docs/slider-handoff-requirements.md` §4). State styling
 * (hover / focus / dragging / invalid) is driven by Ark `data-*` attributes on
 * the individual parts and lands in Phase 2; only the root-level disabled
 * treatment (the whole control at 50% opacity, per requirements §5) lives here.
 */
export const sliderVariants = cva(
  cn(
    // The root IS the layout row: inline `SliderInput`(s) flank a flex-growing
    // `SliderControl`, 8px gap (Figma `spacing-8`). With a single control child the
    // gap is inert.
    'relative flex w-full touch-none select-none items-center gap-8',
    // Reserve room below the track for the tick-label band when <SliderMarks> renders
    // (overlaid absolutely). Replaces the old JS-driven `pb-28`.
    '[&:has([data-slot=slider-marker-group])]:pb-28',
    // Disabled — whole control dimmed + non-interactive (requirements §5)
    'data-disabled:opacity-50 data-disabled:cursor-not-allowed',
  ),
  {
    variants: {},
    defaultVariants: {},
  },
);

/**
 * Pointer-interaction area that holds the track + thumb(s).
 *
 * NOTE: this codebase's Tailwind spacing scale is 1 unit = 1px (e.g. `h-36`
 * is 36px), so geometry numbers here are pixel values, not the stock Tailwind
 * 0.25rem step.
 */
export const sliderControlClassNames = cn(
  'relative flex w-full grow items-center',
  // Vertical room so the 16px thumb sits centred on the 4px track + a clickable band
  'py-8 cursor-pointer',
  'data-dragging:cursor-grabbing',
  'data-disabled:cursor-not-allowed',
);

/**
 * Unfilled rail (4px). Tokenised to `states/primary-pressed` (requirements §4 +
 * decision #6). Corners use Figma's literal 1px (no `radius-1` token exists) —
 * deliberately near-square, NOT a pill (matches the `slider` component).
 */
export const sliderTrackClassNames = cn(
  'relative h-4 w-full grow overflow-hidden rounded-[1px] bg-states-primary-pressed',
);

/** Filled progress from the origin to the thumb. */
export const sliderRangeClassNames = cn('h-full rounded-[1px] bg-bg-fill-brand');

/**
 * Tick overlay. Ark positions each `Marker` absolutely at its value's percent
 * (inline style), so the group is just a non-interactive layer spanning the
 * control; individual markers opt back into pointer events for click-to-jump.
 */
// Override Ark's inline `position: relative` (`!absolute`) so the group overlays
// the full control width; without this it collapses as a flex child and the
// percent-positioned markers cluster. Anchored at the track's vertical centre.
export const sliderMarkerGroupClassNames = cn('pointer-events-none !absolute inset-x-0 top-1/2');

/**
 * A single tick: a short mark just below the track + an optional label under it.
 * Ark applies `position:absolute`, the percent offset, AND horizontal centring
 * via the CSS `translate` property — so we must NOT add a transform-translate
 * here (it would double-shift). Tokens: mark `states/primary-pressed`, label
 * `text/secondary` (requirements §4).
 */
export const sliderMarkerClassNames = cn(
  // Mirrors the Figma `_tick` (node 11354:62): flex-col, 4px gap. `mt-10` lands
  // the mark 8px below the track (the Figma `pt-8` distance) while keeping the
  // box clear of the 16px thumb so it never intercepts a drag.
  'mt-10 flex flex-col items-center gap-4',
  // Tick mark: 4×6px, radius-2, states/primary-pressed — a CONSTANT colour
  // across every state (no hover/selected recolour of the mark; matches Figma).
  "before:h-6 before:w-4 before:rounded-2 before:bg-states-primary-pressed before:content-['']",
  // Label: 12px (text-xs), regular. Default = secondary; colour shifts by state.
  'text-xs whitespace-nowrap text-text-secondary tabular-nums',
  // Interactive: click-to-jump moves the nearest thumb here. `!pointer-events-auto`
  // overrides Ark's inline `pointer-events:none`. Keyboard equivalent is
  // arrow-stepping through values (requirements §7.2), so ticks are not tab stops.
  '!pointer-events-auto cursor-pointer',
  // Label colour by state (Figma `_tick`): selected (Ark `at-value`, the tick
  // equal to the current value) → primary; hover → brand and wins when both.
  'data-[state=at-value]:text-text-primary hover:text-text-brand',
  // Disabled — root handles the 50% opacity; just drop the affordance.
  'data-disabled:pointer-events-none data-disabled:cursor-not-allowed',
);

/**
 * Draggable handle — the real interactive node (`role="slider"`, focusable).
 * Consumer `data-*` / `aria-*` / `ref` / event props land here (see
 * `docs/metrics/contract.md`), never on the Ark Root wrapper.
 */
export const sliderThumbClassNames = cn(
  // Visual: 12×16 portrait rounded-rect (radius-4), surface-3 fill + brand
  // border — matches Figma `slider` handle (node 11354:70), not a circle.
  'h-16 w-12 rounded-4 border-2 border-bg-fill-brand bg-bg-surface-3 shadow-sm',
  'cursor-grab outline-none',
  // Only transition emphasis props — NOT Ark's positioning transform, or the
  // thumb would lag the pointer mid-drag. `border-width` rides along so the
  // pressed border thickens smoothly.
  'transition-[scale,box-shadow,border-color,border-width] duration-150',
  // ≥44px touch target around the 12×16 visual (spec §7 / WCAG 2.5.8)
  "before:absolute before:left-1/2 before:top-1/2 before:size-44 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
  // Hover + keyboard focus share ONE emphasised visual (requirements §5, decision #1
  // — focus reuses Hover, no distinct ring). Enlarge + lift.
  'not-data-disabled:hover:scale-110 not-data-disabled:hover:shadow-md',
  'focus-visible:scale-110 focus-visible:shadow-md',
  // Pressed / dragging — per-thumb. On top of the hover emphasis, the border
  // thickens 2px→3px (Figma `pressed`, Border-width/border-3) and lifts to
  // shadow-md. Keyed on Ark's `data-dragging` (the sustained drag) + `:active`
  // (instant pointer-down feedback) so only the grabbed thumb reacts.
  'active:scale-110 active:cursor-grabbing active:border-[3px]',
  'data-dragging:scale-110 data-dragging:cursor-grabbing data-dragging:border-[3px] data-dragging:shadow-md',
  // Invalid (field-level error → Ark Root data-invalid): handle border goes danger.
  '[[data-invalid]_&]:border-border-strong-danger',
  // Disabled — non-interactive; root handles the 50% opacity.
  'data-disabled:pointer-events-none data-disabled:cursor-not-allowed',
);

/**
 * Each inline value Input: a fixed 48px-wide box (Figma `_text-box`), centred
 * tabular digits, `shrink-0` so it holds its width beside the growing track.
 * `px-8` trims the DS Input's default `px-12` so a 3-digit value fits the 48px.
 */
export const sliderInputBoxClassNames = cn('w-48 shrink-0 px-8 text-center tabular-nums');

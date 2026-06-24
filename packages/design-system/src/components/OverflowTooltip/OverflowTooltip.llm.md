# OverflowTooltip — usage

> A `Tooltip` that appears **only when its target's text is actually truncated** — it
> auto-detects overflow and stays silent when the text fits. Compound
> (`OverflowTooltip` + `OverflowTooltipTrigger` + `OverflowTooltipContent`), built on
> `Tooltip`. A code-level utility — reach for it by behavior, not by browsing a design.

## Reach for it when
You're showing text that may be clipped by `truncate` / `line-clamp` in a
width-constrained spot — a **table cell, dense list row, chip, or any fixed-width
label** — and you want the full value on hover/focus **only when it's actually cut
off**. It measures overflow itself and disables the tooltip when the text fits, so you
never hand-roll a measure-then-conditionally-show. It's built to stay cheap in
**virtualized tables / long lists**: it attaches its observers lazily on pointer-enter,
not for every row up front.

## Don't use it for
- **A label or hint that should always show** — naming an icon control, a shortcut, any *supplementary* context → plain `Tooltip`. OverflowTooltip is conditional on truncation and **mirrors the trigger's own text**; it's not for adding new information.
- **Showing different / extra content than the trigger's text** → plain `Tooltip`. This one reveals the same value that got clipped.
- **Interactive or rich content** → `Popover` (same boundary it inherits from `Tooltip`).
- **Preventing truncation** → it *reveals* clipped text, it doesn't stop the clipping. If the text shouldn't truncate at all, fix the layout/width instead.
- **The only way to reach *essential* clipped data** → don't rely on hover alone. A conditional hover reveal can be missed by keyboard/touch users and gives no cue the text is even clipped; if the full value is essential (a complete endpoint path, an IP), also offer copy / a detail view / an expand. (Same spirit as `Tooltip`: nothing essential lives *only* in a tooltip.)

## How it works — the rules that make it fire
- **The truncating element must *be* the trigger's single child** — the cloned child node is the one watched, so the `truncate` / `line-clamp-N` (or any clipping) class must sit on **that node**, not on a wrapper around it or a child inside it. No clipping on the cloned node → it never overflows → the tooltip never shows. (The two usual "it never fires" causes: no clip class at all, or the clip class is on the wrong node.)
- **Detection + observers are automatic** (ResizeObserver + MutationObserver, attached lazily on hover) — don't wire your own overflow check or `ref` measurement.
- **Inherits `Tooltip`'s locked look** (dark surface, xs/medium, positioning); `OverflowTooltipContent` adds wrapping so the full value reads on multiple lines.

## Judgment calls
- **`forceTooltip`** — show even when the text isn't overflowing. Off by default. Its real use is **uniformity**: a mixed list/column where most rows truncate but a few don't, and you want the *same* component everywhere instead of branching to a plain `Tooltip` for the short rows. (If *every* instance should always show regardless of width, just use `Tooltip`.)
- **`maxWidth`** on the content (default `400`) — widen/narrow the revealed popover.
- **`positioning`** — passthrough to `Tooltip` for side/offset when the default needs adjusting.

## Pairs with
- `Tooltip` — what it's built on; the boundary is **conditional-on-overflow (this)** vs **always-on (`Tooltip`)**.
- `Table` cells / list rows / chips — the prime hosts (the `Table` doc points truncating cells at display components wrapped in `OverflowTooltip`).
- Truncating display components (`ParameterPath`, `Ip`, a long `Text` / `Link`) — the content it reveals.

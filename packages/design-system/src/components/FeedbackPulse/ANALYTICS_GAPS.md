# FeedbackPulse — Analytics Gaps

Single source of truth for `FeedbackPulse`'s analytics-readiness gap, per
[`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md) (Closed-Target Gaps). It records
the interactive targets a consumer **cannot** attach `data-analytics-id` / `data-analytics-props` (or
arbitrary `data-*` / `aria-*` / `ref`) to, why, the callback-based workaround, the owner, and the next
decision point.

Audited: 2026-07-13 · Owner: Artem Miskevich

## CG-1 — All interactive targets are internal/closed

- **Where:** the five score `ToggleButton` radios (`role="radio"`), the `Textarea` comment field, and the
  Send / Close `Button`s — all rendered internally by `FeedbackPulse.tsx`. The component is a closed
  facade (no `children`, no exported sub-components), so none of these nodes is individually
  reachable by a consumer.
- **Why a gap:** there is no composition seam — the public API is `open` / `onOpenChange` / `onSubmit` +
  display-copy props only. A consumer cannot render, substitute, or attach attributes to any one radio,
  the textarea, or either button.
- **Workaround:** analytics is intentionally derived from the two typed callbacks instead of DOM
  attributes — `onSubmit({ score, comment })` (fires once, on Send) and `onOpenChange(open, reason)`
  (`reason: 'submit' | 'dismiss'`, fires on every close path). Together they give a richer, structured
  payload (which score, whether a comment was left, how it closed) than a raw click id would.
- **Root/wrapper passthrough deliberately not provided:** adding arbitrary attribute passthrough to the
  root `<div role="dialog">` would not close the gap — the real targets stay internal — and would
  itself be the contract's wrapper anti-pattern (attribution on a container when the actual click target
  is inside it).
- **Owner:** Artem Miskevich.
- **Next decision point:** revisit only if a product need for per-score DOM-level telemetry emerges
  (beyond the `onSubmit` payload) — mirroring `Slider`'s `SliderThumb` resolution, by exposing the score
  control as an addressable sub-component. Not pre-emptive.

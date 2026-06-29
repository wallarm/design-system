# Slider — Analytics Gaps

Single source of truth for `Slider`'s analytics-readiness gaps, per
[`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md) (Closed-Target Gaps). It records
every interactive target a consumer **cannot yet** attach `data-analytics-id` / `data-analytics-props`
(or arbitrary `data-*` / `aria-*` / `ref`) to, why, the workaround, the owner, and the next decision point.

Audited: 2026-06-26 (pre-flight, `/metrics-audit`) · Updated: 2026-06-29 (Phase 3 — range landed) ·
Owner: Design System team — metrics rollout

## Already covered (not gaps)

The real interactive node is the **thumb** (`role="slider"`, focusable, draggable). The consumer's
arbitrary `data-*` / `aria-*` / `id` / `ref` / event props are spread onto the **primary thumb**
(`Slider.Thumb index={0}`) — never the Ark `Slider.Root` wrapper. This deliberately avoids the
`NumberInput` gap (which strands rest props on its Root). See `Slider.tsx` (`...thumbProps` → primary thumb).
Accessible names are the one exception: `aria-label` / `aria-labelledby` route through the Ark Root's
per-thumb array, which Ark redistributes back onto each `role="slider"` thumb node (so they still land on
the real node, just via the labelling mechanism Ark provides for multi-thumb).

| Target | Seam | Node |
| --- | --- | --- |
| Thumb (single value, or the low/primary thumb of a range) | top-level `Slider` `{...rest}` → `Slider.Thumb index={0}` | `<div role="slider">` |

Track click and pointer drag have **no discrete DOM click target** an SDK can resolve — they are value
gestures, observable via the `onValueChange` / `onValueChangeEnd` callbacks. Not a gap (decision-tree
"custom interaction with no DOM click → typed callback").

## Accepted closed-target gaps

### CG-1 — Range high thumb per-thumb attribution  ·  *accepted (resolved Phase 3)*

- **Where:** the range variant renders **two** thumbs (`index={0}` low/primary, `index={1}` high). The flat
  `Slider` forwards `{...rest}` to the **primary** thumb only, so the **high** thumb cannot carry its own
  consumer `data-analytics-id` (e.g. `PRICE_MIN` on the low vs `PRICE_MAX` on the high).
- **Decision (Phase 3):** keep the **flat, config-driven API** (requirements §2/§3 — thumbs are private
  atoms, not exported sub-components) and accept this as a **documented closed-target gap**, the route the
  metrics contract explicitly permits alongside an exported seam (the same route `Table/ANALYTICS_GAPS.md`
  takes for its drag/gesture targets — the live in-repo precedent). We did **not** export `SliderThumb` —
  doing so would contradict the agreed flat API and create
  two ways to render thumbs. The low/primary thumb is fully addressable; only the high thumb's discrete
  attribution is deferred.
- **Why acceptable:** a range is one logical control. The value change (which thumb moved, to what) is fully
  observable via the typed callbacks; discrete per-thumb DOM attribution is rarely needed and never silently
  dropped — it is recorded here.
- **Interim workaround:** `onValueChange` / `onValueChangeEnd` deliver `[low, high]`; the consumer attributes
  the value change (and which index moved) outside the DS. `data-analytics-id` on the primary thumb still
  identifies the control as a whole.
- **Owner:** Design System team — metrics rollout.
- **Next decision point:** revisit only if a concrete consumer needs distinct per-thumb event attribution —
  then evaluate a typed per-thumb labelling/attribution prop (not a `slotProps` analytics escape hatch).

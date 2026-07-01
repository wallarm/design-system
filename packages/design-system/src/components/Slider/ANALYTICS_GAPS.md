# Slider — Analytics Gaps

Single source of truth for `Slider`'s analytics-readiness gaps, per
[`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md) (Closed-Target Gaps). It records
every interactive target a consumer **cannot yet** attach `data-analytics-id` / `data-analytics-props`
(or arbitrary `data-*` / `aria-*` / `ref`) to, why, the workaround, the owner, and the next decision point.

Audited: 2026-06-26 (pre-flight, `/metrics-audit`) · Updated: 2026-06-30 (compound rework — CG-1 resolved) ·
Updated: 2026-07-01 (PR #192 review — `SliderInput` now forwards `{...rest}`/`ref`; markers documented as value gestures) ·
Owner: Design System team — metrics rollout

## Already covered (not gaps)

The real interactive node is the **thumb** (`role="slider"`, focusable, draggable), exposed as the
**`SliderThumb`** sub-component. The consumer's arbitrary `data-*` / `aria-*` / `id` / `ref` / event props
(canonically `data-analytics-id` / `data-analytics-props`) are spread onto each `SliderThumb`'s Ark thumb
node — never the Ark `Slider.Root` wrapper. This deliberately avoids the `NumberInput` gap (which strands rest
props on its Root). See `SliderThumb.tsx` (`{...rest}` → `ArkSlider.Thumb`).

Because the consumer renders **one `SliderThumb` per thumb**, every thumb — single, low, and high — is
independently addressable:

```tsx
<SliderControl>
  <SliderThumb index={0} data-analytics-id="PRICE_MIN" />
  <SliderThumb index={1} data-analytics-id="PRICE_MAX" />
</SliderControl>
```

The inline **`SliderInput`** (`SliderThumb`'s numeric-entry sibling) is also a real interactive node — a
DS `Input` (`<input>`) — and forwards the consumer's arbitrary `data-*` / `aria-*` / `id` / `ref` straight
through via `{...rest}` (`SliderInputProps extends InputHTMLAttributes<HTMLInputElement>`). See
`SliderInput.tsx`.

| Target | Seam | Node |
| --- | --- | --- |
| Each thumb (single value, or any thumb of a range) | the `SliderThumb` sub-component's `{...rest}` | `<div role="slider">` |
| The inline numeric box | the `SliderInput` sub-component's `{...rest}` / `ref` | `<input>` |

Track click, pointer drag, and **tick click-to-jump** have **no meaningfully-attributable discrete click
target** — they are value gestures (each moves the nearest thumb to a value), observable via the
`onValueChange` / `onValueChangeEnd` callbacks. Individual `SliderMarks` ticks are therefore *not*
per-tick addressable: marks are a `{ value, label }` data model (they also drive `aria-valuetext`), not
exported per-mark sub-components. This is the decision-tree "custom interaction with no discrete DOM click →
typed callback" case, not an accepted closed-target gap. If a product genuinely needs per-tick attribution,
the escalation is a `renderMark` render-prop (keeps the data model, adds a visual/attribute seam) rather
than full `<SliderMark>` compounding — file it then, not pre-emptively.

## Resolved gaps

### CG-1 — Range high thumb per-thumb attribution  ·  *RESOLVED (compound rework, 2026-06-30)*

- **Was:** the original **flat** `Slider` forwarded `{...rest}` to the **primary** thumb only, so a range's
  **high** thumb could not carry its own consumer `data-analytics-id` (`PRICE_MIN` on the low vs `PRICE_MAX` on
  the high). It was accepted as a documented closed-target gap.
- **Resolution:** the compound rework (PR #192 review) exposes **`SliderThumb`** as a real, addressable
  sub-component — the "exported seam" route the metrics contract permits. Each thumb now carries its own
  consumer attributes; there is **no remaining closed target** on the Slider. The value change is still also
  observable via `onValueChange` / `onValueChangeEnd` for consumers that prefer the typed callback.
- **Owner:** Design System team — metrics rollout.

No accepted (open) closed-target gaps remain for `Slider`.

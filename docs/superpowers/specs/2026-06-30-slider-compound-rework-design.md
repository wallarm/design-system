# Slider — compound-component rework (design)

> **Status:** approved design (designer: Artem) · 2026-06-30
> **Driver:** PR [#192](https://github.com/wallarm/design-system/pull/192) review — maintainer `ipwallarm`
> asked to "rework it to a compound-component pattern like other components."
> **Supersedes:** requirements decision **#12** (flat API, value-readout as plain composition) and
> engineering-review judgment call **#1** (flat API + documented closed-target gap). Both were confirmed at
> the 2026-06-29 *designer-led* review; this rework lands the *maintainer's* convention call.

## 1. Why

The Slider shipped with a **flat, config-driven API** (`<Slider value marks input tooltip error />`). That was a
deliberate, documented choice anchored to the two sibling Ark wraps the build mirrored — **`NumberInput`** and
**`SegmentedControl`**, both flat. The maintainer wants it to match the **compound** form-control family
(`Checkbox` / `Radio` / `Switch` / `Select`) instead.

The house pattern is genuinely **split**, so this is a convention call the code-owner owns — not a correctness
fix. We comply. The rework also **closes a real, documented limitation**: the flat API can forward consumer
analytics/`data-*` to the **primary thumb only**, so a range slider's high thumb is an accepted closed-target
gap (`ANALYTICS_GAPS.md` CG-1). Exposing `SliderThumb` as a real sub-component makes **each thumb individually
addressable** and resolves CG-1 via the "exported seam" route the metrics contract permits.

Because PR #192 is **not merged**, there are **zero existing consumers** — so this is a clean **hard cut** to the
compound API. No flat-compat shim.

## 2. Decisions locked in brainstorming

1. **Lean compound (Switch/Checkbox idiom), not full Ark decomposition (Select idiom).** The root owns the Ark
   machine via props; the consumer composes a *few semantic parts*. The track + range "plumbing" — which nobody
   styles per-instance — is rendered **inside `SliderControl`**, not exposed as separate `SliderTrack` /
   `SliderRange` parts.
2. **`tooltip` is a per-thumb prop on `<SliderThumb>`**, not a root flag.
3. **`<SliderMarks>` lives inside `<SliderControl>`** (Ark positions markers on the track), not as a sibling.
4. **Hard cut** — remove the flat props entirely; no backwards-compat surface.

## 3. Public API

### Worked examples

```tsx
// Single value, in a Field — the common case
<Field>
  <FieldLabel>Risk threshold</FieldLabel>
  <Slider defaultValue={[50]} min={0} max={100}>
    <SliderControl>
      <SliderThumb />
    </SliderControl>
  </Slider>
</Field>

// Range, per-thumb analytics (the CG-1 closure), with an on-drag tooltip
<Slider value={v} onValueChange={setV} min={0} max={1000} step={10}>
  <SliderControl>
    <SliderThumb index={0} tooltip data-analytics-id="PRICE_MIN" />
    <SliderThumb index={1} tooltip data-analytics-id="PRICE_MAX" />
  </SliderControl>
</Slider>

// Ordinal / labeled scale
<Slider defaultValue={[1]} min={0} max={2} step={1}>
  <SliderControl>
    <SliderThumb />
    <SliderMarks marks={[{ value: 0, label: 'Low' }, { value: 1, label: 'Medium' }, { value: 2, label: 'High' }]} />
  </SliderControl>
</Slider>

// Paired inline inputs (precision path) — inputs flank the control, all inside <Slider>
<Field>
  <FieldLabel>Price range</FieldLabel>
  <Slider value={v} onValueChange={setV} min={0} max={1000}>
    <SliderInput index={0} />
    <SliderControl>
      <SliderThumb index={0} />
      <SliderThumb index={1} />
    </SliderControl>
    <SliderInput index={1} />
  </Slider>
</Field>
```

> `SliderInput` reads the Ark context, so it **must** sit inside `<Slider>` (the context provider). The root lays
> its direct children out in a horizontal row — `SliderInput`s flank a flex-growing `SliderControl` — so no extra
> wrapper is needed. A bare slider (no inputs) is just `<SliderControl>` as the sole row child.

### Parts

| Export | Element / wraps | Role |
| --- | --- | --- |
| `Slider` (root) | `ArkSlider.Root` | Owns the machine config (props below), reads `Field` context, owns `error`, provides Ark context + DS `SliderContext` + `TestIdProvider`. Renders `children`. `data-slot="slider"`. |
| `SliderControl` | `ArkSlider.Control` → `ArkSlider.Track` → `ArkSlider.Range` | The interactive track region. Renders track+range internally, then `children` (thumbs, marks). `data-slot="slider-control"`. |
| `SliderThumb` | `ArkSlider.Thumb` (+ `ArkSlider.HiddenInput`) | **The real interactive node** (`role="slider"`). `index` (default `0`). Consumer `data-*` / `id` / `aria-*` / `ref` / events forward **here**. Optional `tooltip`. `data-slot="slider-thumb"`. |
| `SliderMarks` | `ArkSlider.MarkerGroup` → `ArkSlider.Marker[]` | Ticks/labels from a `marks` array + click-to-jump. Publishes its marks to `SliderContext` so the root resolves ordinal `aria-valuetext`. `data-slot="slider-marker-group"` (group) + `data-slot="slider-marker"` (each tick) — Ark's part names. |
| `SliderInput` | DS `Input` | Numbers-only box two-way bound to thumb `index`. `data-slot="slider-input"`. |
| `SliderValue` | `<span>` | Live value readout (single → `"50"`; range → `"20 – 80"`; honors ordinal mark labels). Optional; for the value-beside-label pattern. `data-slot="slider-value"`. |

### `Slider` (root) props

All Ark Root machine config, unchanged from today:
`value` · `defaultValue` (default `[50]`) · `min` · `max` · `step` · `disabled` · `readOnly` · `name` · `form` ·
`minStepsBetweenThumbs` · `thumbCollisionBehavior` · `getAriaValueText` · `onValueChange` · `onValueChangeEnd`.

DS-owned: `error?: boolean` (→ Ark `invalid`) · `className?` · `ref?: Ref<HTMLDivElement>` (root) · `data-testid`.

**Removed from root** (now live on sub-parts): `marks`, `tooltip`, `input`, the `{...thumbProps}` pass-through,
and the `aria-label` / `aria-labelledby` arrays.

### Per-thumb props (`SliderThumb`)

- `index?: number` (default `0`).
- `tooltip?: boolean` — on-drag value bubble for **this** thumb (DS `Tooltip`, opened by `api.dragging`).
- `aria-label?` / `aria-labelledby?` — **plain strings now**, passed straight to this thumb's node (no array
  gymnastics). Falls back to: Field label (single, in a Field) → else `index===0 ? 'Minimum' : 'Maximum'` for a
  range with no label.
- `ref?: Ref<HTMLDivElement>` + arbitrary `data-*` / `id` / event props → forwarded to the Ark thumb node.

## 4. How each concern moves

| Concern | Flat (today) | Compound (this rework) |
| --- | --- | --- |
| Single vs range | `value.length` | `value.length` drives the machine; **consumer renders one `<SliderThumb>` per thumb** (`index` 0, then 1). `SliderContext.isRange` is derived from `value`/`defaultValue` length for slot-naming + label defaults. A dev-only warning fires if rendered thumb count ≠ value length. |
| Analytics target | `{...rest}` → primary thumb only (CG-1 gap) | `{...rest}` on each `<SliderThumb>` → its own node. **CG-1 resolved.** |
| Accessible name | `aria-label` array on root | `aria-label` string per `<SliderThumb>`; Field-label fallback preserved. |
| Ticks / labels | `marks` prop on root | `<SliderMarks marks={…}>` inside `SliderControl`. |
| Ordinal `aria-valuetext` | root resolves from `marks` | `SliderMarks` publishes its marks to root **state** via a `useLayoutEffect` (identity-guarded `setMarks`); the root's `getAriaValueText` closes over that state. State (not a ref) is required because Ark computes `aria-valuetext` *during render*, before any child effect — the layout-effect `setMarks` re-renders the root synchronously pre-paint so the value text is right on the first commit. Consumer `getAriaValueText` still wins. |
| On-drag tooltip | `tooltip` prop on root | `tooltip` prop on `<SliderThumb>`. |
| Inline value input | `input` prop renders box(es) + row | `<SliderInput index={n}>` parts; the **root** lays its direct children in a row (inputs flank a flex-growing `SliderControl`). The marks `pb-28` band moves onto `SliderControl`. |
| Persistent readout | plain composition in stories | optional `<SliderValue>` (or still hand-rolled). |
| Field wiring / `error` | root reads `useFieldContext()` | unchanged — root reads it, exposes `invalid`/`disabled`/`readOnly` through Ark Root + `SliderContext`. |

### Context plumbing

- `Slider` renders `ArkSlider.Root` → all descendants can call Ark's **`useSliderContext()`** (the live api:
  `value`, `setThumbValue`, `dragging`, `disabled`, …). This is the same idiom as `PaginationPageSize`
  (`usePaginationContext()`).
- A thin DS **`SliderContext`** (new `SliderContext.tsx`) carries what Ark's api doesn't: `isRange`, `invalid`
  (for error styling on thumbs/inputs), the registered `marks` (for ordinal display + `aria-valuetext`), and the
  field's `ariaDescribedby`. Provided by the root, consumed via `useSliderRootContext()`.
- `TestIdProvider` from the root; each sub-part calls `useTestId(slot)` per `.claude/rules/test-id.md`. Slots:
  `control`, `thumb` (single) / `thumb-0`,`thumb-1` (range), `marks`, `input` / `input-0`,`input-1`, `value`.

## 5. File plan

**Split `Slider.tsx` into:**

- `Slider.tsx` — root only.
- `SliderControl.tsx` · `SliderThumb.tsx` · `SliderMarks.tsx` · `SliderInput.tsx` · `SliderValue.tsx`.
- `SliderContext.tsx` — DS context + `useSliderRootContext`.
- `classes.ts` — unchanged (central classnames; already split per part by name).
- `types.ts` — `SliderMark` + shared prop types if helpful.

**Update:**

- `index.ts` — export every part + its `…Props` type, and `SliderMark`.
- `packages/design-system/src/index.ts` — extend the explicit barrel (line ~525) with the new parts.
- `Slider.stories.tsx` — rewrite all stories to compound (`satisfies Meta`).
- `Slider.test.tsx` — rewrite to compound; **add a per-thumb analytics test** (`PRICE_MIN`/`PRICE_MAX` land on
  the correct nodes) — the CG-1 closure regression guard.
- `Slider.e2e.ts` (+ `-snapshots/`) — update markup; regenerate visual baselines via `[update-screenshots]`.
- `Slider.figma.tsx` — Code Connect examples → compound.
- `Slider.llm.md` — rewrite "Reach for it / Locked / Showing the value" around the compound API; keep the
  judgment ("approximate & bounded", NumberInput/SegmentedControl boundaries) intact.
- `ANALYTICS_GAPS.md` — mark **CG-1 resolved** (exported `SliderThumb` seam); keep the track-gesture entry (still
  a typed-callback, not a gap).
- `docs/slider-handoff-requirements.md` — decision log: reverse #12, add **#13** (compound at maintainer's
  request, 2026-06-30); update the API/prop tables.
- `docs/slider-design-spec.md` — its API sketch was already compound; reconcile names to the final surface.

## 6. Invariants preserved (do not regress)

From `Slider.llm.md` "Locked":
- Single vs range = **value length**, not a flag. Thumbs never cross (`minStepsBetweenThumbs` holds the gap).
- Focus == hover emphasis (size/shadow), **no separate ring**.
- Disabled dims the **whole** control to 50% at the root.
- One size, horizontal only — no size axis, no vertical.
- `error` repaints the handle; the **message is the Field's job**.
- Snap to a sane `step`; ordinal scales align `step` to marks.
- Tooltip and a persistent readout are **mutually exclusive**.
- Token-only styling (CVA + `cn`), `data-slot` per part, `displayName` per part, `ref` prop (no `forwardRef`),
  named exports only, no `any`.

## 7. Out of scope (unchanged deferrals)

Vertical orientation, `origin`, draggable range band, input-in-popover, level/zone color bands, media scrubber.

## 8. Testing

- **Unit/component (Vitest + TL):** render single + range; value model; range no-cross; ordinal
  `aria-valuetext`; states (disabled/readOnly/error); Field context cascade; `data-testid` cascade incl. range
  index suffixes; **per-thumb analytics pass-through (new)**; inline `SliderInput` two-way bind + clamp; dev
  warning on thumb-count mismatch.
- **E2E (Playwright):** interaction + a11y groups as today, on compound markup; visual baselines regenerated.
- Coverage stays >80%; typecheck + biome clean.

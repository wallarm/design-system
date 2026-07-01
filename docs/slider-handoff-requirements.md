# Slider — engineering handoff requirements

> Build spec for the `Slider` and `Slider input` components. This documents the **agreed v1** — what to
> build, how it behaves, all logic, validation, and accessibility.
>
> **Design source:** WADS file, Slider page — https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11354-3
> **Background / rationale:** [`docs/slider-design-spec.md`](slider-design-spec.md) (research, competitive scan, when-to-use).
> **Code foundation:** build on **`@ark-ui/react/slider`** (already a dependency; same posture as Input / NumberInput / SegmentedControl).

---

## 1. Purpose (context, not scope)

A slider lets a user pick a value — or a range — by dragging a handle along a track. Use it for
**approximate, bounded** selections where seeing the value move helps. When an exact figure matters, the
slider is paired with a **NumberInput**; for 2–7 fixed options use **SegmentedControl**; never use it as a
date picker. (Full rationale in the design spec.) This section is for engineer context — adoption guidance
lives in the design docs, not here.

---

## 2. Architecture

Built from private atoms composed into two public components.

| Layer | Component | Role |
|---|---|---|
| atom | `_handle` | The draggable thumb. Visual states + optional tooltip. |
| atom | `_line` | The track (unfilled) + fill (progress). |
| atom | `_tick` | A single tick mark + its label; interactive. |
| **public** | **`Slider`** | The control. Composes line + handle(s) + optional ticks + optional inline input. Also reads `Field` context, so it doubles as the form field (see below). |
| ~~public~~ | ~~**`Slider input`**~~ | **Superseded (#12)** — not built as a component. The "form field" is plain `<Field>` composition around `Slider`, like every other input. |

> **As-built (supersedes parts of §2 / §3 / §6 / §11 / §12):** there is no bundled `Slider input` component —
> the field is plain `<Field>` composition (decision #12), and the inline `input` is a plain numbers-only
> `Input`, not `NumberInput` (decision #11). The `NumberInput` references below reflect the original plan and
> are kept for the decision trail.

~~The inline numeric entry **must be the existing `NumberInput` component** (available in Storybook) — not a
bespoke field — so it inherits NumberInput's formatting, stepping, and validation.~~ → **Superseded (#11):**
the inline entry is a plain numbers-only `Input` (no stepper); the slider machine owns clamping/snapping, so
NumberInput's stepping is redundant.

---

## 3. Public API

### `Slider`
| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number[]` | — | Ark uses an array: `[n]` = single, `[low, high]` = range (`double` renders the 2nd thumb). Labeled scales map array values through `marks`. |
| `min` / `max` | `number` | `0` / `100` | Bounds of the scale. |
| `step` | `number` | `1` | Increment for drag, keyboard, and snapping. |
| `marks` | `{ value: number; label?: string }[]` | — | Tick positions and optional labels. Drives `Ticks` + labeled scales. |
| `double` | `boolean` | `false` | Range mode — two handles. (Figma: `Double`) |
| `ticks` | `boolean` | `false` | Show tick marks (discrete). (Figma: `Ticks` + ticks slot) |
| `input` | `boolean` | `false` | Show inline plain `Input`(s) for direct entry — numbers-only, no stepper (**#11**, not `NumberInput`). (Figma: `Input`) |
| `disabled` | `boolean` | `false` | See §5. |
| `onValueChange` | `(v) => void` | — | Fires live during drag; commit on release. |

### ~~`Slider input` (field wrapper)~~ → **Superseded (#12): plain `<Field>` composition, not a component**

There is no `Slider input` component. The "form field" is the standard `<Field>` composition every other
input uses; the Figma toggles below map to composition, not props:

| Figma toggle | As-built |
|---|---|
| `Label` | `<FieldLabel>` child of `<Field>`. |
| `Label value` | A composition — render the live value (controlled `value` + `onValueChange`) in the `FieldLabel` row. Not a prop. |
| `Description` | `<FieldDescription>` child. |
| `Help text` | `<FieldDescription>` / `<FieldError>` child. |
| `Error` | `error` is a **`Slider`** prop (and cascades from `<Field invalid>`); the message is `<FieldError>`. |

`Slider` itself consumes **`Field` context** (id / label association / invalid / disabled) like `Input` /
`Textarea`, so a wrapping `<Field>` auto-wires labelling. (Help/error text is not tied via `aria-describedby` —
a DS-wide forms gap, since the DS `FieldError` / `FieldDescription` don't register their ids with Ark; the
slider matches the rest of the family here rather than hand-wiring it.)

---

## 4. Anatomy & tokens

All visual properties bind to WADS library tokens. Pixel geometry (track height, handle size) is fixed.

| Part | Token | Notes |
|---|---|---|
| Track (unfilled) | `color-states/primary-pressed` | Intentional choice; keep. |
| Fill (progress) | `color-bg/fill/brand` | From min (or low handle) to value. |
| Handle fill | `color-bg/surface-3` | |
| Handle border | `color-bg/fill/brand` | |
| Tick (mark) | `color-states/primary-pressed` | |
| Tick / min-max label | `color-text/secondary` | |
| Label, value | `color-text/primary` | |
| Description, help text | `color-text/secondary` | |
| Error (border, message, icon) | `color-text/danger` (+ danger family) | Error state only. |
| Corners | handle `radius-4`; track + fill `1px` | Handle is a **12×16 portrait rounded-rect** (`radius-4`), **not** a circle; track + fill use a near-square `1px` corner (no `radius-1` token — literal). Matches the Figma `slider` component (node `11354:180` / handle `11354:70`); supersedes the earlier "everything `radius-full`" wording — see decision #10. |
| Gaps | `spacing-*` tokens | |

**Dark mode:** delivered automatically by the semantic tokens above — no bespoke dark styling required.
**Sizing:** **single size for v1.** No `sm`/`md` axis.

---

## 5. States

| State | Trigger | Visual |
|---|---|---|
| Default | rest | Handle = surface-3 fill + brand border; track filled with brand up to value. |
| Hover | pointer over handle | Handle emphasized (enlarges / stronger brand border). |
| **Focus** | keyboard focus | **Visually identical to Hover.** Reachable via `Tab`; must be clearly distinguishable while keyboard-navigating. |
| Pressed / dragging | pointer down on handle | Handle emphasized; tooltip shown if enabled (§6). |
| **Disabled** | `disabled` prop | **The entire component rendered at 50% opacity** and non-interactive (no pointer, not focusable, `aria-disabled`). Applied at the root — not a per-part variant. |
| Error | `Slider input` `error` | Danger handle/border + error message below (field-level only). |

---

## 6. Behavior & logic

### 6.1 Scale types
1. **Continuous numeric** — any value in `[min, max]`; drag is smooth.
2. **Discrete numeric** — snaps to `step` (and to `marks` when `ticks`).
3. **Labeled / ordinal** — `marks` carry **text labels** (e.g. `Low / Medium / High`). The handle snaps to
   mark positions; the displayed value and `aria-valuetext` are the **label**, not the number.

### 6.2 Defaults
`min = 0`, `max = 100`, `step = 1`. For labeled scales, the steps are the `marks` entries.

### 6.3 Interaction
- **Drag handle:** value tracks the pointer; snaps to `step`/`marks` in discrete/labeled modes. Updates live;
  commits on release.
- **Click on track:** the nearest handle moves to the clicked position (snapped if discrete).
- **Click on tick:** jumps the nearest handle to that tick's value. Ticks are interactive (`_tick` has
  Hover / Selected states).
- **Value rounding:** never surface long decimals — display values aligned to `step`, in tabular numerals.

### 6.4 Range (`double`)
- Two independently focusable handles (low / high).
- **Handles must not cross.** Clamp each handle to the other's current value (optionally enforce a minimum
  gap of `step`).
- Value is `[low, high]`; displayed as `{low}, {high}` (or both labels).
- With `input`, render **two inline `Input`s** (min on the left, max on the right). *(#11 — plain `Input`, not `NumberInput`.)*

### 6.5 Inline input (`input`)
- Rendered with a plain numbers-only **`Input`** (no stepper; #11 — *not* `NumberInput`), two-way bound to the slider value.
- Typing updates the handle position live.
- **Validation / clamp:** values are clamped to `[min, max]` and snapped to `step`. Out-of-range or invalid
  entry → clamp to the nearest valid value; surface the field **error** state with a message when the entry
  can't be honored (see §8).

### 6.6 Tooltip
- Optional on-drag tooltip (`_handle` `Tooltip` On) that floats **above** the handle (avoids finger
  occlusion), fades in on press with a short transition, hidden at rest.
- **Exclusion rule:** the tooltip and a persistent value (`labelValue`) are **mutually exclusive** — the
  tooltip is the value readout *only* when no persistent value is shown. Never display both.

---

## 7. Accessibility

### 7.1 ARIA
- Each handle: `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (updated live), and
  **`aria-valuetext`** when the value is a label or formatted string (e.g. `"Medium"`, `"$4,000"`).
- `aria-orientation="horizontal"`.
- Labelled via the field label (`aria-labelledby`) or an explicit `aria-label`.
- Disabled: `aria-disabled="true"`, removed from the tab order.
- **Range:** two `slider` roles, each separately labelled (e.g. "Minimum" / "Maximum"); each handle's
  `aria-valuemin`/`max` reflects the no-cross clamp.

### 7.2 Keyboard
| Key | Action |
|---|---|
| `→` / `↑` | +1 step |
| `←` / `↓` | −1 step |
| `Page Up` / `Page Down` | ± large step (e.g. 10× `step`) |
| `Home` / `End` | minimum / maximum |
| `Tab` | focus the handle; in range, move to the next handle |

- Focus is shown using the Hover visual (per §5); it must remain clearly visible during keyboard use.
- Tick click-to-jump must have a keyboard equivalent (arrow keys step through ticks).

---

## 8. Content & microcopy
- **Label:** noun, sentence case ("Risk threshold").
- **Value:** numeric (tabular, snapped to `step`) or the mark **label** for ordinal scales. Optional unit
  suffix (e.g. `%`, `ms`).
- **Description / help text:** optional, secondary.
- **Error message:** state what's allowed, e.g. *"Enter a value between {min} and {max}."*

---

## 9. Exclusions / non-goals (v1)
- Single size only (no `sm`/`md`).
- No vertical orientation.
- No standalone media scrubber (separate component).
- Tooltip and persistent value are never shown together (§6.6).
- No bespoke dark-mode work (tokens handle it).
- Focus does **not** get a distinct ring — it reuses the Hover visual (deliberate decision).

---

## 10. Decisions log
| # | Decision | Owner |
|---|---|---|
| 1 | Focus state = Hover visual (no separate variant) | Artem |
| 2 | Disabled = whole component at 50% opacity (doc-only, not in Figma) | Artem |
| 3 | Usage guidance lives in design docs; cover copy to be fixed in Figma | Artem |
| 4 | Single size for v1 | Artem |
| 5 | Value may be numeric **or** labeled (Low/Medium/High) | Artem |
| 6 | Track uses `color-states/primary-pressed` intentionally | Artem |
| 7 | Tooltip ↔ persistent value are mutually exclusive | Artem |
| 8 | ~~Inline input must be the existing `NumberInput`~~ — **superseded by #11.** | Artem |
| 9 | Dark mode covered by tokens; no extra work | Artem |
| 10 | Handle = 12×16 portrait rounded-rect (`radius-4`), not a circle; track + fill near-square (`1px`). Matches Figma `slider`; supersedes §4's earlier "radius-full". Decided at the Phase 1 checkpoint. | Artem |
| 11 | **Inline `input` is a plain numbers-only `Input` (no stepper), not `NumberInput`.** Quieter look beside the track (matches Figma `_text-box`); the slider machine owns clamp/snap, so a stepper is redundant. Supersedes #8 and the `NumberInput` wording in §2 / §3 / §6.4 / §6.5 / §11 / §12. Confirmed at the 2026-06-29 engineering review. | Artem |
| 12 | **No bundled `Slider input` component** — the form field is plain `<Field>` composition (`<Field><FieldLabel/><Slider/><FieldDescription/></Field>`), consistent with every other input (no `InputField` / `SelectField` exists). `Slider` itself reads `Field` context and owns `error`; the value-beside-label readout is a composition, not a prop. Supersedes the two-public-component split in §2 and the `Slider input` prop table in §3. Confirmed at the 2026-06-29 engineering review. **The `<Field>`-composition half still holds; the *flat-control* half is superseded by #13.** | Artem |
| 13 | **Compound rework at maintainer request (PR [#192](https://github.com/wallarm/design-system/pull/192), 2026-06-30).** The flat config-driven `Slider` is reworked to a **lean compound** matching the Checkbox/Radio/Switch idiom: the root owns the Ark machine + `Field` context + `error`, and the consumer composes `SliderControl` (renders track+range) + one `SliderThumb` per thumb + optional `SliderMarks` / `SliderInput` / `SliderValue`. Exposing **`SliderThumb`** makes every thumb independently analytics-addressable, **resolving CG-1** (`ANALYTICS_GAPS.md`). Supersedes the *flat-control* parts of #11/#12 (the inline box is now the `SliderInput` part; the value-beside-label readout is the `SliderValue` part or a plain composition). The `<Field>`-composition decision (#12) is unchanged — the field is still plain `<Field>` composition; only the control inside it is now composed. Hard cut (PR unmerged → zero consumers). Design + plan: `docs/superpowers/specs/2026-06-30-slider-compound-rework-design.md`, `docs/superpowers/plans/2026-06-30-slider-compound-rework.md`. | Artem + maintainer |

---

## 11. Open items — resolved against Ark
- **Range min-gap / no-cross:** Ark `minStepsBetweenThumbs` (gap) + `thumbCollisionBehavior="none"` (default — thumbs block, never cross). Default gap 0 unless a feature needs more.
- **Large step (Page Up/Down):** Ark's built-in Page keys; confirm Zag's default page size in code, expose a custom page step only if a use case needs it.
- **Track click:** Ark moves the nearest thumb to the clicked position by default — keep it.
- **Value formatting:** `getAriaValueText` for the accessible string + matching format on the visible value; the inline `Input` shows the raw snapped value (#11 — no `NumberInput` formatting layer).

## 12. Ark UI alignment (build validation)
This wraps **`@ark-ui/react/slider`**. The headless layer covers most requirements; we add the visual + a few compositions.

**Provided by Ark — use directly:**
| Requirement | Ark mechanism |
|---|---|
| Single + range | `value: number[]` (1 entry = single, 2 = range); each `Slider.Thumb` has `index`. |
| Min / max / step | Root `min` / `max` / `step`. |
| Range no-cross + gap | `thumbCollisionBehavior` (default `none`) + `minStepsBetweenThumbs`. |
| Disabled / read-only / invalid | Root `disabled` / `readOnly` / `invalid` → `data-*` hooks. |
| Ticks | `Slider.MarkerGroup` + `Slider.Marker value={n}`. |
| Keyboard (arrows, Page, Home/End) | Built in. |
| Focus / drag styling | `data-focus`, `data-dragging` (drive CVA — Focus reuses Hover visual, drag = Pressed). |
| Labeled / ordinal value | `getAriaValueText` → `aria-valuetext`; `Slider.ValueText` for display. |
| Center-origin fill (future bipolar) | `origin="center"` — not v1, but available. |
| Form submission | `Slider.HiddenInput`. |

**We build on top (not in Ark):**
- **Inline `Input`** pairing (#11 — plain `Input`, not `NumberInput`) — Ark ships only `HiddenInput`; wire our `Input` to the slider via the live `Slider.Context` api (`setThumbValue`, which clamps/snaps). Range = two inputs.
- **On-drag tooltip** — compose via `data-dragging` (optionally `Slider.DraggingIndicator`); mutually exclusive with the persistent value.
- **Label-left / value-right layout, help text, error message** — the `Slider input` field chrome.
- **Disabled = 50% opacity** at the root (Ark provides `data-disabled`; we apply the opacity).

**Verify in code:** tick **click-to-jump** is not a documented Ark feature — add a `Slider.Marker` click handler (set nearest thumb) or drop from v1; bind field `error` → Ark Root `invalid` so `data-invalid` styles the control.

# Slider — design & technical spec

> Research-and-spec for a new `Slider` component. Companion to the FigJam research board:
> **https://www.figma.com/board/STe3vMhIdyrOQ36316s4Cy/Slider**
>
> Scope of this doc: everything up to (but not including) building the component. It feeds the Figma
> component build first, then the code implementation. "Slider" here means the **range-input control**
> (drag a thumb along a track), never an image carousel.

---

## 1. The one rule

Every source — UX literature and design systems alike — converges on a single rule:

> **A slider is for an _approximate_ value you watch change live. The moment the exact number matters,
> pair it with a number input — or just use the number input.**

This is so strong that **GitHub Primer and GitLab Pajamas ship no slider at all**, routing every numeric
value to a `type="number"` text input. The systems that _do_ ship one (Elastic, Carbon, Atlassian, Nord,
Vercel) all repeat the same caveat in their own words. So the headline decision is not "how should the
slider look" — it's "when is a slider even the right control," and the answer is narrow.

---

## 2. When to use it — and when not

### Use a slider when
- The value is **approximate** — close enough is fine.
- The effect **updates live** as you drag (brightness, volume, zoom, a threshold preview).
- It's a **relative nudge** along a bounded, known range.
- You want to **invite exploration** of the range, not just capture a number.

### Don't — use this instead
| Situation | Use instead |
|---|---|
| Exact value matters (port, memory limit, price) | **NumberInput** |
| The user already knows the number | Let them **type it** (NumberInput) |
| Large range where 1px = many units | **NumberInput** |
| 2–7 fixed options | **SegmentedControl** (or Radio) |
| A star rating | Tappable stars / discrete buttons |
| Result can't update live (slow query, heavy render) | Input **+ explicit Apply** |
| Exact min & max bounds | **Two NumberInputs** |
| Picking a date | **DatePicker** (never a slider — Carbon is explicit) |

The precision escape hatch is the recurring pattern: a slider **paired with a linked number input**
(coarse + fine). Carbon ships this by default and keeps the two two-way synced; NN/g calls it the canonical
solution. Our Slider should make this pairing first-class, not an afterthought.

---

## 3. Real-world patterns (Mobbin)

Twelve real screens, grouped by job. Each job maps to a variant (see §6). Full visual set is on the
[FigJam board](https://www.figma.com/board/STe3vMhIdyrOQ36316s4Cy/Slider).

**Price & numeric ranges → dual-handle.** Two thumbs on one track, almost always backed by min/max number
inputs. [Klarna](https://mobbin.com/screens/2ff7fdaf-9702-4d37-9d3a-72eb63cf463c),
[Shop](https://mobbin.com/screens/a100b65a-ad91-4451-b9a4-36d5fd242724),
[Pinterest](https://mobbin.com/screens/45560b08-b73e-4f7e-8a82-878c035ddd68). Counter-example:
[HODINKEE](https://mobbin.com/screens/e5dc41fa-0c89-432f-92af-03983fe6fcfe) does the same range with **two
number inputs and no slider** — a range doesn't always need one.

**Media: scrub & volume.** A playback scrubber plus a volume slider; thin track, tiny-or-no thumb until
touched. [Headspace](https://mobbin.com/screens/37a8384a-2821-4d8d-b7ab-7f29f40f095c),
[Ten Percent Happier](https://mobbin.com/screens/397f0ee2-9bfc-4d6b-995e-d3e18ff85baf),
[Entale](https://mobbin.com/screens/56e950f4-bb28-4686-982b-aca4384b57a6) (vertical). **Note:** a media
scrubber is really its own control (seek + progress), not a form input — keep it out of this component.

**Settings: a single value.** One thumb for brightness / text size / volume, usually flanked by min/max
icons. [The Athletic](https://mobbin.com/screens/0626e5d0-a58f-44eb-9d42-dce5409cf756),
[X](https://mobbin.com/screens/c966a77e-13ef-4f5f-997f-cf89fefe0db8) (discrete stops),
[Wikipedia](https://mobbin.com/screens/73d4e0a1-066e-4368-8df6-522ae3bae22b) (tick marks).

**Editors: bipolar ± adjust.** Center-zero sliders for ±100 tweaks — exposure, contrast, hue.
[WEAR](https://mobbin.com/screens/2564c404-dd57-40cb-a70f-aa77fd8ddaed),
[GoDaddy Studio](https://mobbin.com/screens/966f8774-ca4b-4ddb-afb6-9fdd71fc16c4),
[Procreate](https://mobbin.com/screens/f81e0770-4fdd-4165-945d-d9ad6d9617d7) (tints the track itself). Zero
sits dead center with a detent; the live value is always on screen.

---

## 4. Design-system benchmark

| System | Calls it | Two-thumb range | Shows value? | Stance |
|---|---|---|---|---|
| **Elastic EUI** | `EuiRange` + `EuiDualRange` | Yes | Optional (tooltip / paired input) | "Use only when the precise value is not important." Adds `showInput` or defers to `EuiFieldNumber`. Has colored **level bands**. |
| **IBM Carbon** | Slider (+ two-handle) | Yes | **Yes** — paired number input, two-way synced | Number input by default. Never a date picker. Avoid huge (1–1000) or tiny (1–3) ranges. |
| **Vercel Geist** | Slider (+ range mode) | Yes (start/end inputs) | **Yes** — live, tabular-nums | Snap to a sensible step (never `47.83`). Pair with a number Input for exact values. |
| **Nord Health** | `Range` | No | No by default | Use when accuracy isn't important; for precise numbers use the `Input` component. |
| **Atlassian** | `Range` | No | **No readout at all** | Deliberately framed for an "approximate value"; precision delegated elsewhere. |
| **GitHub Primer** | — none — | — | — | No slider. Numeric entry = number `TextInput`; small sets = `SegmentedControl`. |
| **GitLab Pajamas** | — none — | — | — | No slider. All numeric entry → `type=number` text input. |

Sources: [EUI](https://eui.elastic.co/docs/components/forms/numeric/range-sliders/) ·
[Carbon](https://carbondesignsystem.com/components/slider/usage/) ·
[Atlassian](https://atlassian.design/components/range) ·
[Nord](https://nordhealth.design/components/range/) · [Geist](https://vercel.com/geist/slider) ·
[Primer](https://primer.style/components/) · [Pajamas](https://design.gitlab.com/components/).

**Takeaways for us:**
1. **Value display is the real fork.** Carbon/Geist always show it (input / tabular-nums); Atlassian/Nord
   show nothing. NN/g says **always show the current value**. → We show it.
2. **Single + dual-handle** is table stakes for the systems that take the component seriously (EUI, Carbon,
   Geist).
3. **EUI's colored "level bands"** (green/amber/red zones on the track) are the one domain-relevant feature
   — a natural fit for a security/observability product (risk score, latency, traffic). Worth stealing,
   with the a11y caveat that color alone never carries meaning.

---

## 5. Anatomy

| Part | Notes | Token (this codebase) |
|---|---|---|
| **Track** | Unfilled rail, full width, rounded. | neutral fill, e.g. `bg-bg-*` / a neutral surface token |
| **Filled range** | From min (or from the low thumb) to the current value. | primary fill, e.g. `bg-fill-brand-*` / strong-primary |
| **Thumb / handle** | Draggable; the focusable element. | `bg-component-input-bg` + `border-border-strong-primary` |
| **Value readout** | Live current value; bubble, inline label, or paired input. **Always present.** | `text-text-primary`, tabular numerals |
| **Min / Max labels** | Optional endpoint labels (often icons in settings sliders). | `text-text-secondary` |
| **Tick marks** | Optional; present → the stepped/discrete variant. | `bg-border-*` |
| **Level bands** (domain extra) | Colored zones along the track for thresholds. | semantic success/warning/danger fills |
| **Focus ring** | On the thumb. | `ring-3 ring-focus-primary` (`ring-focus-destructive` on error) |

---

## 6. Variants & states

### Variants (v1 in **bold**)
- **Single value** — one thumb (brightness, volume, a threshold).
- **Range / dual-handle** — two thumbs (price & numeric bands).
- **Stepped / discrete** — snaps to `step`; optional tick marks.
- **Bipolar (center-zero)** — filled track grows from the center; ±100 adjustments. (A presentation mode of
  single-value, not a separate component.)
- **With paired number input** — the precision escape hatch.
- _Vertical_ — rare (Entale); **defer**.
- _Scrubber / progress_ — media seek; **a separate component, not this**.

### States
`default` · `hover` · `focus-visible` (ring on thumb) · `active` (dragging; thumb may enlarge, cf. Carbon
14→20px) · `disabled` (opacity 50% + `not-allowed`, mirrors `Input`) · `error`/`invalid` (danger border +
ring, `aria-invalid`) · `read-only`.

---

## 7. Sizing & visual spec

This system has **no shared sm/md/lg axis** — each input fixes its own box (`Input`/`NumberInput` are
`h-36`). Follow suit: a single, fixed, intended density. (Reflects the locked-density rule we already apply
to Table.)

- **Track height:** ~4–6px (Carbon uses 4px; Nord uses 3px). Recommend **4px**, rounded-full.
- **Thumb diameter:** ~16–20px visual, but the **hit area must be ≥ 44×44px** (Apple HIG) / 48dp (Material).
  Achieve with an invisible padded target around the visual thumb. WCAG 2.5.8 technically treats the whole
  track as one target, but the thumb still needs to be grabbable in practice.
- **Filled track** repaints from min → value (or low → high thumb for a range).
- **Focus ring:** `ring-3` on the thumb, `ring-focus-primary` (matches `Input`); `ring-focus-destructive`
  on error.
- **Value:** tabular numerals so the readout doesn't jitter while dragging (Geist's rule).
- **Step snapping:** default `step` so dragging never yields `47.83291`.

---

## 8. Interaction & keyboard (WAI-ARIA)

Single-thumb (each thumb in a range gets the same model):

| Key | Action |
|---|---|
| → / ↑ | +1 step |
| ← / ↓ | −1 step |
| Page Up / Page Down | larger jump (a "big step", e.g. 10×) |
| Home / End | minimum / maximum |

- Live drag updates the value continuously; commit on release.
- Don't intercept native arrow behavior — Ark's Slider provides it (Geist's advice: "let the native keyboard
  work").

ARIA (per [APG Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)):
`role="slider"` on each thumb, `aria-valuemin` / `aria-valuemax` / `aria-valuenow` (updated live),
`aria-valuetext` when the raw number isn't friendly (e.g. `4000` → `"$4,000"`), `aria-orientation` for
vertical, and a label via `aria-labelledby` / `aria-label`.

**Multi-thumb** ([APG Slider Multi-Thumb](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/)):
each thumb is its own focusable `slider`; **thumbs must not cross** (clamp the dependent bound); **tab order
stays constant** regardless of visual position; **label each thumb** ("Minimum price" / "Maximum price").

Value-label placement rule (NN/g): the value sits **above or beside** the thumb, **never below** — a finger
hides a below-thumb label on touch.

---

## 9. Technical implementation

### Foundation
Build on **`@ark-ui/react/slider`** (Ark UI `5.31.0` is already a dependency and the backbone of `Input`,
`NumberInput`, `SegmentedControl`, `Checkbox`, `Switch`, `Tabs`, etc.). Ark's Slider gives us the thumb
roles, full keyboard model, multi-thumb support, and `min`/`max`/`step`/`marks` out of the box — same posture
as the rest of the form family. _Do not hand-roll a native `<input type=range>`._

### File structure (mirror `packages/design-system/src/components/Input/`)
```
packages/design-system/src/components/Slider/
  Slider.tsx          # compound root + sub-components
  classes.ts          # CVA: track / range / thumb / states
  index.ts            # export { Slider, type SliderProps, sliderVariants }
  Slider.llm.md       # usage guide (see §2/§6 for content)
  Slider.e2e.ts       # screenshot + interaction + a11y groups
  Slider.stories.tsx  # satisfies Meta<typeof Slider>
```

### Mandatory conventions (from `.claude/rules/`)
- **CVA in `classes.ts`**, merged with `cn()`. No template-literal class concat.
- **`data-slot`** on every part: `slider`, `slider-track`, `slider-range`, `slider-thumb`, `slider-value`,
  `slider-marker`, `slider-control`.
- **`displayName`** on the root and each sub-component.
- **`ref?: Ref<HTMLDivElement>`** prop (React 19 — never `forwardRef`).
- **Export component + Props type** from `index.ts`.
- **No hardcoded colors** — design tokens only (`bg-*`, `text-text-*`, `border-border-*`, `ring-focus-*`).
- **Compound = `data-testid` cascade** via `TestIdProvider` / `useTestId('slot-name')` (see
  `.claude/rules/test-id.md`).

### Field context — close the gap
`Input`/`Textarea` consume Ark's `useFieldContext()` (`field.getInputProps()` wires id / label /
`aria-describedby` / `aria-invalid`). **`NumberInput` does NOT** — a documented gap. The Slider **should**
consume Field context so a wrapping `<Field>` auto-wires label, description, error, and `required`. This also
fixes the pairing story: a Slider + NumberInput inside one `<Field>` share the same labelling.

### Metrics / analytics-readiness
Per `docs/metrics/contract.md`: arbitrary consumer `data-*` / `aria-*` / `id` / event props must land on the
**real interactive DOM node** — here, the **thumb(s)**. Spread rest props onto the thumb, not a wrapper. No
analytics-named props. For dual-handle, follow the closed-target guidance for two interactive nodes.

### Public API sketch (compound, Ark-style)
```tsx
<Slider
  value={number | [number, number]}      // single or range
  defaultValue={…}
  min={0} max={100} step={1}
  onValueChange={(v) => …}
  orientation="horizontal"                // 'vertical' deferred
  disabled error readOnly
  marks={[{ value, label? }]}             // stepped / ticks
  showValue                               // default true
  // level bands (domain extra, see §10)
  levels={[{ min, max, tone: 'success' | 'warning' | 'danger' }]}
>
  <Slider.Label>Risk threshold</Slider.Label>
  <Slider.Control>
    <Slider.Track><Slider.Range /></Slider.Track>
    <Slider.Thumb index={0} />            {/* + index={1} for range */}
  </Slider.Control>
  <Slider.Value />                        {/* or compose a NumberInput here */}
  <Slider.MarkerGroup />
</Slider>
```
**Final shipped surface (2026-06-30 compound rework, decision #13)** — a *lean* compound, not the full
Ark decomposition sketched above. Track + range are rendered inside `SliderControl` (not exported as
`SliderTrack` / `SliderRange`); ticks are `SliderMarks` (array prop), the readout is `SliderValue`, and the
inline box is `SliderInput`. `marks` / `tooltip` / inline-input are **not** root props — `marks` lives on
`<SliderMarks>`, `tooltip` on `<SliderThumb>`, and the box is `<SliderInput>`:

```tsx
<Slider value={value} onValueChange={setValue} min={0} max={100} error={hasError}>
  <SliderControl>
    <SliderThumb index={0} tooltip data-analytics-id="PRICE_MIN" />
    <SliderThumb index={1} data-analytics-id="PRICE_MAX" />  {/* range: one thumb per entry */}
    <SliderMarks marks={[{ value: 0, label: 'Low' }, …]} />
  </SliderControl>
  <SliderInput index={0} />   {/* optional inline boxes / SliderValue readout */}
</Slider>
```

---

## 10. Recommendation & scope

**Build it.** Most peers do, and it fills a real gap (we currently force every numeric value through
`NumberInput`). But build it the Carbon way, not the Atlassian way.

**Ship in v1**
- Single value **+ dual-handle range**, horizontal.
- **Live value on by default**, tabular-nums.
- **Optional paired `NumberInput`** (the precision path) inside the same `Field`.
- **Stepped** via `step`; optional tick marks.
- States: default · hover · focus · active · disabled · error · read-only.
- Built on `@ark-ui/react/slider`; consumes `Field` context.

**Our domain edge**
- **EUI-style colored level bands** (green/amber/red) along the track for risk score, latency, traffic
  thresholds. This is where a generic slider earns its keep for a security product.
- Caveat: **never color alone** — describe the zones in the field's help text (EUI's documented a11y rule).

**Defaults & guardrails**
- Show the value by default; snap to a sane step (never surface `47.83`).
- **Not** a date picker → `DatePicker`. **Not** for 2–3 options → `SegmentedControl` (already in the DS).
- Pairs with `NumberInput` + `Field`.

**Defer past v1**
- Vertical orientation.
- Draggable range band (EUI `isDraggable`).
- Input-in-popover for dense forms (EUI `inputWithPopover`).
- Media scrubber — explicitly a **separate** component.

---

## 11. Open decisions for review
1. **Value display:** inline bubble on the thumb, a label beside the control, or the paired `NumberInput` as
   the canonical readout (Carbon's model)? Recommendation: paired NumberInput optional, lightweight inline
   value by default.
2. **Level bands in v1 or v1.1?** High domain value but adds scope + the color-only a11y obligation.
3. **Size:** single fixed density (consistent with `Input`/Table) — confirm we don't want a `small`.
4. **Where the spec/guide lives** once the component exists: this doc → condensed into
   `Slider.llm.md` next to the code.

---

## 12. Sources
- NN/g — [Slider Design: Rules of Thumb](https://www.nngroup.com/articles/gui-slider-controls/) ·
  [Sliders, Knobs, and Matrices](https://www.nngroup.com/articles/sliders-knobs/)
- W3C WAI-ARIA APG — [Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) ·
  [Slider (Multi-Thumb)](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/)
- Smashing — [Designing The Perfect Slider](https://www.smashingmagazine.com/2017/07/designing-perfect-slider/)
- WCAG 2.2 — [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Design systems: EUI, Carbon, Atlassian, Nord, Geist, Primer, Pajamas (links in §4).
- Mobbin reference screens (links in §3).

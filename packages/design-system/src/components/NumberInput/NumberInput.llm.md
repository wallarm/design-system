# NumberInput — usage

> The numeric form control — the `Input` box restricted to a single number format, plus an increment/decrement stepper (click or arrow keys). Built on Ark UI's NumberInput, so its root is a `<div>` wrapping a real `<input>` + the two stepper buttons: it shares Input's *look* but not Input's element or its `Field` wiring. Interactive.

## Reach for it when
A field accepts **only a number** and the user benefits from nudging or bounding it — counts, quantities, page sizes, timeouts, thresholds, rate limits, percentages, currency amounts. You get the Input box locked to a numeric format, a stepper (arrow keys + click), optional `min`/`max`/`step` clamping, and locale formatting via `formatOptions`. Like the rest of the family it ships **no label** — wrap it in a `Field`.

## Don't use it for
- **A number that's really an identifier** — phone, port, ZIP, version, account/card number: anything where leading zeros matter or there's no arithmetic → `Input` (`inputMode="numeric"`). NumberInput coerces to a number — it strips leading zeros, applies grouping, and a +/– stepper is meaningless on an ID.
- **Picking from a small fixed set of numbers** (page size 10/25/50, retries 1–5) → `Select` / `SegmentedControl` / `Radio`. Stepping through a short closed list is worse than picking from it.
- **An approximate value the user *feels* for, or a min–max range** — risk score, threshold, opacity, a range filter → `Slider` (drag a handle; *seeing it move* helps them choose). Keep NumberInput when the **figure must be exact**; if both the feel *and* the figure matter, use a `Slider` with its inline `SliderInput`.
- **Free or mixed text** → `Input`; multi-line prose → `Textarea`.

## Locked — don't override
- **The stepper is always rendered** — the increment/decrement control is baked into the component; there's **no prop to hide it**. If a +/– stepper makes no sense for the value, that's the signal to use `Input`, not to strip the control away.
- **The box look matches `Input`** (`h-36`, `rounded-8`, border, focus ring, error palette), but there's **no size axis** — don't shrink it via `className` for a dense row.
- **`error` is one coordinated red palette** — it maps to Ark's `invalid`, repaints the border + focus/hover ring red **and** sets the invalid a11y state on the same prop. It shows **no words** (see Validation). Same rule as Input/Textarea.
- **`disabled` dims to ~50% with a not-allowed cursor; width is `w-full`** — sizing is the parent layout's job, never a prop.
- **`value` / `defaultValue` are strings** (`'25'`, not `25`), and uncontrolled it renders **`0`**, not empty (`defaultValue` defaults to `'0'`). For a blank start pass **`defaultValue=""`** (empty string); for a real domain default pass that — don't rely on the baked-in `0`. (`min` clamps the value on interaction, not the empty initial state.)

## Field wiring — the one place it breaks from the family
Unlike `Input`/`Textarea`, NumberInput **does not read `Field` context**. Still wrap it in a `Field` for the visual label / description / error chrome, but nothing auto-wires: clicking the label won't focus the field, and the `FieldDescription`/`FieldError` text isn't tied to the input (`aria-describedby`), so a screen reader gets the invalid *state* without the *message*. *(Known gap, flagged on the FE side; document the reality, don't hand-wire `id`/`htmlFor`.)*

## Validation — two wires you sync yourself
`<NumberInput error />` paints the field red + sets the invalid bit but shows **no words**; `<FieldError>` shows the words but doesn't paint. Set **both**, kept in sync, and render `FieldError` in place of `FieldDescription` when invalid. *(Same rough edge as the rest of the forms family.)*

## Sizing / judgment calls
- **`min` / `max` / `step`** — set them to the domain; they clamp the value and size each arrow-key/stepper tick. This bounding is the main reason to pick NumberInput over a plain Input.
- **`formatOptions`** — for currency / percent / unit / grouped numbers, pass `Intl.NumberFormat` options (e.g. `{ style: 'currency', currency: 'USD' }`) rather than formatting the value yourself; the value stays a raw numeric string and the field renders the formatted form.

## Pairs with
- `Field` (+ `FieldLabel` / `FieldDescription` / `FieldError`) — the wrapper for label/description/error chrome (with the wiring caveat above).
- `Input` / `Textarea` / `Select` — sibling controls; the boundaries above route between them.

```tsx
<Field>
  <FieldLabel>Request timeout (seconds)</FieldLabel>
  <NumberInput defaultValue="30" min={1} max={300} step={5} />
  <FieldDescription>Between 1 and 300 seconds.</FieldDescription>
</Field>
```

# Slider — usage

> Pick an approximate, bounded value — or a range — by dragging a handle along a track. Built on Ark UI's slider; interactive, and it reads `Field` context like `Input`.

## Reach for it when
A value is **approximate and bounded**, and *seeing it move* helps the user choose — risk-score / latency / traffic thresholds, volume / brightness / opacity, sample rate, a live-preview effect, or a **min–max range** filter. The hallmark: the user is feeling for a level, not typing a figure. If the number must be exact, the slider is the wrong primary control.

## Don't use it for
- **A value that must be exact** (port, memory limit, price, timeout, count) → `NumberInput`. If both the feel *and* the figure matter, keep the slider and turn on its paired `input` — don't make a slider the only path to a precise number.
- **2–7 fixed choices** (environment, log level, page size) → `SegmentedControl` / `Radio` / `Select`. A slider implies a continuum.
- **A date or time** → `DateInput` / `TimeInput`. Never a slider.
- **On / off** → `Switch`.
- **A huge range where one pixel spans many units** (e.g. 1–100000) → `NumberInput`; dragging can't land a meaningful value.

## Locked — don't override
- **Single vs range is the value's *length*, not a flag** — `[50]` is one thumb, `[20, 80]` is a two-thumb range. Thumbs **never cross** (`minStepsBetweenThumbs` holds a gap). Don't look for a boolean to "enable range."
- **Focus looks exactly like hover** — the handle enlarges + lifts; there is no separate focus ring. That emphasis *is* the focus indicator and stays clearly visible during keyboard navigation (it's a strong size/shadow change, not a subtle outline) — deliberate; don't add a ring.
- **Disabled dims the *whole* control to 50%** at the root — never dim individual parts.
- **One size, horizontal only.** No `sm`/`md` axis and no vertical orientation; don't shrink the track/handle via `className`. If a slider genuinely won't fit a dense row, that's the signal to use `NumberInput` (or show the value read-only) — not to shrink it.
- **`error` is the danger handle only** — it maps to Ark `invalid` and repaints the handle; the *message* is the field's job (`FieldError`), same wiring as the rest of the forms family.
- **Snap to a sane `step`** — never surface `47.83`. Discrete and labeled scales must align `step` to the marks.
- **Tooltip and a persistent value are mutually exclusive** — show the value *one* way, never both.

## Showing the value — pick exactly one
A slider should almost always show its value. Choose a single readout:
- **Value beside the label** (the default) — render the live value in the `FieldLabel` row. Best for forms.
- **`tooltip`** — an on-drag bubble above the handle. Best when vertical space is tight and the value only matters mid-drag.
- **Paired `input`** — an inline numbers-only `Input` (a plain box, no stepper arrows; fixed 48px), two-way bound (range → two boxes, min left / max right). The precision escape hatch that doubles as the readout.

## Ordinal / labeled scales
Pass `marks` with text labels (`Low` / `Medium` / `High`) and set `step` so each stop lands on a mark. The handle then **announces the label, not the number** (`aria-valuetext`) and the ticks carry the words. Use it for qualitative levels; keep it to a handful of stops.

## Field wiring — it reads `Field` (unlike `NumberInput`)
Wrap it in `<Field>` and labelling / `invalid` / `disabled` auto-wire — the `FieldLabel` names the handle. This is the gap `NumberInput` leaves; the slider closes it. (The `FieldDescription` / `FieldError` text still isn't tied via `aria-describedby` — the same DS-wide forms gap; document the reality, don't hand-wire it.)

## Pairs with
- `NumberInput` — the standalone component for exact numeric entry. (The slider's own `input` prop renders a plain numbers-only `Input` inline — not a `NumberInput`.)
- `Field` (+ `FieldLabel` / `FieldDescription` / `FieldError`) — label / description / error chrome.
- `SegmentedControl` — the alternative when the choices are few and fixed.

```tsx
<Field>
  <div className='flex w-full items-center justify-between'>
    <FieldLabel>Risk threshold</FieldLabel>
    <span className='text-sm text-text-secondary tabular-nums'>{value[0]}</span>
  </div>
  <Slider value={value} onValueChange={setValue} min={0} max={100} />
</Field>
```

# TimeInput — usage

> The type-in-place **time-of-day** field — tab through hour / minute (/ second)
> segments, with an optional clock dropdown. Built on React Aria `useTimeField`.
> Interactive; time only, no date. Sibling of `DateInput`.

## Reach for it when
A form needs a **time of day on its own** — a daily schedule ("run at"),
quiet-hours start, an alert window, an hour:minute slot. Hour + minute by
default. Like the rest of the forms family it ships **no label** — wrap it in a
`Field`.

## Don't use it for
- **A date, or a date + time together** → `DateInput` (`granularity='minute'`).
  TimeInput carries no date.
- **A length of time / duration** ("2h 15m", a timeout, a TTL) — that's a number,
  not a clock time → `NumberInput` (e.g. minutes). TimeInput is a *time of day*,
  not an interval.
- **Picking from a few fixed times** off a short list → `Select`.
- **Displaying a time** → `FormatDateTime`, not a `readOnly` TimeInput (which is a
  temporarily-locked form field).

## Locked — don't override
- **The value is a React Aria `TimeValue` (`Time` from `@internationalized/date`,
  re-exported), not a JS `Date` or string** — e.g. `new Time(22, 0)`; `onChange`
  returns `TimeValue | null`.
- **12h vs 24h is app-wide — set on `DateFormatProvider`, never per input** (no
  `hourCycle` prop). No provider → the browser locale decides.
- **Segmented, leading-zero, keyboard-first** — not a free-text "22:00" box.
- **`error` paints only** (red + `aria-invalid`, no words) — same double-wire as
  the family.

## Field wiring — the family gotcha
Like `DateInput` / `NumberInput` / `InputOTP`, TimeInput **does not read `Field`
context**. Wrap it in a `Field` for the label / description / error chrome, but
nothing auto-wires: the label click won't focus it and `FieldError` isn't tied
via `aria-describedby`. Set `error` on the input **and** render `<FieldError>`
yourself. *(Known family gap — don't hand-wire `id` / `htmlFor`.)*

## Sizing / judgment calls
- **`showTimeDropdown` + `timeStep`** — show the clock dropdown when users pick
  round times (default step 30 min; 15 / 60 common); leave off for free typing.
  (Unlike DateInput, these always apply — TimeInput is always a time.)
- **`granularity`** — `minute` (default); `second` only when seconds matter;
  `hour` for whole-hour slots.
- **`minValue` / `maxValue`** — bound the window (e.g. business hours).
- **`size`** (`default` 36 / `medium` 32 / `small` 24) — match surrounding
  density.

## Pairs with
- `DateFormatProvider` — app-root `hourCycle` (12 / 24) for every time field.
- `Field` (+ `FieldLabel` / `FieldDescription` / `FieldError`) — label chrome
  (wiring caveat above).
- `DateInput` — the dated sibling. For a date **and** a time, use one `DateInput`
  with a time `granularity`, not a `DateInput` + `TimeInput` side by side.

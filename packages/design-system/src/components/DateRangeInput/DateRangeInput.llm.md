# DateRangeInput — usage

> One bordered control holding a **start and end date** — two linked segment
> fields with a separator, built on React Aria's date-range field; optionally
> date + time. A **compound** (composable via `DateRangeProvider`). Interactive.
> *(Tagged `alpha` — the API may still move.)*

## Reach for it when
The user needs a **continuous span** — a "from / to" report window, a validity
period, a filter's date range. The single control keeps start ≤ end linked.
Ships **no label** — wrap it in a `Field`.

## Don't use it for
- **Two unrelated dates** (birth date + hire date — not one span) → two separate
  `DateInput`s, each in its own `Field`. DateRangeInput is for a *continuous*
  range, not "two date fields."
- **Picking a range off a month grid, or range presets** ("Last 7 days", "This
  month") → `Calendar` with `type='range'` — it ships range presets and embeds
  two DateInputs in its header. DateRangeInput is the *typed* range; `Calendar`
  is the *grid* range.
- **A single date or time** → `DateInput` / `TimeInput`.
- **Displaying a range** → two `FormatDateTime`s, not a `readOnly`
  DateRangeInput.

## Composition
- **Default — the all-in-one:** `<DateRangeInput value onChange />` renders the
  bordered start–separator–end control. Use this unless you need a custom layout.
- **Custom layout:** wrap `DateRangeProvider` (owns value / onChange / state)
  around `DateRangeStartValue` / `DateRangeSeparator` / `DateRangeEndValue`,
  reading shared state via `useDateRangeContext` — for when the two ends must sit
  apart or in a bespoke arrangement.

## Locked — don't override
- **The value is a React Aria `RangeValue<DateValue>`** — `{ start, end }` of
  `CalendarDate` / `CalendarDateTime` (from `@internationalized/date`,
  re-exported), **not** JS `Date`s or strings. `onChange` returns it, or `null`
  on clear.
- **Date order (day/month-first) and 12h/24h are app-wide** — set on
  `DateFormatProvider`, never per input.
- **`granularity` applies to both ends at once** — `day` (default), or a time
  granularity adds time to start *and* end.
- **`error` paints only** and the control renders **no** error text itself — pair
  with `Field` + `FieldError`.

## Field wiring — the family gotcha
Same as the rest of the family: DateRangeInput **does not read `Field` context**,
so a `Field` gives you label / description / error chrome but **no auto-wiring**
(label focus, `aria-describedby`). Set `error` **and** render `<FieldError>`
yourself; don't hand-wire `id`.

## Sizing / judgment calls
- **`showTimeDropdown` + `timeStep`** (time granularities only) — clock dropdown
  for round times (default step 30 min).
- **`size`** (`default` 36 / `medium` 32 / `small` 24) — match surrounding
  density.
- **Pre-fill** by passing `value` / `defaultValue` (a `RangeValue` of
  `{ start, end }`) — there's no separate placeholder-value seed.
- *(No `minValue` / `maxValue` props yet — unlike `DateInput` / `TimeInput`, the
  range can't be bounded via props today. To block out-of-range picks, validate
  in your `onChange` and surface it via `error` + `FieldError`.)*

## Pairs with
- `DateFormatProvider` — app-root `order` + `hourCycle`.
- `Field` (+ `FieldError`) — label chrome + the error text the control omits.
- `DateInput` / `TimeInput` — single-value siblings.
- `Calendar` (`type='range'`) — the grid-and-presets alternative when typing isn't
  the goal.

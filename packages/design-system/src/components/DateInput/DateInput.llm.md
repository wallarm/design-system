# DateInput — usage

> The type-in-place date field — tab through day / month / year (and optionally
> hour / minute) segments, each its own editable box, with locale-aware
> ordering. Built on React Aria `useDateField`. Interactive; **typed entry only —
> no calendar popover**.

## Reach for it when
A form needs the user to **enter a date** (or date + time) by typing — "valid
from", "expires on", a schedule start, a filter's "since". Fast when the user
already knows the date and a month-grid would be overkill. Add time by setting
`granularity` to `minute` (or `hour` / `second`). Like the rest of the forms
family it ships **no label** — wrap it in a `Field`.

## Don't use it for
- **Time only**, no date → `TimeInput`.
- **A start–end span** → `DateRangeInput` (one control, two linked fields) —
  never two `DateInput`s wired together by hand.
- **Browsing a month grid / clicking a day / date presets** ("Last 7 days") →
  `Calendar`. Calendar *is* the pop-up picker (its own trigger + portalled
  popover) and it already reuses `DateInput` in its header for typing. **Don't
  wrap DateInput in a `Popover` to fake a picker** — reach for `Calendar`.
- **Displaying a date** — a timestamp in a table / detail pane, "last seen",
  "created" → `FormatDateTime`. A `readOnly` DateInput is a temporarily-locked
  *form field*, not a display format.

## Locked — don't override
- **The value is a React Aria `DateValue`, not a JS `Date` or ISO string** —
  `CalendarDate` (date-only) / `CalendarDateTime` (with time) from
  `@internationalized/date` (re-exported from the package). `onChange` returns
  `DateValue | null`. For "today / now" use `today(getLocalTimeZone())` /
  `now(getLocalTimeZone())`, **never `new Date()`**. Passing a `Date` or string
  silently won't work — this is the trap to avoid.
- **Date order (day- vs month-first) and 12h/24h are app-wide** — set once on
  `DateFormatProvider` at the root, **never per input** (DateInput exposes no
  `order` / `hourCycle` prop on purpose). No provider → `day-first` + locale
  hour cycle.
- **Segmented, leading-zero, keyboard-first** — it is not a free-text box;
  segments auto-advance and arrow-keys nudge. Don't expect it to parse a typed
  `"01/02/2026"` string.
- **`error` paints only** — red border + `aria-invalid`, no message (see Field
  wiring). Same double-wire as the rest of the forms family.

## Field wiring — the family gotcha
Like `NumberInput` / `InputOTP` (and unlike `Input` / `Textarea`), DateInput
**does not read `Field` context**. Wrap it in a `Field` for the label /
description / error chrome, but nothing auto-wires: clicking the label won't
focus it, and `FieldError` isn't tied via `aria-describedby` (a screen reader
gets the invalid *state*, not the *words*). Set `error` on the input **and**
render `<FieldError>` yourself, swapped in for `<FieldDescription>`. *(Known gap,
flagged FE-side — document the reality, don't hand-wire `id` / `htmlFor`.)*
`FieldAction` in the label is the home for a **"Set now / today"** shortcut.

## Sizing / judgment calls
- **`granularity`** — `day` (default) for dates; `minute` for date + time (the
  common time case); `hour` coarse; `second` only for forensic precision. The
  choice = how precise the captured moment must be.
- **`showTimeDropdown` + `timeStep`** (time granularities only) — add a clock
  dropdown when users pick round times (default step 30 min); leave off for free
  typing.
- **`minValue` / `maxValue`** — bound the selectable range to the domain (no
  past dates, within a window).
- **`placeholderValue`** — the date the segments *start from* when the user
  begins typing into an empty field (e.g. this month); **not** a displayed value
  and **not** the default — a real initial value goes in `value` / `defaultValue`
  (e.g. `today(getLocalTimeZone())`).
- **`size`** (`default` 36 / `medium` 32 / `small` 24) — match surrounding form
  / row density. (Unlike `Input` / `NumberInput`, this family **does** have a
  size axis.)

## Pairs with
- `DateFormatProvider` — mounted once at the app root; sets `order` +
  `hourCycle` for every date/time input *and* `Calendar`.
- `Field` (+ `FieldLabel` / `FieldDescription` / `FieldError` / `FieldAction`) —
  label chrome (wiring caveat above).
- `TimeInput` / `DateRangeInput` — siblings; share the value type, the provider,
  and the Field gotcha.
- `Calendar` — the grid picker; it embeds a DateInput in its header, so reach
  for Calendar rather than composing one yourself.

```tsx
<DateFormatProvider order="day-first" hourCycle={24}>
  <Field>
    <FieldLabel>Valid from</FieldLabel>
    <DateInput
      value={value}
      onChange={setValue}
      minValue={today(getLocalTimeZone())}
    />
  </Field>
</DateFormatProvider>
```

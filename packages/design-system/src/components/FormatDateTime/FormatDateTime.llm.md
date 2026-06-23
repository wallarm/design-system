# FormatDateTime — usage

> Renders a date/time in house style: relative ("3 hours ago"), date, or
> two-line datetime — always with an absolute-time tooltip. **Display-only.**

## Reach for it when
Any date or time appears on screen — event streams, tables, detail panes,
"last seen", "created", "expires". **Never hand-format dates** (no
`toLocaleString`, no date-fns in product code): pass the raw value (ISO string,
`Date`, or Unix ms) and pick a format. The relative ladder, absolute formats,
timezone rendering, and tooltip are all house style, baked in.

## Don't use it for
- **Entering / editing a date or time** — this only *displays*. For capture →
  `DateInput` / `TimeInput` / `DateRangeInput`. (Note the mirror-image value
  types: this component takes a raw `Date` / ISO / Unix-ms; the inputs take a
  React Aria `DateValue` / `TimeValue` — don't cross them.)
- **A duration or a countdown** ("2h 15m elapsed", "expires in 3 days") — **not
  supported.** `relative` even clamps *future* dates to "Just now". There's no
  duration / countdown component yet; compute those yourself — don't expect this
  one to do it.

## Which format — by the user's question
**The fact decides the format — the question being answered, not the container
it sits in.** (A recency fact stays relative even in a table; an exact-moment
fact stays absolute even in a feed.)
- **"How long ago?"** — recency ("last seen", "detected 3h ago") → `relative`
  (default). Dashed underline; the tooltip carries the exact moment.
- **"At what exact moment?"** — event / audit tables, config-change history →
  `datetime` (two lines: date over a secondary time — mind row height). Where
  precision is contractual (audit / compliance), use this, never `relative`.
- **"What date?"** — created, expires, license dates → `date`.

## Locked — don't override
- **Timezone is always shown** (`GMT±N` / `UTC`, to avoid ambiguity) and reflects
  the value's zone (browser-local by default) — the component derives it. Never
  hardcode UTC or re-zone in display code; honor a user's profile zone *upstream*
  by passing an appropriately-zoned value, not here.
- **Missing values (`null` / `undefined`) render an em dash (—) with a built-in
  "No data" tooltip** — don't pre-check, don't invent "N/A" / "Never", don't add
  your own tooltip.
- **The absolute-time tooltip is built in** on every rendered value — don't add
  one. (`showSeconds` toggles seconds in it.)
- The relative ladder and the future-date "Just now" clamp are fixed house
  behavior — don't reimplement the thresholds.

## Pairs with
- `Table` cells / feeds — pick the format by the fact (above). Cells are
  `nowrap`; size a relative/absolute column ~140–160px to fit the longest string
  ("3 weeks ago", "11 Feb, 2026").
- `DateFormatProvider` is for the *inputs* (DateInput / TimeInput /
  DateRangeInput / Calendar) — it does **not** affect this component; don't reach
  for it to change a display format.

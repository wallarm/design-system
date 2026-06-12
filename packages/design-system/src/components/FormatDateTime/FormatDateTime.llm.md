# FormatDateTime — usage

> Renders a date/time in house style: relative ("3 hours ago"), date, or
> two-line datetime — always with an absolute-time tooltip. Display-only.

## Reach for it when
Any date or time appears — event streams, tables, detail panes, "last seen",
"created". **Never hand-format dates** (no `toLocaleString`, no date-fns in
product code): pass the raw value (ISO string, Date, or Unix ms) and pick a
format. The relative scale, absolute formats, and tooltip are house style.

## Format ladder
**The fact type decides the format — not the container it sits in.**
- `relative` (default) — recency facts ("last seen", "detected 3 hours ago"),
  wherever they appear: feeds, tables, panes. The dashed underline + tooltip
  carries the exact moment.
- `datetime` — facts where the exact moment is the point: event/audit tables,
  config-change history. Two lines (date over secondary time) — mind the row
  height.
- `date` — date-only facts: created, expires, license dates.
- Where precision is contractual (audit / compliance), use `datetime` — not
  `relative`.

## Locked — don't override
- **Timezone is the user's profile setting** — the component and its utils
  handle it. Never hardcode UTC, never re-zone values yourself; pass the raw
  value through. ("Everyone should see the same time" is solved by the user
  setting their profile to UTC, not by display code.)
- **Missing/invalid values render an em dash (—)** — don't pre-check, don't
  invent "N/A" / "Never" strings.
- The absolute-time tooltip is built in — don't add your own.

## Pairs with
- `Table` cells and feeds — pick the format by the fact, per the ladder.
- Detail panes with a secondary description line under the date.
- `DateFormatProvider` is for *inputs* (DateInput, Calendar) — it does not
  affect this component; don't reach for it to change display formats.

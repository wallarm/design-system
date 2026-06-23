# Calendar — usage

> The pop-up **date / range grid picker** — a trigger that opens a portalled
> popover with a one-month (single) or two-month (range) grid, plus optional
> preset sidebar, typed-input header, and Apply/Reset footer. Built on Ark UI
> `DatePicker`. A **compound**. Interactive. *(Tagged `alpha` — API may move.)*

## Reach for it when
The user picks a date or range by **browsing a month grid** — when day-of-week /
which-week / month context matters, or you want **quick presets** ("Last 7 days",
"This month"). It's the visual counterpart to the typed date inputs, and the home
for date *presets*.

## Don't use it for
- **A date the user already knows and can just type** → `DateInput` (compact, no
  popover); a **typed start–end span** → `DateRangeInput`. Calendar is for visual
  browsing / presets — reach for it when the grid earns its space.
- **Displaying a date as text** → `FormatDateTime`. (A `readonly` + `defaultOpen`
  Calendar is a fine way to *show a fixed range on a grid* — e.g. a booked period
  — but a text timestamp in a row is `FormatDateTime`.)
- **A menu of commands** → `DropdownMenu`; **a value from a non-date list** →
  `Select`.

## Composition
**Required spine:**
```tsx
<Calendar type="single">                 {/* or "range" */}
  <CalendarTrigger>
    <Button variant="outline" color="neutral">Select date</Button>
  </CalendarTrigger>
  <CalendarContent>                       {/* the popover itself */}
    <CalendarBody>
      <CalendarGrids />                    {/* 1 month (single) / 2 (range), auto by type */}
    </CalendarBody>
  </CalendarContent>
</Calendar>
```
**Optional layers** (mix per need — the 10 sanctioned combos = `type` × these):
- **`CalendarPresets`** — left sidebar of quick-picks; first child of
  `CalendarContent`. Defaults auto by type (`DEFAULT_SINGLE_PRESETS` /
  `DEFAULT_RANGE_PRESETS`); or pass `presets={…}` / custom `CalendarPresetItem`
  children. Keyboard shortcuts (T / W / M …) wire up automatically.
- **`CalendarInputHeader`** — typed `DateInput`(s) above the grid (1 for single,
  2 + arrow for range) so users can type *or* click. First child of
  `CalendarBody`.
- **`CalendarFooter`** › `CalendarKeyboardHints` + `CalendarFooterControls` ›
  `CalendarResetButton` + `CalendarApplyButton` — the staged-apply footer. Last
  child of `CalendarBody`.

## Locked — don't override
- **The trigger is your own `Button` wrapped in `CalendarTrigger`** — the
  sanctioned trigger is `<Button variant="outline" color="neutral">` (optional
  leading Calendar icon). Calendar ships no trigger of its own.
- **Value is a `DateValue[]` array** (Ark UI) — **one element for single, two for
  range** — *not* a single `DateValue` (`DateInput`) or `{ start, end }`
  (`DateRangeInput`). `onChange` gets `DateValue[]`. Build dates with
  `today(getLocalTimeZone())`, **never `new Date()`**.
- **`CalendarContent` IS the popover** (portal + positioning + animation, same
  machinery as `DropdownMenu` / `Popover`) — never wrap `Calendar` in a `Popover`.
- **Apply / Reset carry built-in behavior** — `CalendarApplyButton` closes the
  popover (primary/brand/small), `CalendarResetButton` clears the value
  (ghost/neutral/small); your `onClick` runs *in addition*. Don't re-wire
  close/clear yourself.
- **Date order (day/month-first) + 12h/24h come from `DateFormatProvider`** —
  app-wide, same as every date/time input.

## Sizing / judgment calls
- **`type`** — `single` (one month) vs `range` (two months side by side).
- **Which optional layers** — presets when common ranges matter; the input header
  when typed entry alongside the grid helps; the footer when you want an explicit
  Apply/Reset (a *staged* commit rather than commit-on-click).
- **`closeOnSelect`** (default `true`) — leave on for a single quick-pick (pick →
  closes); set **`false`** for range, multi-step, or any footer/Apply flow (and
  pair it with controlled `value` / `open`).
- **`minDate` / `maxDate`, `isDateUnavailable(date)`** — bound or disable days;
  `disallowDisabledDatesInRange` blocks a range that spans a disabled day (needs
  controlled `value`).
- **`showTime`** — adds time-of-day selection alongside the date.
- **`readonly` + `defaultOpen`** — a display-only grid (no selection, presets
  disabled): show a fixed range visually.

## Pairs with
- `DateFormatProvider` — app-root `order` + `hourCycle`.
- `DateInput` / `DateRangeInput` — the typed siblings (Calendar embeds a
  `DateInput` in its header); for pure typed entry, use them instead of opening a
  grid.
- `Button` — the trigger, composed in via `CalendarTrigger`.

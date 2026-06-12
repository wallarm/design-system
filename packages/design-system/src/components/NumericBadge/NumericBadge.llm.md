# NumericBadge — usage

> Pill-shaped counter for a numeric value. Display-only. The counts member of
> the chip trio: Badge annotates, Tag acts, NumericBadge counts.

## Reach for it when
A count rides along with something else — unread/new items on a tab, matches
behind a filter button, selected rows, findings in an accordion section. It
lives attached to its host (tab label, button, segmented item, accordion
header), not free-floating.

## Don't use it for
- **Words or statuses** → `Badge`. If it isn't a number (or a capped count
  like "99+"), it isn't a NumericBadge.
- **A metric that IS the content** (dashboard stat, "1.2M requests") — that's
  typography on the page, not a chip riding a control.
- **Status codes** → `ResponseCode` — numbers, but a domain chip.
- **A click target** — family rule: never wire its `onClick`; the host (tab,
  button, row) owns the click.

## Type — match the surface, not a meaning map
Type is a context/taste call, not a fixed semantic ladder. The one hard
anchor: on dark or color-filled hosts (a brand-solid `Button`, a tooltip),
use `primary-alt` so the count stays legible. On neutral surfaces, `primary`
is the everyday default. The rest (`brand`, `destructive`, `info`, `outline`)
follow the exact design case — when unsure, stay on `primary` and let a
designer upgrade.

## Counting rules
- **Show `0`** by default; hiding an empty count is a product-case decision,
  not the norm.
- **Cap long counts the standard way: `99+`** (and similar — `999+` where the
  host is wide). The component renders the string you pass — formatting is on
  you.

## Sizing
`default` beside regular text and controls; `small` inside dense/compact
hosts. Match the host, not the page.

## Pairs with
- `Tabs`, `SegmentedControl`, `Button`, `Accordion` headers — its real homes
  across the system.
- `Badge` (words) and `Tag` (interactive descriptors) — the sibling routing.

# Badge — usage

> Small colored chip for short status / category metadata. Display-only — never an interactive control.

## Reach for it when
A short label should read at a glance: a status ("Active", "Blocked"), a category, an
annotation like "New" or "Recommended" in a section hero or card header. If you're about
to hand-style a small piece of colored text, it's a Badge — but check the dedicated chips
first: Badge is deliberately agnostic, and the domain components are its product faces.

## Don't use it for
- **Values with a dedicated chip** — HTTP verb → `HttpMethod`, status code → `ResponseCode`,
  IP → `Ip`, country → `Country`. They are Badges under the hood with locked prop sets;
  hand-rolling a raw Badge for these silently breaks product-wide consistency.
- **Counts** (unread, selected, totals) → `NumericBadge`.
- **Anything actionable** — removable chips and value sets in fields/filters → `Tag` (the
  focusable, interactive sibling); standalone actions → `Button`. Never wire `onClick` on a
  Badge: if a badge-shaped label must trigger something, an interactive parent (menu item,
  link, `Button`) owns the click and the Badge sits inside it, display-only.

## Locked — don't override
- **Set `type='secondary'`** (soft tint) — the standard choice for a plain Badge, same as
  the domain chips. Don't rely on the code default (`solid`): solid is for deliberate
  high-emphasis moments only.
- **`textVariant='code'` for machine values** (codes, IDs, technical strings); human words
  stay `default`.
- **Color follows meaning, not decoration** — use the semantic when one applies (the page's
  established mapping); muted/grayscale means inactive or archived; with no meaning to
  encode, stay on the neutral `slate` default. Never pick a color just to look different.
- **Keep content to a word or two** — the spec truncates text at 320px with an ellipsis;
  if you're hitting that, it isn't Badge content.

## Sizing / judgment calls
- Three sizes; match the density around it: `medium` is the everyday default (tables,
  rows), `large` for spacious heroes/headers, `small` only in the tightest micro-surfaces.
  Align with neighbours — never pick in isolation.
- **Dotted variant** — the dot marks a live/current state (online, running). Also fine as
  light emphasis where an icon is wanted but none fits.

## Pairs with
- Base of the domain-chip family (`HttpMethod`, `ResponseCode`, `Ip`…) — a new domain value
  should be composed on Badge, not built from scratch.
- `OverflowList` — sets of badges collapse behind a "+N" chip rather than wrapping forever.
- Lives inside menus and `Select` values as the displayed option — the parent owns the
  interactivity, the Badge stays display-only.

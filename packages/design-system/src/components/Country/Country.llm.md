# Country — usage

> Country as a round flag + name, composed from sub-components. Display-only.

## Reach for it when
A country appears on screen — attack sources, geo columns in tables, IP/host
details, location facts. Compose it: flag + name is the standard full form.
**Never hand-roll a flag emoji (🇩🇪), a third-party flag icon, or a plain-text
country name** — the round SVG flag set and name data ship with the component.

## Composition
- **Full form (flag + name)** — the default wherever there's room.
- **Flag-only** — dense/inline surfaces: table cells, next to an IP address
  (exactly what `Ip` does via `IpCountry`). Accessible: the flag carries the
  name as alt text.
- **Name-only** — rare; for the occasional surface where a flag would be noise.
- **Flag before name — the order is strict.**

## Don't use it for
- **Choosing a country** (form control) → `Select` (Country can render inside
  its options — the Select owns the interaction).
- **A bare country-code column** ("DE" / "FR" as text) — not a pattern; a known
  country shows its flag and/or name. (The unknown-value fallback rendering a
  code as text is fine — that's a degradation, not a choice.)
- **A clickable thing** — family rule: the parent (row/cell, menu item,
  `FilterInput` chip) owns interactivity.

## Locked — don't override
- **Pass the ISO alpha-2 code, uppercase** — lookup is case-sensitive: `de`
  finds nothing and degrades to raw "de" text with no flag.
- **Unknown/missing codes degrade safely** — flag hides, the code renders as
  text. Not an error; don't pre-validate or invent fallbacks.
- **The flag set is the design system's** — round, consistent; never mix in
  emoji or external flag assets.

## Sizing
Two sizes, and the scale differs from the badge chips: `small` (default) for
tables, lists, and inline-next-to-IP; `medium` where the surface is roomier.
Match neighbours, as always.

## Pairs with
- `Ip` — its `IpCountry` slot renders a flag-only small Country beside the
  address.
- The domain-chip family (method, status code, IP…) — same "dedicated
  component first" rule, though Country is flag + text, not a Badge chip.

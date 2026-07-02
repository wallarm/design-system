# Separator — usage

> A **divider** — a 1px rule that splits content into groups, either purely visually or as a real semantic boundary. Knobs: `orientation`, `spacing`, `decorative`.

## Reach for it when
Whitespace alone isn't enough to show where one group of content ends and the next begins, and you want an explicit line — a rule between menu / section groups, between inline meta (`Blog │ Docs │ Source`), or between toolbar segments. **But first check for a dedicated family separator** (below) — reach for the raw `Separator` only for generic content.

## Don't use it for
- **Inside a component family that ships its own** → use that one, not the raw primitive: a menu → `DropdownMenuSeparator`; a `Select` list → `SelectSeparator`; tabs → `TabsSeparator`; grouped fields → `FieldSeparator`; the nav rail → `NavRailSeparator`; breadcrumbs → `BreadcrumbsSeparator`; a date range → `DateRangeSeparator`. They wrap `Separator` with the right defaults for that context.
- **Spacing / rhythm between blocks** → that's layout gap (`Stack` / `Flex`), not a divider. A rule is a visual *statement*; reaching for one where whitespace already groups things adds noise. Don't stack dividers or use one as a spacer.
- **Between `Card`s or panels** → they already carry their own edge; don't draw a line between them.
- **Pure decoration** → no.

## Locked — don't override
- **Colour + weight are fixed** — `border-primary`, 1px. No colour / thickness / dashed variants; don't restyle it (style through the props, not `className`).
- **It carries its own surrounding space** — set the gap around it with the **`spacing`** prop (the token scale: `8`, `16`, `24`…), which becomes vertical margin for horizontal / horizontal margin for vertical. Don't wrap it in a margin `div`.
- **Vertical needs a bounded-height row** — a vertical separator `self-stretch`es to its flex parent, so the row it sits in must have a height (e.g. an `HStack` of inline items). Horizontal is always full-width.

## Accessibility — decorative by default
This is a **raw-`Separator`** decision. `decorative` defaults to **true** → `role="none"`, invisible to screen readers — correct for a purely visual rule. Set **`decorative={false}`** (→ `role="separator"` + `aria-orientation`) only when a standalone line marks a *real* boundary between distinct groups a screen-reader user should perceive, not just visual polish. **Inside a component family, use its separator and let it own the context's semantics** — a menu / select / field separator is conventionally decorative (`FieldSeparator` still forwards `decorative={false}` if a grouped-field divider genuinely must be announced).

## Pairs with
- `Stack` / `Flex` — the gap-based way to group content; usually the better first choice over a drawn line.
- The family separators (`DropdownMenuSeparator`, `SelectSeparator`, `TabsSeparator`, `FieldSeparator`, `NavRailSeparator`, `BreadcrumbsSeparator`, `DateRangeSeparator`) — the context-specific renditions built on this primitive.

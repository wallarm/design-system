# Attribute — usage

> A labeled, read-only field for one piece of an object's metadata —
> `AttributeLabel` + `AttributeValue`, composed from sub-components. Display-only
> today; inline edit is designed but not built (see Composition).

## Reach for it when
Laying out an object's **metadata / general info** on a page or in a panel —
title, description, owner, status, created / last-edited, source — one fact at a
time. This is the house pattern for "the facts about this object": reach for
`Attribute` (grouped into columns) instead of hand-rolling `label + value` divs
or a `Text`+`Text` pair. Each fact is one `Attribute`; its value slot holds the
right display component for the data.

## Don't use it for
- **A table of many records** → `Table`. Attribute describes *one* object's
  fields; Table is for collections of same-shaped rows.
- **Editing a value** → it's read-only. Use a real form (`Field` +
  `Input`/`Select`). Inline-edit inside the value is coming but **not built —
  don't hand-roll it**.
- **A lone value with no label** → render the display component by itself
  (`Badge`, `Ip`, `FormatDateTime`…).

## Composition
- Core: `AttributeLabel` + `AttributeValue`. The value slot takes the dedicated
  display component for the data — `Text`, `Badge`, `Tag`, `Ip`/`IpList`,
  `Country`, `FormatDateTime`, `Code`/`InlineCodeSnippet`, `Link`,
  `ParameterPath`.
- Label adornment, pick one: `AttributeLabelInfo` (ⓘ tooltip, brief help),
  `AttributeLabelDescription` (always-on subtext), `AttributeEmptyDescription`
  (subtext shown only while `isEmpty`, e.g. "Not yet assigned").
- Interactive: wrap the value in `AttributeActions` → `AttributeActionsTarget` +
  `AttributeActionsContent` / `AttributeActionsItem` for a contextual actions
  menu on click — investigate / filter by this value / copy and the like. The
  value stays a display component — the target owns the click.
- **Inline edit (Input/Select/DateInput in the value) and an error state are
  designed but NOT shipped — don't build them yet.**
  <!-- TODO(designer): revisit when inline-edit ships -->

## Locked — don't override
- **Empty → em-dash (—)**, never "N/A"/"None"/blank. `isEmpty` forces it (and
  reveals any `AttributeEmptyDescription`); an empty value slot shows it too.
- **Loading → skeleton** via `loading` (wins over `isEmpty`) — don't hand-build
  placeholders.
- **The click target is a locked recipe** (hover / pressed / focus ring) — use
  `AttributeActionsTarget`; never restyle a value into a button.
- **Overflowing values use `OverflowList` / `IpList`** ("+N" popover) — never a
  hand-rolled wrapped map.
- Horizontal label width is **clamped 100–256px** (tune within those bounds per
  case); ignored when vertical.

## Judgment calls
- **orientation** — not a rule, follows the layout: full-page object grids lean
  `vertical` (label above value); tight drawers / fixed-column panels can go
  `horizontal` (label left). Match the form factor, not a policy.
- **`AttributeActions`** — default lets nested bits (a `Link`, copy) keep their
  own clicks while the menu opens from the surrounding area; set
  `disableNestedInteractive` to make the whole value menu-only.

## Pairs with
- The value-slot family — `Badge`, `Tag`, `Ip`, `Country`, `FormatDateTime`,
  `Code`, `Link`, `ParameterPath`, `HttpMethod`/`ResponseCode`: same "dedicated
  component first" rule.
- `Drawer` / `Card` / detail pages — the containers; attributes group into 1–2
  columns.
- `Field` — the editable counterpart (use it until inline-edit ships).

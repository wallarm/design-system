# Text — usage

> The typography primitive for **all non-heading text** — body, labels, captions, metadata, inline runs. A polymorphic element (`<p>` by default, `asChild` to change it) that carries the type scale, the font, and the semantic colour tokens. Never hand-style text.

## Reach for it when
Any run of text that isn't a page or section *heading* — a paragraph, a label, a caption, helper/meta text, an inline span. It's the default text element: reach for it instead of a raw `<p>` / `<span>` / `<div>`, so the text picks up the font, a **type-scale** step, and a colour **token** rather than ad-hoc styling.

## Don't use it for
- **Page / section titles** → `Heading` (the semantic heading levels). Text is body, Heading is hierarchy.
- **A form control's label** → `FieldLabel` (inside `Field`) — it names and wires the control for you; don't hand-build a label out of `Text`.
- **Clickable / navigating text** → `Link` — not `Text` with an `onClick`.
- **Code, monospace, machine values** → `Code` / `CodeSnippet`.
- **A domain value** — status code, HTTP method, IP, country, timestamp, a count → the dedicated display component (`ResponseCode` / `HttpMethod` / `Ip` / `Country` / `FormatDateTime` / `NumericBadge`…), never raw `Text`.

## Locked — don't override
- **No `className`** — it's `Omit`ted; style **only** through the props, never ad-hoc CSS. The font family is fixed.
- **`size` is a type-scale step, not a pixel** — pick by role + surrounding density: small steps for captions / labels / metadata, the default for body, the top step for a lead-in. Never hand-set `font-size`; if the step you need isn't in the scale, that's a *foundations* conversation, not a `className`.
- **`color` is the semantic token set, and de-emphasis is a ladder — not a free choice.** Never a raw hex or Tailwind colour. Default is **`inherit`** (adopts the surface; body is usually `primary`). Step *down* for lower importance — `secondary` for supporting / helper text, the faintest tier for incidental metadata — use `danger` for errors, and the **`-alt`** tokens on dark / colour-filled surfaces.
- **`weight` is emphasis, not hierarchy** — `regular` default, `medium` for gentle emphasis, `bold` sparingly. Rank/hierarchy comes from `size` and `Heading`, not from bolding body text.

## Overflow
Constrained space → `truncate` (single-line ellipsis) or `lineClamp={n}` (clamp to *n* lines). When the clipped text must stay readable, pair it with `OverflowTooltip`.

## Polymorphic
`asChild` renders Text's styling on a *different* element for correct semantics — a `<span>`, a list item, or merged onto a `Link` — without losing the type styles; `inline` switches it to inline flow. Default is a block `<p>`. (For a form control's label, reach for `FieldLabel`, not `asChild`.)

## Pairs with
- `Heading` — titles / section headings (the hierarchy sibling).
- `Link` — when the text is interactive.
- `Code` — monospace / machine values.
- `OverflowTooltip` — to recover truncated text on hover.
- The domain display components — for values (never format a status / date / IP as raw Text).

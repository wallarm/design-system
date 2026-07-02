# Heading — usage

> The typography component for **titles** — page, section, card / panel headings. Polymorphic and styled from the type scale; its one non-obvious rule is that the **semantic level and the visual size are separate knobs**.

## Reach for it when
Any **title or section header** — the page title, a section heading, a card / dialog / drawer title. It's the heading half of the type system; `Text` is everything that isn't a title (body, labels, captions, meta).

## The one rule: level ≠ size
- **`as` sets the semantic level** (`h1`…`h6`) — the document outline screen readers and SEO read. One `h1` per page (usually the page title); **don't skip levels** (h1 → h2 → h3), and a title *inside* a container (card / dialog / drawer) sits **lower** in the outline (h2 / h3), never another `h1`.
- **`size` sets the appearance** — independently. Pick `as` for *structure*, `size` for *look*; a visually small section header can still be an `h2`. **Never choose the element by how big you want the text** — that's the classic heading mistake.

## Don't use it for
- **Body, labels, captions, helper / inline text** → `Text`.
- **Making text big for emphasis** → a larger `size` on `Text` (or a heavier weight) — don't reach for a heading element just to get large text.
- **A big stat / KPI number** → that's display `Text`, not a semantic heading; don't wrap a metric in an `h1`.

## Locked — don't override
- **Style through the props, not `className`** — `size` / `weight` / `color` / `align`; the font family + tight heading tracking are fixed. A `className` won't take effect.
- **`color` is a narrow semantic set** — `primary` (the effective default) / `secondary` + the `-alt` tokens for dark surfaces. **No `danger`, no faint tertiary** (unlike `Text`) — a heading is never an error colour; keep meaning in body text / messaging.
- **`size` is a type-scale step** (up to the display sizes) — never a hand-set `font-size`.

## Pairs with
- `Text` — the body sibling; the title-vs-everything-else boundary runs between them.
- `Stack` / layout — headings define the rhythm; the layout owns the spacing around them.

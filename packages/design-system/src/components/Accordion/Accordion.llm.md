# Accordion — usage

> The **collapse / expand** primitive — stacks sections behind clickable headers and reveals each one's content on demand. A utilitarian progressive-disclosure control: you pick the variant and supply the content; the DS owns the expand/collapse behavior.

## Reach for it when
**Secondary, optional, or lengthy content the user doesn't need all at once** — grouped / advanced settings, FAQ-style Q&A, per-item detail on a long page, a section that's usually collapsed. It trades some visibility for a shorter, scannable page. There has to be **enough content to be worth the extra click** — optionality alone isn't the cue (a single short note goes inline, not in an accordion). Give every header a label that clearly says what's inside.

## Don't use it for
- **Content users read top-to-bottom / most of the time** → don't hide it behind a click; use a plain scrolling page with headings. (Collapsed content can't be scanned or found in-page.)
- **A few *primary* sections users switch between often, one at a time** → `Tabs` (owns one panel; far less clicking for frequent switching).
- **A compact view / mode toggle of the same content** → `SegmentedControl`.
- **Sections that must be *visible at the same time* / read side-by-side** → show them, or a side panel — not stacked collapses.
- **Only one or two short items** → just render them inline; an accordion is overhead.
- **Navigation between areas** → nav, not an accordion. And never bury *essential* info.

## Open model
- **Default: one open at a time** (`collapsible` lets the open one close) — for focus, when sections are alternatives.
- **`multiple`** — several open at once, independent — when users flip between / reference sections on their own terms. (Not when sections must be seen *side-by-side* — that's the "show it" case above.)

## Variants — pick per context (don't invent a 4th)
- **`primary`** — standard rows (the default).
- **`secondary`** — compact, muted; for nested or dense lists.
- **`section`** — a bordered panel with a title + an **`AccordionActions`** slot. Put a header menu / button in `AccordionActions` — it sits *beside* the trigger, not inside it, so its clicks don't toggle the panel.

Layout / size flex *within* these three — the content is yours; the expand/collapse behavior, chevron, animation, and a11y wiring are the component's. Don't hand-roll a collapse or restyle past the variants.

## Pairs with
- `Tabs` — the one-panel-at-a-time sibling; the boundary runs between "open many / stacked disclosure" (Accordion) and "one primary panel" (Tabs).
- `Heading` / `Text` — the header label. `Button` / `DropdownMenu` — inside `AccordionActions`.

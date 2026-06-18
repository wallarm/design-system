# Link — usage

> The navigation member of the Actions family — a styled `<a>` that takes the user somewhere. Four semantic types × five text-matched sizes. Interactive.

## Reach for it when
Anything that **navigates** — goes to a URL or route, changes location, jumps to a section, opens an external page, or downloads a file (`href`, `target`, `rel`, `download` and all native anchor attrs pass through). The test: if activating it *changes where you are*, it's a Link; if it *does something in place*, it's a Button. **Use Link, never a hand-rolled `<a>`** — it carries the semantic color, the hover underline, and sizing, plus `asChild` so a router/Next `<Link>` keeps the styling: `<Link asChild><RouterLink to="…">…</RouterLink></Link>`. The most common case is an **inline link inside body text** — front-load the meaningful words so the text describes where it goes.

## Don't use it for
- An action that *does* something (submit, save, delete, open a dialog) → `Button`. An action is never a Link, even one styled to look text-like; a quiet text-like action is a `ghost` `Button`.
- A "link" with no real destination (only `onClick`, no `href`) → that's a `Button`. If it doesn't go somewhere, it isn't a Link.
- A link that must look like a button → `<Button asChild><a href="…" /></Button>`.
- A navigation target that's currently unavailable → **omit the link (render plain `Text`) or explain why** — don't disable it. `disabled` exists (greys out, drops from tab order) but disabled navigation is an anti-pattern; last resort only.

## Locked — don't override
- **`type` is semantic — never hand-color a link.** `default` = standard brand link · `muted` = quiet / secondary · `alt` = the full `-alt` token family for **dark / inverted surfaces** (rest + hover handled; never pair `alt` with a non-alt hover) · `table` = the **master-cell title link** in a table — reads as plain text at rest, reveals on hover, and **navigates to the object** on click (give it a real `href`; it keeps the whole row from being one big click target). Niche — *only* this master-cell title case; an ordinary link inside a table cell is still `default` / `muted` at the row's size.
- **The underline is automatic** — none at rest, appears on hover / active. Don't add or strip your own `text-decoration`.
- **Icons are CHILDREN, not a prop** (spacing + a fixed icon size are handled — icons don't scale with `size`). A **trailing** icon is the direction / affordance cue — external-link (`SquareArrowOutUpRight`) for new-tab, arrow (`ArrowRight`) for "explore". A **leading** icon is fine when it *identifies the destination* (object or file type, an attachment) — not for decoration.
- **New-tab is native — there is no `newTab` prop.** Set `target="_blank"` **+ `rel="noopener noreferrer"`** (security), add the trailing external-link icon, and put the cue in the accessible name ("opens in new tab").

## Microcopy
Link text must **describe its destination** — front-load the meaningful words. Never "Click here" / "Read more" / "Learn more" / a bare "here": they read as nothing in a screen-reader link list and are a documented a11y failure (GOV.UK; WCAG 2.4.4). Name the info if it leads to info; lead with a verb if it starts a task.

## Sizing & weight — match the surrounding text
An **inline** link takes the scale and weight of the copy it sits in — never size it in isolation. A **standalone** link (toolbar, footer, card) sizes to *its* context and is emphasized with weight, **not** by out-sizing its neighbours.
- **Size** (`xs`–`xl`): match the surrounding / contextual text. Default is **`lg`** (`text-base`), so a link in smaller text needs an explicit size. `xs`→text-2xs · `sm`→text-xs · `md`→text-sm · `lg`→text-base · `xl`→text-lg.
- **Weight** (`regular` default / `medium`): set `weight="medium"` to match medium/bold copy, or to emphasize a standalone link — otherwise `regular`. There's no bold weight; `medium` is the heaviest.

## Pairs with
- `Button` — the sibling action workhorse; the `asChild` bridge works both ways. See `Button` for the boundary from the action side.
- Inline `Text` — the usual home for a link; size + weight matched to the paragraph.
- The rest of the **Actions family** — `ToggleButton`, `SplitButton`, `Select`'s `SelectButton` (routing lives in `Button`).

```tsx
// External, opens a new tab — security rel + icon + announced in the name
<Link href="https://example.com" target="_blank" rel="noopener noreferrer"
  aria-label="API reference (opens in new tab)">
  API reference <SquareArrowOutUpRight />
</Link>

// Internal route via asChild — Link styling, router behavior
<Link asChild><RouterLink to="/settings">Settings</RouterLink></Link>
```

# Loader — usage

> A **spinner** — an always-**indeterminate** "working…" indicator for short, in-context
> waits. Two looks (`circle` / `sonner`), sized 12–48px; you drop it where the wait is.
> The "something's happening, duration unknown" member of the loading family
> (`Progress` / `Loader` / `Skeleton`).

## Reach for it when
A **short (≈1–10s), indeterminate** wait you can't measure, scoped to **one thing** — a
button mid-submit, a chart / module fetching, a panel or section refreshing. Place the
spinner where the wait is happening.

## Don't use it for — the loading family
- **A whole-page / list / card / table first load** → `Skeleton`. A spinning whole page reads as broken; the spinner is for a *module*, not the page. (And don't pair a spinner with a `Skeleton` in the same region — pick one.)
- **A measurable, or any long (>~10s), operation** → `Progress` — determinate if you can measure it, else `Progress value={null}` (an indeterminate *linear* bar beats a spinner that looks frozen). A spinner past ~10s reads as broken.
- **An instant (<~1s) action** → nothing; a sub-second spinner is a distracting flash.

## Locked — don't override
- **Always indeterminate** — there is no determinate spinner; if you can measure progress, that's `Progress`.
- **Two types**: `circle` (default; `background` toggles the faint track ring) and `sonner` (the radial fade). Sizes `sm`–`3xl` (12–48px), icon colors (`primary` / `brand` / `danger` / `primary-alt` for dark surfaces). Don't restyle the SVG.
- A `Button` shows its **own** loading state — use that, don't drop a separate Loader beside a button.

## Accessibility — it's a bare SVG; you supply the rest
The Loader ships **no text label and no live region**, and it always animates. Pair it
with an accessible announcement (`role="status"` / "Loading…") so non-sighted users
know, and **respect `prefers-reduced-motion`**. (System-wide loading-a11y is a
foundations gap — see the design-judgment backlog.)

## Sizing / judgment calls
- **`size`** to the context — `sm` / `md` inline (in a button / field), `xl`+ centered in a panel / section.
- **`color`** — `primary` default; `primary-alt` on dark surfaces; `danger` only to match a danger context; `brand` sparingly.

## Pairs with
- `Button` (which owns its own loading), `Progress` (measurable / long), `Skeleton` (whole-layout load) — the **"which loading indicator?" decision** lives in the design-judgment backlog (loading-feedback ladder).

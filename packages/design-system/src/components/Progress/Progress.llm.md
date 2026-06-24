# Progress — usage

> A **linear progress bar** for an operation whose progress you can *measure*, or a
> long / multi-step job where seeing progress reassures. Determinate by default;
> **`value={null}` makes it indeterminate.** Built on Ark UI. The "how far along" member
> of the loading family (`Progress` / `Loader` / `Skeleton`).

## Reach for it when
You can **measure** how far an operation has got (a real %), or it's a **long (>~10s)
or multi-step** job where the user benefits from seeing it advance and that it's still
working — a file upload / download, an export / import (when you get a real %), a batch job, a
wizard's step progress. (With progress feedback users tolerate the wait far longer.)
**A long (>~10s) wait whose progress you genuinely can't measure also belongs here —
as `value={null}` (indeterminate)**, not a `Loader`: an indeterminate *linear* bar
reads better than a spinner that looks frozen.

## Don't use it for — the loading family
- **A short, indeterminate wait of unknown duration, or anything in-context** (a button, a panel, a chart) → `Loader` (spinner). If you can't measure it but want the *linear* look, use **`value={null}`** (indeterminate) — never a faked, crawling percentage.
- **A whole page / list / card / table loading its known layout** → `Skeleton` (perceived speed, no layout shift), not a bar.
- **An instant (<~1s) action** → show the result optimistically; no indicator.

## Locked — don't override
- **Linear only** — there is **no circular / radial** progress in the system. Don't hand-roll a ring.
- **`value={null}` = indeterminate, a number = determinate** — and **switch from `null` to a real number the moment you can measure**. Never fake a percentage.
- Fill animates automatically; track + range styling is fixed.
- **A11y is built in** (Ark gives it `progressbar` + `aria-valuenow`, so a determinate bar is announced — unlike the bare-SVG `Loader`). Still give a long operation a visible label; reduced-motion applies to the fill.

## Sizing / judgment calls
- **`value` / `min` / `max`** — the data (`min`/`max` default 0–100); `value={null}` for indeterminate.
- **`size`** `xs` (default) → `lg` — match the surface (a thin `xs` bar inline; a thicker one for a prominent standalone operation).
- **`color`** defaults `brand`; the full palette exists but stay `brand` unless a status genuinely applies (e.g. red for a failing job).
- **`showLabel`** — show the `%` for a long / standalone operation where the number reassures; omit for a thin inline bar.

## Pairs with
- `Loader` (short / indeterminate / in-context) and `Skeleton` (whole-layout load) — the other two indicators; the **"which loading indicator?" decision** lives in the design-judgment backlog (loading-feedback ladder).
- A `Text` label + an accessible announcement of the operation's start / finish.

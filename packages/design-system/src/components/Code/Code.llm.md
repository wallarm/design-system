# Code — usage

> The **monospace text style** — code-as-typography (`font-mono`), rendered as a `<p>` (or `asChild`).
> Pure type: **no background, no copy, no syntax highlighting, no chrome.** The lightest, chrome-free
> rung of the code-display ladder (the monospace sibling of `Text`).

## Reach for it when
A value or string should read as **monospace text** but carries no affordance — a code-shaped value in a
`Table` cell, an ID / hash / token / path in a label or `Attribute` row, a `version`, a header value, a
short mono string in running UI. **Machine values render mono; human words stay in `Text`.** Reach for
`Code` instead of hand-rolling `<span className="font-mono">`. (`Ip` renders its address on `Code`
internally; prefer a dedicated display component — `Ip`, `ParameterPath`, etc. — when one fits the value.)

## Don't use it for — climb the ladder
- **An inline code *chip*** (background, optional click-to-copy) inside prose → `InlineCodeSnippet`. The chip/background is the cue, not whether it copies.
- **A standalone code *block*** to read / scan / copy / run (highlighting, line numbers, copy, tabs, folding) → `CodeSnippet`. Even multi-line mono text needs `CodeSnippet` the moment it wants *any* affordance — `Code` is chrome-free (a chrome-free multi-line mono paragraph is the only multi-line case that stays `Code`).
- **Prose / human-language text** → `Text`. `Code` is for machine strings, not sentences.

## Locked — don't override
- **Pure typography** — no background, no copy, no highlighting, no border. The moment you need any of those you're on the wrong rung (→ `InlineCodeSnippet` / `CodeSnippet`).
- **`size` / `weight` follow the surrounding type** — match the neighbouring text's scale and weight (the foundations density rule), don't pick in isolation.
- **`color` follows meaning, never decoration** — default `primary`; `secondary` to de-emphasize; `destructive` only when the value itself denotes an error. Don't recolor a mono value to "stand out".

## Pairs with
- `InlineCodeSnippet` (chip) + `CodeSnippet` (block) — the heavier rungs; this is the chrome-free base. The full ladder lives in `CodeSnippet`'s doc.
- `Table` / `Attribute` — mono values in cells / metadata rows render as `Code` (or a dedicated display component when one exists); long values clip via `OverflowTooltip`.

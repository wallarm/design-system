# CodeSnippet — usage

> The read-only, multi-line **code block** — syntax highlighting, copy, line numbers,
> annotations, folding, tabs, fullscreen, wrap, and `maxLines` show-more collapse.
> Compound: `CodeSnippetRoot` + `CodeSnippetContent` + `CodeSnippetCode` (+ optional
> header / actions / line-numbers / tabs). This file also covers **`InlineCodeSnippet`**
> (the inline code *chip*), exported from the same directory. Code is a string **prop**
> (`code="…"`), never children — these are display surfaces, not editors.

## Which code rendition? (the #1 decision — a 3-rung ladder)
- **Plain monospace *text* — no background, no chip** — a code-shaped value in a table cell, a label, a token rendered as typography → **`Code`** (the text style, its own file). It's pure typography: no copy, no highlighting, no chrome. Not this.
- **An inline token / command *inside a sentence*, shown as a *chip* (background + rounded)** (`npm install …`, an env-var name, a path) → **`InlineCodeSnippet`** (see its section). The **chip/background is what picks it over `Code`** — *not* copyability: the chip copies by default, but copy is a per-product-case toggle that can be off and it's still a chip.
- **A standalone, multi-line block** to read / scan / copy / run — with highlighting, line numbers, tabs, folding, or a filename header → **`CodeSnippet`** (this). A single one-line command can be a block too when it's a standalone copy target rather than part of a sentence.

## Reach for it when
You're showing a block of code, config, or a request/response the user will read or copy:
a `curl`/`bash` install block, a JSON/YAML config, a code example, an HTTP request or
response (the security-domain case — annotate the lines that matter). The block owns its
own scroll, copy, and chrome — don't wrap a `<pre>` by hand or rebuild copy/line-numbers.

## Don't use it for
- **Inline code in prose** → `InlineCodeSnippet`. A block inside a paragraph breaks the text flow.
- **Plain monospace text with no chip/background** (a mono value, a label) → the `Code` text style.
- **Editable code / a code input** → not this. CodeSnippet is **read-only display**; use a real form control / editor.
- **A short non-code value** — an IP, a parameter path, a status/method → the dedicated display component (`Ip`, `ParameterPath`, `ResponseCode`, `HttpMethod`), not a code snippet.

## Composition — sanctioned forms (build from these, don't invent chrome)
The spine is always `CodeSnippetRoot code=… language=…` → `CodeSnippetContent` → `CodeSnippetCode`. Layer on:
- **Line numbers** — add `<CodeSnippetLineNumbers/>` as the first child of `CodeSnippetContent` (before `CodeSnippetCode`).
- **Filename / title header** — `CodeSnippetHeader` > `CodeSnippetTitle` ("install.sh"). Add a header when the code has a real paste destination; omit for throwaway examples.
- **Tabs (multi-variant command)** — `CodeSnippetHeader` > `CodeSnippetTabs`/`CodeSnippetTab` (npm/pnpm/yarn/bun, or curl/python/node). **You own the tab state and swap the `code` prop yourself** (and `language` too, when it differs per tab — e.g. curl vs python — or the highlighting goes stale) — the tabs don't store multiple bodies. Actions sit in the same header beside the tabs.
- **Actions** — `CodeSnippetActions` holding the pre-built `CodeSnippetCopyButton` / `CodeSnippetFullscreenButton` / `CodeSnippetWrapButton`. Inside a `CodeSnippetHeader` they live in the bar; with no header they float top-right automatically.
- **Show-more collapse** — set `maxLines` on the Root; the show-more button **auto-renders** (won't collapse fewer than 3 hidden lines). Add `<CodeSnippetShowMoreButton/>` as a direct child **only** when the real button needs your props (analytics id, handlers) — it then **replaces** the auto-rendered one (no duplicate).
- **Folding** — pass `folds`; for HTTP request/response use the `getHttpFolds(code)` helper.

## Locked — don't override
- **Read-only display** — no editing, no text input. The whole component is for reading/copying.
- **Copy is built in, with a confirmation tooltip** — block: `CodeSnippetCopyButton` (icon → "Click to copy" / "Copied"); inline: click anywhere on the chip. Don't bolt on your own copy button or replace the tooltip.
- **Syntax highlighting is OFF until you wire an adapter** — with no `CodeSnippetAdapterProvider` the block renders plain (and a `language` the adapter doesn't support silently falls back to plain too). Plain is fine for a prototype; see *Highlighting* below for the real choice.
- **Syntax colors are code-/foundations-managed.** The `--color-syntax-*` tokens come from WADS foundations (Figma note: "find all syntax-category tokens in the wads foundations"), and the semantic token→color mapping must not be re-pointed to match a mockup. Don't hand-set token colors.
- **Wrap is a toggle, off by default** (`CodeSnippetWrapButton` = a `ToggleButton`) → long lines scroll horizontally until the user wraps. **Fullscreen** opens a portal overlay, closes on Esc — both automatic.
- **Annotation colors are a fixed enum** — `lines={{ n: { color, ranges, prefix, textStyle } }}`, color ∈ `danger | warning | info | success | brand | ai | neutral`. (Figma labels the danger one "Error" — the prop value is `danger`.) Don't invent colors.

## Sizing / judgment calls
- **`size`** — `sm` is the default; reach for `md` / `lg` only when a denser/larger block is actually needed. (The Sizes story labels `md` "(default)" — that's a stale label; the real default is `sm`.)
- **Annotate sparingly** — highlight only the lines under discussion (a block where every line is colored reads like no highlight at all). The colored-line + prefix machinery is built for HTTP requests/responses — mark the payload/attack line, not the whole request.
- **`maxLines`** — set it when a block is long enough to dominate the page; otherwise let it render full-height.

## Highlighting — which adapter (no single house standard)
Highlighting is a per-product-case / per-language choice **wired in code, not read from Figma**. To turn it on, wrap the block (ideally app-level, for code-splitting) in `CodeSnippetAdapterProvider adapter={loader}` and pass a `language` the adapter supports:
- **`loadPrismAdapter`** (~15KB) — the lightweight default for most cases; covers js/ts/jsx/tsx, bash/shell, json, html/xml, css, python, go, sql, yaml, markdown, http.
- **`loadHighlightJsAdapter`** (~30KB) — well-established alternative, fewer languages (no jsx/tsx/yaml/markdown).
- **`loadShikiAdapter`** (~200KB+, WASM) — VS Code-quality + extra languages (rust/java/c/cpp); reach for it only when you need that fidelity/coverage, given the bundle cost.
- No provider → plain (no highlighting) — the prototype default.

## InlineCodeSnippet — the inline chip
An inline `<code>` chip (background + rounded) for a token or command **inside running text**. The chip/background is the reason to pick it over the `Code` text style.
- **`size`** defaults to `inherit` — in prose, keep `inherit` so it matches the surrounding text; the explicit `sm`/`md`/`lg` are for standalone use.
- **`copyable` defaults to `true`** (click anywhere on the chip → tooltip "Click to copy" / "Copied"). Whether the chip copies is a **per-product-case call, not a fixed rule** — set `copyable={false}` when the case is just naming a token, not offering a copy. A non-copyable chip is **still an `InlineCodeSnippet`, not `Code`** — it keeps the background.
- Don't put multi-line content in it → that's a `CodeSnippet` block.

## A labelled "code field"? Compose it — there's no dedicated component
Figma shows a `code-snippet-field` (a label + code, with an Error state); **it isn't a shipped component or story**. When a code value should read as a labelled field, **compose it** — a `Field` / `FieldLabel` (plus `FieldError` if it can be invalid) wrapped around an `InlineCodeSnippet` or a `CodeSnippet` block. The snippet stays **read-only** — any "error" is an *externally determined / presentational* message on the surrounding `Field` (a value rejected upstream), not validation of an input the user edits. Don't wait for a dedicated component, and don't expect a built-in error state on the snippet itself.

## Pairs with
- `Code` (mono text style) + `InlineCodeSnippet` (inline chip) — the two lighter rungs of the same ladder.
- `Tabs` — the header tab set is the real `Tabs` (small / grayscale); `ToggleButton` powers wrap; `Tooltip` + `Kbd` power the copy/fullscreen affordances.
- `Table` — code-bearing cells use `InlineCodeSnippet` or `Code`, not a full block.

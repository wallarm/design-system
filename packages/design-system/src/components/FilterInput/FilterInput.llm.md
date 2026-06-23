# FilterInput — usage

> A config-driven **query-builder pattern** — an input that builds a structured
> **AND/OR filter expression** as removable chips via field → operator → value
> autocomplete, and hands back an expression *tree* (not a string). Filed in
> Storybook under **Patterns/**, not Components — it's heavyweight and
> config-driven. Interactive.

## Reach for it when
You're filtering a **data-dense resource with many attributes** — a logs /
events / sessions / attacks explorer, a big table behind a new section — and
users need **precise, compound queries**: several conditions joined with AND/OR,
grouping, and operators beyond equality (`>`, `between`, `like`, `in`, is-set).
You define a `fields` metadata config — **hardcode it for a prototype**; in
production it's typically served from a backend query-metadata endpoint.
`onChange` hands back an `ExprNode` tree.

## Don't use it for — it's a pattern, not a default filter
- **Simple filtering** — a handful of facets (≈3–5), pick-from-a-list, results
  update live → a row of `Select` (and/or `SegmentedControl`) dropdowns, **not**
  FilterInput. A query builder for simple cases is overkill and nudges users into
  no-result queries (the agnostic guidance: ~3–5 dropdowns is the simple-filter
  sweet spot; reach for a builder only past that). *(No dedicated lightweight
  "filter bar" component exists yet — compose `Select`s; a simple-filter pattern
  is a likely future addition.)*
- **Free-text search** across a record ("find this term") → a search `Input`
  (search icon via `InputGroup`), not a structured query.
- **A form field that captures a value** → the form inputs
  (`Input` / `Select` / `DateInput` …). FilterInput is a filtering *surface* that
  sits above a result set, not a labelled field.
- **Picking one known value** → `Select`.

## It's a pattern — config in, expression tree out
- **Config-driven.** Pass `fields: FieldMetadata[]`; each field's `type` drives
  which operators are offered, and its `values` / `options` / `getSuggestions`
  drive value autocomplete. Don't hardcode operators or hand-assemble chips — the
  field config is the single source of truth.
- **For a prototype, that's all you need** — hardcode a `fields` array and read
  the result from `onChange`. **Don't let "it needs a backend" block you:** the
  metadata endpoint and the query execution are an engineering concern handled
  when the prototype goes to production, not something the prototype itself needs.
- **Output is an expression tree, not a string.** `onChange` returns a recursive
  `ExprNode` (`Condition | Group`, AND/OR); `value` controls it. In a prototype,
  log it or filter client-side; in production it goes to a query API.
- **Self-contained UI.** The field → operator → value (and date) menus, parsing,
  chip rendering, and edit/delete are all internal. The sub-menus are exported
  only for rare custom builds — don't hand-wire them.

## Locked — don't override
- **Operator labels are house-fixed** — `=`→"is", `!=`→"is not", `in`→"is any
  of", `is_null`→"is set", etc. Pass the operator tokens; the UI renders the
  words. Don't relabel.
- **Chips + connectors are automatic** — attribute·operator·value chips, AND/OR
  connector chips and parenthesis grouping between them, click-to-edit,
  hover-to-delete, clear-all; the first chips show inline and extras collapse to a
  hint. You don't build chip markup.
- **It does NOT read `Field` context** — it isn't a labelled form control; don't
  wrap it in a `Field` expecting label/error wiring.
- **`status_code` is a reserved field `name`** — DS auto-wires HTTP-status
  helpers (mask suggestions like "4XX", format validation, digit/X input filter,
  normalization) and **DS callbacks override yours** for it. To opt out, use a
  different `name` and attach the `createStatusCode*` factories manually.
- **The whole query is portable as text** — select-all copies the expression as a
  parseable string; paste re-parses it (with parse-error handling). This is the
  target of `ParameterPath`'s "copy → ready FilterInput expression".

## Judgment calls
- **The use-it-at-all call** (the boundary above) is the big one — and it's two
  axes, not just field count: reach for FilterInput when **either** the attribute
  count is high **or** users need boolean shape (AND/OR, grouping) or operators
  beyond equality (`between`, ranges, `like`, is-set). A few facets all picked by
  equality → a row of `Select`s, even if there are several; conversely even 3–4
  fields that need ranges/AND-OR can justify the builder.
- **`strictValues`** (per field) — `true`: `values`/`options` are an allowlist
  (invalid → "Invalid value"); `false`: they're suggestions and free typed values
  commit (the backend validates). The Attacks page uses `false`.
- **`externalErrors`** (field names) — paint chips red for values the backend
  rejected; presentational only (the expression / `onChange` are untouched). Pair
  with your own `Alert` and clear the prop when the filter changes; use
  **`onErrorsChange`** so you don't stack your alert on top of the message
  FilterInput already shows.
- **`placeholder`** (default "Type to filter…") and **`showKeyboardHint`**
  (default off — turn on where discoverability matters).

## Pairs with
- The **results table / list** it filters (it sits above it). *In production* it
  also pairs with a backend query-metadata endpoint (`fields`) + a query endpoint
  (runs the `ExprNode`) — a prototype needs neither.
- `Select` / `SegmentedControl` — the simpler-filtering alternative for few
  facets (the boundary above).
- `ParameterPath` — its copy action emits a ready FilterInput expression.
- `Alert` — surface backend rejection text alongside `externalErrors`
  (coordinated via `onErrorsChange`).

```tsx
// fields ideally come from a backend query-metadata endpoint
<FilterInput
  fields={whereFields}
  value={expression}
  onChange={setExpression}   // ExprNode tree → your query API
  placeholder="Filter attacks…"
/>
```

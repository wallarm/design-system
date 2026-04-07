# Filter Copy/Paste — Design Spec

**Jira:** AS-809
**Date:** 2026-04-06
**Scope:** `packages/design-system/src/components/FilterInput`

## Overview

Add the ability to select all filter chips (Ctrl+A), copy them as a human-readable text string (Ctrl+C), paste a filter string to restore filters (Ctrl+V), and delete selected chips (Delete/Backspace). This enables filter sharing via Slack, Zoom, or any text channel.

## Text Format

```
(attack_type in [sqli, xss]) AND (host != staging.example.com) AND (status_code > 200)
```

- Each condition wrapped in parentheses
- Conditions joined by ` AND ` or ` OR `
- Operators use raw symbols: `=`, `!=`, `>`, `<`, `>=`, `<=`, `in`, `not_in`, `like`, `not_like`, `is_null`, `is_not_null`, `between`
- Multi-value: `[val1, val2, val3]` with comma+space separation
- Single values unquoted: `(attack_type = sqli)`
- Unary operators have no value: `(field is_null)`
- `between`: `(date between [val1, val2])`
- Top-level conditions sorted alphabetically by field name for deterministic output

## New Files

### 1. `lib/serializeExpression.ts`

**Function:** `serializeExpression(expr: ExprNode, fields?: FieldMetadata[]): string`

Recursively walks the expression tree and produces the canonical text format.

**Logic:**

- `Condition` node:
  - `is_null` / `is_not_null` → `(field operator)` (no value)
  - Array value → `(field operator [v1, v2, v3])`
  - Single value → `(field operator value)`
  - Uses `condition.field` (API name), not display label
- `Group` node:
  - Serializes each child, joins with ` AND ` or ` OR `
  - Top-level AND group: children sorted alphabetically by field name
  - Nested groups: no sorting (preserve user intent)
- `null` expression → empty string `""`

**Edge cases:**

- Empty value → `(field operator )`
- Value containing special characters (commas, brackets) → no escaping in v1 (document as limitation)

### 2. `lib/parseExpression.ts`

**Function:** `parseExpression(text: string, fields: FieldMetadata[]): ExprNode`

Recursive descent parser that converts text back to an expression tree.

**Tokenizer** produces tokens:

| Token type | Examples |
|---|---|
| `LPAREN` | `(` |
| `RPAREN` | `)` |
| `LBRACKET` | `[` |
| `RBRACKET` | `]` |
| `COMMA` | `,` |
| `AND` | `AND` (case-insensitive) |
| `OR` | `OR` (case-insensitive) |
| `OPERATOR` | `=`, `!=`, `>`, `<`, `>=`, `<=`, `in`, `not_in`, `like`, `not_like`, `is_null`, `is_not_null`, `between` |
| `IDENT` | Field names, values (anything else) |

**Parser grammar (precedence: OR < AND):**

```
expression  → term ( OR term )*
term        → factor ( AND factor )*
factor      → LPAREN expression RPAREN
            | condition
condition   → IDENT OPERATOR value_list
            | IDENT OPERATOR IDENT
            | IDENT unary_operator
value_list  → LBRACKET IDENT ( COMMA IDENT )* RBRACKET
unary_operator → is_null | is_not_null
```

**Validation:**

- Field name checked against `fields` array by `name` — unknown field → `FilterParseError`
- Operator checked against `FilterOperator` type — unknown operator → `FilterParseError`
- If field has `operators` defined, operator must be in that list

**Error handling:**

- Throws `FilterParseError` (extends `Error`) with a human-readable `message`
- Examples: `"Unknown field: foo"`, `"Expected operator after field 'attack_type'"`, `"Unexpected token ')' at position 15"`

### 3. `FilterParseError` class

```ts
export class FilterParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FilterParseError'
  }
}
```

Defined in `lib/parseExpression.ts`, exported from `lib/index.ts`.

## Modified Files

### 4. `FilterInput.tsx` — Keyboard Handlers

**New state:**

```ts
const [allSelected, setAllSelected] = useState(false)
const [pasteError, setPasteError] = useState<string | null>(null)
```

**Ctrl+A — Select All:**

- On the container `<div>`, add `onKeyDown` handler
- When `Ctrl+A` / `Cmd+A` detected and filter bar is focused:
  - `e.preventDefault()` (prevent browser select-all)
  - `setAllSelected(true)`
  - Blur the input to prevent text cursor showing
- All chips get a visual "selected" state via `data-selected-all` on the container
- Deselect triggers: `Escape`, any click, any typing, any chip action → `setAllSelected(false)`

**Ctrl+C — Copy:**

- On the container `<div>`, add `onCopy` handler
- When `allSelected` is true (or there are chips and focus is in filter bar):
  - `e.preventDefault()`
  - `const text = serializeExpression(buildExpression(conditions, connectors))`
  - `e.clipboardData.setData('text/plain', text)`
- If no chips → no-op

**Ctrl+V — Paste:**

- On the container `<div>`, add `onPaste` handler
- Read `e.clipboardData.getData('text/plain')`, trim whitespace
- If empty → no-op
- Try `parseExpression(text, fields)`:
  - Success → `onChange(parsedExpr)`, `setAllSelected(false)`, `setPasteError(null)`
  - `FilterParseError` → `setPasteError(error.message)`, existing filters unchanged
- `e.preventDefault()` to prevent text appearing in input

**Delete/Backspace — Delete Selected:**

- In the existing `onKeyDown` handler on the container:
- When `allSelected` is true and `Delete` or `Backspace` pressed:
  - `e.preventDefault()`
  - Remove all non-disabled conditions (call `onChange` with only disabled conditions remaining, or `null` if none)
  - `setAllSelected(false)`

### 5. Visual Selection State

On the container `<div>`, when `allSelected` is true:

- Add `data-selected-all` attribute
- CSS: all chip elements inside get a selected highlight (e.g., `ring-2 ring-border-accent bg-bg-accent/10`)
- Disabled chips also get highlighted (they're selected but won't be deleted)
- Connector chips (AND/OR) and paren chips also highlighted

Styling via Tailwind group selector:

```css
/* In FilterInputChip classes */
'group-data-[selected-all]/filter-input:ring-2 group-data-[selected-all]/filter-input:ring-border-accent'
```

The container gets `group/filter-input` class.

### 6. Paste Error Display

- `pasteError` string is prepended to the `errors` array passed to `FilterInputErrors`
- Auto-clear after 5 seconds via `useEffect` with timeout
- Clear on next user action (input change, chip click, focus change)

### 7. Exports

`lib/index.ts` — add:

```ts
export { serializeExpression } from './serializeExpression'
export { FilterParseError, parseExpression } from './parseExpression'
```

`FilterInput/index.ts` — add:

```ts
export { FilterParseError, parseExpression, serializeExpression } from './lib'
```

## Tests

### `__tests__/serializeExpression.test.ts`

- Single condition with each operator type
- Multi-value `in` / `not_in`
- Unary `is_null` / `is_not_null`
- `between` with two values
- AND group
- OR group
- Mixed AND/OR
- Alphabetical sorting of top-level conditions
- Null expression → empty string
- Empty value

### `__tests__/parseExpression.test.ts`

- Single condition: `(field = value)`
- Multi-value: `(field in [a, b, c])`
- Unary: `(field is_null)`
- AND: `(a = 1) AND (b = 2)`
- OR: `(a = 1) OR (b = 2)`
- Mixed: `(a = 1) AND (b = 2) OR (c = 3)` — AND has higher precedence
- Nested parens: `((a = 1) OR (b = 2)) AND (c = 3)`
- Unknown field → FilterParseError
- Unknown operator → FilterParseError
- Malformed input → FilterParseError
- Round-trip: serialize → parse → serialize produces same string
- Whitespace tolerance: extra spaces, leading/trailing whitespace

### Copy/Paste integration tests (E2E or component tests)

- Ctrl+A highlights all chips
- Ctrl+A → Ctrl+C puts correct string on clipboard
- Ctrl+V with valid string replaces filters
- Ctrl+V with invalid string shows error, filters unchanged
- Ctrl+A → Delete removes non-disabled chips, keeps disabled
- Ctrl+A → Escape deselects
- Clicking after Ctrl+A deselects

## Out of Scope

- Cross-tenant sharing (AS-810)
- Values with commas/brackets escaping (v1 limitation — document)
- Partial selection of individual chips
- Drag-select chips
- Keyboard shortcut customization

---
name: filter-field-design
description: >-
  Implementation and architecture reference for the FilterInput query-builder
  component (config-driven field→operator→value autocomplete, expression-tree
  model, chip rendering, and a Playwright testing guide). Use when building,
  wiring, or testing FilterInput, or when you need its real component names,
  import paths, props, types, or Storybook titles.
---

# FilterInput System Design Reference

Implementation and architecture documentation for the Wallarm **FilterInput**
query-builder. This document describes the public components, the config-driven
mechanics, the expression-tree data model, chip rendering, and a Playwright
testing guide.

> **Companion doc:** `packages/design-system/src/components/FilterInput/FilterInput.llm.md`
> is the **judgment / usage-intent** layer — *when* to reach for FilterInput,
> when **not** to (a row of `Select`s for ≈3–5 facets), what's locked, and what
> it pairs with. **This** doc is the **implementation / architecture** reference
> (real names, paths, props, types, mechanics). Read the `.llm.md` for the
> design decision; read this for the wiring.

---

## 🎯 Core Concept: Simple Config-Driven API

**`FilterInput` works by passing a `fields` config** — no manual field
definitions, no hardcoded operators, no hand-assembled chips. Each field's
`type` decides which operators are offered; its `values` / `options` /
`getSuggestions` drive value autocomplete.

The config is typically served from a backend query-metadata endpoint, but for
a prototype you just hardcode the `fields` array and read the result from
`onChange`.

### Integration Pattern

```tsx
import { FilterInput } from '@wallarm-org/design-system';
// or the subpath: import { FilterInput } from '@wallarm-org/design-system/FilterInput';
import type { ExprNode, FieldMetadata } from '@wallarm-org/design-system';
import { useState } from 'react';

// fields ideally come from a backend query-metadata endpoint
const whereFields: FieldMetadata[] = [
  { name: 'last_seen', label: 'Last seen', type: 'date' },
  {
    name: 'status',
    label: 'Status',
    type: 'enum',
    values: [
      { value: 'registered', label: 'Registered' },
      { value: 'blocked', label: 'Blocked' },
    ],
  },
];

function AttackFilters() {
  const [expression, setExpression] = useState<ExprNode | null>(null);

  return (
    <FilterInput
      fields={whereFields}
      value={expression}
      onChange={(expr) => {
        setExpression(expr); // ExprNode tree → your query API
      }}
      placeholder="Filter attacks…"
    />
  );
}
```

**Key benefits:**
- ✅ Zero per-condition wiring — `FilterInput` manages its own state.
- ✅ No hardcoded operators — the field `type` decides which operators appear.
- ✅ Config is the single source of truth — values, suggestions, validation all
  hang off `FieldMetadata`.
- ✅ Type-safe — full TypeScript support, no `any`.
- ✅ Output is a structured **expression tree** (`ExprNode`), not a string.

---

## 📚 Component Architecture

The component lives at
`packages/design-system/src/components/FilterInput/`. Real nested structure:

- `FilterInput.tsx` — the main component + `FilterInputProps`.
- `index.ts` — public exports.
- `types.ts` — `FieldMetadata`, `ExprNode`, `Condition`, `Group`,
  `FilterOperator`, `FieldType`, `FieldValueOption`, `FilterInputChipData`,
  `FilterInputChipVariant`.
- `FilterInputField/` — the chip strip, holding:
  - `FilterInputChip/` — the attribute·operator·value chip (`FilterInputChip`).
  - `FilterInputConnectorChip/` — the AND/OR/parenthesis connector chip.
- `FilterInputMenu/` — the autocomplete menus:
  - `FilterInputFieldMenu.tsx` — field-selection menu.
  - `FilterInputOperatorMenu.tsx` — operator-selection menu.
  - `FilterInputValueMenu/` — value-selection menu.
  - `FilterInputDateValueMenu/` — date value / preset menu (date fields).
- `FilterInputContext/` — internal React context wiring.
- `hooks/` — autocomplete, expression, and selection hooks.
- `lib/` — parser (`parseExpression/`), serializer, constants, validation,
  field helpers, `statusCode/` factories.
- `stories/` — Storybook stories (filed under **Patterns/**).

### Public exports (`index.ts`)

```typescript
// Components
export { FilterInput, type FilterInputProps } from './FilterInput';
export { FilterInputChip, type FilterInputChipProps } from './FilterInputField';
export {
  FilterInputFieldMenu, type FilterInputFieldMenuProps,
  FilterInputOperatorMenu, type FilterInputOperatorMenuProps,
  FilterInputValueMenu, type FilterInputValueMenuProps,
  type ValueOption,
} from './FilterInputMenu';

// Utilities
export {
  applyFieldValueTransforms, COUNTRY_OPTIONS,
  createStatusCodeInputFilter, createStatusCodeNormalizer,
  createStatusCodeSerializer, createStatusCodeSuggestions,
  createStatusCodeValidator,
  type FilterParseError, getKnownFieldSerializer, isFilterParseError,
  parseExpression, serializeExpression, validateValueForField,
} from './lib';

// Types
export type {
  Condition, ExprNode, FieldMetadata, FieldType, FieldValueOption,
  FilterInputChipData, FilterInputChipVariant, FilterOperator, Group,
} from './types';
```

> `FilterInputDateValueMenu` is also exported from the `FilterInputMenu` barrel
> for date fields; the menus are exported only for rare custom builds — in normal
> use you render `<FilterInput>` and it wires the menus internally.

### Core Components

#### FilterInput
**Path:** `packages/design-system/src/components/FilterInput/FilterInput.tsx`
**Storybook:** `Patterns/FilterInput/FilterInput`

**Main filter component — self-contained, config-driven.** Pass `fields` and it
handles autocomplete, chip creation/editing/removal, expression parsing, and
error rendering automatically.

**Key features:**
- **Self-contained**: internal state management, no manual menu wiring.
- **Config-driven**: pass `fields`; everything derives from it.
- Autocomplete menus (field → operator → value, plus a date menu) handled
  internally.
- Expression parsing and chip creation automatic.
- Visual chips with AND/OR connectors and parenthesis grouping; first chips
  render inline, extras collapse to a hint; click-to-edit, hover-to-delete,
  clear-all.
- Keyboard support (menu navigation, Backspace to delete, Escape to close).
- Select-all copies the whole query as a parseable string; paste re-parses it
  (with parse-error handling).

**Props — the real `FilterInputProps`** (verbatim shape from
`FilterInput.tsx`). It extends
`Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'>`:

```typescript
interface FilterInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  fields?: FieldMetadata[];                  // field config (drives autocomplete)
  value?: ExprNode | null;                   // controlled expression
  onChange?: (expression: ExprNode | null) => void; // emits the expression tree

  placeholder?: string;                      // default 'Type to filter...'
  error?: boolean;                           // error styling on the whole input

  // Field names whose VALUES the backend rejected → matching chips painted red.
  // Purely presentational: conditions and onChange output are unaffected. The
  // consumer renders its own message (e.g. an Alert) and clears this when the
  // filter changes or the query succeeds.
  externalErrors?: string[];

  // Notified whenever the set of validation messages FilterInput renders below
  // the input changes (empty array = none). Lets a consumer avoid stacking its
  // own message on top. Pass a stable (memoized) callback.
  onErrorsChange?: (errors: string[]) => void;

  showKeyboardHint?: boolean;                // default false
}
```

**How it works internally (the autocomplete cascade):**
- User clicks/types → **`FilterInputFieldMenu`** opens (field selection).
- User selects a field → **`FilterInputOperatorMenu`** opens (operators filtered
  by field `type`).
- User selects an operator → **`FilterInputValueMenu`** opens (or
  **`FilterInputDateValueMenu`** for date fields).
- User selects/commits a value → a chip is created, the expression is rebuilt,
  and `onChange` fires.

**Stories to reference** (`Patterns/FilterInput/FilterInput`):
- `Default` — empty state with placeholder.
- `WithKeyboardHint` — keyboard hint shown.
- `ErrorEmpty` — error styling, empty.
- `WithPresetValue` — controlled `value` with a single condition.
- `WithMultiConditionPreset` — multiple conditions joined with AND/OR.
- `ErrorWithValue` — value-level error on a chip.
- `WithDisabledChips` / `AllChipsDisabled` — non-editable/non-removable chips.
- `HTTPStatusCodeSuggestions` / `HTTPStatusCodeByName` — the reserved
  `status_code` field in action.

---

#### FilterInputChip
**Path:** `packages/design-system/src/components/FilterInput/FilterInputField/FilterInputChip/FilterInputChip.tsx`
**Storybook:** `Patterns/FilterInput/FilterInputChip`

Visual representation of a single filter **condition** (the
attribute·operator·value chip). Logical operators and parentheses are rendered
by a **separate** component, `FilterInputConnectorChip` (variants `and`, `or`,
`(`, `)`).

**Props (`FilterInputChipProps`, extends `Omit<HTMLAttributes<HTMLDivElement>, 'children'>`):**
```typescript
interface FilterInputChipProps {
  ref?: Ref<HTMLDivElement>;
  chipId?: string;
  attribute: string;          // field label
  operator?: string;          // operator label (e.g. 'is')
  value?: string;             // value display text
  error?: ChipErrorSegment;   // boolean | 'attribute' | 'value'
  valueParts?: string[];      // individual parts for multi-value chips
  valueSeparator?: string;    // default ', '
  errorValueIndices?: number[]; // invalid value indices (e.g. 'in' operator)
  building?: boolean;         // mid-construction chip
  disabled?: boolean;         // not editable / not removable (dimmed)
  onRemove?: () => void;      // shows delete button on hover
  onSegmentClick?: (segment: ChipSegment, anchorEl: HTMLElement) => void;
}
```

> `error` is a `ChipErrorSegment` (`boolean | 'attribute' | 'value'`), so an
> error can target the whole chip or just one segment. This is richer than a
> plain boolean.

**Stories to reference** (`Patterns/FilterInput/FilterInputChip`):
- `Default`, `WithError`, `WithLongText`, `RealisticExample` — chip states.
- `AndOperator`, `OrOperator`, `OpeningParenthesis`, `ClosingParenthesis` —
  connector-chip variants (rendered via `FilterInputConnectorChip`).
- `CombinedWithAnd`, `CombinedWithOr`, `CombinedWithParentheses` — composed.
- `WithDeleteButton`, `ErrorWithDelete`, `InteractiveDeleteExample` — removal.
- `Disabled`, `DisabledWithOnRemove`, `DisabledAndInteractiveMix` — disabled.
- `BuildingAttributeOnly`, `BuildingWithOperator`, `BuildingComplete` — the
  in-progress (building) states.
- `AllStatesShowcase` — overview of all variants and states.

---

### Menu Components

In normal use these are wired internally by `FilterInput`; they are exported for
rare custom builds and have their own stories.

#### FilterInputFieldMenu
**Path:** `packages/design-system/src/components/FilterInput/FilterInputMenu/FilterInputFieldMenu/FilterInputFieldMenu.tsx`
**Storybook:** `Patterns/FilterInput/FilterInputFieldMenu`

Dropdown for **field selection** (first step in the cascade).

**Features:**
- `filterText` filters fields by `label`/`name` (via `filterAndSort`).
- Recent conditions section (max 3, shown when no filter text).
- Suggested-fields section.
- Keyboard navigation; can offer AND/OR connectors (`onSelectAnd` / `onSelectOr`).

**Props (`FilterInputFieldMenuProps`):**
```typescript
interface FilterInputFieldMenuProps {
  fields: FieldMetadata[];
  filterText?: string;                 // input text used to filter fields
  onSelect: (field: FieldMetadata) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  recentConditions?: Condition[];      // recent (sliced to 3)
  suggestedFields?: FieldMetadata[];
  onSelectAnd?: () => void;
  onSelectOr?: () => void;
  onEscape?: () => void;
  positioning?: Record<string, unknown>;
  inputRef?: RefObject<HTMLInputElement | null>;
  menuRef?: RefObject<HTMLDivElement | null>;
  className?: string;
}
```

**Stories:** `Default`, `FewFields`, `Closed`, `Interactive`, `WithSearch`,
`WithRecentFields`, `WithSuggestions`, `WithRecentAndSuggestions`.

---

#### FilterInputOperatorMenu
**Path:** `packages/design-system/src/components/FilterInput/FilterInputMenu/FilterInputOperatorMenu.tsx`
**Storybook:** `Patterns/FilterInput/FilterInputOperatorMenu`

Dropdown for **operator selection** (second step). Operators come from
`OPERATORS_BY_TYPE[fieldType]` (grouped for separators); display labels come
from `OPERATOR_LABELS` / `OPERATOR_LABELS_BY_TYPE` (via `getOperatorLabel`).

**Operator groups by field type** (from `OPERATORS_BY_TYPE`):
- **string**: `=, !=, in, like, not_like` | `is_null, is_not_null`
- **integer**: `=, !=, >, <, >=, <=` | `in`
- **float**: `=, !=, >, <, >=, <=`
- **date**: `>, >=, <, <=, =, !=, between`
- **boolean**: `=, !=, is_null, is_not_null`
- **enum**: `=, !=, in, not_in` | `is_null, is_not_null`

**Stories:** `StringType`, `IntegerType`, `FloatType`, `DateType`,
`BooleanType`, `EnumType`, `Interactive`, `KeyboardNavigation`.

---

#### FilterInputValueMenu & FilterInputDateValueMenu
**Paths:**
`.../FilterInputMenu/FilterInputValueMenu/FilterInputValueMenu.tsx`
`.../FilterInputMenu/FilterInputDateValueMenu/FilterInputDateValueMenu.tsx`

Dropdowns for **value selection** (third step). The value menu lists options
(with optional badges) and supports multi-select for `in` / `not_in`. Date
fields use `FilterInputDateValueMenu`, which offers relative presets
(`DATE_PRESETS`) plus absolute dates. Both are config-driven off `FieldMetadata`
(`values` / `options` / `getSuggestions`). A `ValueOption` type is exported
alongside the value menu.

---

### Segments

A chip's content is rendered from internal segment elements (CSS hooks for
testing/styling — never use `data-slot` as a test selector):
- `data-slot="segment-attribute"` — field/attribute label (left).
- `data-slot="segment-operator"` — operator label (middle).
- `data-slot="segment-value"` — value (right).

These are implemented by the internal `Segment` component under
`FilterInputChip/`; they are not separately exported.

---

## 📊 Data Structures

### FieldMetadata
The config that drives everything — matches the backend field-definition shape.
Defined in `FilterInput/types.ts`:

```typescript
interface FieldMetadata {
  name: string;                 // field identifier (e.g. 'attack_type')
  label: string;                // display name (e.g. 'Attack Type')
  type: FieldType;              // 'string'|'integer'|'date'|'float'|'boolean'|'enum'
  description?: string;         // tooltip/help text
  operators?: FilterOperator[]; // restrict the offered operators
  default?: string | number | boolean;
  values?: FieldValueOption[];  // value options (with optional badges)

  // Shorthand for simple string values (e.g. ['GET','POST']); converted to
  // FieldValueOption[] where value === label. Empty array [] = freeform input.
  options?: string[];

  // When false, values/options are SUGGESTIONS, not an allowlist: the dropdown
  // still offers them but any typed value commits without an allowlist error
  // (data-type validation still applies). Defaults to true (strict allowlist).
  strictValues?: boolean;

  // Compute suggestions dynamically from the current input text. Takes
  // precedence over values/options; result is still post-filtered.
  getSuggestions?: (
    inputText: string,
    context?: { selectedValues?: Array<string | number | boolean> },
  ) => FieldValueOption[];

  // Freeform validator — runs in place of the static allowlist check.
  // Return true to mark the value INVALID (e.g. status code must be 3 chars).
  validate?: (value: string | number | boolean) => boolean;

  // Per-character input filter while entering a value; chars returning false
  // are stripped (separators like comma/space pass through).
  acceptChar?: (char: string) => boolean;

  // Value normalizer, runs on commit before validate (e.g. '2' → '2XX').
  normalize?: (value: string | number | boolean) => string | number | boolean;

  // Backend-value transformer applied when emitting the query (display is
  // unaffected). Apply via applyFieldValueTransforms / serializeExpression.
  serializeValue?: (value: string | number | boolean) => string | number | boolean;
}

interface FieldValueOption {
  value: string | number | boolean;
  label: string;
  badge?: { color: BadgeColor; text: string };
}
```

> **`FieldType` is a closed union** —
> `'string' | 'integer' | 'date' | 'float' | 'boolean' | 'enum'` (there is no
> `'array'` type; multi-value comes from the `in` / `not_in` operators).

---

### ExprNode (Expression Tree)
`onChange` emits, and `value` controls, a recursive expression tree. Defined in
`FilterInput/types.ts`:

```typescript
type ExprNode = Condition | Group;

// Single condition: field operator value
interface Condition {
  type: 'condition';
  field: string;                    // e.g. 'attack_type'
  operator?: FilterOperator;        // optional — absent if committed incomplete
  value: string | number | boolean | null
       | Array<string | number | boolean>; // array for in / not_in
  error?: ChipErrorSegment;         // boolean | 'attribute' | 'value'
  dateOrigin?: 'relative' | 'absolute'; // date fields only
  disabled?: boolean;
}

// Group of nodes joined with AND/OR
interface Group {
  type: 'group';
  operator: 'and' | 'or';
  children: ExprNode[];             // recursive: Conditions or nested Groups
}
```

**Example — complex expression** (`attack_type = sqli AND (severity = critical OR severity = high)`):
```typescript
{
  type: 'group',
  operator: 'and',
  children: [
    { type: 'condition', field: 'attack_type', operator: '=', value: 'sqli' },
    {
      type: 'group',
      operator: 'or',
      children: [
        { type: 'condition', field: 'severity', operator: '=', value: 'critical' },
        { type: 'condition', field: 'severity', operator: '=', value: 'high' },
      ],
    },
  ],
}
```

---

### FilterInputChipData
The internal view-model `FilterInput` derives from the expression to render
chips. Defined in `FilterInput/types.ts`:

```typescript
type FilterInputChipVariant = 'chip' | 'and' | 'or' | '(' | ')';

interface FilterInputChipData {
  id: string;
  variant: FilterInputChipVariant;
  attribute?: string;          // 'chip' variant
  operator?: string;           // 'chip' variant
  value?: string;              // 'chip' variant
  error?: ChipErrorSegment;    // boolean | 'attribute' | 'value'
  valueParts?: string[];       // multi-value chips
  valueSeparator?: string;     // default ', '
  errorValueIndices?: number[];
  disabled?: boolean;
}
```

**Conversion (handled internally):** `ExprNode` → `FilterInputChipData[]`
- `Condition` → `{ variant: 'chip', attribute, operator, value }`
- `Group` (`and`/`or`) → its children's chips with `{ variant: 'and' | 'or' }`
  connector chips inserted between them (nested groups add `'('`/`')'`).

You don't build this yourself — `FilterInput` does. It's documented here so the
data flow is legible.

---

## ⚙️ Mechanics & Patterns

### Autocomplete Flow

**3-step config-driven cascade** (all internal to `FilterInput`):

1. **Field selection** (`FilterInputFieldMenu`) — user types/clicks → menu lists
   fields, filtered by `label`/`name`. Selecting a field advances to operators.
2. **Operator selection** (`FilterInputOperatorMenu`) — operators come from
   `OPERATORS_BY_TYPE[field.type]`, labelled via `getOperatorLabel`. Selecting an
   operator advances to values.
3. **Value selection** (`FilterInputValueMenu`, or `FilterInputDateValueMenu`
   for date fields) — options come from the field's `values` / `options` /
   `getSuggestions`; badges render when present. Committing the value creates a
   chip and rebuilds the expression.

**No hardcoded values** — everything derives from `FieldMetadata`.

---

### Expression Parsing

The parser converts query text into an `ExprNode` tree and validates fields,
operators, and values against the `fields` config. It lives under
`lib/parseExpression/` (`parser.ts` is the recursive-descent core, with a
`tokenizer.ts` and `validators.ts`).

**Exported entry points** (from `index.ts` / `lib`):
- **`parseExpression(text: string, fields: FieldMetadata[]): ExprNode`** —
  parses text to a tree. **Throws `FilterParseError`** on invalid input (empty
  text, unexpected tokens, invalid field/operator/value). Use
  `isFilterParseError(err)` to narrow.
- **`serializeExpression(expr: ExprNode | null, fields?: FieldMetadata[]): string`**
  — serializes a tree back to query text, applying each field's `serializeValue`
  when `fields` is passed.
- **`validateValueForField(field: FieldMetadata, value): boolean`** — validates
  a single value against a field (allowlist or `validate`).
- **`applyFieldValueTransforms(expr, fields)`** — applies `serializeValue` across
  a tree (the structured equivalent of `serializeExpression`).

> There is **no** `parse()` function and no `ParseResult` object — the parser
> throws on bad input and returns an `ExprNode` directly. `FilterInput` consumes
> these internally; you rarely call them yourself.

**Supported text syntax** (round-trips with `serializeExpression`):
```
status = active
status = active AND priority > 5
type = bug OR type = feature
priority > 5 AND (status = active OR status = pending)
title = "hello world"
```

AND/OR keywords are case-insensitive; consecutive same-operator conditions
flatten into a single `Group`.

---

### Operator Labels

Operator tokens are house-fixed to display words — pass the token, the UI renders
the label. Don't relabel. From `lib/constants.ts`:

`OPERATOR_LABELS` (the generic labels):

| token | label | token | label |
|-------|-------|-------|-------|
| `=` | is | `>` | greater |
| `!=` | is not | `<` | less |
| `in` | is any of | `>=` | greater or equal |
| `not_in` | is not any of | `<=` | less or equal |
| `is_null` | **is set** | `like` | like |
| `is_not_null` | **is not set** | `not_like` | not like |
| `between` | between | | |

> Two non-obvious mappings: **`in` → "is any of"** (not "in" generically), and
> **`is_null` → "is set"** / **`is_not_null` → "is not set"** — the Wallarm API's
> `is_null` means "field has a value" (IS SET), the opposite of SQL. Keep in sync
> with the backend contract.

`OPERATOR_LABELS_BY_TYPE` overrides some labels per field type — e.g. **date**
relabels `>`→"after", `<`→"before", `>=`→"on or after", `<=`→"on or before",
`between`→"in between"; **boolean** uses `=`→"is true", `!=`→"is false". The menu
uses `getOperatorLabel(operator, fieldType)`, which prefers the per-type label.

---

### Reserved field: `status_code`

**`status_code` is a reserved field `name`.** When a field is named
`status_code`, `FilterInput` (via `applyKnownFieldHelpers`) auto-wires HTTP
status-code behavior and **DS-supplied callbacks override consumer values** for
that field, because the semantics (mask range, accepted chars, backend form) are
fixed by DS. The factories live in `lib/statusCode/` and are exported:

- `createStatusCodeSuggestions` — mask suggestions (e.g. `4XX`).
- `createStatusCodeValidator` — format validation (3 chars, first digit 1–5).
- `createStatusCodeInputFilter` — per-char filter (digits / `X`).
- `createStatusCodeNormalizer` — partial-input normalization (`2` → `2XX`).
- `createStatusCodeSerializer` — backend value form.

To **opt out**, use a different `name` and attach the factories manually. See the
`HTTPStatusCodeSuggestions` / `HTTPStatusCodeByName` stories for live examples.

---

### Errors

Two error surfaces, both presentational:
- **`error?: boolean`** — error styling on the whole input.
- **`externalErrors?: string[]`** — field *names* whose values the backend
  rejected; matching chips are painted red. The expression and `onChange` output
  are unaffected. Pair with your own `Alert`, and clear the prop when the filter
  changes or the query succeeds.
- **`onErrorsChange?: (errors: string[])`** — fires whenever the set of messages
  `FilterInput` renders below the input changes, so you don't stack your own
  message on top of one it already shows. Pass a memoized callback.

---

## 🧪 Playwright Testing Guide

E2E specs live in `FilterInput/__tests__/` (`*.e2e.ts`). Follow
`docs/e2e-test-rules.md` for file/naming conventions and `test.describe` grouping
(Visual / Interactions / Accessibility).

### Real DOM hooks

`data-slot` values are CSS/test selectors (use these, **not** `data-testid`,
unless a `data-testid` is explicitly passed):
- `[data-slot="filter-input"]` — the root.
- `[data-slot="filter-input-condition-chip"]` — an attribute·operator·value chip
  (carries `[data-building]` while under construction).
- `[data-slot="filter-input-connector-chip"]` — an AND/OR/parenthesis chip.
- `[data-slot="filter-input-chip-delete"]` — a chip's delete button.
- `[data-slot="filter-input-field-menu"]`, `[data-slot="filter-operator-menu"]` —
  menus.
- `[data-slot="segment-attribute"|"segment-operator"|"segment-value"]` — chip
  segments.

### What to test

1. **Autocomplete cascade** — type → field menu; pick field → operator menu
   (operators match the field type); pick operator → value menu; pick value →
   chip created and `onChange` emits the expression.
2. **Chip rendering** — correct attribute/operator/value; AND/OR connector chips
   between conditions; first chips inline, extras collapsed; value errors paint
   the chip red.
3. **Chip editing & deletion** — click a chip segment to edit; hover →
   delete button; delete removes it; clear-all empties.
4. **AND/OR logic** — parse `status = active AND priority > 5`,
   `type = bug OR type = feature`, and grouped expressions.
5. **Keyboard** — arrow navigation, Enter to select, Escape to close, Backspace
   at input start to delete the previous chip.
6. **Copy/paste** — select-all copies a parseable string; paste re-parses (and
   shows a parse error on malformed input).

### How to test (Playwright)

**Basic interaction** (Storybook story URL):
```typescript
// Navigate to a FilterInput story
await page.goto('http://localhost:6006/?path=/story/patterns-filterinput-filterinput--default');

const root = page.locator('[data-slot="filter-input"]');
await expect(root).toBeVisible();

// Type into the input
await root.locator('input').click();
await page.keyboard.type('status');

// Field menu opens
await expect(page.locator('[data-slot="filter-input-field-menu"]')).toBeVisible();

// Pick the field (menu items are DropdownMenu items)
await page.getByRole('menuitem', { name: /Status/i }).click();

// Operator menu opens; pick an operator
await expect(page.locator('[data-slot="filter-operator-menu"]')).toBeVisible();
await page.getByRole('menuitem', { name: /^is$/ }).click();

// Value menu → pick a value → a condition chip appears
await page.getByRole('menuitem', { name: /Blocked/i }).click();
await expect(page.locator('[data-slot="filter-input-condition-chip"]')).toHaveCount(1);
```

**Keyboard navigation:**
```typescript
await page.locator('[data-slot="filter-input"] input').click();
await page.keyboard.press('ArrowDown');
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await page.keyboard.press('Escape');
```

**Screenshot:**
```typescript
await expect(page.locator('[data-slot="filter-input"]')).toHaveScreenshot();
```

> Story paths follow the title slug: `Patterns/FilterInput/FilterInput` →
> `patterns-filterinput-filterinput`, plus the kebab-cased story name (e.g.
> `--default`, `--with-multi-condition-preset`).

---

## 📖 Reference Files

- `FilterInput.tsx` — main component + `FilterInputProps`.
- `types.ts` — `FieldMetadata`, `ExprNode`, `Condition`, `Group`,
  `FilterOperator`, `FieldType`, `FieldValueOption`, `FilterInputChipData`,
  `FilterInputChipVariant`.
- `lib/constants.ts` — `OPERATORS_BY_TYPE`, `OPERATOR_LABELS`,
  `OPERATOR_LABELS_BY_TYPE`, `OPERATOR_SYMBOLS`.
- `lib/parseExpression/` — `parseExpression` (parser core, tokenizer,
  validators) + `FilterParseError`.
- `lib/serializeExpression.ts`, `lib/validation.ts`,
  `lib/applyFieldValueTransforms.ts` — serialize / validate / transform helpers.
- `lib/statusCode/` — the reserved `status_code` factories.
- `FilterInputField/FilterInputChip/` + `FilterInputConnectorChip/` — chips.
- `FilterInputMenu/` — field / operator / value / date menus.
- `stories/*.stories.tsx` — Storybook stories (filed under `Patterns/FilterInput`).
- **`FilterInput.llm.md`** (component dir) — the usage/judgment companion.

---

## 🎯 Key Principles

1. **Config-Driven** — no hardcoded values; everything from `FieldMetadata`.
2. **Type-Safe** — full TypeScript coverage, strict types, no `any`.
3. **Self-contained** — `FilterInput` owns its menus, parsing, and chip state;
   sub-components are exported only for rare custom builds.
4. **Tree, not string** — `onChange` emits an `ExprNode`; text serialization is a
   reversible helper (`serializeExpression` / `parseExpression`).
5. **Testable** — clear separation of parsing, rendering, and interaction; stable
   `data-slot` hooks.
6. **Accessible** — keyboard navigation, menu roles, focus management.
7. **Incremental** — graceful handling of incomplete input (building chips,
   per-segment errors).

---

**Last updated:** 2026-06-23
This refresh corrected the March 2026 naming (the old `filter/FilterField`
component was renamed/restructured to **`FilterInput`** under `Patterns/`); props
`externalErrors` / `onErrorsChange` / `strictValues` and the reserved
`status_code` behavior were added to match the current code.

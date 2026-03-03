# Filter System Design Reference

Comprehensive design documentation for Wallarm Filter System. This document describes all available components, mechanics, config-driven patterns, and testing guidelines.

---

## 🎯 Core Concept: Simple Config-Driven API

**FilterField works by simply passing config from backend API** - no manual field definitions, no hardcoded values.

### Backend Integration Pattern

```typescript
// 1. Fetch metadata from backend API
const response = await fetch('/api/query-metadata');
const metadata: QueryMetadata = await response.json();

// 2. Pass fields directly to FilterField - that's it!
<FilterField
  fields={metadata.where_fields}  // Just pass the array from API!
  onChange={(expression) => {
    // Get parsed expression tree ready for API
    console.log(expression);
  }}
/>
```

**Backend API Contract** (from `sessions-api/internal/wallarm/security_universal_queries/metadata.go`):

```typescript
interface QueryMetadata {
  select_fields: SelectFieldMetadata[];  // For SELECT clause
  group_by_fields: FieldMetadata[];      // For GROUP BY clause
  where_fields: FieldMetadata[];         // For WHERE clause (filters)
}

interface FieldMetadata {
  name: string;              // Field identifier (e.g., "attack_type")
  label: string;             // Human-readable label (e.g., "Attack Type")
  type: string;              // Field type: "string" | "integer" | "date" | "float" | "boolean" | "array"
  description: string;       // Help text for tooltips
  operators?: string[];      // Allowed operators (e.g., ["=", "!=", "in", "like"])
  default?: boolean;         // Pre-select in table view
}
```

**Complete working example:**
```typescript
import { FilterField } from '@wallarm/design-system';

function AttackFilters() {
  const [metadata, setMetadata] = useState<QueryMetadata | null>(null);
  const [expression, setExpression] = useState<ExprNode | null>(null);

  useEffect(() => {
    // Fetch config from backend
    fetch('/api/security/query-metadata')
      .then(res => res.json())
      .then(data => setMetadata(data));
  }, []);

  if (!metadata) return <div>Loading...</div>;

  return (
    <FilterField
      fields={metadata.where_fields}  // Config from backend!
      value={expression}
      onChange={(expr) => {
        setExpression(expr);
        // Send to API: POST /api/filters with expression tree
      }}
      placeholder="Filter attacks..."
    />
  );
}
```

**Key benefits:**
- ✅ Zero manual configuration - backend defines all fields
- ✅ No hardcoded operators - backend specifies per field type
- ✅ Automatic validation - only valid operators shown
- ✅ Single source of truth - metadata.go defines everything
- ✅ Type-safe - full TypeScript support

---

## 📚 Component Architecture

### Core Components

#### FilterField
**Path:** `packages/design-system/src/components/filter/FilterField/FilterField.tsx`
**Storybook:** [`Components/Filter/FilterField`](http://localhost:6006/?path=/story/components-filter-filterfield)

**Main filter component - works directly with backend API config.**

**Config-driven mode (RECOMMENDED):**
```typescript
<FilterField
  fields={metadata.where_fields}  // From backend API
  value={expression}
  onChange={(expr) => console.log(expr)}
/>
```

**Key Features:**
- **Config-driven**: Just pass `fields` from API, everything works
- Autocomplete menus (field → operator → value)
- Expression parsing (supports AND/OR logic)
- Visual chips rendering
- Shows up to 3 visible chips, then displays placeholder hint
- Automatic error propagation to all chips
- Clear button (appears on hover when chips exist)
- Keyboard navigation (⌘K / Ctrl+K)

**Props:**
```typescript
interface FilterFieldProps {
  // Config-driven mode
  fields?: FieldMetadata[];           // Fields from backend API
  value?: ExprNode | null;            // Parsed expression
  onChange?: (expression: ExprNode | null) => void;

  // Legacy mode (manual chips)
  chips?: Array<{ id: string; content: ReactNode }>;

  // Common props
  placeholder?: string;
  error?: boolean;
  leftIcon?: ReactNode;
  showKeyboardHint?: boolean;
  onChipClick?: (chipId: string) => void;
  onChipRemove?: (chipId: string) => void;
  onClear?: () => void;
}
```

**Stories to reference:**
- `Default` - Empty state with placeholder
- `WithMultipleChips` - Multiple chips with AND/OR operators
- `WithMoreThanThreeChips` - Shows 3 chips + placeholder hint
- `ErrorWithChips` - Error state propagates to all chips
- `InteractiveWithRemoval` - Chip deletion functionality
- `HoverStateDemo` - Border color change on hover
- `FocusStateDemo` - Focus ring with 3px spread

---

#### FilterChip
**Path:** `packages/design-system/src/components/filter/FilterChip/FilterChip.tsx`
**Storybook:** [`Components/Filter/FilterChip`](http://localhost:6006/?path=/story/components-filter-filterchip)

Visual representation of filter conditions and logical operators.

**Variants:**
- `chip` - Attribute-Operator-Value display (uses segments internally)
- `and` - AND logical operator
- `or` - OR logical operator
- `(` - Opening parenthesis
- `)` - Closing parenthesis

**Props:**
```typescript
interface FilterChipProps {
  variant: 'chip' | 'and' | 'or' | '(' | ')';
  attribute?: string;  // For 'chip' variant
  operator?: string;   // For 'chip' variant
  value?: string;      // For 'chip' variant
  error?: boolean;     // Red border + red background
  onRemove?: () => void; // Shows delete button on hover
}
```

**Stories to reference:**
- `Default` - Basic chip with attribute-operator-value
- `CombinedWithAnd` - Chip + AND + Chip
- `CombinedWithOr` - Chip + OR + Chip
- `CombinedWithParentheses` - Complex grouped expression
- `WithDeleteButton` - Hover to see delete button
- `AllStatesShowcase` - Complete overview of all variants and states

---

### Menu Components

#### FilterMainMenu
**Path:** `packages/design-system/src/components/filter/FilterMainMenu/FilterMainMenu.tsx`
**Storybook:** [`Components/Filter/FilterMainMenu`](http://localhost:6006/?path=/story/components-filter-filtermainmenu)

Dropdown menu for **field selection** (first step in autocomplete flow).

**Features:**
- Search input for filtering fields by label/name (case-insensitive)
- Recent fields section (max 3, shown at top)
- Suggested fields section
- Keyboard navigation (Arrow Up/Down, Enter, Esc)
- Keyboard hints at bottom

**Props:**
```typescript
interface FilterMainMenuProps {
  fields: FieldMetadata[];           // All available fields
  recentFields?: FieldMetadata[];    // Recently used (max 3)
  suggestedFields?: FieldMetadata[]; // Commonly used
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect: (field: FieldMetadata) => void;
}
```

**Stories to reference:**
- `Default` - Basic field list
- `WithSearch` - Search/filter functionality
- `WithRecentFields` - Recent section at top
- `WithSuggestions` - Suggested section
- `WithRecentAndSuggestions` - Full menu with all sections
- `Interactive` - State management example

---

#### FilterOperatorMenu
**Path:** `packages/design-system/src/components/filter/FilterOperatorMenu/FilterOperatorMenu.tsx`
**Storybook:** [`Components/Filter/FilterOperatorMenu`](http://localhost:6006/?path=/story/components-filter-filteroperatormenu)

Dropdown menu for **operator selection** (second step in autocomplete flow).

**Features:**
- Operators filtered by field type (uses `OPERATORS_BY_TYPE`)
- Human-readable labels (uses `getOperatorLabel`)
- Grouped operators with separators
- Keyboard navigation and selection

**Props:**
```typescript
interface FilterOperatorMenuProps {
  fieldType: FieldType; // 'string' | 'integer' | 'date' | 'float' | 'boolean' | 'enum'
  selectedOperator?: FilterOperator;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect: (operator: FilterOperator) => void;
}
```

**Operator groups by field type:**
- **string**: `=, !=, like, not_like` | `is_null, is_not_null`
- **integer**: `=, !=, >, <, >=, <=`
- **date**: `>, >=, <, <=, =, !=, between`
- **boolean**: `=, !=, is_null, is_not_null`
- **enum**: `=, !=, in, not_in` | `is_null, is_not_null`

**Stories to reference:**
- `StringType` - String field operators
- `IntegerType` - Integer field operators
- `DateType` - Date field operators
- `BooleanType` - Boolean field operators
- `EnumType` - Enum field operators
- `KeyboardNavigation` - Keyboard usage example

---

#### FilterValueMenu
**Path:** `packages/design-system/src/components/filter/FilterValueMenu/FilterValueMenu.tsx`
**No Storybook yet** - Reference implementation only

Dropdown menu for **value selection** (third step in autocomplete flow).

**Features:**
- Enum values with optional badges (color + text)
- Multi-select mode with checkboxes
- Submenu support (hasSubmenu flag)
- Config-driven values from `FieldMetadata.values`

**Props:**
```typescript
interface FilterValueMenuProps {
  values: ValueOption[];              // From FieldMetadata.values
  onSelect: (value: string | number | boolean) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  multiSelect?: boolean;              // Show checkboxes
  selectedValues?: Array<string | number | boolean>;
  width?: 'standard' | 'compact' | number;
}

interface ValueOption {
  value: string | number | boolean;
  label: string;
  badge?: { color: string; text: string };
  hasSubmenu?: boolean;
}
```

---

### Segment Components

Visual building blocks for rendering chip content (attribute, operator, value).

#### SegmentAttribute
**Path:** `packages/design-system/src/components/filter/segments/SegmentAttribute.tsx`
**Storybook:** [`Filter/Segments/SegmentAttribute`](http://localhost:6006/?path=/story/filter-segments-segmentattribute)

Displays field/attribute name (left part of chip).

**Styling:**
- Container: `flex flex-col justify-center leading-none overflow-hidden text-ellipsis whitespace-nowrap`
- Text: `<p className='text-sm font-normal leading-5 overflow-hidden text-ellipsis'>`

#### SegmentOperator
**Path:** `packages/design-system/src/components/filter/segments/SegmentOperator.tsx`
**Storybook:** [`Filter/Segments/SegmentOperator`](http://localhost:6006/?path=/story/filter-segments-segmentoperator)

Displays operator label (middle part of chip).

**Common operators:** `is`, `is not`, `contains`, `does not contain`, `greater than`, etc.

#### SegmentValue
**Path:** `packages/design-system/src/components/filter/segments/SegmentValue.tsx`
**Storybook:** [`Filter/Segments/SegmentValue`](http://localhost:6006/?path=/story/filter-segments-segmentvalue)

Displays value (right part of chip).

**Stories to reference:**
- `VariousValues` - Different value types (strings, IPs, dates, numbers)

---

## 📊 Data Structures

### FieldMetadata
**Comes directly from backend API** - defined in `sessions-api/internal/wallarm/security_universal_queries/metadata.go`

```typescript
interface FieldMetadata {
  name: string;                    // Field identifier (e.g., 'attack_type')
  label: string;                   // Display name (e.g., 'Attack Type')
  type: string;                    // 'string' | 'integer' | 'date' | 'float' | 'boolean' | 'array'
  description: string;             // Tooltip/help text
  operators?: string[];            // Allowed operators from backend (e.g., ["=", "!=", "in", "like"])
  default?: boolean;               // Pre-select in table view
  values?: FieldValueOption[];     // **Optional** values for autocomplete (if provided by backend)
}

interface FieldValueOption {
  value: string | number | boolean;
  label: string;
  badge?: { color: string; text: string };  // Visual badge in dropdown
}
```

**Real example from sessions-api metadata.go:**
```go
// Backend definition (Go)
{
    Name:        "attack_type",
    Label:       "Attack Type",
    Type:        "string",
    Description: "Type of attack (sqli, xss, rce, etc.)",
    Operators:   []string{"=", "!=", "in", "like"},
    Default:     true,
}
```

**Frontend receives (TypeScript):**
```typescript
// Fetched from /api/security/query-metadata
{
  name: "attack_type",
  label: "Attack Type",
  type: "string",
  description: "Type of attack (sqli, xss, rce, etc.)",
  operators: ["=", "!=", "in", "like"],
  default: true
}
```

---

### ExprNode (Expression Tree)
**Parsed filter expression** - represents the filter logic as a tree.

```typescript
type ExprNode = Condition | Group;

// Single condition: field operator value
interface Condition {
  type: 'condition';
  field: string;                           // e.g., 'attack_type'
  operator: FilterOperator;                // e.g., '='
  value: string | number | boolean | null; // e.g., 'sqli'
}

// Group of conditions with AND/OR
interface Group {
  type: 'group';
  operator: 'and' | 'or';
  children: ExprNode[];  // Recursive - can contain Conditions or nested Groups
}
```

**Example - Complex expression:**
```typescript
// attack_type = sqli AND (severity = critical OR severity = high)
{
  type: 'group',
  operator: 'and',
  children: [
    {
      type: 'condition',
      field: 'attack_type',
      operator: '=',
      value: 'sqli'
    },
    {
      type: 'group',
      operator: 'or',
      children: [
        { type: 'condition', field: 'severity', operator: '=', value: 'critical' },
        { type: 'condition', field: 'severity', operator: '=', value: 'high' }
      ]
    }
  ]
}
```

---

### FilterChipData
**Visual representation** of expression nodes - passed to FilterField.

```typescript
interface FilterChipData {
  id: string;                              // Unique identifier
  variant: 'chip' | 'and' | 'or' | '(' | ')';
  attribute?: string;                      // For 'chip' variant
  operator?: string;                       // For 'chip' variant
  value?: string;                          // For 'chip' variant
  error?: boolean;                         // Validation error flag
}
```

**Conversion:** `ExprNode` → `FilterChipData[]`
- `Condition` → `{ variant: 'chip', attribute, operator, value }`
- `Group` with `operator: 'and'` → Insert `{ variant: 'and' }` between children
- `Group` with `operator: 'or'` → Insert `{ variant: 'or' }` between children

---

## ⚙️ Mechanics & Patterns

### Autocomplete Flow

**3-step config-driven autocomplete:**

1. **Field Selection** (FilterMainMenu)
   - User starts typing or clicks input
   - Show FilterMainMenu with all fields
   - Filter fields by `field.label` or `field.name` (case-insensitive)
   - User selects field → append field name to input

2. **Operator Selection** (FilterOperatorMenu)
   - Detect field is complete (exists in fields config)
   - Get field type: `fields.find(f => f.name === fieldName)?.type`
   - Show FilterOperatorMenu with operators from `OPERATORS_BY_TYPE[fieldType]`
   - Use `getOperatorLabel(operator, fieldType)` for display labels
   - User selects operator → append operator to input

3. **Value Selection** (FilterValueMenu)
   - Detect operator is complete
   - Get field's value options: `field.values`
   - Show FilterValueMenu with config-driven values
   - Support badges if `value.badge` exists
   - User selects value → complete condition → create chip

**No hardcoded values** - everything comes from `FieldMetadata` config.

---

### Expression Parsing

**Recursive descent parser** - converts text to expression tree.

**Entry point:** `parse(input: string): ParseResult`

**Parser functions:**
- `parseExpression()` - Recursive AND/OR handling
- `parseCondition()` - Single condition parsing
- `parseQuotedString()` - Quoted value support

**Supported syntax:**
```
status = active
status = active AND priority > 5
type = bug OR type = feature
priority > 5 AND (status = active OR status = pending)
title = "hello world"
name = 'O\'Reilly'
```

**Operators (ordered by length for correct matching):**
```typescript
const OPERATORS = ['>=', '<=', '!=', '=', '>', '<', 'like', 'not_like'];
```

**AND/OR keywords:**
- Case-insensitive: `AND`, `and`, `OR`, `or`
- Regex: `/^(and|AND)(\s+(.*))?$/i`
- Group flattening: consecutive same-operator conditions → single Group

**Incremental parsing:**
- `ParseResult.isComplete` - whether expression is ready for chip creation
- Incomplete examples: `"status"`, `"status ="`, `"status = active AND"`

---

### Chip Rendering

**Convert ExprNode to visual chips:**

```typescript
function expressionToChips(expression: ExprNode | null): FilterChipData[] {
  if (!expression) return [];

  if (expression.type === 'condition') {
    // Single condition → chip
    return [{
      id: generateId(),
      variant: 'chip',
      attribute: expression.field,
      operator: getOperatorLabel(expression.operator, fieldType),
      value: String(expression.value),
    }];
  }

  if (expression.type === 'group') {
    // Group → chips with AND/OR between
    const chips: FilterChipData[] = [];
    for (let i = 0; i < expression.children.length; i++) {
      chips.push(...expressionToChips(expression.children[i]));
      if (i < expression.children.length - 1) {
        chips.push({
          id: generateId(),
          variant: expression.operator  // 'and' or 'or'
        });
      }
    }
    return chips;
  }
}
```

**Segment usage in chips:**
```tsx
<FilterChip
  variant='chip'
  attribute='Attack Type'
  operator='is'
  value='SQL Injection'
/>

// Internally renders:
<SegmentAttribute>Attack Type</SegmentAttribute>
<SegmentOperator>is</SegmentOperator>
<SegmentValue>SQL Injection</SegmentValue>
```

---

### Config-Driven Values

**All values come from FieldMetadata** - no hardcoding.

**Example config:**
```typescript
const attackFields: FieldMetadata[] = [
  {
    name: 'attack_type',
    label: 'Attack Type',
    type: 'enum',
    values: [
      { value: 'sqli', label: 'SQL Injection', badge: { color: 'red', text: 'Critical' } },
      { value: 'xss', label: 'Cross-Site Scripting', badge: { color: 'orange', text: 'High' } },
    ],
  },
  {
    name: 'severity',
    label: 'Severity',
    type: 'enum',
    values: [
      { value: 'critical', label: 'Critical', badge: { color: 'red', text: 'Critical' } },
      { value: 'high', label: 'High', badge: { color: 'orange', text: 'High' } },
    ],
  },
  {
    name: 'ip_address',
    label: 'IP Address',
    type: 'string',
    values: [
      { value: '192.168.1.1', label: '192.168.1.1' },
      { value: '10.0.0.1', label: '10.0.0.1' },
    ],
  },
];
```

**Usage in menus:**
```typescript
// Field menu
<FilterMainMenu
  fields={attackFields}
  onSelect={(field) => { /* field.name, field.type */ }}
/>

// Operator menu
<FilterOperatorMenu
  fieldType={selectedField.type}  // e.g., 'enum'
  onSelect={(operator) => { /* operator */ }}
/>

// Value menu
<FilterValueMenu
  values={selectedField.values}  // Config-driven!
  onSelect={(value) => { /* value */ }}
/>
```

---

## 🧪 Playwright Testing Guide

### What to Test

#### 1. Autocomplete Flow
- **Field autocomplete**
  - Type text → FilterMainMenu appears
  - Filter fields by search text
  - Click field → field name added to input
  - Keyboard navigation (Arrow Up/Down, Enter)

- **Operator autocomplete**
  - Complete field name → FilterOperatorMenu appears
  - Operators filtered by field type
  - Click operator → operator added to input

- **Value autocomplete**
  - Complete operator → FilterValueMenu appears
  - Values from config displayed
  - Badges rendered correctly
  - Click value → chip created

#### 2. Chip Creation & Rendering
- Complete condition creates chip
- Chip displays correct attribute-operator-value
- AND/OR chips appear between conditions
- Error state propagates to chips
- Max 3 chips visible, rest in placeholder

#### 3. Chip Editing & Deletion
- Click chip → converts to editable text
- Hover chip → delete button appears
- Click delete → chip removed
- Clear all → all chips removed

#### 4. AND/OR Logic
- Parse `status = active AND priority > 5`
- Parse `type = bug OR type = feature`
- Parse multiple AND/OR conditions
- Validate incomplete AND/OR (no second condition)

#### 5. Keyboard Shortcuts
- Arrow Up/Down - navigate menu
- Enter - select item
- Escape - close menu
- Backspace at input start - delete previous chip

#### 6. Error Handling
- Invalid field name → error state
- Invalid operator → error state
- Empty value → incomplete state
- Unbalanced parentheses → error state

---

### How to Test

#### Using Playwright MCP (chrome-devtools)

**Basic interaction:**
```typescript
// Navigate to Storybook story
await playwright.browser_navigate({
  url: 'http://localhost:6006/?path=/story/components-filter-filterfield--interactive'
});

// Wait for component to load
await playwright.browser_wait_for({
  selector: '[data-testid="filter-field"]',
  timeout: 5000
});

// Type into input
await playwright.browser_click({ selector: 'input[type="text"]' });
await playwright.browser_type({ text: 'attack' });

// Wait for dropdown
await playwright.browser_wait_for({
  selector: '[role="menu"]',
  state: 'visible'
});

// Click menu item
await playwright.browser_click({ selector: '[role="menuitem"]:first-child' });

// Verify chip created
const chipCount = await playwright.browser_evaluate({
  script: 'document.querySelectorAll("[data-chip]").length'
});
```

**Keyboard navigation:**
```typescript
// Open menu
await playwright.browser_click({ selector: 'input' });

// Navigate with arrow keys
await playwright.browser_press_key({ key: 'ArrowDown' });
await playwright.browser_press_key({ key: 'ArrowDown' });
await playwright.browser_press_key({ key: 'Enter' });

// Close with Escape
await playwright.browser_press_key({ key: 'Escape' });
```

**Screenshot testing:**
```typescript
// Take screenshot of menu
const screenshot = await playwright.browser_take_screenshot({
  selector: '[role="menu"]',
  fullPage: false
});
```

---

### Example Test Cases

#### Test Case 1: Field Autocomplete
```typescript
test('should show field suggestions when typing', async () => {
  // 1. Navigate to FilterField story
  await navigate('Components/Filter/FilterField');

  // 2. Type 'attack'
  await click('input');
  await type('attack');

  // 3. Verify FilterMainMenu appears
  await waitFor('[role="menu"]');

  // 4. Verify 'Attack Type' in suggestions
  const menuItems = await findAll('[role="menuitem"]');
  expect(menuItems).toContainText('Attack Type');

  // 5. Click 'Attack Type'
  await click('[role="menuitem"]:has-text("Attack Type")');

  // 6. Verify input value updated
  const inputValue = await getValue('input');
  expect(inputValue).toBe('attack_type ');
});
```

#### Test Case 2: Complete Filter Creation
```typescript
test('should create chip for complete condition', async () => {
  // 1. Navigate to story
  await navigate('Components/Filter/FilterField');

  // 2. Select field
  await click('input');
  await type('severity');
  await click('[role="menuitem"]:has-text("Severity")');

  // 3. Select operator
  await waitFor('[role="menu"]');  // Operator menu appears
  await click('[role="menuitem"]:has-text("is")');

  // 4. Select value
  await waitFor('[role="menu"]');  // Value menu appears
  await click('[role="menuitem"]:has-text("Critical")');

  // 5. Verify chip created
  const chip = await waitFor('[data-chip]');
  expect(chip).toContainText('Severity');
  expect(chip).toContainText('is');
  expect(chip).toContainText('Critical');
});
```

#### Test Case 3: AND Logic
```typescript
test('should create AND chip between conditions', async () => {
  // 1. Create first chip (severity = critical)
  await createChip('severity', '=', 'critical');

  // 2. Type AND
  await type(' AND ');

  // 3. Create second chip (attack_type = sqli)
  await createChip('attack_type', '=', 'sqli');

  // 4. Verify chips
  const chips = await findAll('[data-chip]');
  expect(chips).toHaveLength(3);  // chip + AND + chip
  expect(chips[0]).toContainText('Severity is Critical');
  expect(chips[1]).toContainText('AND');
  expect(chips[2]).toContainText('Attack Type is SQL Injection');
});
```

#### Test Case 4: Chip Editing
```typescript
test('should edit chip on click', async () => {
  // 1. Create chip
  await createChip('status', '=', 'active');

  // 2. Click chip
  const chip = await find('[data-chip]');
  await click(chip);

  // 3. Verify chip removed and text in input
  const inputValue = await getValue('input');
  expect(inputValue).toBe('status = active');

  // 4. Verify dropdown appears (value menu)
  await waitFor('[role="menu"]');
});
```

#### Test Case 5: Error Propagation
```typescript
test('should propagate error to all chips', async () => {
  // 1. Create multiple chips
  await createChip('status', '=', 'active');
  await type(' AND ');
  await createChip('priority', '>', '5');

  // 2. Set error state (via story controls or API)
  await setError(true);

  // 3. Verify all chips have error class
  const chips = await findAll('[data-chip][data-variant="chip"]');
  for (const chip of chips) {
    expect(chip).toHaveClass('error');
  }
});
```

---

## 💡 Code Examples

### Example 1: Complete FilterField Implementation

```typescript
import { useState, useCallback } from 'react';
import { FilterField } from './FilterField';
import { FilterMainMenu } from './FilterMainMenu';
import { FilterOperatorMenu } from './FilterOperatorMenu';
import { FilterValueMenu } from './FilterValueMenu';
import { parse, type ParseResult } from './parser';
import type { ExprNode, FieldMetadata, FilterChipData } from './types';

// Config-driven field definitions
const fields: FieldMetadata[] = [
  {
    name: 'attack_type',
    label: 'Attack Type',
    type: 'enum',
    values: [
      { value: 'sqli', label: 'SQL Injection', badge: { color: 'red', text: 'Critical' } },
      { value: 'xss', label: 'XSS', badge: { color: 'orange', text: 'High' } },
    ],
  },
  {
    name: 'severity',
    label: 'Severity',
    type: 'enum',
    values: [
      { value: 'critical', label: 'Critical', badge: { color: 'red', text: 'Critical' } },
      { value: 'high', label: 'High', badge: { color: 'orange', text: 'High' } },
    ],
  },
];

export function FilterExample() {
  const [expression, setExpression] = useState<ExprNode | null>(null);
  const [chips, setChips] = useState<FilterChipData[]>([]);
  const [inputText, setInputText] = useState('');
  const [showFieldMenu, setShowFieldMenu] = useState(false);
  const [showOperatorMenu, setShowOperatorMenu] = useState(false);
  const [showValueMenu, setShowValueMenu] = useState(false);

  // Parse input and create chips
  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
    const result: ParseResult = parse(text);

    if (result.isComplete && result.expression) {
      setExpression(result.expression);
      const newChips = expressionToChips(result.expression);
      setChips(newChips);
      setInputText('');  // Clear input after chip creation
    }

    // Show appropriate menu based on parsing state
    analyzeInput(text);
  }, [fields]);

  return (
    <div className="relative">
      <FilterField
        chips={chips.map(chip => ({
          id: chip.id,
          content: <FilterChip {...chip} />
        }))}
        placeholder="Type to filter..."
        onChipClick={(chipId) => {
          // Convert chip back to text for editing
          const chip = chips.find(c => c.id === chipId);
          if (chip && chip.variant === 'chip') {
            setInputText(`${chip.attribute} ${chip.operator} ${chip.value}`);
            setChips(chips.filter(c => c.id !== chipId));
            setShowValueMenu(true);
          }
        }}
        onChipRemove={(chipId) => {
          setChips(chips.filter(c => c.id !== chipId));
        }}
        onClear={() => {
          setChips([]);
          setExpression(null);
          setInputText('');
        }}
      />

      {showFieldMenu && (
        <FilterMainMenu
          fields={fields}
          open={showFieldMenu}
          onSelect={(field) => {
            setInputText(prev => prev + field.name + ' ');
            setShowFieldMenu(false);
            setShowOperatorMenu(true);
          }}
          onOpenChange={setShowFieldMenu}
        />
      )}

      {showOperatorMenu && (
        <FilterOperatorMenu
          fieldType={selectedField?.type || 'string'}
          open={showOperatorMenu}
          onSelect={(operator) => {
            setInputText(prev => prev + operator + ' ');
            setShowOperatorMenu(false);
            setShowValueMenu(true);
          }}
          onOpenChange={setShowOperatorMenu}
        />
      )}

      {showValueMenu && (
        <FilterValueMenu
          values={selectedField?.values || []}
          open={showValueMenu}
          onSelect={(value) => {
            setInputText(prev => prev + value);
            setShowValueMenu(false);
            handleInputChange(inputText + value);
          }}
          onOpenChange={setShowValueMenu}
        />
      )}
    </div>
  );
}
```

### Example 2: Expression to Chips Conversion

```typescript
function expressionToChips(expression: ExprNode | null): FilterChipData[] {
  if (!expression) return [];

  const chips: FilterChipData[] = [];

  function processNode(node: ExprNode) {
    if (node.type === 'condition') {
      const field = fields.find(f => f.name === node.field);
      chips.push({
        id: generateId(),
        variant: 'chip',
        attribute: field?.label || node.field,
        operator: getOperatorLabel(node.operator, field?.type || 'string'),
        value: String(node.value),
      });
    } else if (node.type === 'group') {
      for (let i = 0; i < node.children.length; i++) {
        processNode(node.children[i]);
        if (i < node.children.length - 1) {
          chips.push({
            id: generateId(),
            variant: node.operator,  // 'and' or 'or'
          });
        }
      }
    }
  }

  processNode(expression);
  return chips;
}
```

---

## 📖 Reference Files

### Parser
- `FilterComponent/parser.ts` - Expression parsing logic
- `FilterComponent/parser.test.ts` - Parser unit tests (40+ tests)

### Type Definitions
- `types.ts` - All TypeScript interfaces and types
  - `FieldMetadata`, `ExprNode`, `Condition`, `Group`
  - `FilterChipData`, `FilterOperator`, `FieldType`
  - `OPERATORS_BY_TYPE`, `getOperatorLabel()`

### Components
- `FilterField/FilterField.tsx` - Main visual container
- `FilterChip/FilterChip.tsx` - Chip rendering
- `FilterMainMenu/FilterMainMenu.tsx` - Field selection
- `FilterOperatorMenu/FilterOperatorMenu.tsx` - Operator selection
- `FilterValueMenu/FilterValueMenu.tsx` - Value selection
- `segments/` - SegmentAttribute, SegmentOperator, SegmentValue

---

## 🎯 Key Principles

1. **Config-Driven** - No hardcoded values, everything from `FieldMetadata`
2. **Type-Safe** - Full TypeScript coverage, strict types
3. **Composable** - Small focused components that combine
4. **Testable** - Clear separation of parsing, rendering, interaction
5. **Accessible** - Keyboard navigation, ARIA roles, focus management
6. **Incremental** - Graceful handling of incomplete input

---

**Last updated:** 2026-03-03
**Related PRD:** `ralph/prd.json` (US-001 through US-017)
**Progress Log:** `scripts/ralph/progress.txt`

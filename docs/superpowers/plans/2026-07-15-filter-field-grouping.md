# FilterInput Field Grouping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional `fieldGroups` prop to `FilterInput` that organizes the field-selection menu into labeled sections, without breaking any current consumer.

**Architecture:** A new pure helper `buildFieldMenuSections(fields, fieldGroups, filterText)` turns the flat `fields` array plus an optional `fieldGroups` mapping into an ordered list of render-ready `{ label?, fields }` sections. `FilterInputFieldMenu` maps over those sections, reusing the existing `DropdownMenuLabel` / `DropdownMenuSeparator` header pattern. The prop threads `FilterInput → FilterInputMenu → FilterInputFieldMenu` as static config alongside `fields`.

**Tech Stack:** React 19, TypeScript (strict), Vitest (unit), Playwright (E2E), Storybook, Ark UI DropdownMenu, Tailwind.

## Global Constraints

- **Non-breaking:** `fields` prop and all current behavior stay identical when `fieldGroups` is omitted. `fieldGroups` is optional everywhere.
- **No `any`** (TS strict). Use `type` imports for type-only imports.
- **Component rules:** `data-slot` unchanged; no inline styles; design tokens only. Field-menu RTL component tests are skipped in jsdom (Ark UI portal) — do **not** add jsdom render tests for the menu; cover via unit (helper) + Playwright E2E.
- **Commit style:** Conventional Commits. End commit messages with `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **All paths below are relative to** `packages/design-system/src/components/FilterInput/`.

---

### Task 1: `FieldGroup` type + `buildFieldMenuSections` pure helper

**Files:**
- Modify: `types.ts` (add `FieldGroup` interface near `FieldMetadata`)
- Create: `lib/buildFieldMenuSections.ts`
- Modify: `lib/index.ts` (add export)
- Test: `__tests__/buildFieldMenuSections.test.ts`

**Interfaces:**
- Consumes: `filterAndSort` from `./filterSort` — `<T>(items: T[], query: string, getText: (item: T) => string[]) => T[]`; `FieldMetadata` from `../types`.
- Produces:
  - `interface FieldGroup { label: string; fields: string[]; }` (exported from `types.ts`)
  - `interface FieldMenuSection { label?: string; fields: FieldMetadata[]; }` (exported from `lib/buildFieldMenuSections.ts`)
  - `function buildFieldMenuSections(fields: FieldMetadata[], fieldGroups: FieldGroup[] | undefined, filterText: string): FieldMenuSection[]`

- [ ] **Step 1: Add the `FieldGroup` type**

In `types.ts`, immediately after the `FieldMetadata` interface closing brace, add:

```ts
/**
 * A labeled group of filter fields for the field-selection menu, referenced by
 * field `name`. Passed to `FilterInput` via the optional `fieldGroups` prop.
 * Groups render in array order; fields within a group in listed order; fields
 * not referenced by any group fall into a trailing headerless section. Unknown
 * names are ignored; a field listed in multiple groups resolves to its first.
 */
export interface FieldGroup {
  /** Section header text (e.g. "Threat classification"). */
  label: string;
  /** Field names in display order. */
  fields: string[];
}
```

- [ ] **Step 2: Write the failing unit test**

Create `__tests__/buildFieldMenuSections.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildFieldMenuSections } from '../lib/buildFieldMenuSections';
import type { FieldGroup, FieldMetadata } from '../types';

const f = (name: string, label = name): FieldMetadata => ({ name, label, type: 'string' });

const fields: FieldMetadata[] = [
  f('attack_type', 'Attack type'),
  f('host', 'Host'),
  f('path', 'Path'),
  f('country', 'Country'),
  f('orphan', 'Orphan'),
];

const groups: FieldGroup[] = [
  { label: 'Threat classification', fields: ['attack_type'] },
  { label: 'Request features', fields: ['host', 'path'] },
  { label: 'Source and identity', fields: ['country'] },
];

describe('buildFieldMenuSections', () => {
  it('returns one headerless section equal to the flat list when no groups', () => {
    const result = buildFieldMenuSections(fields, undefined, '');
    expect(result).toEqual([{ fields }]);
  });

  it('returns [] when no groups and filter matches nothing', () => {
    expect(buildFieldMenuSections(fields, undefined, 'zzz')).toEqual([]);
  });

  it('buckets fields into groups in group order, fields in listed order', () => {
    const result = buildFieldMenuSections(fields, groups, '');
    expect(result.map(s => s.label)).toEqual([
      'Threat classification',
      'Request features',
      'Source and identity',
      undefined, // trailing ungrouped
    ]);
    expect(result[1]!.fields.map(x => x.name)).toEqual(['host', 'path']);
  });

  it('places fields not in any group into a trailing headerless section', () => {
    const result = buildFieldMenuSections(fields, groups, '');
    const tail = result[result.length - 1]!;
    expect(tail.label).toBeUndefined();
    expect(tail.fields.map(x => x.name)).toEqual(['orphan']);
  });

  it('drops groups whose fields all filter out, keeps matching ones', () => {
    const result = buildFieldMenuSections(fields, groups, 'host');
    expect(result.map(s => s.label)).toEqual(['Request features']);
    expect(result[0]!.fields.map(x => x.name)).toEqual(['host']);
  });

  it('ignores unknown field names in a group', () => {
    const g: FieldGroup[] = [{ label: 'G', fields: ['host', 'nope'] }];
    const result = buildFieldMenuSections(fields, g, '');
    expect(result[0]!.fields.map(x => x.name)).toEqual(['host']);
  });

  it('resolves a field listed in two groups to its first group only', () => {
    const g: FieldGroup[] = [
      { label: 'A', fields: ['host'] },
      { label: 'B', fields: ['host', 'path'] },
    ];
    const result = buildFieldMenuSections(fields, g, '');
    expect(result.find(s => s.label === 'A')!.fields.map(x => x.name)).toEqual(['host']);
    expect(result.find(s => s.label === 'B')!.fields.map(x => x.name)).toEqual(['path']);
  });

  it('floats startsWith matches to the top within a group during search', () => {
    const many: FieldMetadata[] = [f('a_host', 'Backhost'), f('host', 'Host')];
    const g: FieldGroup[] = [{ label: 'G', fields: ['a_host', 'host'] }];
    const result = buildFieldMenuSections(many, g, 'host');
    // 'Host' startsWith wins over 'Backhost' (includes only)
    expect(result[0]!.fields.map(x => x.name)).toEqual(['host', 'a_host']);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test buildFieldMenuSections`
Expected: FAIL — `buildFieldMenuSections` is not defined / module not found.

- [ ] **Step 4: Implement the helper**

Create `lib/buildFieldMenuSections.ts`:

```ts
import type { FieldGroup, FieldMetadata } from '../types';
import { filterAndSort } from './filterSort';

/** A render-ready field-menu section. `label` undefined = headerless. */
export interface FieldMenuSection {
  label?: string;
  fields: FieldMetadata[];
}

const getText = (field: FieldMetadata): string[] => [field.label, field.name];

/**
 * Bucket `fields` into ordered, filtered menu sections. With no `fieldGroups`,
 * returns a single headerless section (today's flat list). With groups: fields
 * render under group headers in group/listed order, unclaimed fields fall into
 * a trailing headerless section, each section is filtered by `filterText`, and
 * sections with no surviving fields are dropped.
 */
export function buildFieldMenuSections(
  fields: FieldMetadata[],
  fieldGroups: FieldGroup[] | undefined,
  filterText: string,
): FieldMenuSection[] {
  if (!fieldGroups || fieldGroups.length === 0) {
    const flat = filterAndSort(fields, filterText, getText);
    return flat.length > 0 ? [{ fields: flat }] : [];
  }

  const byName = new Map(fields.map(field => [field.name, field]));
  const claimed = new Set<string>();
  const sections: FieldMenuSection[] = [];

  for (const group of fieldGroups) {
    const groupFields: FieldMetadata[] = [];
    for (const name of group.fields) {
      if (claimed.has(name)) continue;
      const field = byName.get(name);
      if (!field) continue;
      claimed.add(name);
      groupFields.push(field);
    }
    const filtered = filterAndSort(groupFields, filterText, getText);
    if (filtered.length > 0) sections.push({ label: group.label, fields: filtered });
  }

  const ungrouped = fields.filter(field => !claimed.has(field.name));
  const filteredUngrouped = filterAndSort(ungrouped, filterText, getText);
  if (filteredUngrouped.length > 0) sections.push({ fields: filteredUngrouped });

  return sections;
}
```

- [ ] **Step 5: Export from the lib barrel**

In `lib/index.ts`, add (alphabetical order is not enforced by Biome for exports, but place it next to `filterAndSort`):

```ts
export { buildFieldMenuSections, type FieldMenuSection } from './buildFieldMenuSections';
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm --filter @wallarm-org/design-system test buildFieldMenuSections`
Expected: PASS (all 8 tests green).

- [ ] **Step 7: Typecheck**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add packages/design-system/src/components/FilterInput/types.ts \
  packages/design-system/src/components/FilterInput/lib/buildFieldMenuSections.ts \
  packages/design-system/src/components/FilterInput/lib/index.ts \
  packages/design-system/src/components/FilterInput/__tests__/buildFieldMenuSections.test.ts
git commit -m "feat(filter-input): add buildFieldMenuSections helper and FieldGroup type

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Thread `fieldGroups` prop and render grouped sections

**Files:**
- Modify: `FilterInputMenu/FilterInputFieldMenu/FilterInputFieldMenu.tsx` (render sections + flatItems)
- Modify: `FilterInputMenu/FilterInputMenu.tsx` (accept + forward `fieldGroups`)
- Modify: `FilterInput.tsx` (accept `fieldGroups` prop, forward to `FilterInputMenu`)
- Modify: `stories/FilterInputFieldMenu.stories.tsx` (add `WithGroups` story)
- Modify: `stories/FilterInput.stories.tsx` (add `WithFieldGroups` story)

**Interfaces:**
- Consumes: `buildFieldMenuSections(fields, fieldGroups, filterText)` and `FieldGroup` from Task 1.
- Produces: `FilterInputProps.fieldGroups?: FieldGroup[]`; `FilterInputMenuProps.fieldGroups?: FieldGroup[]`; `FilterInputFieldMenuProps.fieldGroups?: FieldGroup[]`.

- [ ] **Step 1: Add `fieldGroups` to `FilterInputFieldMenu` and render sections**

In `FilterInputMenu/FilterInputFieldMenu/FilterInputFieldMenu.tsx`:

Add `Fragment` to the react import and `DropdownMenuLabel` + `DropdownMenuSeparator` to the DropdownMenu import, and import the helper + type:

```ts
import { type FC, Fragment, type RefObject, useMemo } from 'react';
```
```ts
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemText,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../../../DropdownMenu';
```
```ts
import { buildFieldMenuSections, filterAndSort } from '../../lib';
import type { Condition, FieldGroup, FieldMetadata, FilterInputDropdownItem } from '../../types';
```

Add `fieldGroups` to the props interface (after `suggestedFields`):

```ts
  /** Optional grouping for the field list. When omitted, fields render flat. */
  fieldGroups?: FieldGroup[];
```

Destructure it in the component signature (add after `suggestedFields = []`):

```ts
  fieldGroups,
```

Replace the `filteredFields` memo with a `sections` memo (delete the old `filteredFields` `useMemo`):

```ts
  const sections = useMemo(
    () => buildFieldMenuSections(fields, fieldGroups, filterText),
    [fields, fieldGroups, filterText],
  );
```

In the `flatItems` memo, replace the `filteredFields.forEach(...)` block with a section-order loop, and swap the dependency `filteredFields` → `sections`:

```ts
    sections.forEach(section => {
      section.fields.forEach(field => {
        items.push({
          id: `field-${field.name}`,
          label: field.label,
          value: { type: 'field', field },
        });
      });
    });
```

Update the `flatItems` dependency array: replace `filteredFields` with `sections`.

Replace `const hasResults = filteredFields.length > 0 || !filterText;` with:

```ts
  const hasResults = sections.length > 0 || !filterText;
```

Replace the JSX block that currently renders `filteredFields.length > 0 ? (<DropdownMenuGroup>…</DropdownMenuGroup>) : (<MenuEmptyState />)` with:

```tsx
        {sections.length > 0 ? (
          sections.map((section, index) => (
            <Fragment key={section.label ?? `ungrouped-${index}`}>
              {index > 0 && <DropdownMenuSeparator />}
              {section.label && <DropdownMenuLabel>{section.label}</DropdownMenuLabel>}
              <DropdownMenuGroup>
                {section.fields.map(field => (
                  <DropdownMenuItem
                    key={field.name}
                    value={`field-${field.name}`}
                    ref={registerItem(`field-${field.name}`)}
                    onSelect={() => onSelect(field)}
                  >
                    <DropdownMenuItemText>{field.label}</DropdownMenuItemText>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </Fragment>
          ))
        ) : (
          <MenuEmptyState />
        )}
```

Note: `filterAndSort` may no longer be referenced directly in this file after removing `filteredFields`. If Biome flags it as unused, remove it from the `import { ... } from '../../lib'` line. (It is still used transitively by the helper.)

- [ ] **Step 2: Forward `fieldGroups` through `FilterInputMenu`**

In `FilterInputMenu/FilterInputMenu.tsx`:

Add to the import of types:

```ts
import type { FieldGroup, FieldMetadata, FilterOperator, MenuState } from '../types';
```

Add to `FilterInputMenuProps`:

```ts
export interface FilterInputMenuProps {
  fields: FieldMetadata[];
  fieldGroups?: FieldGroup[];
  autocomplete: FilterInputAutocompleteState;
}
```

Destructure in the component signature:

```ts
export const FilterInputMenu: FC<FilterInputMenuProps> = ({ fields, fieldGroups, autocomplete }) => {
```

Pass it to the field menu (add the prop to the existing `<FilterInputFieldMenu ... />`):

```tsx
      <FilterInputFieldMenu
        fields={fields}
        fieldGroups={fieldGroups}
        filterText={fieldFilterText}
        ...
      />
```

- [ ] **Step 3: Add the `fieldGroups` prop to `FilterInput` and forward it**

In `FilterInput.tsx`:

Add to the types import:

```ts
import type { ExprNode, FieldGroup, FieldMetadata } from './types';
```

Add the prop to `FilterInputProps` (after the `fields?` prop doc block):

```ts
  /**
   * Optional grouping for the field-selection menu. When omitted, fields
   * render as a flat list. When provided, fields render under labeled group
   * headers (group order = array order; field order = listed order). Fields
   * not referenced by any group fall into a trailing headerless section.
   * Referenced by field `name`; unknown names are ignored.
   */
  fieldGroups?: FieldGroup[];
```

Destructure in the component signature (after `fields: rawFields = [],`):

```ts
  fieldGroups,
```

Forward to the menu (update the existing render near the end):

```tsx
      <FilterInputMenu fields={fields} fieldGroups={fieldGroups} autocomplete={autocomplete} />
```

- [ ] **Step 4: Typecheck + lint**

Run: `pnpm --filter @wallarm-org/design-system typecheck && pnpm --filter @wallarm-org/design-system lint`
Expected: no errors (fix an unused `filterAndSort` import if flagged).

- [ ] **Step 5: Add a `WithGroups` story to the field menu**

In `stories/FilterInputFieldMenu.stories.tsx`, add after the `WithSuggestions` story (reuse the existing `sampleFields` defined in the file):

```tsx
/**
 * FilterInputFieldMenu with grouped fields. Fields render under labeled group
 * headers; the `cwe` field is intentionally left out of every group to show
 * the trailing headerless "ungrouped" section.
 */
export const WithGroups: Story = {
  args: {
    fields: sampleFields,
    fieldGroups: [
      { label: 'Threat classification', fields: ['status', 'severity', 'blocking_status'] },
      {
        label: 'Request features',
        fields: ['http_status_code', 'endpoint', 'hostname', 'parameter'],
      },
      { label: 'Source and identity', fields: ['location', 'network', 'impact'] },
    ],
    open: true,
    onSelect: () => {
      // Field selection handler
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Fields grouped under section headers. Groups render in array order; the ungrouped "CWE" field appears in a trailing headerless section.',
      },
    },
  },
};
```

- [ ] **Step 6: Add a `WithFieldGroups` story to `FilterInput`**

In `stories/FilterInput.stories.tsx`, add a self-contained story so the filter-driven E2E can type into a real input. Add near the other simple stories (define an inline field set + groups so it does not depend on the backend fixture):

```tsx
const groupedDemoFields: FieldMetadata[] = [
  { name: 'attack_type', label: 'Attack type', type: 'string' },
  { name: 'status', label: 'Status', type: 'string' },
  { name: 'host', label: 'Host', type: 'string' },
  { name: 'path', label: 'Path', type: 'string' },
  { name: 'country', label: 'Country', type: 'string' },
];

export const WithFieldGroups: Story = {
  args: {
    fields: groupedDemoFields,
    fieldGroups: [
      { label: 'Threat classification', fields: ['attack_type', 'status'] },
      { label: 'Request features', fields: ['host', 'path'] },
      { label: 'Source and identity', fields: ['country'] },
    ],
    placeholder: 'Filter…',
  },
};
```

If `FieldMetadata` is not already imported in `FilterInput.stories.tsx`, add:

```ts
import type { FieldMetadata } from '../types';
```

(Check the existing imports first; only add if missing. The `Story` type and `meta` already exist in the file.)

- [ ] **Step 7: Verify stories render in Storybook**

Run: `pnpm --filter @wallarm-org/design-system storybook` (or rely on the build). Manually confirm `Patterns/FilterInput/FilterInputFieldMenu → With Groups` shows three headers + a trailing ungrouped "CWE", and `Patterns/FilterInput/FilterInput → With Field Groups` opens a grouped menu when the input is clicked.
Expected: grouped rendering matches the Figma section layout.

- [ ] **Step 8: Commit**

```bash
git add packages/design-system/src/components/FilterInput/FilterInputMenu/FilterInputFieldMenu/FilterInputFieldMenu.tsx \
  packages/design-system/src/components/FilterInput/FilterInputMenu/FilterInputMenu.tsx \
  packages/design-system/src/components/FilterInput/FilterInput.tsx \
  packages/design-system/src/components/FilterInput/stories/FilterInputFieldMenu.stories.tsx \
  packages/design-system/src/components/FilterInput/stories/FilterInput.stories.tsx
git commit -m "feat(filter-input): render grouped field menu via fieldGroups prop

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: E2E coverage for grouped field menu

**Files:**
- Create: `__tests__/FilterInputFieldMenuGrouping.e2e.ts`

**Interfaces:**
- Consumes: the `WithGroups` (field menu) and `WithFieldGroups` (FilterInput) stories from Task 2.
- Produces: nothing consumed downstream (leaf task).

- [ ] **Step 1: Write the E2E tests**

Create `__tests__/FilterInputFieldMenuGrouping.e2e.ts`:

```ts
import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const fieldMenuStory = createStoryHelper('patterns-filterinput-filterinputfieldmenu', [
  'With Groups',
] as const);

const filterInputStory = createStoryHelper('patterns-filterinput-filterinput', [
  'With Field Groups',
] as const);

test.describe('Component: FilterInput field grouping', () => {
  test.describe('Visual', () => {
    test('Should render the grouped field menu', async ({ page }) => {
      await fieldMenuStory.goto(page, 'With Groups');
      const menu = page.locator('[data-slot="filter-input-field-menu"]');
      await expect(menu).toHaveScreenshot('field-menu-grouped.png');
    });
  });

  test.describe('Interactions', () => {
    test('Should show all group headers in order', async ({ page }) => {
      await fieldMenuStory.goto(page, 'With Groups');
      await expect(page.getByText('Threat classification')).toBeVisible();
      await expect(page.getByText('Request features')).toBeVisible();
      await expect(page.getByText('Source and identity')).toBeVisible();
    });

    test('Should still select a field when grouped', async ({ page }) => {
      await filterInputStory.goto(page, 'With Field Groups');
      const field = page.locator('[data-slot="filter-input"]');
      await field.click();
      await page.getByRole('menuitem', { name: /^Host$/ }).click();
      await page.getByRole('menuitem', { name: /^is =$/ }).click();
      // Operator menu opened => field selection through a group works.
      await expect(page.getByRole('menu').last()).toBeVisible();
    });

    test('Should hide groups with no matching field when filtering', async ({ page }) => {
      await filterInputStory.goto(page, 'With Field Groups');
      const field = page.locator('[data-slot="filter-input"]');
      const input = field.locator('input');
      await field.click();
      await input.fill('host');
      // Matching group header stays…
      await expect(page.getByText('Request features')).toBeVisible();
      // …non-matching group headers are gone.
      await expect(page.getByText('Threat classification')).toHaveCount(0);
      await expect(page.getByText('Source and identity')).toHaveCount(0);
    });
  });
});
```

- [ ] **Step 2: Run the E2E tests locally**

Run: `pnpm --filter @wallarm-org/design-system test:e2e FilterInputFieldMenuGrouping` (or the repo's standard E2E command; see `docs/e2e-test-rules.md`). On first run, generate the screenshot baseline with the repo's update-screenshots flow.
Expected: all interaction tests PASS; screenshot baseline created for `field-menu-grouped.png`.

- [ ] **Step 3: Verify against E2E rules**

Read `docs/e2e-test-rules.md` and confirm the file name (`*.e2e.ts`), `test.describe` naming (`Component: …` + `Visual`/`Interactions` groups), and severity conventions match. Adjust if the repo requires a severity annotation or a different describe root.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/components/FilterInput/__tests__/FilterInputFieldMenuGrouping.e2e.ts
# plus any generated screenshot baseline paths
git commit -m "test(filter-input): e2e coverage for grouped field menu

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Data model (`FieldGroup` + `fieldGroups` prop) → Task 1 Step 1, Task 2 Steps 2–3. ✓
- Pure helper with all behaviors → Task 1 Steps 2–4. ✓
- Non-breaking (no groups = flat) → Task 1 Step 4 branch + unit test Step 2. ✓
- Group order / within-group order → helper + unit tests. ✓
- Ungrouped trailing section → helper + unit test. ✓
- Empty-group drop on search → helper + unit test + E2E Step 1 (filter test). ✓
- First-group dedup / unknown-name skip → helper + unit tests. ✓
- Recent/Suggestions unchanged → untouched code; Task 2 only replaces the flat field block. ✓
- Rendering with `DropdownMenuLabel`/`DropdownMenuSeparator` → Task 2 Step 1. ✓
- Keyboard-nav flatItems in section order → Task 2 Step 1. ✓
- `MenuEmptyState` when no results → Task 2 Step 1. ✓
- Prop threading → Task 2 Steps 2–3. ✓
- Testing (unit primary, E2E for render/filter) → Tasks 1 & 3. ✓
- YAGNI guardrails (no collapse/icons/select-all/nesting) → nothing in plan adds them. ✓

**Placeholder scan:** No TBD/TODO; every code step has complete code. The one conditional ("add `FieldMetadata` import only if missing", "remove unused `filterAndSort` if Biome flags it") is a concrete, verifiable instruction, not a placeholder.

**Type consistency:** `FieldGroup { label: string; fields: string[] }` and `FieldMenuSection { label?: string; fields: FieldMetadata[] }` and the `buildFieldMenuSections(fields, fieldGroups, filterText)` signature are used identically in Tasks 1, 2, and 3. Item value shape `{ type: 'field', field }` and id `field-${field.name}` match the existing `handleItemSelect` switch, unchanged.

# Status Code Suggestions Helper — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `createStatusCodeSuggestions` — a pure helper that turns a raw backend status-code list into mask-only `FieldValueOption[]` suggestions, with color badges keyed to HTTP class. Wire it into all three FilterInput stories.

**Architecture:** The helper lives in `FilterInput/lib/`, takes the backend's raw `codes` list, keeps only 1-char entries in `[1..5]` as mask roots, and maps user input to a mask (`""` → all, `"4"` → `4XX`, `"40"` → `40X`). Masks carry a `badge` whose color is a CSS variable for the HTTP class. No menu/component changes — `ValueMenuItem` already renders colored pills when `badge` is set.

**Tech Stack:** TypeScript, Vitest (unit), Playwright (E2E screenshot), Biome for lint/format.

**Spec:** [`docs/superpowers/specs/2026-04-20-status-code-suggestions-design.md`](../specs/2026-04-20-status-code-suggestions-design.md)

---

## File Structure

**New:**
- `packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts` — the helper: factory returning `(inputText) => FieldValueOption[]`.
- `packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts` — unit tests.
- `packages/design-system/src/components/FilterInput/stories/mockStatusCodes.ts` — shared example backend list for stories.

**Modified:**
- `packages/design-system/src/components/FilterInput/lib/index.ts` — add re-export.
- `packages/design-system/src/components/FilterInput/index.ts` — add public export.
- `packages/design-system/src/components/FilterInput/stories/FilterInput.stories.tsx` — new `HTTPStatusCodeSuggestions` story.
- `packages/design-system/src/components/FilterInput/stories/FilterInputComposition.stories.tsx` — wire `getSuggestions` on `status_code`.
- `packages/design-system/src/components/FilterInput/stories/FilterInputFieldMenu.stories.tsx` — wire `getSuggestions` on all three `http_status_code` fields.
- `packages/design-system/src/components/FilterInput/__tests__/FilterInput.e2e.ts` — add one screenshot for the new story.

---

## Commands Reference

Run from the repo root (`/Users/klimovaoks/Projects/work/design-system`):

- Run one unit test file: `pnpm -F @wallarm/design-system test -- statusCodeSuggestions`
- Run all unit tests: `pnpm -F @wallarm/design-system test`
- Typecheck: `pnpm -F @wallarm/design-system typecheck`
- Biome fix + format on touched files: `npx biome check --write <paths>`
- Storybook (for manual visual check): `pnpm -F @wallarm/design-system storybook`
- Playwright screenshot update (single story): `pnpm -F @wallarm/design-system e2e -- --update-snapshots -g "HTTPStatusCodeSuggestions"`

---

## Task 1: Scaffold helper — empty input returns all available masks (TDD)

**Files:**
- Test: `packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts`
- Create: `packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts`

- [ ] **Step 1: Create the test file with the first failing test**

Create `packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createStatusCodeSuggestions } from '../lib/statusCodeSuggestions';

describe('createStatusCodeSuggestions', () => {
  it('returns all available masks for empty input', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    const result = suggest('');
    expect(result.map(o => o.value)).toEqual(['2XX', '3XX', '4XX', '5XX']);
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
pnpm -F @wallarm/design-system test -- statusCodeSuggestions
```

Expected: FAIL — `Cannot find module '../lib/statusCodeSuggestions'`.

- [ ] **Step 3: Create the helper with minimal implementation**

Create `packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts`:

```ts
import type { FieldValueOption } from '../types';

const VALID_MASK_ROOTS = new Set(['1', '2', '3', '4', '5']);

export interface StatusCodeSuggestionsOptions {
  /**
   * Raw backend status-code list. The helper keeps only 1-char entries in
   * `[1..5]` as mask roots; everything else is ignored. When omitted or empty,
   * the helper returns `[]` for every input.
   */
  codes?: string[];
}

export const createStatusCodeSuggestions = (
  options?: StatusCodeSuggestionsOptions,
): ((inputText: string) => FieldValueOption[]) => {
  const maskRoots = (options?.codes ?? []).filter(
    c => c.length === 1 && VALID_MASK_ROOTS.has(c),
  );

  const makeMask = (label: string): FieldValueOption => ({
    value: label,
    label,
  });

  return (inputText: string): FieldValueOption[] => {
    const norm = inputText.trim();
    if (norm.length === 0) {
      return maskRoots.map(d => makeMask(`${d}XX`));
    }
    return [];
  };
};
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
pnpm -F @wallarm/design-system test -- statusCodeSuggestions
```

Expected: PASS (1/1).

- [ ] **Step 5: Format and commit**

```bash
npx biome check --write \
  packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts \
  packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts

git add \
  packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts \
  packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts

git commit -m "feat(filter-input): AS-877 scaffold createStatusCodeSuggestions helper"
```

---

## Task 2: Input-driven masks — 1-digit and 2-digit narrowing

**Files:**
- Modify: `packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts`
- Modify: `packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts`

- [ ] **Step 1: Add failing tests for 1- and 2-digit input**

Append to the `describe` block in `statusCodeSuggestions.test.ts`:

```ts
  it('returns the matching 1-digit mask when the digit is a known root', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('4').map(o => o.value)).toEqual(['4XX']);
    expect(suggest('2').map(o => o.value)).toEqual(['2XX']);
  });

  it('returns empty when a 1-digit input is not in maskRoots', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('1')).toEqual([]);
    expect(suggest('6')).toEqual([]);
  });

  it('returns the narrowed 2-digit mask when the leading digit is a known root', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('40').map(o => o.value)).toEqual(['40X']);
    expect(suggest('20').map(o => o.value)).toEqual(['20X']);
  });

  it('returns empty for a 2-digit input whose leading digit is not a known root', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('70')).toEqual([]);
    expect(suggest('10')).toEqual([]);
  });
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
pnpm -F @wallarm/design-system test -- statusCodeSuggestions
```

Expected: 4 new failures — current impl returns `[]` for any non-empty input.

- [ ] **Step 3: Extend the helper to handle 1- and 2-digit input**

In `statusCodeSuggestions.ts`, replace the returned function body:

```ts
  return (inputText: string): FieldValueOption[] => {
    const norm = inputText.trim();
    if (norm.length === 0) {
      return maskRoots.map(d => makeMask(`${d}XX`));
    }
    if (norm.length === 1) {
      return maskRoots.includes(norm) ? [makeMask(`${norm}XX`)] : [];
    }
    if (norm.length === 2) {
      const d1 = norm[0];
      return maskRoots.includes(d1) ? [makeMask(`${norm}X`)] : [];
    }
    return [];
  };
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
pnpm -F @wallarm/design-system test -- statusCodeSuggestions
```

Expected: PASS (5/5).

- [ ] **Step 5: Format and commit**

```bash
npx biome check --write \
  packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts \
  packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts

git add \
  packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts \
  packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts

git commit -m "feat(filter-input): AS-877 narrow status code mask by typed digits"
```

---

## Task 3: Input sanitization — 3+ digits, non-digits, whitespace

**Files:**
- Modify: `packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts`
- Modify: `packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts`

- [ ] **Step 1: Add failing sanitization tests**

Append to the `describe` block:

```ts
  it('returns empty when input has three or more digits', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('401')).toEqual([]);
    expect(suggest('4040')).toEqual([]);
  });

  it('returns empty when input contains non-digit characters', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('4a')).toEqual([]);
    expect(suggest('abc')).toEqual([]);
    expect(suggest('4.')).toEqual([]);
  });

  it('trims surrounding whitespace before matching', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('  4  ').map(o => o.value)).toEqual(['4XX']);
    expect(suggest('  ').map(o => o.value)).toEqual(['2XX', '3XX', '4XX', '5XX']);
  });
```

- [ ] **Step 2: Run the tests to confirm the non-digit ones fail**

```bash
pnpm -F @wallarm/design-system test -- statusCodeSuggestions
```

Expected: `suggest('4a')`, `suggest('abc')`, `suggest('4.')` currently return `[]` coincidentally (because none are mask roots), but the 3+ digit tests already pass (length > 2 returns `[]`). Whitespace test may or may not pass depending on current impl. Run the full set and see which fail.

*Note: if everything passes, still add an explicit digit guard — the behavior matters for correctness, not just as an accident.*

- [ ] **Step 3: Add an explicit digit guard to the helper**

In `statusCodeSuggestions.ts`, update the returned function to explicitly bail on non-digit input and on > 3 chars:

```ts
  return (inputText: string): FieldValueOption[] => {
    const norm = inputText.trim();
    if (norm.length > 3) return [];
    if (norm.length > 0 && !/^\d+$/.test(norm)) return [];

    if (norm.length === 0) {
      return maskRoots.map(d => makeMask(`${d}XX`));
    }
    if (norm.length === 1) {
      return maskRoots.includes(norm) ? [makeMask(`${norm}XX`)] : [];
    }
    if (norm.length === 2) {
      const d1 = norm[0];
      return maskRoots.includes(d1) ? [makeMask(`${norm}X`)] : [];
    }
    return [];
  };
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
pnpm -F @wallarm/design-system test -- statusCodeSuggestions
```

Expected: PASS (8/8).

- [ ] **Step 5: Format and commit**

```bash
npx biome check --write \
  packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts \
  packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts

git add \
  packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts \
  packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts

git commit -m "feat(filter-input): AS-877 sanitize input for status code suggestions"
```

---

## Task 4: Defensive filtering of backend `codes`

**Files:**
- Modify: `packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts`
- Modify: `packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts`

- [ ] **Step 1: Add failing tests for defensive filtering**

Append to the `describe` block:

```ts
  it('ignores 3-char entries and other lengths in codes', () => {
    const suggest = createStatusCodeSuggestions({
      codes: ['2', '3', '4', '5', '200', '201', '40', '4040', '', '404'],
    });
    expect(suggest('').map(o => o.value)).toEqual(['2XX', '3XX', '4XX', '5XX']);
  });

  it('ignores 1-char entries outside the valid HTTP range', () => {
    const suggest = createStatusCodeSuggestions({
      codes: ['0', '2', '4', '6', '9', 'a'],
    });
    expect(suggest('').map(o => o.value)).toEqual(['2XX', '4XX']);
  });

  it('returns empty when codes is undefined', () => {
    const suggest = createStatusCodeSuggestions();
    expect(suggest('')).toEqual([]);
    expect(suggest('4')).toEqual([]);
    expect(suggest('40')).toEqual([]);
  });

  it('returns empty when codes is an empty array', () => {
    const suggest = createStatusCodeSuggestions({ codes: [] });
    expect(suggest('')).toEqual([]);
    expect(suggest('4')).toEqual([]);
  });

  it('accepts the full backend example and shows only available masks', () => {
    const suggest = createStatusCodeSuggestions({
      codes: ['2', '3', '4', '5', '200', '201', '301', '302', '400', '401', '403', '404', '500', '502', '503'],
    });
    expect(suggest('').map(o => o.value)).toEqual(['2XX', '3XX', '4XX', '5XX']);
    expect(suggest('4').map(o => o.value)).toEqual(['4XX']);
    expect(suggest('40').map(o => o.value)).toEqual(['40X']);
    expect(suggest('1')).toEqual([]);
  });
```

- [ ] **Step 2: Run the tests**

```bash
pnpm -F @wallarm/design-system test -- statusCodeSuggestions
```

Expected: all tests pass already — `VALID_MASK_ROOTS` filter + `length === 1` guard in the factory already cover out-of-range and wrong-length entries. Confirm that every new test reports PASS.

*If a test fails, review the filter in the factory and fix before moving on.*

- [ ] **Step 3: Format and commit**

```bash
npx biome check --write \
  packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts

git add \
  packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts

git commit -m "test(filter-input): AS-877 cover defensive filtering of backend codes"
```

---

## Task 5: Badge colors per HTTP class

**Files:**
- Modify: `packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts`
- Modify: `packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts`

Badge color mapping (CSS vars from `theme/semantic.css`):
- `1` → `var(--color-bg-light-success)` *(informational — lighter green to differ from 2XX)*
- `2` → `var(--color-bg-success)` *(success)*
- `3` → `var(--color-bg-info)` *(redirect — blue)*
- `4` → `var(--color-bg-warning)` *(client error — amber)*
- `5` → `var(--color-bg-danger)` *(server error — red)*

These tokens exist today at `packages/design-system/src/theme/semantic.css:76-95`.

- [ ] **Step 1: Add failing tests for badge colors**

Append to the `describe` block:

```ts
  it('attaches a badge with the mask string as text', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['4'] });
    const [mask] = suggest('');
    expect(mask.badge).toBeDefined();
    expect(mask.badge?.text).toBe('4XX');
  });

  it('derives badge color from the leading digit', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['1', '2', '3', '4', '5'] });
    const byValue = Object.fromEntries(suggest('').map(o => [o.value, o.badge?.color]));
    expect(byValue).toEqual({
      '1XX': 'var(--color-bg-light-success)',
      '2XX': 'var(--color-bg-success)',
      '3XX': 'var(--color-bg-info)',
      '4XX': 'var(--color-bg-warning)',
      '5XX': 'var(--color-bg-danger)',
    });
  });

  it('preserves leading-digit color on 2-digit masks', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['4'] });
    const [mask] = suggest('40');
    expect(mask.value).toBe('40X');
    expect(mask.badge?.color).toBe('var(--color-bg-warning)');
    expect(mask.badge?.text).toBe('40X');
  });
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
pnpm -F @wallarm/design-system test -- statusCodeSuggestions
```

Expected: 3 new failures — `mask.badge` is currently `undefined`.

- [ ] **Step 3: Add the color map and populate `badge` in the helper**

In `statusCodeSuggestions.ts`, add the color map near the top and update `makeMask`:

```ts
import type { FieldValueOption } from '../types';

const VALID_MASK_ROOTS = new Set(['1', '2', '3', '4', '5']);

const HTTP_CLASS_BADGE_COLOR: Record<string, string> = {
  '1': 'var(--color-bg-light-success)',
  '2': 'var(--color-bg-success)',
  '3': 'var(--color-bg-info)',
  '4': 'var(--color-bg-warning)',
  '5': 'var(--color-bg-danger)',
};

export interface StatusCodeSuggestionsOptions {
  /**
   * Raw backend status-code list. The helper keeps only 1-char entries in
   * `[1..5]` as mask roots; everything else is ignored. When omitted or empty,
   * the helper returns `[]` for every input.
   */
  codes?: string[];
}

export const createStatusCodeSuggestions = (
  options?: StatusCodeSuggestionsOptions,
): ((inputText: string) => FieldValueOption[]) => {
  const maskRoots = (options?.codes ?? []).filter(
    c => c.length === 1 && VALID_MASK_ROOTS.has(c),
  );

  const makeMask = (label: string): FieldValueOption => ({
    value: label,
    label,
    badge: {
      color: HTTP_CLASS_BADGE_COLOR[label[0]],
      text: label,
    },
  });

  return (inputText: string): FieldValueOption[] => {
    const norm = inputText.trim();
    if (norm.length > 3) return [];
    if (norm.length > 0 && !/^\d+$/.test(norm)) return [];

    if (norm.length === 0) {
      return maskRoots.map(d => makeMask(`${d}XX`));
    }
    if (norm.length === 1) {
      return maskRoots.includes(norm) ? [makeMask(`${norm}XX`)] : [];
    }
    if (norm.length === 2) {
      const d1 = norm[0];
      return maskRoots.includes(d1) ? [makeMask(`${norm}X`)] : [];
    }
    return [];
  };
};
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
pnpm -F @wallarm/design-system test -- statusCodeSuggestions
```

Expected: PASS (all, current count 12+).

- [ ] **Step 5: Format and commit**

```bash
npx biome check --write \
  packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts \
  packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts

git add \
  packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts \
  packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts

git commit -m "feat(filter-input): AS-877 attach HTTP-class color badge to status masks"
```

---

## Task 6: Re-export the helper publicly

**Files:**
- Modify: `packages/design-system/src/components/FilterInput/lib/index.ts`
- Modify: `packages/design-system/src/components/FilterInput/index.ts`

- [ ] **Step 1: Re-export from `lib/index.ts`**

Open `packages/design-system/src/components/FilterInput/lib/index.ts` and insert, keeping alphabetical grouping with neighboring `fields` export:

Before (line 20):
```ts
export { getFieldValues, hasFieldValues, hasStaticAllowlist } from './fields';
```

After:
```ts
export { getFieldValues, hasFieldValues, hasStaticAllowlist } from './fields';
export {
  createStatusCodeSuggestions,
  type StatusCodeSuggestionsOptions,
} from './statusCodeSuggestions';
```

- [ ] **Step 2: Re-export from the component barrel**

Open `packages/design-system/src/components/FilterInput/index.ts` and update the `// Utilities` block:

Before (lines 13-19):
```ts
// Utilities
export {
  type FilterParseError,
  isFilterParseError,
  parseExpression,
  serializeExpression,
} from './lib';
```

After:
```ts
// Utilities
export {
  createStatusCodeSuggestions,
  type FilterParseError,
  isFilterParseError,
  parseExpression,
  serializeExpression,
  type StatusCodeSuggestionsOptions,
} from './lib';
```

- [ ] **Step 3: Typecheck**

```bash
pnpm -F @wallarm/design-system typecheck
```

Expected: no new errors.

- [ ] **Step 4: Format and commit**

```bash
npx biome check --write \
  packages/design-system/src/components/FilterInput/lib/index.ts \
  packages/design-system/src/components/FilterInput/index.ts

git add \
  packages/design-system/src/components/FilterInput/lib/index.ts \
  packages/design-system/src/components/FilterInput/index.ts

git commit -m "feat(filter-input): AS-877 publicly export createStatusCodeSuggestions"
```

---

## Task 7: Shared mock constant for stories

**Files:**
- Create: `packages/design-system/src/components/FilterInput/stories/mockStatusCodes.ts`

- [ ] **Step 1: Create the mock**

```ts
/**
 * Example HTTP status code backend response used by FilterInput stories.
 * Mixes 1-char HTTP classes with 3-char concrete codes — the same shape the
 * real backend produces. See AS-877 design spec.
 */
export const MOCK_STATUS_CODES: string[] = [
  '2',
  '3',
  '4',
  '5',
  '200',
  '201',
  '301',
  '302',
  '400',
  '401',
  '403',
  '404',
  '500',
  '502',
  '503',
];
```

Save to `packages/design-system/src/components/FilterInput/stories/mockStatusCodes.ts`.

- [ ] **Step 2: Format and commit**

```bash
npx biome check --write \
  packages/design-system/src/components/FilterInput/stories/mockStatusCodes.ts

git add \
  packages/design-system/src/components/FilterInput/stories/mockStatusCodes.ts

git commit -m "chore(filter-input): AS-877 add shared status-code mock for stories"
```

---

## Task 8: New `HTTPStatusCodeSuggestions` story

**Files:**
- Modify: `packages/design-system/src/components/FilterInput/stories/FilterInput.stories.tsx`

- [ ] **Step 1: Add imports**

At the top of `FilterInput.stories.tsx`, just below `import type { ExprNode, FieldMetadata } from '../types';`:

```ts
import { createStatusCodeSuggestions } from '../lib/statusCodeSuggestions';
import { MOCK_STATUS_CODES } from './mockStatusCodes';
```

- [ ] **Step 2: Add the story at the end of the file**

Append at the very end of `FilterInput.stories.tsx` (after the last existing export):

```ts
/**
 * HTTP status code field using createStatusCodeSuggestions for mask-only
 * suggestions. Empty input shows all masks available in the data; typing a
 * digit narrows the suggestion (e.g. "4" → 4XX, "40" → 40X). See AS-877.
 */
export const HTTPStatusCodeSuggestions: Story = {
  args: {
    fields: [
      {
        name: 'response_code',
        label: 'Status code',
        type: 'integer',
        getSuggestions: createStatusCodeSuggestions({ codes: MOCK_STATUS_CODES }),
      },
    ],
    placeholder: 'Type to filter by status code...',
  },
};
```

- [ ] **Step 3: Verify visually in Storybook**

```bash
pnpm -F @wallarm/design-system storybook
```

Manual check (in browser):
1. Open `Patterns/FilterInput/FilterInput/HTTPStatusCodeSuggestions`.
2. Click the input, choose `Status code` → `is`.
3. Empty value menu should show four masks: `2XX, 3XX, 4XX, 5XX`, each with its color badge.
4. Type `4` — only `4XX` should remain.
5. Type `40` (additional `0`) — `40X` should appear.
6. Type `401` — menu should be empty.

Stop Storybook (Ctrl-C) once verified.

- [ ] **Step 4: Typecheck**

```bash
pnpm -F @wallarm/design-system typecheck
```

Expected: no errors.

- [ ] **Step 5: Format and commit**

```bash
npx biome check --write \
  packages/design-system/src/components/FilterInput/stories/FilterInput.stories.tsx

git add \
  packages/design-system/src/components/FilterInput/stories/FilterInput.stories.tsx

git commit -m "docs(filter-input): AS-877 add HTTPStatusCodeSuggestions story"
```

---

## Task 9: Wire helper into `FilterInputComposition.stories.tsx`

**Files:**
- Modify: `packages/design-system/src/components/FilterInput/stories/FilterInputComposition.stories.tsx`

- [ ] **Step 1: Locate the `status_code` field**

Open `packages/design-system/src/components/FilterInput/stories/FilterInputComposition.stories.tsx`. The `status_code` field sits near line 84.

- [ ] **Step 2: Add imports**

At the top of the file, after existing imports, add:

```ts
import { createStatusCodeSuggestions } from '../lib/statusCodeSuggestions';
import { MOCK_STATUS_CODES } from './mockStatusCodes';
```

- [ ] **Step 3: Wire `getSuggestions` on the `status_code` field**

Find the field definition around line 84 that starts with `name: 'status_code',`. Add `getSuggestions` to it:

```ts
{
  name: 'status_code',
  label: 'Status Code',
  type: 'integer',
  description: 'HTTP response status code (200, 404, 500, etc.)',
  getSuggestions: createStatusCodeSuggestions({ codes: MOCK_STATUS_CODES }),
},
```

*(Preserve every other property of the object; only add the `getSuggestions` line.)*

- [ ] **Step 4: Typecheck**

```bash
pnpm -F @wallarm/design-system typecheck
```

Expected: no errors.

- [ ] **Step 5: Format and commit**

```bash
npx biome check --write \
  packages/design-system/src/components/FilterInput/stories/FilterInputComposition.stories.tsx

git add \
  packages/design-system/src/components/FilterInput/stories/FilterInputComposition.stories.tsx

git commit -m "docs(filter-input): AS-877 wire status code suggestions in composition story"
```

---

## Task 10: Wire helper into `FilterInputFieldMenu.stories.tsx`

**Files:**
- Modify: `packages/design-system/src/components/FilterInput/stories/FilterInputFieldMenu.stories.tsx`

Three field definitions reference `http_status_code` (lines 50-53, 216-219, 293-296). All three must get the same wiring.

- [ ] **Step 1: Add imports**

At the top, after the existing imports:

```ts
import { createStatusCodeSuggestions } from '../lib/statusCodeSuggestions';
import { MOCK_STATUS_CODES } from './mockStatusCodes';
```

- [ ] **Step 2: Add `getSuggestions` to all three `http_status_code` definitions**

For **each** occurrence of:

```ts
{
  name: 'http_status_code',
  label: 'HTTP status code',
  type: 'integer',
  description: 'HTTP response status code',
},
```

add the same `getSuggestions` line:

```ts
{
  name: 'http_status_code',
  label: 'HTTP status code',
  type: 'integer',
  description: 'HTTP response status code',
  getSuggestions: createStatusCodeSuggestions({ codes: MOCK_STATUS_CODES }),
},
```

Verify with grep that only three matches exist and all three are updated:

```bash
grep -n "name: 'http_status_code'" packages/design-system/src/components/FilterInput/stories/FilterInputFieldMenu.stories.tsx
```

Expected: three line numbers. Follow each to confirm `getSuggestions` is present.

- [ ] **Step 3: Typecheck**

```bash
pnpm -F @wallarm/design-system typecheck
```

Expected: no errors.

- [ ] **Step 4: Format and commit**

```bash
npx biome check --write \
  packages/design-system/src/components/FilterInput/stories/FilterInputFieldMenu.stories.tsx

git add \
  packages/design-system/src/components/FilterInput/stories/FilterInputFieldMenu.stories.tsx

git commit -m "docs(filter-input): AS-877 wire status code suggestions in field menu story"
```

---

## Task 11: E2E screenshot for the new story

**Files:**
- Modify: `packages/design-system/src/components/FilterInput/__tests__/FilterInput.e2e.ts`

Read `.claude/rules/e2e.md` and `docs/e2e-test-rules.md` before writing. Follow the project's screenshot/describe naming conventions.

- [ ] **Step 1: Inspect existing structure**

```bash
sed -n '1,80p' packages/design-system/src/components/FilterInput/__tests__/FilterInput.e2e.ts
```

Identify the `test.describe` block that hosts Screenshot tests for FilterInput stories — add the new case inside it.

- [ ] **Step 2: Add the screenshot case**

Add a new `test()` inside the matching describe block. Use the Storybook URL for the story added in Task 8. Example (adapt to existing patterns in the file):

```ts
test('HTTPStatusCodeSuggestions — empty menu shows mask list', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=patterns-filterinput-filterinput--http-status-code-suggestions&viewMode=story',
  );
  const trigger = page.getByRole('textbox');
  await trigger.click();
  await page.getByRole('menuitem', { name: /status code/i }).click();
  await page.getByRole('menuitem', { name: /^is$/ }).click();
  // Value menu is now open with the mask list.
  await expect(page.getByRole('menu')).toHaveScreenshot('status-code-mask-menu.png');
});
```

*(If the existing file already uses helper utilities like `openFilterInput(page)`, prefer those — match the style of neighboring tests. Read the file before writing.)*

- [ ] **Step 3: Generate the snapshot**

```bash
pnpm -F @wallarm/design-system e2e -- --update-snapshots -g "HTTPStatusCodeSuggestions"
```

Expected: a new PNG is written under the appropriate `*-snapshots/` directory. Commit it alongside the test.

- [ ] **Step 4: Re-run the test without `--update-snapshots` to confirm it passes**

```bash
pnpm -F @wallarm/design-system e2e -- -g "HTTPStatusCodeSuggestions"
```

Expected: PASS.

- [ ] **Step 5: Format and commit**

```bash
npx biome check --write \
  packages/design-system/src/components/FilterInput/__tests__/FilterInput.e2e.ts

git add \
  packages/design-system/src/components/FilterInput/__tests__/FilterInput.e2e.ts \
  packages/design-system/src/components/FilterInput/__tests__/FilterInput.e2e.ts-snapshots/

git commit -m "test(filter-input): AS-877 e2e screenshot for status code mask menu"
```

---

## Task 12: Final verification

- [ ] **Step 1: Run full unit test suite**

```bash
pnpm -F @wallarm/design-system test
```

Expected: PASS, zero regressions.

- [ ] **Step 2: Run typecheck across the workspace**

```bash
pnpm -F @wallarm/design-system typecheck
```

Expected: no errors.

- [ ] **Step 3: Run Biome check on the whole touched area**

```bash
npx biome check packages/design-system/src/components/FilterInput
```

Expected: clean output. If Biome reports anything, re-run with `--write` on the specific files and commit the fix.

- [ ] **Step 4: Run the E2E suite (locally, single project)**

```bash
pnpm -F @wallarm/design-system e2e -- -g "FilterInput"
```

Expected: all FilterInput E2E tests pass, including the new screenshot.

- [ ] **Step 5: Push the branch**

```bash
git push
```

(If the branch isn't tracking the remote yet, push with `-u origin HEAD`.)

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Helper API (`codes`, `maskRoots`, masks output) → Tasks 1-4.
- Badge mapping per HTTP class → Task 5.
- Public export → Task 6.
- Mock constant → Task 7.
- New `HTTPStatusCodeSuggestions` story → Task 8.
- Wiring into Composition and FieldMenu stories → Tasks 9, 10.
- E2E screenshot for empty-input state → Task 11.
- Unit tests from the spec's Testing section → Tasks 1-5 (table-driven) + Task 4 (defensive cases).

**Placeholder scan:** no TBD/TODO; every code step shows the actual code; every command has an expected outcome.

**Type consistency:** the exported symbols `createStatusCodeSuggestions` and `StatusCodeSuggestionsOptions` are used consistently across Tasks 1, 5, 6, 8, 9, 10.

**Note for implementer:** the badge mapping uses `var(--color-bg-light-success)` for 1XX. If the Figma reviewer flags a different token for 1XX (e.g. a teal token), update `HTTP_CLASS_BADGE_COLOR` in `statusCodeSuggestions.ts` and the matching unit test in Task 5. No other changes needed.

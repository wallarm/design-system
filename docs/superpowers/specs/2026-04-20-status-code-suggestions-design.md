# Status Code Suggestions Helper — Design

**Jira:** [AS-877 — Status code filter mask does not work](https://wallarm.atlassian.net/browse/AS-877)
**Branch:** `feature/AS-877-filter-input-getsuggestions`
**Date:** 2026-04-20

## Context

The `FilterInput` component already supports dynamic value suggestions via `FieldMetadata.getSuggestions(inputText: string): FieldValueOption[]`. This is the infrastructure landed on the current branch.

The HTTP status code field is an **exception** to the normal value-list behavior: instead of offering the full backend value list as suggestions, it offers only **masks** (`1XX, 2XX, 3XX, 4XX, 5XX` when empty; narrower as the user types). The ticket also mentions a "frequently used status code" section — **we explicitly skip that** per the product decision.

**Backend shape** — an observed example response for this field:

```json
["2", "3", "4", "5", "200", "201", "301", "302", "400", "401", "403", "404", "500", "502", "503"]
```

The helper cares only about **1-character entries** in this list (`"2", "3", "4", "5"` above) — those are the HTTP classes for which the dataset has data. Three-digit entries are ignored by this helper.

**Figma references:**
- [Empty value menu — masks only](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7894-60394)
- [Full behavior across states](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7894-60358)

Key visual decisions:
- Masks are **selectable** values. Selecting `4XX` commits a chip value of `"4XX"`; the backend understands the mask.
- Masks render with a **color badge** keyed to the HTTP class (1xx..5xx). Concrete three-digit codes, when the user picks one, render as plain text — but the helper does not suggest any concrete codes, so this only matters for chips already committed.
- Multi-select works across masks (`Status code is any of 2XX, 3XX`).

## Goal

Ship a pure helper that consumers plug into `FieldMetadata.getSuggestions` for the status code field. The helper returns mask-only suggestions derived from (a) the backend's known HTTP classes and (b) the current input text. Badge color is derived from the mask's leading digit.

Non-goals:

- Adding a dedicated `type: 'statusCode'` field kind.
- Returning concrete codes as suggestions (the ticket's "frequently used" section is out of scope).
- Translating mask values (e.g. `4XX`) to backend query predicates — that lives on the backend / consumer side, not here.
- Extending `getSuggestions` to return grouped sections with headers.

## API

New helper in `packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts`.

```ts
export interface StatusCodeSuggestionsOptions {
  /**
   * The raw backend response for the status code field.
   * The helper picks only 1-character entries (the HTTP classes with data),
   * intersected with the valid HTTP range [1..5]. All other entries are ignored.
   * When omitted or empty, the helper returns `[]` for every input.
   */
  codes?: string[];
}

export const createStatusCodeSuggestions: (
  options?: StatusCodeSuggestionsOptions,
) => (inputText: string) => FieldValueOption[];
```

**Usage:**

```ts
const statusCodeField: FieldMetadata = {
  name: 'response_code',
  label: 'Status Code',
  type: 'integer',
  getSuggestions: createStatusCodeSuggestions({
    codes: ['2', '3', '4', '5', '200', '201', '301', '302', '400', '401', '403', '404', '500', '502', '503'],
  }),
};
```

## Behavior

### Input normalization

1. Trim the input.
2. If the result contains any non-digit, return `[]`.
3. If the length is > 3, return `[]`.

### Derive `maskRoots`

From `codes`, keep entries where `length === 1 && digit ∈ [1..5]`. Call this set `maskRoots`. All other entries are ignored. If `maskRoots` is empty, the helper returns `[]` for every input.

### Masks

Let `norm` be the normalized input.

| `norm` | Output masks |
| --- | --- |
| `""` | `maskRoots.map(d => d + 'XX')` |
| 1 digit `d`, `d ∈ maskRoots` | `[d + 'XX']` |
| 1 digit `d`, `d ∉ maskRoots` | `[]` |
| 2 digits `d1d2`, `d1 ∈ maskRoots` | `[d1 + d2 + 'X']` |
| 2 digits, `d1 ∉ maskRoots` | `[]` |
| 3 digits | `[]` |

Each mask is a selectable `FieldValueOption`:
- `value` and `label` are the mask string (e.g. `"4XX"`, `"40X"`).
- `badge` is populated with an HTTP-class color (see "Badge mapping" below). The existing menu renders `badge.text` as the visible text inside the colored pill — so `badge.text` equals the mask string.

### Badge mapping

The badge color is derived from the **leading digit** of the mask, mapping to existing design-system color tokens:

| Leading digit | HTTP class | Token role |
| --- | --- | --- |
| `1` | Informational | info / teal-subtle |
| `2` | Success | success |
| `3` | Redirect | brand / blue |
| `4` | Client error | warning |
| `5` | Server error | danger |

All five roles already back the existing `Badge` component. The implementation plan picks the exact CSS variable for each class and documents the mapping in code.

### Verification

Given `codes = ["2", "3", "4", "5", "200", "201", "301", "302", "400", "401", "403", "404", "500", "502", "503"]` (`maskRoots = {2, 3, 4, 5}`):

| Input | Helper output |
| --- | --- |
| `""` | `[2XX, 3XX, 4XX, 5XX]` |
| `"2"` | `[2XX]` |
| `"20"` | `[20X]` |
| `"4"` | `[4XX]` |
| `"40"` | `[40X]` |
| `"401"` | `[]` |
| `"1"` | `[]` (no `"1"` in `maskRoots`) |
| `"6"` | `[]` |
| `"4a"` | `[]` (non-digit) |
| `"4040"` | `[]` (too long) |

Given `codes = ["1", "2", "3", "4", "5"]` (all five classes available):

| Input | Helper output |
| --- | --- |
| `""` | `[1XX, 2XX, 3XX, 4XX, 5XX]` |
| `"1"` | `[1XX]` |

## Menu changes

None. Masks are ordinary selectable `FieldValueOption`s with `badge` set — the existing `ValueMenuItem` already renders a colored pill when `badge` is present (`ValueMenuItem.tsx:30`). Multi-select, keyboard navigation, and filtering (`filterAndSort`) all work as-is.

## Files

**New:**

- `packages/design-system/src/components/FilterInput/lib/statusCodeSuggestions.ts`
- `packages/design-system/src/components/FilterInput/__tests__/statusCodeSuggestions.test.ts`
- `packages/design-system/src/components/FilterInput/stories/mockStatusCodes.ts` — shared constant with the backend example list, imported by all three stories.

**Changed:**

- `packages/design-system/src/components/FilterInput/lib/index.ts` — re-export the helper.
- `packages/design-system/src/components/FilterInput/index.ts` — public export of the helper and `StatusCodeSuggestionsOptions`.
- `packages/design-system/src/components/FilterInput/stories/FilterInput.stories.tsx` — add a new `HTTPStatusCodeSuggestions` story that wires a status-code field to `createStatusCodeSuggestions({ codes: [...] })` using the mock.
- `packages/design-system/src/components/FilterInput/stories/FilterInputComposition.stories.tsx` — the existing `status_code` field gets `getSuggestions: createStatusCodeSuggestions({ codes: [...] })`.
- `packages/design-system/src/components/FilterInput/stories/FilterInputFieldMenu.stories.tsx` — the three existing `http_status_code` field definitions get the same wiring, so field metadata stays consistent across stories even though this file focuses on the field menu.

No changes to `types.ts`, `FilterInputValueMenu.tsx`, `ValueMenuItem.tsx`, `useValueMenuState.ts`, or `filterAndSort.ts`.

## Testing

**Unit — `statusCodeSuggestions.test.ts`:**

- Table-driven coverage over the backend example list — every row from the verification table.
- `codes` with a partial set of classes (`["4", "5"]`) → empty input returns `[4XX, 5XX]` only.
- `codes` omitted or empty → `[]` for every input.
- `codes` containing out-of-range 1-char entries (`"0"`, `"6"`, `"9"`) → ignored.
- `codes` containing 3-char entries (`"200"`, `"500"`) and other lengths (`"40"`, `"4040"`) → ignored.
- Non-digit input (`"4a"`, `"abc"`) → `[]`.
- Input longer than three digits → `[]`.
- Masks carry a `badge` with the correct color per leading digit (parametrized over 1..5).
- Mask `value`, `label`, and `badge.text` are the same string (e.g. `"4XX"`, `"40X"`).

**Component:** no new component tests — no component behavior changes.

**E2E:** add a single screenshot to the story for the empty-input state (all available masks with their color badges visible). This covers both rendering and badge-color regressions. No interaction E2E — covered by unit tests.

## Open questions

None.

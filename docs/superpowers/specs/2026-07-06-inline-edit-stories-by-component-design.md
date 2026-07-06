# InlineEdit Stories — Split by Component Type Design Spec

**Date:** 2026-07-06
**Ticket:** [WDS-143](https://wallarm.atlassian.net/browse/WDS-143) (continuation)
**Branch:** `feature/WDS-143`
**Predecessor:** [2026-07-03-inline-edit-compound-api-redesign-design.md](./2026-07-03-inline-edit-compound-api-redesign-design.md)

## Overview

`InlineEdit.stories.tsx` (561 lines) has one story, `Gallery`, that crams all
nine editor-row demos (Name/Port/About/Role/Roles/Tags/Date/Time/Date & Time)
into a single grid. This makes each editor's own story hard to find in
Storybook's sidebar and forces every visual/interaction e2e test that only
cares about one editor to navigate through the combined grid.

**Decision (superseding an earlier proposal in this conversation):** keep
`InlineEdit.stories.tsx` as **one file** — do not split into per-component
files (that was floated and explicitly rejected: "файл `*.stories.tsx`
пускай один будет"). Instead, split the **`Gallery` story itself** into one
export per editor type, all still living in this one file with its existing
`title: 'Data Display/InlineEdit'`. Since the title/Storybook-ID prefix is
unchanged, `createStoryHelper('data-display-inlineedit', [...])` in the e2e
file only needs its story-name array updated, not its prefix.

The five cross-cutting root-behavior stories — `States`, `Async`,
`NonEditable`, `CustomEditor`, `ConfirmCommit` — are untouched. They are not
tied to one editor type (they demonstrate status/guard/readonly behavior
using `InlineEditInput` as a stand-in vehicle), so they stay exactly as they
are, following the same precedent this repo already uses for
`FilterInput`/`CodeSnippet`, where focused per-part stories coexist with
broader behavior demos.

## Scope

**In scope:**

- Replace the single `Gallery` export in `InlineEdit.stories.tsx` with nine
  new exports, one per editor row it currently contains — each keeps its own
  local `useState`, its own `<Row>` wrapper, and its existing `data-testid`.
- Update `InlineEdit.e2e.ts`: the `createStoryHelper` story-name array drops
  `'Gallery'` and gains the nine new names; every test currently navigating
  to `'Gallery'` is repointed to whichever new story its `data-testid`
  belongs to; the single combined-grid visual screenshot test is replaced by
  one visual test per new story (an editor-count-for-editor-count swap, not
  a coverage reduction).
- Adapt the one test that depended on Gallery's multi-row layout for its own
  mechanics: `'Should commit a time edit on blur'` currently blurs by
  clicking a sibling `text--preview` cell that will no longer be on the same
  page as the Time story — it blurs via `page.mouse.click(5, 5)` instead
  (the same empty-page-click idiom already used by this file's date/time
  popover-close tests).
- Re-baseline the affected e2e screenshots (`[update-screenshots]`).

**Out of scope:**

- `States`/`Async`/`NonEditable`/`CustomEditor`/`ConfirmCommit` — unchanged.
- Any change to component source code — this is a stories/e2e-only reorg.
- Splitting into separate `.stories.tsx` files per component (explicitly
  rejected).

## The nine new stories

Each is extracted verbatim from `Gallery`'s corresponding row — same state,
same JSX, same `data-testid` — just promoted to its own `export const` with
its own `StoryFn` wrapper. `roleItems`/`tagItems`/`Row` (already defined in
the file) are reused as-is; no duplication.

| New export | Storybook display name | `data-testid` | Extracted from Gallery's row |
|---|---|---|---|
| `TextEditor` | Text Editor | `text` | Name (`InlineEditInput`) |
| `NumberEditor` | Number Editor | `number` | Port (`InlineEditNumber`) |
| `TextareaEditor` | Textarea Editor | `textarea` | About (`InlineEditTextarea`) |
| `SelectEditor` | Select Editor | `select` | Role (`InlineEditSelect`, single) |
| `MultiSelectEditor` | Multi Select Editor | `multi-select` | Roles (`InlineEditSelect`, multiple) |
| `TagsEditor` | Tags Editor | `tags` | Tags (`InlineEditSelect`, multiple + `Tag`) |
| `DateEditor` | Date Editor | `date` | Date (`InlineEditDate`) |
| `TimeEditor` | Time Editor | `time` | Time (`InlineEditTime`) |
| `DateTimeEditor` | Date Time Editor | `datetime` | Date & Time (`InlineEditDateTime`) |

Storybook's display-name derivation (PascalCase → spaced words) is already
relied on elsewhere in this exact file (`NonEditable` → "Non Editable",
`CustomEditor` → "Custom Editor", both already referenced by name in
`InlineEdit.e2e.ts`), so the table's display names are not a new convention.

## e2e re-mapping

Every `await inlineEditStory.goto(page, 'Gallery')` call is repointed to the
new story matching the test's own `data-testid` usage:

| Test | Old target | New target |
|---|---|---|
| `Should render the editor gallery correctly` (Visual) | Gallery (whole-grid screenshot) | **Removed** — replaced by one `Should render {X} correctly` Visual test per new story (9 tests replacing 1) |
| `Should render hover affordance with tooltip correctly` | Gallery | Text Editor |
| `Should render the editing state correctly` | Gallery | Text Editor |
| `Should enter edit mode and commit on Enter` | Gallery | Text Editor |
| `Should revert on Escape` | Gallery | Text Editor |
| `Should commit on blur` | Gallery | Text Editor |
| `Should commit a select pick when the dropdown closes` | Gallery | Select Editor |
| `Should commit a date pick when the calendar closes` | Gallery | Date Editor |
| `Should commit a time edit when the date-time popover closes` | Gallery | Date Time Editor |
| `Should keep the time when a day is picked from the date-time grid` | Gallery | Date Time Editor |
| `Should commit a time edit on blur` | Gallery (blurs via sibling `text--preview`) | Time Editor (blurs via `page.mouse.click(5, 5)`) |
| `Should enter edit via keyboard activation` | Gallery | Text Editor |
| `Should cancel edit via Escape` | Gallery | Text Editor |
| `Should reach the preview in tab order and expose the editor name` | Gallery | Text Editor |

All `Confirm Commit`/`Non Editable`/`Async`/`States`/`Custom Editor` tests
are untouched — they never referenced `Gallery`.

## Testing

No new test *cases* beyond the 1-for-9 visual-screenshot swap described
above — every existing interaction/accessibility assertion is preserved
verbatim, only its navigation target and (for the one blur test) its blur
mechanism change. Re-run the full `InlineEdit.e2e.ts` suite with
`--update-snapshots` once against the new story set, then a plain re-run to
confirm stability, per this repo's existing e2e conventions
(`docs/e2e-test-rules.md`).

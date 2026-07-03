# InlineEdit — Standalone Component Extraction Design Spec

**Date:** 2026-07-03
**Ticket:** [WDS-143](https://wallarm.atlassian.net/browse/WDS-143) (continuation — extraction of the inline-edit family delivered by the 2026-06-30 spec)
**Branch:** `feature/WDS-143`
**Predecessor:** [2026-06-30-attribute-inline-edit-design.md](./2026-06-30-attribute-inline-edit-design.md)
**References:** [Chakra Editable](https://chakra-ui.com/docs/components/editable), [Ark UI Editable](https://ark-ui.com/docs/components/editable)

## Overview

The inline-edit family currently lives inside `Attribute` as `AttributeEdit*`
(8 source files in `packages/design-system/src/components/Attribute/`). It must
become a **standalone `InlineEdit` compound component** in its own folder, usable
anywhere in a product UI, while remaining fully usable inside
`Attribute`/`AttributeValue` exactly as today.

Two facts make this a clean rename rather than a breaking change:

1. **Nothing is published.** The package root `src/index.ts` uses explicit named
   re-exports and never exported any `AttributeEdit*` symbol, `useAttributeEdit`,
   or its types. External consumers cannot import them today
   (`src/index.ts:72–90` exports only `Attribute`, `AttributeActions*`,
   `AttributeLabel*`, `AttributeValue`).
2. **Zero import coupling.** None of the 8 family files import Attribute
   internals — only `react`, shared utils (`cn`, `testId`), `useControlled`,
   icons, and generic DS components (`Input`, `NumberInput`, `Textarea`,
   `Loader`, `Tooltip`).

The real work is relocating files, renaming symbols/slots, and moving the two
Attribute-specific styling constants to the Attribute side (see Styling Seam).

## Scope

**In scope:**

- Move + rename the family into `components/InlineEdit/` (production code, unit
  tests, stories, e2e, `ANALYTICS_GAPS.md`).
- Neutralize Attribute-specific styling in the component; make `AttributeValue`
  own its integration CSS.
- Export the family from the package root (closing today's export gap).
- Finish the e2e coverage the 2026-06-30 spec promised but never landed:
  readOnly/disabled do not enter edit mode, `onValueRevert` on cancel, Tab
  order, editor accessible-name/label association.
- A metrics new-component-checklist pass, including a story demonstrating
  `data-analytics-id` placement.

**Out of scope (follow-ups):**

- New built-in editors (`InlineEditSelect`, date/datetime/time editors). Stories
  keep composing them from `Select`/`CalendarPicker`/`TimeInput` via
  `useInlineEdit()`, as today.
- The `@internationalized/date` `instanceof CalendarDate` interop hazard in the
  date story editors (pre-existing, documented in story comments).
- The pre-existing read→edit row-height jump inside `AttributeValue` (edit mode
  was never height-compensated; extraction preserves behavior).
- The `NumberInput` closed-target analytics fix (tracked in
  `ANALYTICS_GAPS.md`, owned by `NumberInput`).

## Approaches Considered

1. **Clean move + host-owned integration CSS (chosen).** Physically move and
   rename everything; `InlineEdit` becomes visually neutral; `AttributeValue`
   adapts to a hosted `InlineEdit` via `data-slot` CSS selectors. One name, one
   folder, correct dependency direction (host adapts to guest).
2. **Variant prop (`<InlineEditPreview variant='attribute'>`).** Explicit but
   leaks the host's name into the generic component's API, and every usage site
   inside Attribute must remember the prop; forgetting it causes a subtle 4px
   misalignment.
3. **Keep files in Attribute, re-export as `InlineEdit`.** Minimal diff but
   fails the goal — the component stays Attribute-centric in folder, stories,
   and e2e.

## Naming

Clean rename, **no deprecated aliases** (nothing was published):

| Old (Attribute folder) | New (`components/InlineEdit/`) |
| --- | --- |
| `AttributeEdit<T>` | `InlineEdit<T>` |
| `AttributeEditPreview` | `InlineEditPreview` |
| `AttributeEditControl` | `InlineEditControl` |
| `AttributeEditInput` | `InlineEditInput` |
| `AttributeEditNumber` | `InlineEditNumber` |
| `AttributeEditTextarea` | `InlineEditTextarea` |
| `AttributeEditError` | `InlineEditError` |
| `useAttributeEdit` | `useInlineEdit` |
| `AttributeEditContextValue/Status/ActivationMode/SubmitMode` | `InlineEditContextValue/Status/ActivationMode/SubmitMode` |

- `Attribute/index.ts` drops all Edit exports.
- **data-slots** (all four that exist): `attribute-edit` → `inline-edit`,
  `attribute-edit-preview` → `inline-edit-preview`, `attribute-edit-control` →
  `inline-edit-control`, `attribute-edit-error` → `inline-edit-error`.
  Input/Number/Textarea render no own slot (unchanged).
- **testId slots**: `edit-preview` → `preview`, `edit-control` → `control`,
  `edit-error` → `error` (per the test-id rule: slot = sub-component suffix).
  `InlineEditInput`, `InlineEditNumber`, and `InlineEditTextarea` **deliberately
  share the `input` slot** — a deviation from the suffix rule, inherited from
  today's shared `edit-input`, kept so e2e selectors stay editor-agnostic.
- The root keeps its inherit-or-own testId semantics:
  `useTestId(undefined, testIdProp)`. Inside `Attribute` the base cascades from
  the Attribute provider (ids like `text--preview`); standalone stories must
  pass `data-testid` to `InlineEdit` directly. Verified: no collisions with
  Attribute's own slots (`label`, `label-info`, `label-description`, `value`,
  `target`). Note the preview tooltip id also changes base
  (`{base}--content`).
- Known homonym: `FilterInput` uses "inline editing" internally for chip
  segments (hooks, comments — nothing exported). Accepted; no collision.

## File Layout

```
packages/design-system/src/components/InlineEdit/
├── InlineEdit.tsx                    # root (moved from AttributeEdit.tsx, logic unchanged)
├── InlineEditContext.ts              # context + useInlineEdit + types
├── InlineEditPreview.tsx
├── InlineEditControl.tsx
├── InlineEditInput.tsx
├── InlineEditNumber.tsx
├── InlineEditTextarea.tsx
├── InlineEditError.tsx
├── classes.ts                        # CVA for the preview (see below)
├── index.ts                          # named exports + Props types
├── InlineEdit.stories.tsx            # standalone stories
├── InlineEdit.e2e.ts (+ snapshots)   # full Visual/Interactions/Accessibility
├── ANALYTICS_GAPS.md                 # moved from Attribute, renamed subjects
├── InlineEdit.test.tsx               # moved: AttributeEdit.test.tsx
├── InlineEdit.integration.test.tsx   # standalone integration (see Testing)
├── InlineEditContext.test.tsx
├── InlineEditControl.test.tsx
├── InlineEditError.test.tsx
├── InlineEditInput.test.tsx          # includes the metrics-placement tests
└── InlineEditPreview.test.tsx
```

Exactly seven existing test files move. `InlineEditNumber`/`InlineEditTextarea`
have no dedicated unit files today — they are covered via the integration and
metrics tests; no new coverage appears for free.

**`classes.ts`:** extract `InlineEditPreview`'s conditional class logic into
`inlineEditPreviewVariants` (CVA). The `activatable && !invalid` /
`activatable && invalid` branches become `compoundVariants` over boolean
variants `activatable` and `invalid`, plus a `multiline` variant for the
`items-start`/`items-center` switch. The variants object is **not** exported
from the package root (matches the majority convention; Drawer/Card are the
exceptions, not the rule).

**Package root `src/index.ts`:** add an InlineEdit block modeled on the Drawer
block — all seven components, all `*Props` types, `useInlineEdit`, and the four
context types.

## Styling Seam (host adapts to guest)

Today's coupling and its resolution:

1. **Preview row-height cancellation.** `AttributeEditPreview` hardcodes
   `-my-4`, which exactly cancels `AttributeValue`'s `py-4` (horizontal) /
   `pt-4` (vertical) so the hover box fills the row without changing its
   height. → `InlineEditPreview` drops `-my-4` (root becomes
   `flex w-full min-w-0 gap-4 rounded-8 border border-transparent px-6 py-4
   transition-colors` + state classes). `AttributeValue` adds
   `[&_[data-slot=inline-edit-preview]]:-my-4` — verified to compile to a
   byte-identical `margin-block` declaration on the same element, unconditional
   in both orientations, exactly as today. The rule no-ops when no preview is
   hosted.
2. **Dropdown clipping opt-out.** Every editable `AttributeValue` in stories
   currently hand-adds `className='overflow-visible'` to un-clip non-portaled
   editor dropdowns (horizontal `truncate` sets `overflow: hidden`; regression
   fixed in commit `f16702b3`). → `AttributeValue` adds
   `has-[[data-slot=inline-edit]]:overflow-visible`; the story hack is deleted.
   Verified: the `:has()` selector has specificity (0,2,0) and beats
   `.truncate` (0,1,0); the `inline-edit` slot is rendered in both read and
   edit modes; `has-[` arbitrary variants are established in Field and Table;
   tailwind-merge (`cn`) cannot strip either seam class via consumer
   classNames.
3. **`InlineEditInput` keeps `h-28 px-8` as its own default** — compact inline
   density is the component's identity, not an Attribute-ism (it happens to
   match `AttributeValue`'s `min-h-[28px]`).

Both seam classes in `AttributeValue` get a code comment naming the
`inline-edit` slot contract: if the preview's padding changes, the cancellation
constant must follow. Trade-off (accepted): the negative margin now comes from
a parent-scoped rule, so a consumer can no longer remove it with a plain
`my-0` on the preview — it takes `!my-0` or an override on `AttributeValue`
itself; noted in the same comment.

Direction of knowledge: `Attribute` references only the `data-slot` string —
no production-source imports between the two components in either direction.
Attribute-side **tests and stories** may import `InlineEdit` (host consuming a
generic component is the allowed direction).

## Behavior — Unchanged

The root state machine moves byte-for-byte (renames only): controlled/
uncontrolled `value` + `edit`, draft state, `activationMode`
(`click`/`focus`/`none`), `submitMode` (`enter`/`blur`/`both`/`none`),
`selectOnFocus`, async `onValueCommit` driving `loading → saved(savedDuration)
/ error`, `onValueRevert` on cancel, `disabled`/`readOnly`. Generic typing
stays `<T = unknown>` with consumer casts (Meta typing for a generic component
verified viable — `LineChart` precedent).

## Stories

**`InlineEdit.stories.tsx`** — title **`Data Display/InlineEdit`** (existing
category, same as Attribute; derived e2e component id
`data-display-inlineedit`). Standalone presentation (no Attribute wrapper):

- `Gallery` — the 9 editor types moved from Attribute stories (text, number,
  textarea, select, multi-select, tags, date, time, datetime; custom editors
  stay story-local compositions via `useInlineEdit`).
- `States` — `loading` / `saved` / `error + defaultEdit`.
- `Async` — promise commit (1.2s, rejects on empty).
- The Gallery's text editor is wired with `data-analytics-id` /
  `data-analytics-props` on `InlineEditPreview` and `InlineEditInput`,
  demonstrating placement per the metrics new-component checklist.
- Every story passes `data-testid` to `InlineEdit` directly (standalone has no
  provider to inherit from).

**`Attribute.stories.tsx`** — the six `InlineEdit*` story exports are replaced
by two slim integration stories named so they don't shadow the imported
component: `WithInlineEdit` (vertical) and `HorizontalWithInlineEdit`. They
import from `../InlineEdit`, demonstrate the canonical nesting
`Attribute > AttributeValue > InlineEdit`, and carry no manual
`overflow-visible`. The horizontal-states and horizontal-async permutations
are **dropped deliberately** — state rendering does not depend on orientation;
orientation-specific risks (row height, clipping) are covered by the
integration e2e below.

## Testing

**Unit:** seven files move with renames. `AttributeEdit.integration.test.tsx`
is **split**, not moved:

- `InlineEdit/InlineEdit.integration.test.tsx` — standalone composition
  (preview → edit → commit/cancel across sub-components, own `data-testid`).
- `Attribute/AttributeInlineEdit.integration.test.tsx` — hosted composition:
  imports `InlineEdit` from `../InlineEdit`, asserts the testId cascade
  (`attr--preview`) and that the seam classes land on `AttributeValue`.

**E2E `InlineEdit.e2e.ts`** (per `docs/e2e-test-rules.md`, selectors via
`data-testid` only):

- Visual: gallery, states, async — migrated from `Attribute.e2e.ts` with new
  story ids and testIds (`text--edit-preview` → `text--preview` form).
- Interactions: existing coverage (activate, type, Enter commit, Escape
  cancel, blur behavior per submitMode, async loading/saved/error) **plus the
  four items promised by the 2026-06-30 spec that never landed**: readOnly and
  disabled do not enter edit mode; `onValueRevert` fires on cancel; Tab order
  through preview → editor; editor accessible-name/label association.
- Accessibility: keyboard activation + Escape (existing) extended by the
  label-association check above.

**E2E `Attribute.e2e.ts`** — the five inline-edit story tuples are replaced by
explicit integration coverage of the seam:

1. `WithInlineEdit` vertical screenshot (row-height cancellation),
2. `HorizontalWithInlineEdit` screenshot (truncation + row height),
3. `HorizontalWithInlineEdit` **open-editor** screenshot — regression coverage
   for the `f16702b3` clipping bug, proving the `:has()` overflow rule
   un-clips the editor border/dropdown.

Screenshot baselines: old `Attribute.e2e.ts-snapshots` inline-edit images are
deleted; new baselines generated in CI via the `[update-screenshots]` commit
trigger.

**Metrics:** run `docs/metrics/new-component-checklist.md` for InlineEdit; the
existing placement tests move with `InlineEditInput.test.tsx` /
`InlineEditPreview.test.tsx`; `ANALYTICS_GAPS.md` moves with subjects renamed
(`AttributeEditNumber` → `InlineEditNumber`), title → "InlineEdit — Analytics
Gaps"; Attribute's copy is deleted (verified: the file's only subject is the
edit family).

## Docs

- This spec is the extraction record; the 2026-06-30 spec/plan remain as the
  historical record of the original in-Attribute design.
- Old plan `docs/superpowers/plans/2026-06-30-attribute-inline-edit.md` is
  superseded for anything inline-edit-related by the plan derived from this
  spec.

## Success Criteria

1. `InlineEdit` renders correctly standalone (no negative-margin bleed) and
   inside `AttributeValue` (pixel-identical to today's hosted rendering).
2. No `AttributeEdit*` symbol, `attribute-edit*` slot, or `edit-*` testId slot
   remains in source (grep-clean outside historical docs).
3. Package root exports the full family; `pnpm lint`, `typecheck`, unit tests,
   and e2e pass; visual baselines regenerated.
4. The four previously-missing e2e checks exist and pass.
5. Metrics checklist recorded for InlineEdit; `ANALYTICS_GAPS.md` relocated.

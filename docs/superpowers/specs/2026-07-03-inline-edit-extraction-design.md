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
`Attribute`/`AttributeValue` exactly as today. On top of the extraction, the
component gains **built-in editors** — `InlineEditSelect`, `InlineEditDate`,
`InlineEditTime` — formalizing the five popover editors that stories currently
hand-roll (~25 lines each), plus the **submit-mode override** core mechanism
they need.

Two facts make the extraction a clean rename rather than a breaking change:

1. **Nothing is published.** The package root `src/index.ts` uses explicit named
   re-exports and never exported any `AttributeEdit*` symbol, `useAttributeEdit`,
   or its types. External consumers cannot import them today
   (`src/index.ts:72–90` exports only `Attribute`, `AttributeActions*`,
   `AttributeLabel*`, `AttributeValue`).
2. **Zero import coupling.** None of the 8 family files import Attribute
   internals — only `react`, shared utils (`cn`, `testId`), `useControlled`,
   icons, and generic DS components (`Input`, `NumberInput`, `Textarea`,
   `Loader`, `Tooltip`).

## Scope

**In scope:**

- Move + rename the family into `components/InlineEdit/` (production code, unit
  tests, stories, e2e, `ANALYTICS_GAPS.md`).
- Neutralize Attribute-specific styling in the component; make `AttributeValue`
  own its integration CSS.
- Export the family from the package root (closing today's export gap).
- **Built-in editors**: `InlineEditSelect` (single/multiple), `InlineEditDate`
  (day + `showTime` modes), `InlineEditTime` — see Built-in Editors.
- **Submit-mode override** mechanism in the core + public
  `useInlineEditSubmitMode` hook for custom editor authors.
- Finish the e2e coverage the 2026-06-30 spec promised but never landed:
  readOnly/disabled do not enter edit mode, `onValueRevert` on cancel, Tab
  order, editor accessible-name/label association.
- A metrics new-component-checklist pass, including a story demonstrating
  `data-analytics-id` placement.

**Out of scope (follow-ups):**

- Fixing the `@internationalized/date` multi-copy interop at its root (the
  built-ins contain it the way the stories do: value pass-through, no
  `instanceof` gates — see Built-in Editors).
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

For the editors' commit-mode pairing: a `submitMode` prop on `InlineEditControl`
was considered and rejected as the primary mechanism — it moves the invisible
contract one level down instead of removing it. Context registration by the
editor removes it; a Control-level prop is kept only as an explicit escape
hatch (see Submit-Mode Override).

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

New symbols: `InlineEditSelect`, `InlineEditDate`, `InlineEditTime`,
`useInlineEditSubmitMode`.

- `Attribute/index.ts` drops all Edit exports.
- **data-slots** (all four that exist): `attribute-edit` → `inline-edit`,
  `attribute-edit-preview` → `inline-edit-preview`, `attribute-edit-control` →
  `inline-edit-control`, `attribute-edit-error` → `inline-edit-error`.
  Input/Number/Textarea render no own slot (unchanged).
- **testId slots**: `edit-preview` → `preview`, `edit-control` → `control`,
  `edit-error` → `error` (per the test-id rule: slot = sub-component suffix).
  All editor components (`Input`, `Number`, `Textarea`, `Select`, `Date`,
  `Time`) **deliberately share the `input` slot** — a deviation from the
  suffix rule, inherited from today's shared `edit-input`, kept so e2e
  selectors stay editor-agnostic. Injection points: `InlineEditSelect` computes
  `useTestId('input', testIdProp)` and passes it as the explicit `data-testid`
  of the internal `SelectButton`/`SelectInput` (override path — bypassing
  `Select`'s own cascade, which would otherwise yield `…--input--button`);
  `InlineEditDate`/`InlineEditTime` pass it to `DateInput`/`TimeInput` (lands
  on their wrapper div).
- The root keeps its inherit-or-own testId semantics:
  `useTestId(undefined, testIdProp)`. Inside `Attribute` the base cascades from
  the Attribute provider (ids like `text--preview`); standalone stories must
  pass `data-testid` to `InlineEdit` directly. Verified: no collisions with
  Attribute's own slots (`label`, `label-info`, `label-description`, `value`,
  `target`). Note the preview tooltip id also changes base (`{base}--content`).
- Known homonym: `FilterInput` uses "inline editing" internally for chip
  segments (hooks, comments — nothing exported). Accepted; no collision.

## File Layout

```
packages/design-system/src/components/InlineEdit/
├── InlineEdit.tsx                    # root (moved from AttributeEdit.tsx) + submit-mode override state
├── InlineEditContext.ts              # context + useInlineEdit + useInlineEditSubmitMode + types
├── InlineEditPreview.tsx
├── InlineEditControl.tsx             # + optional submitMode prop (escape hatch)
├── InlineEditInput.tsx
├── InlineEditNumber.tsx
├── InlineEditTextarea.tsx
├── InlineEditError.tsx
├── InlineEditSelect.tsx              # NEW built-in editor
├── InlineEditDate.tsx                # NEW built-in editor (day + showTime)
├── InlineEditTime.tsx                # NEW built-in editor
├── classes.ts                        # CVA for the preview (see below)
├── index.ts                          # named exports + Props types
├── InlineEdit.stories.tsx            # standalone stories
├── InlineEdit.e2e.ts (+ snapshots)   # full Visual/Interactions/Accessibility
├── ANALYTICS_GAPS.md                 # moved from Attribute + new Date/Time entries
├── InlineEdit.test.tsx               # moved: AttributeEdit.test.tsx (+ override-mechanism tests)
├── InlineEdit.integration.test.tsx   # standalone integration (see Testing)
├── InlineEditContext.test.tsx
├── InlineEditControl.test.tsx
├── InlineEditError.test.tsx
├── InlineEditInput.test.tsx          # includes the metrics-placement tests
├── InlineEditPreview.test.tsx
├── InlineEditSelect.test.tsx         # NEW
├── InlineEditDate.test.tsx           # NEW
└── InlineEditTime.test.tsx           # NEW
```

Six existing test files move; the integration test is split (see Testing);
three new editor test files and the override-mechanism tests are new coverage. `InlineEditNumber`/
`InlineEditTextarea` have no dedicated unit files today — they are covered via
the integration and metrics tests; no new coverage appears for free.

**`classes.ts`:** extract `InlineEditPreview`'s conditional class logic into
`inlineEditPreviewVariants` (CVA). The `activatable && !invalid` /
`activatable && invalid` branches become `compoundVariants` over boolean
variants `activatable` and `invalid`, plus a `multiline` variant for the
`items-start`/`items-center` switch. The variants object is **not** exported
from the package root (matches the majority convention; Drawer/Card are the
exceptions, not the rule).

**Package root `src/index.ts`:** add an InlineEdit block modeled on the Drawer
block — all components, all `*Props` types, `useInlineEdit`,
`useInlineEditSubmitMode`, and the four context types. Additionally export
`SelectDataItem` (and `createListCollection`) from the root — today they exist
only at `Select/index.ts` level, so consumers could not name
`InlineEditSelect`'s `items` prop type (stories work around this by importing
from `@ark-ui/react/collection` directly). While touching the barrel, fix the
stale header comment at `src/index.ts:7–9` that claims `DateValue` is
deliberately not exported (it is exported at line 159).

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
   classNames. Standalone consumers hosting `InlineEditTime` (non-portaled
   dropdown) own the same requirement on their clipping ancestors — documented
   in `InlineEditTime`'s JSDoc.
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

## Core Behavior

The root state machine moves byte-for-byte (renames only): controlled/
uncontrolled `value` + `edit`, draft state, `activationMode`
(`click`/`focus`/`none`), `submitMode` (`enter`/`blur`/`both`/`none`),
`selectOnFocus`, async `onValueCommit` driving `loading → saved(savedDuration)
/ error`, `onValueRevert` on cancel, `disabled`/`readOnly`. Generic typing
stays `<T = unknown>` with consumer casts (Meta typing for a generic component
verified viable — `LineChart` precedent).

One addition: the submit-mode override below. `InlineEditControl` must keep
**unmounting** its children when not editing (never CSS-hiding) — the built-in
editors' `defaultOpen`-per-session behavior depends on remounting.

### Submit-Mode Override

**Problem.** `InlineEditControl` owns Enter/blur/Escape handling per the
context `submitMode`. `Select` and `Calendar` portal their popover content
outside the Control's DOM subtree, so focus moving into the popover fires
Control's blur handler (`contains(relatedTarget)` is a DOM check and returns
`false`) → premature commit (`blur`/`both`) or cancel. Stories work around it
with an invisible contract: all five popover rows set `submitMode='none'`
(select, multi-select, tags, date, datetime) or `'blur'` (time) on the root.

**Design.** Editors register their required submit mode while mounted:

- Root holds `submitModeOverride` state; the context's effective
  `submitMode = controlOverride ?? editorOverride ?? submitModeProp`.
- Public hook `useInlineEditSubmitMode(mode)` registers in **`useLayoutEffect`**
  (not `useEffect` — closes the committed-render window where Control could
  observe the consumer mode before the editor's registration lands; layout
  effects flush before paint and before any browser event).
- Unregister is **token-safe**: cleanup runs
  `setOverride(prev => (prev === token ? null : prev))` so one editor's unmount
  never clobbers another's active registration. Semantics: last registered
  editor wins; a dev-only `console.warn` fires when a second editor registers a
  different mode. StrictMode double-invoke is safe under token-safe cleanup
  (verified: effect/cleanup/effect run batched within one commit).
- Built-ins register: `InlineEditSelect` → `'none'`, `InlineEditDate` →
  `'none'`, `InlineEditTime` → `'blur'`.
- `InlineEditControl` also accepts an optional `submitMode` prop as an explicit
  render-time escape hatch with the highest precedence (Control prop > editor
  registration > root prop) — for custom editors that cannot use the hook.
- Consumer-set root `submitMode` keeps working unchanged for
  text/number/textarea (no override registered).

### Wiring plain DS components: render-prop children on `InlineEditControl`

Besides the adapters and the `useInlineEdit` hook, `InlineEditControl` accepts
**function children** (render-prop) so consumers can wire a plain DS component
in place, without defining a local editor component (a hook cannot be called
inline in JSX; function children solve that boundary):

```tsx
<InlineEditControl submitMode='none'>
  {({ value, setValue, submit }) => (
    <Select
      defaultOpen
      collection={collection}
      value={value as string[]}
      onValueChange={d => setValue(d.value)}
      onOpenChange={d => {
        if (!d.open) submit();
      }}
    >
      …
    </Select>
  )}
</InlineEditControl>
```

- Type: `children?: ReactNode | ((ctx: InlineEditContextValue) => ReactNode)`;
  the callback receives the same object `useInlineEdit()` returns and is
  invoked only in edit mode (Control still unmounts otherwise).
- A render-prop cannot register a submit-mode override (no component boundary
  for the hook) — popover wiring pairs with the Control-level `submitMode`
  prop, which exists exactly for this and has the highest precedence.
- Rejected alternatives for "plain DS components inside Control", recorded for
  posterity: `cloneElement` prop injection (DS inputs have heterogeneous
  contracts — `onChange(event)` vs `onValueChange(details)` vs
  `onChange(value)` — so injection needs a per-component mapping registry:
  adapters in disguise, untyped and wrapper-fragile) and context-aware DS
  inputs (every input would import inline-edit context — reverse coupling,
  behavior varying by render location).

**Escape semantics (deliberate).** zag's dismissable layer handles Escape at
document level in the capture phase and calls `preventDefault()`;
Control's Escape-cancel is skipped via its `defaultPrevented` guard — that
guard is **load-bearing** and must not be removed. Closing the popover fires
`onOpenChange(false)` → `submit()`. Net effect: **for popover editors, Escape
closes the popover and commits**, same as click-outside — "close = commit" is
the model; keyboard-cancel is not available for them (matches today's story
behavior; revisit only on UX feedback). For non-popover editors Escape cancels
as before.

## Built-in Editors

All three formalize the story editors byte-for-behavior
(`Attribute.stories.tsx:914–1103`), register their submit-mode override, share
the `input` testId slot, and inherit the ambient `DateFormatProvider` (they do
**not** wrap one; stories wrap for demo variety).

### `InlineEditSelect`

Replaces the three near-identical story compositions (`SelectEditor`,
`MultiSelectEditor`, `TagsSelectEditor` — differences: `multiple` and trigger
choice).

- Wraps DS `Select`: `defaultOpen`, draft binding, `onValueChange →
  setValue(details.value)`, `onOpenChange(details)` → on close `submit()`
  (note: `Select`'s `onOpenChange` receives a details object; `Calendar`'s
  receives a plain boolean — the two built-ins do not share a handler
  signature).
- **Bound-root pattern** (post-review refinement, user-approved): the
  component IS the prewired `Select` root, not an opaque wrapper. It accepts
  either `items: SelectDataItem[]` (shorthand — builds `createListCollection`
  internally; precedent: `PaginationPageSize`) or a prebuilt
  `collection` (exactly one of the two; dev-mode warn otherwise), and its
  `children` are ordinary `Select` compound parts (`SelectButton`/`SelectInput`,
  `SelectPositioner > SelectContent > SelectOption…`) rendered inside the
  prewired root. No children → the default composition is rendered from the
  resolved collection's items.
- `multiple?: boolean` — default `false`. Default trigger: `SelectButton`
  (single) / `SelectInput` (multiple), matching the stories.
- **Props typing is a discriminated union on `multiple`** per the metrics
  contract's element-specific-typing rule: the single variant forwards
  button-appropriate attributes (trigger is a real `<button>` via
  `SelectButton`), the multiple variant forwards div attributes (trigger is
  `SelectInput`'s div). Rest props land on the real interactive trigger in
  both cases (verified: `SelectButton` spreads onto the `<button>`,
  `SelectInput` onto the trigger div).
- `children?: ReactNode` — full custom composition replaces the default
  trigger+positioner+options rendering entirely. This is the documented
  composition/analytics escape for per-option attributes (unit test asserts
  per-option `data-analytics-id` works through the children path).
- Value type: `useInlineEdit<string[]>` for both single and multiple (Ark's
  `details.value` is always `string[]`; DS-wide idiom reads `value[0]`).
  Draft normalization is explicit and friendly: a `string` draft value is
  normalized to `[string]` (no silent blanking of non-array values).
- Tags presentation stays a Preview concern (consumer renders `Tag` chips in
  `InlineEditPreview` children) — the editor is identical for multi-select and
  tags.

### `InlineEditDate`

One component, two modes (mirrors the `DateEditor`/`DateTimeEditor` stories).
Composes the DS **`Calendar`** component (note: "CalendarPicker" in stories is
a local alias dodging the `Calendar` icon name; the source file needs the same
alias trick).

- day mode (default): `Calendar type='single' defaultOpen closeOnSelect`,
  trigger = segmented `DateInput granularity='day' showIcon={false}`, content =
  `CalendarBody > CalendarGrids`.
- `showTime` mode: `Calendar showTime defaultOpen closeOnSelect={false}`,
  `DateInput granularity='minute'`, content adds `CalendarInputHeader`.
- **Value adapter is behavior, not plumbing**: `Calendar`'s contract is
  `DateValue[]`/`onChange(DateValue[])`, so the editor wraps
  `value ? [value] : []` and unwraps `next[0] ?? null`; in `showTime` mode the
  unwrap carries an **unchecked `as CalendarDateTime` cast** (Calendar emits
  `DateValue`; `showTime` promotes grid picks to `CalendarDateTime` via
  `useCalendarTime`). Public prop types use the package-exported `DateValue`
  (Calendar's Ark-derived union, `src/index.ts:159`) — day mode
  `DateValue | null`, `showTime` mode `CalendarDateTime | null`.
- Values pass through with **no `instanceof` gates** — the story-documented
  interop hazard (Ark produces values from a different `@internationalized/date`
  copy; `instanceof` drops them). The comment moves into the component.
- `onOpenChange(false)` → `submit()`; override `'none'`.
- **Bound-root pattern** (post-review refinement, user-approved): `children`
  are ordinary `Calendar` compound parts (`CalendarTrigger`,
  `CalendarContent > CalendarBody > …`) rendered inside the prewired
  `Calendar` root — the value adapter, `defaultOpen`/`closeOnSelect`, and
  commit-on-close stay on the root regardless. No children → the current
  default composition (segmented `DateInput` trigger + grids, plus
  `CalendarInputHeader` in `showTime` mode).

### `InlineEditTime`

Wraps `TimeInput`: defaults `granularity='minute'`, `showTimeDropdown`,
`showIcon={false}`; override `'blur'`.

- Value type is TimeInput's actual contract: **`TimeValue | null`**
  (pass-through, no `instanceof Time` narrowing — the story's narrowing relies
  on npm dedup, not a package guarantee; the interop comment mirrors
  `InlineEditDate`'s).
- Why `'blur'` is safe: the time dropdown is rendered inline (absolute, no
  portal) and its rows `preventDefault()` on mousedown, so focus never leaves
  the Control subtree; documented in the component (a future portaled
  TimeDropdown would need re-evaluation). Clipping ancestors need
  `overflow-visible` — automatic inside `AttributeValue` (styling seam #2),
  documented for standalone hosts.

### Analytics gaps (pre-committed, not "audit later")

`InlineEdit/ANALYTICS_GAPS.md` = the moved NumberInput entry (subjects renamed,
title "InlineEdit — Analytics Gaps") **plus two new entries**:

1. `InlineEditDate` — consumer attributes land on the `DateInput` wrapper div,
   not the focusable segments (mirror of the NumberInput entry; `closest()`
   resolution keeps click analytics working).
2. `InlineEditTime` — same wrapper placement, plus the time-dropdown option
   rows are a closed target (workaround: value-level analytics via
   `onValueCommit`).

`InlineEditSelect` needs no entry: rest props reach the real trigger.

## Stories

**`InlineEdit.stories.tsx`** — title **`Data Display/InlineEdit`** (existing
category, same as Attribute; derived e2e component id
`data-display-inlineedit`). Standalone presentation (no Attribute wrapper):

- `Gallery` — the 9 editor types moved from Attribute stories; the
  select/multi-select/tags/date/time/datetime rows switch to the built-ins,
  **preserving the existing row-level `data-testid` values** so e2e diffs are
  visual-only. Exactly **one** hand-rolled custom editor remains, demonstrating
  the extension seams with its own testid: the render-prop children +
  Control-level `submitMode` (plain DS component path), with the
  `useInlineEdit` + `useInlineEditSubmitMode` component path shown in the
  story description.
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

**Unit:** six files move with renames; new files for the three editors and
the override mechanism. `AttributeEdit.integration.test.tsx` is **split**, not
moved:

- `InlineEdit/InlineEdit.integration.test.tsx` — standalone composition
  (preview → edit → commit/cancel across sub-components, own `data-testid`).
- `Attribute/AttributeInlineEdit.integration.test.tsx` — hosted composition:
  imports `InlineEdit` from `../InlineEdit`, asserts the testId cascade
  (`attr--preview`) and that the seam classes land on `AttributeValue`.

Editor tests are feasible in jsdom — modeled on existing suites that already
exercise Ark portals (`Select.test.tsx` opens the portaled dropdown;
`Calendar.test.tsx` renders `defaultOpen` and asserts inside the portal;
`DateInput.test.tsx`/`TimeInput.test.tsx` model the wrapper-level analytics
assertions). Override-mechanism tests: effective mode after mount (including
under StrictMode), token-safe cleanup, precedence (Control prop > registration
> root prop), a Control-level test pinning the Escape `defaultPrevented`
guard, and a render-prop children test (callback receives the context object,
invoked only while editing). Implementation-time check: Control's focus-first-descendant effect must
not fight Ark's initial focus when `defaultOpen` is set.

**E2E `InlineEdit.e2e.ts`** (per `docs/e2e-test-rules.md`, selectors via
`data-testid` only):

- Visual: gallery, states, async — migrated from `Attribute.e2e.ts` with new
  story ids and testIds (`text--edit-preview` → `text--preview` form).
- Interactions: existing coverage (activate, type, Enter commit, Escape
  cancel, blur behavior per submitMode, async loading/saved/error) **plus**:
  per built-in editor — open, pick, commit-on-close (select/date), time
  commit-on-blur — **plus the four items promised by the 2026-06-30 spec that
  never landed**: readOnly and disabled do not enter edit mode;
  `onValueRevert` fires on cancel; Tab order through preview → editor; editor
  accessible-name/label association.
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

**Metrics:** run `docs/metrics/new-component-checklist.md` for InlineEdit
including the three new editors; the existing placement tests move with
`InlineEditInput.test.tsx` / `InlineEditPreview.test.tsx`; new placement tests
per editor (select trigger = real node; date/time wrapper placement asserted
explicitly, per the pre-committed gaps above).

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
3. Package root exports the full family (incl. editors, both hooks,
   `SelectDataItem`); `pnpm lint`, `typecheck`, unit tests, and e2e pass;
   visual baselines regenerated.
4. The five popover gallery rows use built-ins with **no** `submitMode` set on
   their roots — the override mechanism carries the pairing.
5. The four previously-missing e2e checks exist and pass.
6. Metrics checklist recorded for InlineEdit; `ANALYTICS_GAPS.md` relocated
   with the two pre-committed Date/Time entries.

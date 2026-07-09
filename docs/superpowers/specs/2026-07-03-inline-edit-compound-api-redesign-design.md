# InlineEdit — Three Compound-API Redesigns Design Spec

**Date:** 2026-07-03
**Ticket:** [WDS-143](https://wallarm.atlassian.net/browse/WDS-143) (continuation)
**Branch:** `feature/WDS-143`
**Predecessor:** [2026-07-03-inline-edit-before-commit-design.md](./2026-07-03-inline-edit-before-commit-design.md)
**References:** [CodeSnippetRoot.tsx](../../packages/design-system/src/components/CodeSnippet/CodeSnippetRoot.tsx) (children-detection precedent), [.claude/rules/component-development.md](../../.claude/rules/component-development.md), [.claude/rules/test-id.md](../../.claude/rules/test-id.md)

## Overview

Three independent, small API redesigns to the `InlineEdit` family, all
converging on the same principle: **author content and behavior as compound
children, not as props that carry JSX or plain text through an opaque
string/prop channel.**

1. `InlineEditError` — drop the root's `error?: string` prop; error text is
   authored only as `InlineEditError`'s children (which already supports
   this).
2. `InlineEditDate` — split the `showTime` boolean into two components,
   `InlineEditDate` (day-only) and a new `InlineEditDateTime` (date+time),
   mirroring MUI's `DatePicker`/`DateTimePicker` split.
3. `InlineEditPreview` — replace the `triggerIcon` prop with compound parts
   `InlineEditPreviewValue` and `InlineEditPreviewIcon`; plain-text children
   with no parts keep working via auto-wrap.

None of these are breaking changes in the semver sense — nothing from this
family is published (`src/index.ts` exports only what the 2026-07-03
extraction spec added, and this repo's own convention already treats
pre-release call-site updates as normal spec work, not a compat concern).
Every existing call site is enumerated below with its exact replacement.

## Scope

**In scope:**

- Remove `InlineEdit`'s `error?: string` prop; `InlineEditError`'s existing
  `children ?? error` behavior is unchanged.
- Split `InlineEditDate`'s `showTime` boolean into `InlineEditDate` (day) and
  a new `InlineEditDateTime` (date+time); extract the shared
  `@internationalized/date`/react-aria cast helpers.
- Replace `InlineEditPreview`'s `triggerIcon` prop with `InlineEditPreviewValue`
  and `InlineEditPreviewIcon` compound parts, auto-wrapping plain children.
- Update every existing call site (stories, tests, `ANALYTICS_GAPS.md`) to the
  new API — enumerated per section below.

**Out of scope (follow-ups):**

- Any change to `InlineEditSelect`/`InlineEditTime` (unaffected by all three).
- Any change to the commit-guard (`onBeforeValueCommit`) mechanism — these
  redesigns are orthogonal and land on top of it.
- **Parked, needs a scope decision:** making the date/time *input field*
  itself (`DateInput`/`TimeInput`) compound. `InlineEditDate`/
  `InlineEditDateTime` already have full escape-hatch composability today via
  their bound-root `children` override — a consumer can already swap in any
  custom `DateInput` arrangement. What is *not* compound is `DateInput`'s own
  icon: it's a fixed `Calendar` icon toggled by a `showIcon` boolean
  (`DateInput.tsx:56,132`), not swappable content — but that's consistent
  DS-wide (`TimeInput` does the same), not an InlineEdit-specific
  `triggerIcon`-style anti-pattern. Making the icon genuinely compound (custom
  content, not just on/off) means touching `DateInputInternal`, which is
  shared by `DateInput`, `TimeInput`, and (transitively) `DateRangeInput` —
  outside InlineEdit's/WDS-143's blast radius and better scoped as its own
  spec if pursued.

## 1. `InlineEditError` — text only as children

### Current state

`InlineEditProps.error?: string` (`InlineEdit.tsx:66`) feeds
`resolvedError = error ?? autoError` (`InlineEdit.tsx:159`), which is exposed
on context as `error` and consumed by `InlineEditError`'s
`const message = children ?? error;`. The root prop lets a consumer set a
*static* error message without going through the async commit-reject path —
today's only use for it is the `States` story's static error row.

### Change

Remove the `error` prop from `InlineEditProps` and its destructuring in
`InlineEdit.tsx`. `resolvedError` becomes simply `autoError` — the value set
internally by `onValueCommit` rejection or `onBeforeValueCommit` rejection
(`InlineEdit.tsx:206-207`, and the guard's `failCommit` path added by the
commit-guard work). `invalid` (`resolvedStatus === 'error' ||
Boolean(resolvedError)`) is unchanged in shape; it now derives purely from an
explicit `status='error'` or from the internal auto machinery.

`InlineEditError` itself needs **zero code changes** — `children ?? error`
already prefers children, and `error` from context is now exclusively the
async-auto value.

### Consumer pattern

Static validation (the driving case):

```tsx
<InlineEdit value={email} status={touched && !email ? 'error' : undefined}>
  <InlineEditPreview>{email}</InlineEditPreview>
  <InlineEditControl><InlineEditInput /></InlineEditControl>
  <InlineEditError>Обязательное поле</InlineEditError>
</InlineEdit>
```

Async server rejection (unchanged, already the documented pattern):

```tsx
<InlineEdit value={value} onValueCommit={save}>
  ...
  <InlineEditError /> {/* text from reject(new Error(...)) */}
</InlineEdit>
```

### Call sites to update

- `InlineEdit.stories.tsx`, `States` story: the row using
  `status='error' error='An error message.'` moves the message into
  `<InlineEditError>An error message.</InlineEditError>` — `error` prop
  dropped, `status='error'` stays.
- `InlineEditError.test.tsx`: `'renders the context error message when
  invalid'` currently sets the root `error` prop — rewrite to populate
  `autoError` via a rejecting `onValueCommit` (matching the pattern already
  used in `InlineEdit.test.tsx`'s `'surfaces error and stays editing when the
  commit rejects'` test) and assert the message renders without children.
  `'prefers explicit children over the context error'` follows the same
  rewrite, asserting children still win over the auto message.

No other file references the root `error` prop (`Attribute`/`AttributeValue`
do not forward it).

## 2. `InlineEditDate` split → `InlineEditDate` + `InlineEditDateTime`

### Current state

`InlineEditDateProps.showTime?: boolean` (default `false`) branches the
entire root wiring in `InlineEditDate.tsx`: `closeOnSelect={!showTime}`,
`granularity` (`'day'` vs `'minute'`), whether `CalendarInputHeader` renders,
and whether the trigger's value is promoted through
`withMinuteGranularity`. This is not a cosmetic variant — it is two different
root configurations sharing one file via an `if`.

### Change

Split into two sibling components, each a complete bound-root (per the
existing "`InlineEditDate` IS the prewired `Calendar` root" pattern — see
`InlineEditDate.tsx:40-52`):

- **`InlineEditDate`** keeps only the day-granularity branch: `closeOnSelect`,
  `granularity='day'`, no `CalendarInputHeader`, no `showTime` prop at all.
- **`InlineEditDateTime`** (new file) is today's `showTime=true` branch,
  hardcoded — `closeOnSelect={false}`, `granularity='minute'`,
  `CalendarInputHeader` always renders, draft promoted via
  `withMinuteGranularity` before being handed to `DateInput`.

Both keep the identical `children?: ReactNode` bound-root escape hatch and
its JSDoc (adapted per component), the same `useInlineEditSubmitMode('none')`
registration, and the same shared `input` testId slot on the default
`DateInput` trigger.

**Shared helpers.** `toReactAriaDateValue`/`toCalendarDateValue` (the
cross-package `@internationalized/date` cast, needed by both components) move
to a new internal file `InlineEdit/dateValueCast.ts` (not exported from
`index.ts` — an implementation detail, same as today).
`withMinuteGranularity` is needed only by `InlineEditDateTime` and moves
fully into that file.

### Consumer pattern

```tsx
<InlineEditControl><InlineEditDate /></InlineEditControl>       {/* day only */}
<InlineEditControl><InlineEditDateTime /></InlineEditControl>   {/* date + time */}
```

### Call sites to update

- `InlineEdit.stories.tsx` Gallery: the `Date & Time` row's
  `<InlineEditDate showTime />` becomes `<InlineEditDateTime />`; `meta.
  subcomponents` gains `InlineEditDateTime`.
- `InlineEditDate.test.tsx`: drop `showTime` from the `Harness` props and the
  `'showTime mode renders the time-aware header'` test (moves below).
- New `InlineEditDateTime.test.tsx`: the moved header test, plus its own
  `'children compose ordinary Calendar parts inside the prewired root'` test
  (adapted from `InlineEditDate.test.tsx`'s equivalent, using
  `granularity='minute'` in the custom `DateInput`).
- `index.ts`: export `InlineEditDateTime` and `InlineEditDateTimeProps`.
- `ANALYTICS_GAPS.md`'s `InlineEditDate → DateInput wrapper` entry is
  generalized to name both components — the gap (consumer attributes land on
  the `DateInput` wrapper, not the focusable segments) and its fix-belongs-in
  pointer are identical for both.

## 3. `InlineEditPreview` → compound `Value` + `Icon` parts

### Current state

`InlineEditPreview` takes `children: ReactNode` (just the displayed value)
and internally renders a fixed structure: a truncate/`lineClamp` span, then a
trailing-slot span whose content is centrally decided by priority — loading
spinner, then saved check, then `triggerIcon` (default `Pencil`) if
activatable, else nothing (`InlineEditPreview.tsx:104-143`).

### Change

Two new parts, each self-governing from context — the same pattern
`InlineEditError` already uses (a component that reads `useInlineEdit()` and
decides its own visibility/content, rather than the parent computing
everything and threading it down as props):

- **`InlineEditPreviewValue`** — `{ lineClamp?: 1-6; children: ReactNode }`.
  Renders the value span: truncate or `lineClamp`, and the loading-dim
  (`opacity-50` while `status === 'loading'`, read from context).
- **`InlineEditPreviewIcon`** — `{ children?: ReactNode }`, default
  `<Pencil size='md' />`. Recomputes the same `activatable` formula
  `InlineEditPreview` already computes (`!disabled && !readOnly && status !==
  'loading' && activationMode !== 'none'`) from context fields already on
  `InlineEditContextValue` — no new context field needed. Renders: loading →
  `Loader`; `status === 'saved'` → `Check`; `activatable` → its own
  `children`; else `null`. This priority order is unchanged from today.

`InlineEditPreview` detects composition via `Children.toArray(children).some(...)`
checking each child's `type.displayName` against `InlineEditPreviewValue`/
`InlineEditPreviewIcon` — the exact pattern `CodeSnippetRoot` already uses for
its `isCodeSnippetShowMoreButton` detection (`CodeSnippetRoot.tsx:85-86,
208`), so this is an established codebase idiom, not a new one:

- **No parts detected** (plain children — the common case, 13 of today's 20
  call sites) → auto-wraps: `<InlineEditPreviewValue lineClamp={lineClamp}>
  {children}</InlineEditPreviewValue><InlineEditPreviewIcon />`. Root's
  `lineClamp`/`tooltip` props stay exactly as today and apply to this path —
  the `About` row needs no changes.
- **Parts given explicitly** → renders `children` as-is inside the same outer
  div/Tooltip wrapper; root's `lineClamp` prop, if passed, is unused (set
  `lineClamp` on `InlineEditPreviewValue` directly instead). `tooltip` still
  applies — it wraps the whole preview region regardless of composition.

The click/focus/keydown/`onPointerMove` handlers, the `role='button'`/
`tabIndex`, and `inlineEditPreviewVariants` CVA classes all stay on
`InlineEditPreview`'s own root `<div>` — none of that moves into the parts.

Both new parts follow the standard component rules: `data-slot`
(`inline-edit-preview-value` / `inline-edit-preview-icon`), `ref` forwarding,
and testId slots `'preview-value'` / `'preview-icon'` (hyphenated
multi-segment slot names are an established convention — see `'item-icon'`,
`'legend-value'` elsewhere in the DS).

### Consumer pattern

```tsx
// plain — unchanged
<InlineEditPreview>{text}</InlineEditPreview>

// custom icon — now composition, not a prop
<InlineEditPreview>
  <InlineEditPreviewValue>{roleLabel}</InlineEditPreviewValue>
  <InlineEditPreviewIcon><ChevronDown size='md' /></InlineEditPreviewIcon>
</InlineEditPreview>
```

### Call sites to update

- `InlineEdit.stories.tsx`: 7 usages of `triggerIcon={...}` (Role, Roles,
  Tags, Date, Time, Date & Time in the Gallery story, plus the Role row in
  the guard's `ConfirmCommit` story) rewritten to the compound form.
  `meta.subcomponents` gains `InlineEditPreviewValue` and
  `InlineEditPreviewIcon`.
- `index.ts`: export both new components and their Props types.
- New `InlineEditPreviewValue.test.tsx` / `InlineEditPreviewIcon.test.tsx`:
  cover `lineClamp`, loading-dim, and the icon priority order (loading →
  saved → custom → activatable-false → null) respectively.
- `InlineEditPreview.test.tsx`: add coverage for the two composition paths
  (plain-children auto-wrap vs. explicit parts) — existing tests (click/
  keyboard activation, readOnly, loading-inert, data-* forwarding) are
  unaffected since they all use plain-children usage.
- `Attribute.stories.tsx`'s single plain-children usage needs no change.

## Testing

Per-section test changes are listed above (all standard unit-test additions
following this repo's existing patterns — Testing Library + `userEvent`, no
mocks of internal behavior). No new e2e coverage is required: the commit-guard
feature's `Confirm Commit` e2e story already exercises `InlineEditPreview`,
`InlineEditError`, and `InlineEditSelect` visually; the existing `Gallery`/
`States`/`Async` e2e screenshot tests re-baseline automatically via
`[update-screenshots]` once the story call sites are updated (icon/error
rendering is visually identical — only the JSX authoring the same visual
output changes).

## Storybook

No new stories. Existing stories (`Gallery`, `States`, `ConfirmCommit`) are
updated in place per the call-site lists above; their rendered output is
unchanged, so no new visual regression risk beyond the standard re-baseline.

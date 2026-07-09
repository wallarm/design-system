# InlineEditSelect / InlineEditDate / InlineEditDateTime — Pure Root-Wrapper Design Spec

**Date:** 2026-07-06
**Ticket:** [WDS-143](https://wallarm.atlassian.net/browse/WDS-143) (continuation)
**Branch:** `feature/WDS-143`
**Predecessor:** [2026-07-06-inline-edit-stories-by-component-design.md](./2026-07-06-inline-edit-stories-by-component-design.md)

## Overview

`InlineEditSelect`, `InlineEditDate`, and `InlineEditDateTime` currently offer
two composition modes: a **default composition** (no `children` — the
wrapper renders its own trigger + positioner + content, with rest-props
forwarded onto the default trigger) or a **full override** (`children`
replaces the entire inner tree). This is binary and asymmetric: to change
just one visual detail (wrap the trigger in `InputGroup`, add an icon,
customize an option's rendering) a consumer must abandon the default
entirely and hand-reconstruct positioner/content/options themselves — there
is no middle ground.

**Decision:** remove the default composition. `children` becomes **required**
for all three components. Each becomes a pure root-wrapper — it owns only
the data wiring (draft binding, `defaultOpen`, commit-on-close, submit-mode
override) — and the consumer always composes the underlying `Select`/
`Calendar` family's own compound parts directly, exactly as they would use
`Select`/`Calendar` standalone anywhere else in the app. This is the same
principle already applied to `InlineEditPreview` in this project (compound
parts, auto-fill removed in favor of explicit composition) taken one step
further: there is no auto-fill fallback left at all, because — unlike
`InlineEditPreview`'s Value/Icon split, which is InlineEdit-specific — Select
and Calendar already have their own complete, well-known compound APIs; a
second, InlineEdit-owned default composition of them is redundant
maintenance surface, not a convenience.

`InlineEditTime` and `InlineEditNumber` are **out of scope** — they wrap a
single leaf component (`TimeInput`/`NumberInput`), not a multi-part
compound tree, so there is no "default composition vs. compound parts"
tension to resolve for them.

## Scope

**In scope:**

- `InlineEditSelect`: drop the default trigger/positioner/content
  composition and the `InlineEditSelectSingleProps`/
  `InlineEditSelectMultipleProps` discriminated union (it existed solely to
  type-check rest-props forwarded onto the removed default trigger).
  `children: ReactNode` becomes required. `items`/`collection`/`multiple`
  stay — they still drive the `Select` root's own `collection`/`multiple`
  props, independent of how the consumer visually renders options.
- `InlineEditDate` / `InlineEditDateTime`: same treatment — drop the default
  `DateInput` composition, the `Omit<DateInputProps, ...>` prop surface, and
  the internal `showIcon` handling. Each collapses to `{ children: ReactNode
  }` — no other props.
- Promote the cross-package `@internationalized/date`/react-aria cast
  helpers to **public API**: `toReactAriaDateValue`/`toCalendarDateValue`
  already live in `dateValueCast.ts` (currently internal, not exported from
  `index.ts`) and simply get exported. `withMinuteGranularity` currently
  lives inside `InlineEditDateTime.tsx` itself (module-private) — it
  **moves** into `dateValueCast.ts` alongside the other two casts and is
  exported from there. A consumer composing their own `DateInput` trigger
  needs all three to bridge the two `@internationalized/date` package
  copies, the same way `InlineEditDate`/`InlineEditDateTime` did internally
  until now.
- Update every existing call site: 6 story exports (`SelectEditor`,
  `MultiSelectEditor`, `TagsEditor`, `DateEditor`, `DateTimeEditor`,
  `ConfirmCommit`'s Role row) and the three components' test files (11 of 13
  tests in `InlineEditSelect.test.tsx`, 3 of 4 in each of
  `InlineEditDate.test.tsx`/`InlineEditDateTime.test.tsx` currently exercise
  the default composition and must be rewritten to compose explicitly).
- Remove or rewrite the `ANALYTICS_GAPS.md` entry for `InlineEditDate`/
  `InlineEditDateTime` (see Analytics below — the gap it documents no
  longer exists).

**Out of scope:**

- `InlineEditTime`, `InlineEditNumber`, `InlineEditInput`, `InlineEditTextarea`
  — unaffected.
- Any change to `InlineEditControl`, the commit-guard mechanism, or
  `InlineEditPreview`'s own parts.

## New public API

```ts
export interface InlineEditSelectProps {
  items?: SelectDataItem[];
  collection?: ListCollection<SelectDataItem>;
  multiple?: boolean;
  children: ReactNode;
}

export interface InlineEditDateProps {
  children: ReactNode;
}

export interface InlineEditDateTimeProps {
  children: ReactNode;
}
```

Each component's body shrinks to just its root wiring — the exact same
`Select`/`CalendarRoot` props as today (`defaultOpen`, `collection`,
`multiple`, `value`/`onValueChange` or `value`/`onChange`, `onOpenChange` →
`submit()`, `useInlineEditSubmitMode('none')`), rendering `{children}` with
nothing else. `InlineEditDate`/`InlineEditDateTime` no longer import
anything from `dateValueCast.ts` — that module's exports are now purely for
consumers.

### Consumer pattern

```tsx
<InlineEditControl>
  <InlineEditSelect items={roleItems}>
    <SelectButton />
    <SelectPositioner>
      <SelectContent>
        {roleItems.map(item => (
          <SelectOption key={item.value} item={item}>
            <SelectOptionText>{item.label}</SelectOptionText>
            <SelectOptionIndicator />
          </SelectOption>
        ))}
      </SelectContent>
    </SelectPositioner>
  </InlineEditSelect>
</InlineEditControl>

<InlineEditControl>
  <InlineEditDate>
    <CalendarTrigger>
      <DateInput
        value={toReactAriaDateValue(value)}
        onChange={v => setValue(toCalendarDateValue(v))}
        granularity='day'
      />
    </CalendarTrigger>
    <CalendarContent>
      <CalendarBody>
        <CalendarGrids />
      </CalendarBody>
    </CalendarContent>
  </InlineEditDate>
</InlineEditControl>
```

`value`/`setValue` above come from `useInlineEdit()`, called directly inside
the consumer's own composition — the same hook `InlineEditDate` itself used
internally until now; nothing new is needed to access them.

A trade-off worth stating plainly: today's `Omit<DateInputProps,
'granularity' | ...>` enforced at the type level that `InlineEditDate` could
only ever be composed with a day-granularity `DateInput`. Once the consumer
writes the `DateInput` themselves, that enforcement is gone — a consumer
could mismatch `granularity='minute'` inside `InlineEditDate` (day-only
root) and nothing catches it at compile time. This mirrors the exact
responsibility a consumer already has composing `Calendar`/`DateInput`
standalone; it's accepted as the cost of removing the maintained default.

## Test IDs

No new mechanism needed — verified against the actual `Select`/`Calendar`
source, not assumed:

- **`SelectButton`/`SelectOption` self-cascade; `SelectInput` does not** —
  verified against all three, not assumed. `Select`'s root already does
  `<TestIdProvider value={testId}>` from its own `data-testid` prop
  (`Select.tsx`), and `SelectButton`/`SelectOption` already call
  `useTestId('button', ...)`/`useTestId('option', ...)` themselves
  (`SelectButton.tsx`/`SelectOption.tsx`). `InlineEditSelect` only needs to
  bridge the ambient `InlineEdit`-level cascade into `Select`'s own
  re-provided one: `const testId = useTestId();` (the documented
  transparent-passthrough form — no slot segment) forwarded as `<Select
  data-testid={testId}>`. The consumer's own `SelectButton`/`SelectOption`
  then automatically resolve to `{base}--button`/`{base}--option` with zero
  extra work — a slot-name change from today's `InlineEditSelect`-specific
  `{base}--input` override.
  `SelectInput` (the multiple-select trigger) is the one inconsistency in
  the `Select` family itself: it takes a raw `data-testid?` prop and does
  **not** call `useTestId` internally (`SelectInput.tsx` — confirmed no
  `useTestId` import). A consumer composing the multiple-select trigger who
  wants a stable testid must supply it explicitly, e.g. `<SelectInput
  data-testid={useTestId('input')} />` — one extra line versus the
  single-select case. This is a pre-existing gap in `Select` itself, not
  introduced by this change; not in scope to fix here.
- **`Calendar`/`DateInput` do not re-provide a `TestIdProvider` at all**
  (verified: no `TestIdProvider`/`useTestId` anywhere in `Calendar.tsx` or
  `CalendarTrigger.tsx`; `DateInput.tsx` takes a raw `data-testid` prop, it
  does not call `useTestId` itself). The ambient `InlineEdit`-level cascade
  therefore already reaches straight through to whatever the consumer
  writes — a `DateInput` placed inside `InlineEditDate`'s children calls
  `useTestId('input')` itself (one line, the same the consumer would write
  for any other custom editor) and gets the correctly cascaded value. No
  `data-testid` prop is needed on `InlineEditDate`/`InlineEditDateTime` at
  all — dropped entirely, along with any handling for it.

## Analytics

`ANALYTICS_GAPS.md`'s `InlineEditDate` / `InlineEditDateTime → DateInput
wrapper` entry documents a gap in the *default composition* (consumer
attributes land on `DateInput`'s wrapper `<div>`, not the focusable
segments). Once there is no default composition, the consumer places
`data-analytics-id`/`data-*` exactly where they choose on their own
`DateInput` usage — the gap this entry describes no longer exists and the
entry is deleted.

## Testing

- `InlineEditSelect.test.tsx`: the `Harness` always composes
  `SelectButton`/`SelectInput` + `SelectPositioner > SelectContent >
  SelectOption` explicitly (mirroring the file's own existing "children
  compose ordinary Select parts" test, which becomes the new default
  shape). The two dev-warning tests (`items`/`collection` combination) keep
  their assertions, just via the new always-composing `Harness`. Testid
  assertions updated to the new slot names: `{base}--button` for
  `SelectButton` (auto-cascaded, no prop needed); `{base}--input` for
  `SelectInput` (multiple) via an explicit `data-testid={useTestId('input')}`
  the `Harness` supplies itself, per the `SelectInput` gap above;
  `{base}--option` for `SelectOption` (auto-cascaded).
- `InlineEditDate.test.tsx` / `InlineEditDateTime.test.tsx`: same treatment
  — the existing "children compose ordinary Calendar parts" test becomes
  the only composition shape; the other three tests in each file are
  rewritten against it.
- New: a focused test (in `InlineEditSelect.test.tsx` or a new file) proving
  the testid bridge — a consumer's bare `<SelectButton />`/`<SelectOption
  item={...} />` (no explicit `data-testid` prop) inside `InlineEditSelect`
  resolves to `{base}--button`/`{base}--option` from the ambient
  `InlineEdit` root testid, with no wiring beyond what `InlineEditSelect`
  itself does.
- Stories: `SelectEditor`/`MultiSelectEditor`/`TagsEditor`/`DateEditor`/
  `DateTimeEditor`/`ConfirmCommit`'s Role row rewritten to explicit
  composition. Date/DateTime rows derive `useTestId('input')` themselves to
  preserve the existing `{testid}--input` convention (Select's own natural
  `button`/`option` slot names are simply adopted for Select-based rows).

No e2e changes needed: verified against the current `InlineEdit.e2e.ts` —
its Select-related tests only ever use `{testid}--preview` (unaffected,
`InlineEditPreview`'s own testid) and `getByRole('option', { name: ... })`
(accessible-role based), never `{testid}--input`/`{testid}--button` on the
trigger. Date/DateTime tests keep working unchanged because those stories
deliberately preserve the `input` slot name. Only the unit test files
(`InlineEditSelect.test.tsx`, which today asserts on `ie--input` directly)
need their testid assertions updated to the new `ie--button`/`ie--option`
names.

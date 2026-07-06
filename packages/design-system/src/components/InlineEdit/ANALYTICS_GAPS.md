# InlineEdit — Analytics Gaps

Per `docs/metrics/contract.md`, arbitrary consumer `data-*` / `aria-*` / handlers
must reach the **real interactive DOM node**. The inline-edit family honours this
for every editor except one closed target, recorded here.

## `InlineEditNumber` → wrapper, not the inner input

- **What:** `InlineEditNumber` spreads consumer props (`data-analytics-id`,
  `data-analytics-props`, etc.) to `NumberInput`, which forwards them to the Ark
  `NumberInput.Root` **wrapper `<div>`**, not the inner `<input>`.
- **Impact:** Low. Click analytics still resolve correctly — the document-level
  click handler walks up via `closest('[data-analytics-id]')`, and the input is a
  descendant of the wrapper carrying the attribute. The only divergence from the
  contract is that the attribute is not physically on the focusable node.
- **Why not fixed here:** the placement is decided inside `NumberInput`
  (`components/NumberInput/NumberInput.tsx`), a shared component out of scope for
  WDS-143. Splitting `data-*`/`aria-*`/`id` from the Ark `Root` props and
  forwarding them to `NumberInput.Input` is the durable fix and belongs in that
  component (with its own tests/snapshots).
- **Tested:** `InlineEditInput.test.tsx` asserts the current placement so the
  behaviour is explicit and any future change is caught.
- **Owner / follow-up:** Design System — forward consumer attributes to
  `NumberInput.Input`, then update the test above to assert the inner node and
  delete this entry.

`InlineEditInput` (text) and `InlineEditTextarea` forward to the real
`<input>` / `<textarea>` and are contract-compliant (covered by tests).

## `InlineEditDate` / `InlineEditDateTime` → DateInput wrapper, not the focusable segments

- **What:** consumer `data-*` / `aria-*` spread lands on the `DateInput`
  wrapper `<div>`, not the focusable date segments (mirror of the
  `InlineEditNumber` entry above). Applies identically to both components —
  they share the same `DateInput`-based default composition.
- **Impact:** Low — document-level click analytics resolve via
  `closest('[data-analytics-id]')`.
- **Fix belongs in:** `components/DateInput` (forward consumer attributes to
  the segment group), out of scope here.
- **Tested:** `InlineEditDate.test.tsx` and `InlineEditDateTime.test.tsx`
  ("forwards data-analytics-id to the DateInput wrapper, not the focusable
  segments") each assert same-node identity with the wrapper carrying the
  derived testId, and that no focusable segment carries the attribute.

## `InlineEditTime` → TimeInput wrapper + closed dropdown rows

- **What:** consumer attributes land on the `TimeInput` wrapper `<div>` (same
  shape as the DateInput entry). Additionally the time-dropdown option rows
  are a closed target — no consumer attribute can reach them.
- **Impact:** Low — click analytics resolve via `closest()`; value-level
  analytics belong on `onValueCommit`.
- **Fix belongs in:** `components/TimeInput` / `TemporalCore`, out of scope.
- **Tested:** `InlineEditTime.test.tsx` ("forwards data-analytics-id to the
  TimeInput wrapper, not the focusable segments") asserts same-node identity
  with the wrapper carrying the derived testId, and that no focusable
  segment carries the attribute.

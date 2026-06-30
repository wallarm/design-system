# Attribute — Analytics Gaps

Per `docs/metrics/contract.md`, arbitrary consumer `data-*` / `aria-*` / handlers
must reach the **real interactive DOM node**. The inline-edit family honours this
for every editor except one closed target, recorded here.

## `AttributeEditNumber` → wrapper, not the inner input

- **What:** `AttributeEditNumber` spreads consumer props (`data-analytics-id`,
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
- **Tested:** `AttributeEditInput.test.tsx` asserts the current placement so the
  behaviour is explicit and any future change is caught.
- **Owner / follow-up:** Design System — forward consumer attributes to
  `NumberInput.Input`, then update the test above to assert the inner node and
  delete this entry.

`AttributeEditInput` (text) and `AttributeEditTextarea` forward to the real
`<input>` / `<textarea>` and are contract-compliant (covered by tests).

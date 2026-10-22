# Test ID Rules

**Read and follow [`docs/test-id-pattern.md`](../../docs/test-id-pattern.md)** before creating or modifying a compound component (one with sub-components) or writing a test that locates elements.

That document is the single source of truth for:
- `data-testid` cascading via `TestableProps` / `TestIdProvider` / `useTestId`
- Slot naming (`{baseTestId}--{slot}`, kebab-case sub-component suffix)
- Root and sub-component snippets and the step-by-step checklist
- Locator rules for unit and E2E tests

## Hard nevers

- Never skip the cascade on a compound component — it is mandatory, not opt-in.
- Never use `data-slot` in tests — it is for CSS selectors only. Locate by `data-testid` (`getByTestId`); `getByRole` is fine for accessibility assertions. Existing `data-slot` queries are legacy to migrate.
- Never render a derived `data-testid` when the root received none — `useTestId` returns `undefined` and the DOM stays clean.

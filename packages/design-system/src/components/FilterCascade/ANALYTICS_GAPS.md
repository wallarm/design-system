# FilterCascade — Analytics Gaps

Per [`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md). Every interactive target
is an exported part whose `{...rest}` lands on the real DOM node:

| Target | Part | Node |
|---|---|---|
| Trigger (open / close, Backspace / Delete clears) | `FilterCascadeTrigger` | `button` |
| ✕ on the trigger | `FilterCascadeClear` (pass as the trigger's child to replace the default) | `button` |
| Option (any level) | `FilterCascadeItem` | `div[role=treeitem]` |
| Search field | `FilterCascadeSearch` | `input` |
| Toggle row under the levels | `FilterCascadeCheckboxItem` | `button[role=menuitemcheckbox]` |

The root, `FilterCascadeContent`, `FilterCascadeLevel`, `FilterCascadeSection`,
`FilterCascadeGroupLabel` and `FilterCascadeEmpty` are containers, not click targets. With no
children, `FilterCascadeContent` renders default `FilterCascadeItem`s — compose the levels to put
attributes on them.

## Known gaps (closed targets)

- **The search field's built-in clear button** — the same `SearchInput` gap as `FilterDropdown`
  (see its ANALYTICS_GAPS.md). **Workaround:** `onClear` / `onChange('')` on `FilterCascadeSearch`.
  **Owner:** Design System team; fixed together with `SearchInput`.

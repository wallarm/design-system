# FilterCascade — Analytics Gaps

Per [`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md):

| Target | Part | Node |
|---|---|---|
| Trigger (open / close, Backspace / Delete clears) | `FilterCascadeTrigger` | `button` |
| ✕ on the trigger | rendered by `FilterCascadeTrigger` | `button` |
| Option (any level) | rendered by `FilterCascadeContent` | `div[role=treeitem]` |

The root and `FilterCascadeContent` are containers, not click targets.

## Known gaps (closed targets)

- **The ✕ and the options.** First version: both are rendered by the component, so consumer
  attributes cannot reach them.
  - **Workaround:** `onValueChange` reports every pick and the clear (`value: []`).
  - **Owner:** Design System team.
  - **Next decision point:** when a consumer needs per-option or clear-click analytics — export
    `FilterCascadeClear` and an item part, as `FilterDropdown` does.

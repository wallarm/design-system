# FilterDropdown — Analytics Gaps

Single source of truth for `FilterDropdown`'s analytics decisions, per
[`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md). Every interactive target is an
exported part whose `{...rest}` lands on the real DOM node:

| Target | Part | Node |
|---|---|---|
| Trigger (open / close, Backspace / Delete clears) | `FilterDropdownTrigger` | `button` |
| ✕ on the trigger (multi) | `FilterDropdownClear` (pass as the trigger's child to replace the default) | `button` |
| Option / "Selected" copy row | `FilterDropdownOption` | Ark option `div[role=option]` |
| «All» option (single) | `FilterDropdownAllOption` | Ark option `div[role=option]` |
| Search field | `FilterDropdownSearch` | `input` |
| Footer «Clear» (multi) | `FilterDropdownFooterClear` | `button` |

The root and `FilterDropdownContent` are containers, not click targets.

## Known gaps (closed targets)

- **The search field's built-in clear button.** `FilterDropdownSearch` renders `SearchInput`,
  whose own `<button aria-label='Clear'>` is not individually reachable: consumer attributes land
  on the `<input>`, and the button is mouse-only (`tabIndex=-1`).
  - **Workaround:** `onClear` on `FilterDropdownSearch` fires when that button is clicked (before
    `onChange('')`). `onChange(query)` also fires with `''`, but does not tell a Clear click from
    the user emptying the field by hand.
  - **Owner:** Design System team.
  - **Next decision point:** when a consumer asks for clear-click analytics — add an exported
    clear sub-component or a disable-default flag to `SearchInput`, which fixes `Select`,
    `FilterDropdown` and every other `SearchInput` user at once. No `clearButtonProps` escape
    hatch.

# FilterDropdown — design (WDS-180)

- Jira: WDS-180 «Filter dropdown — single / multi select»
- Figma: WADS-Components `VKb5gW46uSGw0rqrhZsbXT`, page node `12413:15939` (set `filter-dropdown` `12413:17394`, Documentation frame `12418:21395`)
- Pattern page / requirements: linked from the ticket (treated as the behavioural source of truth)

## Goal

A platform-wide lightweight filter: a 36px trigger that opens a menu and narrows a list by one attribute.
Single mode (exclusive values, «All …» first as default and reset) and multi mode (checkboxes, OR-ed, ✕ clear).
Instant apply, controlled `value` / `onValueChange`.

## Decisions

1. **Base: our `Select` (Ark Select), composed from existing Select parts.** Menu styling lives in one place;
   Select parts get the small extensions FilterDropdown needs, which the plain Select also benefits from.
   Consequence: ARIA is `combobox` + `listbox` (`aria-multiselectable` in multi) instead of the ticket's
   `aria-haspopup="menu"`. Rationale: a filter picks stateful values → listbox semantics; Figma says
   «Menu = select-menu». To be confirmed with design.
2. **Public API: compound**, but the spec rules live inside the parts (they read `FilterDropdownContext`),
   so dropping the parts into markup yields the spec behaviour without consumer logic.
3. **"Selected" duplicates via alias values** (`__selected__:<value>`) handled inside the root; consumers only
   ever see base values.
4. **"Selected" section is a snapshot** taken when the menu opens (and when the search is cleared): ticking/unticking
   while open does not add/remove rows there, so nothing jumps under the cursor. Unticking a copy unticks the original.

## Public API

```tsx
<FilterDropdown
  label="Type"                 // attribute name: trigger text in multi, aria, «Clear Type»
  allLabel="All types"         // single only: trigger text when unset + default «All» option text
  collection={collection}      // createListCollection, groupBy supported
  multiple
  value={value}                // string[]; [] = unset (= «All» in single)
  onValueChange={(d) => setValue(d.value)}
  searchThreshold={8}          // default 8
  data-testid="type-filter"
>
  <FilterDropdownTrigger />                   {/* auto-renders FilterDropdownClear in multi */}
  <FilterDropdownContent>
    <FilterDropdownSearch />                  {/* renders only when items >= threshold */}
    <FilterDropdownAllOption />               {/* single only; children default to allLabel */}
    <FilterDropdownSelected />                {/* multi, >= threshold, empty query */}
    {groups.map(([group, items]) => (
      <FilterDropdownGroup key={group}>
        <FilterDropdownGroupLabel>{group}</FilterDropdownGroupLabel>
        {items.map((item) => (
          <FilterDropdownOption key={item.value} item={item} hint={item.count}>
            {item.label}
          </FilterDropdownOption>
        ))}
      </FilterDropdownGroup>
    ))}
    <FilterDropdownEmpty />                   {/* «Nothing matches» when the filtered list is empty */}
    <FilterDropdownFooter />                  {/* multi, only when something is ticked; default child = FilterDropdownFooterClear */}
  </FilterDropdownContent>
</FilterDropdown>
```

`useFilterDropdown()` exposes `{ filteredCollection, groups, query, isSearchActive, multiple, value, clear }` so consumers
render the filtered items/groups. Groups with no matches are simply absent from `groups`.

Root props = `Select` props (minus `multiple`-incompatible bits) + `label`, `allLabel`, `searchThreshold`, `TestableProps`.

### Parts → base

| Part | Built from | Own behaviour |
|---|---|---|
| `FilterDropdown` | `Select` + `FilterDropdownContext` + `useSelectSearch` | alias mapping, single-mode `All` sentinel mapping (`[]` ↔ sentinel), search state reset on open, snapshot of "Selected" |
| `FilterDropdownTrigger` | `ArkUiSelect.Control/Trigger` + ButtonBase/Button outline neutral large classes | label forms, dashed/solid, 180px max + `OverflowTooltip` on the label span, Backspace/Delete clears (multi, set), composed `aria-label` |
| `FilterDropdownClear` | plain `<button>` sibling of the trigger inside one pill `div data-slot='filter-dropdown-control'` | multi + set only; 24px target, 16px `X`, `text-icon-secondary hover:text-icon-primary`; `aria-label="Clear {label}"`; focus → trigger before unmount. Seam: pass `<FilterDropdownClear …/>` as a child of the trigger to replace the default |
| `FilterDropdownContent` | `SelectContent` (→ `SelectPositioner`) | `max-height: min(340px, var(--available-height))`, `max-w-360`, hug width (no `min-w-240`), width lock while searching |
| `FilterDropdownSearch` | `SelectHeader` + `SelectSearchInput` | rendered only when total items ≥ threshold; gets initial focus |
| `FilterDropdownAllOption` | `SelectOption` | single only; sentinel value |
| `FilterDropdownOption` | `SelectOption` + `SelectOptionText` + `SelectOptionIndicator` | `hint` → right-side secondary text |
| `FilterDropdownGroup` / `FilterDropdownGroupLabel` | `SelectGroup` / `SelectGroupLabel` | — |
| `FilterDropdownSelected` | `SelectGroup` + `SelectGroupLabel` («Selected») + `SelectSeparator` | alias rows; hidden while query non-empty |
| `FilterDropdownEmpty` | `SelectEmptyState` | default text «Nothing matches» |
| `FilterDropdownFooter` / `FilterDropdownFooterClear` | footer row (Figma geometry) + `Button variant='ghost' color='neutral' size='small'` | multi + set only |

### Select extensions (shared)

1. `SelectSearchInput`: stop propagation of `' '`, `Home`, `End` from the input so Content's keymap does not
   select an item / eat caret keys (fixes the existing `WithSearch` bug).
2. `SelectOption`/`SelectOptionIndicator`: support right-side secondary text without overlapping the absolute indicator
   (e.g. `SelectOptionHint` part or indicator made inline).
3. `SelectPositioner`: allow `min-w`/`max-w` override via `className` (verify tailwind-merge).
4. Footer: Figma geometry (full-bleed top border, `justify-end`, inside the 8px padding).

## Trigger visuals (Figma)

- `h-36 px-16 py-8 gap-8 rounded-12 border border-border-primary bg-component-outline-button-bg text-sm`,
  `pr-10` with the end icon, hover `overlay-states-primary-hover`, pressed/open `overlay-states-primary-pressed`,
  focus `ring-3 ring-focus-primary`, disabled `opacity-50`.
- Unset: `border-dashed`, no shadow, text regular. Set: `border-solid shadow-2xs`.
- Label forms:
  - single unset → `allLabel` (regular); single set → selected label (medium), chevron.
  - multi unset → `label` (regular) + chevron.
  - multi 1 value → `label` · value (medium) + ✕.
  - multi ≥2 → `label` · `<NumericBadge type="primary">N</NumericBadge>` + ✕.
  - separator `•` `text-xs text-text-tertiary`, gap 4.
- Chevron `text-icon-primary` 16px; ✕ `text-icon-secondary`, hover `text-icon-primary`.
- `aria-label`: «Type, 3 selected: Lua, WASM, Plugin» / «Type, Lua» / «Environment, Pre-production» / «Type».

## Keyboard & a11y

- Enter/Space/ArrowDown open (Ark). Esc closes and returns focus. Click outside closes.
- Focus lands in the search when present, otherwise on the list.
- Backspace/Delete on the focused set multi trigger clears.
- Single closes on pick; multi stays open (Ark `closeOnSelect: !multiple`).

## Out of scope (v1)

Loading state, Apply footer, touch layout, disabled-reason tooltip, «+ Filter» overflow, second size.

## Testing

- Unit (Vitest + Testing Library): label forms, aria-label, clear via ✕ / footer / Backspace, focus returns to trigger,
  threshold for search and Selected, alias mapping (onValueChange only base values, unticking copy unticks original),
  single `All` ↔ `[]`, empty state, search keys (Space types a space), metrics attribute forwarding per target, testId cascade.
- E2E (Playwright, per `docs/e2e-test-rules.md`): screenshots of the trigger matrix and menu variants, interactions, a11y.
  Baselines are generated in CI (`[update-screenshots]`), not locally.
- Stories: Default (single), Multi, Label forms, States, With search (8+), Groups, Hint, Long labels, Filter row
  (SearchInput + SegmentedTabs + 3 filters), Controlled.

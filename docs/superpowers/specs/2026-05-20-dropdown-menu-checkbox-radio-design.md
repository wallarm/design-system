# DropdownMenu: CheckboxItem and RadioGroup

**Date:** 2026-05-20
**Branch:** `feat/dropdown-menu-checkbox-radio`
**Status:** Design approved, ready for implementation

## Goal

Add `CheckboxItem`, `RadioGroup`, and `RadioItem` sub-components to `DropdownMenu`, modeled after Ark UI `Menu.CheckboxItem` / `Menu.RadioItem` / `Menu.RadioItemGroup` primitives.

Use cases this unlocks:
- Multi-select toggles inside a menu (e.g. "Bold / Italic / Underline").
- Single-select option groups inside a menu (e.g. "List / Grid / Compact" view modes).

## Non-goals

- `indeterminate` state for `CheckboxItem` — Ark UI Menu does not support it.
- Render-prop or `asChild` API for the indicator — fixed visual is enough for now.
- Uncontrolled API (`defaultChecked`, `defaultValue`) — kept out for now; users wrap in `useState` when needed.

## Architecture

Three new public components plus one internal helper, all under `packages/design-system/src/components/DropdownMenu/`:

| File | Public? | Wraps |
|------|---------|-------|
| `DropdownMenuCheckboxItem.tsx` | yes | `Menu.CheckboxItem` |
| `DropdownMenuRadioGroup.tsx` | yes | `Menu.RadioItemGroup` |
| `DropdownMenuRadioItem.tsx` | yes | `Menu.RadioItem` |
| `DropdownMenuItemIndicator.tsx` | no (internal) | `Menu.ItemIndicator` |

The internal `DropdownMenuItemIndicator` is consumed by both `CheckboxItem` (with `<Check />`) and `RadioItem` (with `<Dot />`). It is **not** exported — users never wire the indicator themselves.

### Data flow

```
DropdownMenu (Menu.Root)
└── DropdownMenuContent
    ├── DropdownMenuCheckboxItem [checked, onCheckedChange]
    │   └── Menu.CheckboxItem
    │       ├── children (label text)
    │       └── Menu.ItemIndicator → <Check />  (auto-hidden when unchecked)
    │
    └── DropdownMenuRadioGroup [value, onValueChange]
        └── Menu.RadioItemGroup
            └── DropdownMenuRadioItem [value]
                └── Menu.RadioItem
                    ├── children (label text)
                    └── Menu.ItemIndicator → <Dot />
```

Ark UI handles all selection state, keyboard nav, and ARIA roles (`menuitemcheckbox` / `menuitemradio`, `aria-checked`).

## Public API

### `DropdownMenuCheckboxItem`

```typescript
export interface DropdownMenuCheckboxItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id'>,
    DropdownMenuItemVariantsProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Optional — auto-generated via useId() if omitted. Used by highlightedValue. */
  value?: string;
  disabled?: boolean;
  /** Whether selecting closes the menu (default: false, matches Ark UI). */
  closeOnSelect?: boolean;
  ref?: Ref<HTMLDivElement>;
}
```

### `DropdownMenuRadioGroup`

```typescript
export interface DropdownMenuRadioGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  onValueChange?: (details: { value: string }) => void;
  ref?: Ref<HTMLDivElement>;
}
```

`onValueChange` keeps the Zag.js `{ value }` shape so a future addition (e.g. `previousValue`) is non-breaking.

### `DropdownMenuRadioItem`

```typescript
export interface DropdownMenuRadioItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id'>,
    DropdownMenuItemVariantsProps {
  /** Required — identifies this radio within the group. */
  value: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  ref?: Ref<HTMLDivElement>;
}
```

`value` is required on `RadioItem` (single-select identity) but optional on `CheckboxItem` (each item owns its own `checked`).

### Usage

```tsx
const [bold, setBold] = useState(false);
const [italic, setItalic] = useState(true);
const [view, setView] = useState('list');

<DropdownMenu>
  <DropdownMenuTrigger>...</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Text style</DropdownMenuLabel>
    <DropdownMenuCheckboxItem checked={bold} onCheckedChange={setBold}>
      Bold
    </DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem checked={italic} onCheckedChange={setItalic}>
      Italic
    </DropdownMenuCheckboxItem>

    <DropdownMenuSeparator />

    <DropdownMenuLabel>View mode</DropdownMenuLabel>
    <DropdownMenuRadioGroup
      value={view}
      onValueChange={(d) => setView(d.value)}
    >
      <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="compact" disabled>
        Compact
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

## Visual design

**Layout:** indicator on the **right side** (similar to `DropdownMenuShortcut`), pushed via `ml-auto`. Item itself stays in its native `flex items-center gap-8`.

```
┌──────────────────────────────────┐
│ Label text                    ✓  │ ← checkbox checked
│ Label text                       │ ← checkbox unchecked (indicator hidden by Ark)
│ Label text                    ●  │ ← radio checked
│ Label text                       │ ← radio unchecked
└──────────────────────────────────┘
```

**Reuse `dropdownMenuItemVariants`** — same `default | brand | destructive` variants, hover/active/disabled/highlighted states. No new variant CSS.

**New CSS** (single block in `classes.ts`):

```typescript
export const dropdownMenuItemIndicatorVariants = cn(
  'ml-auto flex items-center justify-center',
  'size-16',
  '[&_svg]:icon-sm [&_svg]:shrink-0',
  '[&_svg]:text-current',
);
```

`text-current` lets the indicator inherit the item's variant color automatically (`text-text-danger` for destructive, `text-text-brand` for brand).

**Indicator icons:**
- Both `CheckboxItem` and `RadioItem` use `<Check />` from `../../icons`. Differentiation between multi-select and single-select is made via the parent context (presence of `DropdownMenuRadioGroup`) and ARIA role (`menuitemcheckbox` vs `menuitemradio`), not by visual icon.

**Dimensions:** `size-16` (16px) — compact, matches Radix/shadcn density. A full-bordered Checkbox visual would overweight the row.

**State mapping (data attrs from Ark UI):**

| State | DOM | Visual |
|-------|-----|--------|
| Unchecked | `data-state="unchecked"` | `Menu.ItemIndicator` is not rendered |
| Checked | `data-state="checked"` | Indicator visible |
| Disabled | `data-disabled` | Inherited from `dropdownMenuItemVariants` |
| Highlighted | `data-highlighted` | Inherited from `dropdownMenuItemVariants` |

## TestId pattern

Per `.claude/rules/test-id.md`, `DropdownMenu` root already wraps children in `TestIdProvider`. New components consume it via `useTestId(slot)`.

| Slot | Component |
|------|-----------|
| `checkbox-item` | `DropdownMenuCheckboxItem` root |
| `radio-group` | `DropdownMenuRadioGroup` root |
| `radio-item` | `DropdownMenuRadioItem` root |
| `item-indicator` | internal `DropdownMenuItemIndicator` |

## Storybook

Add to existing `DropdownMenu.stories.tsx` (no new story file):

- **`WithCheckboxItems`** — three checkboxes (Bold/Italic/Underline) with `useState`. Demonstrates multi-select and that the menu stays open across selections.
- **`WithRadioGroup`** — `RadioGroup` with three items (List/Grid/Compact), one `disabled`. Demonstrates single-select.
- **`WithMixedSelectionItems`** — checkboxes + separator + radio group + plain items in one menu.

Controlled-demo stories are written as small wrapper components (e.g. `CheckboxItemsDemo`) defined in the stories file so React hooks are valid.

## E2E tests

Add to `DropdownMenu.e2e.ts`, following `docs/e2e-test-rules.md`.

**Visual:**
- `Should render checkbox items correctly` — screenshot with mixed checked/unchecked.
- `Should render radio group correctly` — screenshot with one selected.

**Interaction:**
- `Should toggle checkbox item on click` — click flips `data-state`; menu stays open.
- `Should select radio item on click` — click changes selected value within group.
- `Should not select disabled checkbox/radio item`.

**Accessibility:**
- Space/Enter toggles `aria-checked`.
- Arrow keys navigate without breaking selection state.
- Roles `menuitemcheckbox` / `menuitemradio` are present.

## Exports

Add to `packages/design-system/src/components/DropdownMenu/index.ts`:

```typescript
export {
  DropdownMenuCheckboxItem,
  type DropdownMenuCheckboxItemProps,
} from './DropdownMenuCheckboxItem';
export {
  DropdownMenuRadioGroup,
  type DropdownMenuRadioGroupProps,
} from './DropdownMenuRadioGroup';
export {
  DropdownMenuRadioItem,
  type DropdownMenuRadioItemProps,
} from './DropdownMenuRadioItem';
```

The internal `DropdownMenuItemIndicator` is NOT exported.

## Open considerations

- **`closeOnSelect` default.** We default to `false` for both Checkbox and Radio items (Ark UI behavior; users typically tweak several toggles before dismissing). Users can override per-item.
- **Disabled `RadioItem` inside a controlled group.** The disabled item is rendered but cannot be selected by click or keyboard — Ark UI handles this; we just pass `disabled` through.

# Kbd — usage

> Displays a **keyboard key or shortcut** as a semantic `<kbd>` cap (`⌘`, `Esc`, `⇧`, `↵`). **Display-only** — it *shows* a shortcut; it does not bind or handle it.

## Reach for it when
Surfacing a **keyboard shortcut / hotkey** in the UI — in a `Tooltip`, a menu item, a command palette, a shortcuts list or menu footer, a `NavRail` item, or beside an action. One `Kbd` holds **one key**; use **`KbdGroup`** (one `Kbd` per key) for a combo or sequence (`⌘` + `K`).

## Don't use it for
- **Actually binding the shortcut** → Kbd is presentational; the DS ships **no** shortcut-binding hook, so you wire the `keydown` handler yourself. Kbd renders the hint, nothing more.
- **A code value / monospace string** (a token, path, ID) → `Code`. Kbd is specifically for *keys*, not code.
- **A status / label / count** → `Badge` / `Tag` / `NumericBadge`, not a key cap.

## Locked — don't override
- **Display-only** — `pointer-events-none`, non-selectable; it's never interactive.
- **The cap look is fixed** (border, `surface-2` bg, rounded, medium sans) — style through **`size`** (`xsmall` / `small` / `medium`), not `className`. Size follows the surrounding density.
- **Inside a `Tooltip` it auto-restyles** to the inverted / borderless treatment — don't restyle it for the dark surface yourself; the Tooltip handles it.

## Content — keep keys canonical
Render the **modifier symbols** (`⌘` / `⇧` / `⌥` / `↵` / `Esc`), not the words ("Cmd" / "Shift" / "Enter"), so the same shortcut always reads the same. (A "key in a button" is Figma-open — don't force one in.)

## Pairs with
- `Tooltip` (+ its `Kbd`-aware styling) — the shortcut hint on an icon control.
- `DropdownMenu` / menus — a shortcut beside an item. `NavRail` — an item's shortcut.
- `KbdGroup` — multi-key combos / sequences (one `Kbd` per key).

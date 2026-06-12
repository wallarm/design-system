# Tag — usage

> Interactive chip for a removable / actionable descriptor. Looks like a slate
> Badge; behaves like a control (focusable, hover/pressed states).

## Reach for it when
A value the user can act on is shown as a chip: applied labels, values picked
into a multiselect field, removable criteria. Badge ANNOTATES; Tag is for
chips you interact with. If nothing happens on click or remove, it's a Badge —
when interactivity is unknown, default to Badge and promote to Tag only once
the remove/act behavior is real. Use tags in moderation: a wall of tags is
cognitive noise.

## The tag-shaped things — route correctly
- **`Tag` (+ `TagClose`)** — a chip the user removes or acts on in place.
- **A chip with a chevron that opens a picker** → it's a `Select` trigger
  (`SelectButtonTag`, or `SelectButton` per the design case) — never a Tag
  with a hand-wired popover.
- **`FilterInput`** — owns its own filter chips; don't rebuild them from Tag.

## Composition
- Text only, or icon + text; `TagClose` (the X) goes last for removable tags.
- Labels: sentence case, no leading articles, a few words.
- No avatars / user pictures inside tags — ruled out of scope by design.
- Sets that can overflow → `OverflowList` with a "+N" chip opening a `Popover`
  — the spec'd group pattern. Never hand-roll the width math.

## Don't use it for
- **Pure annotation** (status, category, "New") → `Badge` — display-only.
- **Counts** → `NumericBadge`.
- **Primary actions** ("Save", "Add") → `Button`. A Tag acts on its own value
  (remove it, open it, change it), never on the page.

## Interaction
- The whole tag is one click target and may carry an action (per design case).
- **Removing is only ever the X** — `TagClose` is its own precise target and
  never triggers the tag's own action. Don't make the body remove the tag.
- A "selected/active" toggle tag is **TBD in design — don't build one yet**.

## Locked — don't override
- **Always neutral slate** — Tags are never colored; the meaning lives in the
  text. Need semantic color? That's a Badge.
- **Keep content to a few words** — spec truncates at 320px with an ellipsis
  and full-value tooltip; if you hit that, shorten the label.

## Sizing
`medium` in fields, menus, and dense rows; `large` on roomier surfaces. Match
neighbours — inside an input, match the input's size.

## Pairs with
- `Select` (multiselect) — picked values render as Tags inside the field, with
  clear-all and "+N" overflow.
- `Badge` — same skeleton, opposite role: Badge states, Tag acts.

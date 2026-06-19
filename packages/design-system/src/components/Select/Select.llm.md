# Select — usage

> A dropdown that **holds a chosen value** and shows it in its trigger. One compound family — three triggers over one shared menu, built on Ark UI (portaled, auto-positioned, form-submittable). Interactive.

## Reach for it when
A user picks a value from a **predefined list** to hold and submit — a form field, a toolbar/inline filter, a setting. Selection data is **always** `createListCollection({ items })` passed to the `collection` prop — never JSX children; the `<SelectOption>`s are only the visual row template. **Never hand-wire a `Button` or `Tag` to a popover list** — that's a Select.

## Which trigger — route correctly
Pick **exactly one** trigger per Select; all three open the same menu, look interchangeable, but aren't — the wrong one is a silent design mismatch, not an error.
- **`SelectInput`** — the common case. An input-shaped, bordered, labelled **form field** (36px) — reach for it for any Select inside a form, beside `Input` / `Textarea` / the date inputs. The only trigger that renders a multiselect value as **removable `Tag`s** with "+N" `OverflowList` overflow and a clear-all.
- **`SelectButton`** — a Select that is **not** a form field: a toolbar picker, an inline filter, a standalone control. A real `Button` under the hood.
- **`SelectButtonTag`** — a chip-with-chevron (a real `Tag`); what `Tag` routes to for "a chip that opens a picker". An **emerging pattern** — reach for it only for a genuine chip-trigger case (e.g. an object's status shown as a Tag you change in place: *In progress → Done*). Don't default to it.

## Don't use it for
- **A short fixed set** (~5 or fewer) where every option is worth showing at once → `Radio` (single-pick) / `Checkbox` (multi-pick) / `SegmentedControl` (2–4, inline toggle). Not a hard cutoff — it's a judgment driven by the **form's height and how many fields it already has**; don't bury a short choice in a dropdown.
- **Firing commands / actions** → `DropdownMenu`. A menu *runs* things; a Select *holds* a value. **The one sanctioned exception:** a Select menu may carry a single **create-style action row** — e.g. a "Create new…" escape hatch, typically surfaced when search finds nothing — that opens a create flow instead of selecting. That's the *only* action allowed in a value menu; anything else (Delete, Edit, …) belongs in a `DropdownMenu`.
- **Type-as-you-filter a known list** → there is no Combobox; it's a Select **with `SelectSearchInput`** (you own the query + `collection.filter()`). But a Select only holds a value **from its collection** — if the user must enter an arbitrary value *not* in the list (a creatable typeahead), that's a free-text `Input`, not a Select (the sole in-menu escape is the "Create new…" action row above).
- **A filter input that produces a result set** → `FilterInput` (it owns its own filter chips — don't rebuild them from `Tag` or Select).
- **Displaying a chosen domain value** (HTTP verb, status code) → the read-only chip (`HttpMethod`, `ResponseCode`). Choosing among them is a Select; *showing* one is display.

## Multiselect
- **Default** is the plain in-menu toggle: picked rows show a checkmark + highlight; click again to deselect; **each pick commits immediately** (no Apply step). Options can be text or `Badge`s.
- The field's chosen value renders **by product case** — comma-joined text, or removable `Tag`s/`Badge`s — there's no single rule; `SelectInput` is the rendition that gives the removable Tags + "+N" overflow.
- Reach for the **Cancel/Apply footer + an "X selected" counter** only for **staged-apply** cases — you hold the selection locally and **commit only on Apply** (Cancel reverts), usually with many items. It's an optional construction, not the default.

## Locked — don't override
- **Positioning is fixed and not exposed** — the menu always opens just below the trigger; every Select opens identically. `positioning` / `lazyMount` / `unmountOnExit` are omitted from props.
- **The menu is lazy-mounted** — options aren't in the DOM until first open and are removed on close. Don't query, measure, or auto-focus an option before the user opens it.
- A hidden native `<select>` is always rendered for form submission — don't add your own.
- **`SelectButton` stays off the loud cells** — `variant` excludes `primary`, `color` excludes `destructive` (both at the type level); a trigger is never an action button. `disabled`/`loading` come only from the `Select` root, not the trigger.
- **`loading` is cosmetic** (`SelectButton` spinner only) — it does **not** block opening, disable selection, or change the list. Async option loading and the empty/partial list are yours to manage.
- **Menu width defaults to a 280–320px clamp**; value text truncates with an ellipsis. Usually trim the content — but you *may* widen it (e.g. up to ~440px) for a deliberately wide field whose values are genuinely long. That's a considered exception, not the default. Use **`SelectSeparator`, never `DropdownMenuSeparator`**, inside a Select (the latter reads a Menu context that doesn't exist and throws).

## Composition
Assemble from shipped parts — don't hand-roll equivalents:
- **Required first step** — build the data with `createListCollection({ items })` and pass it to `collection` (item: `value`/`label`, optional `disabled`/`description`/`category`/`icon`). `value` must be a **string** — remap differently-keyed data first. Disable a row via the collection (`item.disabled` / `isItemDisabled`), not on `SelectOption`.
- **Menu shell, strict order** — `SelectPositioner` wraps an optional `SelectHeader`, then `SelectContent` (the scroll area), then an optional `SelectFooter` (header/footer are pinned siblings, *not* inside Content).
- **Rows** — `SelectOption` → leading icon, `SelectOptionText`, optional `SelectOptionDescription`, `SelectOptionIndicator` last. Group with `SelectGroup` + `SelectGroupLabel` (groups self-separate by label — no divider between them); use `SelectSeparator` only to divide a flat list or distinct sections.
- **Search** — `SelectSearchInput` is **controlled**: you hold the query and call `collection.filter()`; it filters nothing itself. Filter **before** grouping, or empty group wrappers keep the child count non-zero and the auto "No results" won't show.
- **Form framing** — wrap in `Field` for label / description / error; `SelectInput` supplies the input *look*, not the label/error chrome. *(`Field` has no usage guide yet — don't assume its API.)*
- **Placeholder** — write an **action-oriented** placeholder per use site (`"Select a framework"`), not the bare `"Choose…"` fallback.

## Sizing & not-yet-built
**One size ships today** — `SelectButton` is `large` + full-width, `SelectInput` is 36px; neither exposes a size prop, so don't try to make a compact Select for a toolbar or table cell. Smaller sizes are designed (Figma) but **not shipped — don't build them yet**. Likewise drawn-but-unshipped, don't build: nested submenus, per-item loading spinners, keyboard-shortcut chips.

## Pairs with
- `createListCollection` — the mandatory data source (re-exported from the package); step one.
- `Tag` / `OverflowList` — multiselect `SelectInput` renders picked values as Tags with "+N" overflow; `SelectButtonTag` *is* a Tag.
- `Button` — `SelectButton` is one; Select is the value-picker member of the Actions family.
- `DropdownMenu` — the boundary sibling (holds a value vs runs commands) and visual twin (shares the menu's class tokens).
- `Field` — the form-row wrapper (label/description/error) around a Select, most often a `SelectInput`.
- `Radio` / `Checkbox` / `SegmentedControl` — the always-visible pickers for short choices.

```tsx
const collection = createListCollection({
  items: [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
  ],
})

<Select collection={collection}>
  <SelectInput placeholder="Select a framework" />
  <SelectPositioner>
    <SelectContent>
      {collection.items.map((item) => (
        <SelectOption key={item.value} item={item}>
          <SelectOptionText>{item.label}</SelectOptionText>
          <SelectOptionIndicator />
        </SelectOption>
      ))}
    </SelectContent>
  </SelectPositioner>
</Select>
```

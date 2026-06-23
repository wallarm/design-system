# InputGroup — usage

> The single-input **adornment wrapper** — one box that holds **one** control (`Input`) plus leading/trailing add-ons (icon, text prefix/suffix, button, embedded `Select`, ⌘K hint, spinner, tooltip). The group owns the border / focus ring / error paint; the inner `Input` drops its own box and becomes the fill. This is the **only** sanctioned way to put an affordance inside an input — none of these are props on `Input`. Compound, interactive.

## Reach for it when
A **single** input needs something **inside its box**: a leading search/status icon, a text prefix or suffix (`https://`, `.com`, a unit), an inline button (clear, show/hide password, submit), a `⌘K` shortcut hint, a loading spinner, an embedded scope/unit `Select`, or a help tooltip. `Input` ships none of these — when you'd reach for an `icon` / `prefix` / `suffix` / `clearable` / search / password-toggle prop, reach for InputGroup instead (there's no dedicated Search or Password component — they're built here). Drop a bare `<Input>` (it already carries `data-slot="input"`) between `InputGroupAddon`s.

## Don't use it for
- **Combining several fields / laying out a form** → `Field` + `FieldGroup`. InputGroup adorns **one** control inside **one** box; a form of multiple fields is the Field family's job, not this. (It's not a multi-input container.)
- **The label / description / error *message*** → still `Field`. InputGroup handles only the in-box add-ons; it nests **inside** a `Field` for the label/error chrome.
- **A `Textarea`** → add-ons are single-line `Input` only (see Textarea's doc); don't adorn a textarea even though a CSS escape hatch exists.
- **The primary value picked from a list** → `Select` on its own. An embedded `Select` in an add-on is a *secondary* scope/unit selector beside a text value, never the main control.

## Locked — don't override
- **The group owns the box; the Input gives it up** — inside an InputGroup the `Input` loses its own border / background / shadow / focus ring (stripped via `data-slot="input"`) and the group draws them. Don't restyle the inner Input's box or expect it to keep its border.
- **State lives on the inner control; the group reflects it** — set `error` / `disabled` on the **`Input`**, not the group; the group repaints its border red / dims off the input's `aria-invalid` / `disabled`. Validation is the same family double-wire (`<Input error>` + a `<FieldError>` in the surrounding `Field`).
- **Add-on placement + look** — `align="inline-start"` (leading, default) or `"inline-end"` (trailing); `variant="ghost"` (default, transparent — icons, inline icon-buttons like clear / show-hide, Kbd, tooltips) or `"outline"` (filled with a divider — text prefixes, embedded Selects). Clicking an add-on focuses the input (unless the click lands on a button inside it).
- **Size** — the group carries `size` (`default` h-36 / `medium` / `small`); `default` is the norm and the only one exercised. *(Bare `Input` has no size axis, so the smaller group sizes are unproven against the Input's fixed height — flagged; stick to `default`.)*

## Pairs with
- `Field` (+ `FieldLabel` / `FieldDescription` / `FieldError`) — wraps the whole InputGroup for the label / description / error chrome; InputGroup is only the in-box layer.
- `Input` — the single control inside (bare, already carries `data-slot="input"`).
- `Button` / `Select` (`SelectButton`) / `Kbd` / `Loader` / `Tooltip` — what lives in an `InputGroupAddon`: a clear / password-toggle / submit button, a scope/unit Select, a `⌘K` hint, a loading spinner, a help tooltip.

```tsx
<Field>
  <FieldLabel>Search endpoints</FieldLabel>
  <InputGroup>
    <InputGroupAddon><Search /></InputGroupAddon>
    <Input placeholder="Search endpoints" />
    <InputGroupAddon align="inline-end">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </InputGroupAddon>
  </InputGroup>
</Field>
```

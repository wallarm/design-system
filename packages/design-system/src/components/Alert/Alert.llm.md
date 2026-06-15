# Alert — usage

> An inline, persistent message bound to a region of the UI (`role="alert"`) —
> five semantic colors, composed from sub-components. Stays until resolved or
> dismissed (not transient).

## Reach for it when
A message that belongs to a specific part of the screen and should stay put —
inside a `Drawer` or `Dialog`, or under a page's main header, scoped to the
section or form it's about. Contextual status: a form-level error, an info /
warning note about what's in view, a success that should persist. Reach for it
instead of hand-rolling a colored box with an icon.

## Don't use it for
- **Transient confirmation of an async action** (Saved, Sent) → `Toast`. Alert is
  persistent and doesn't auto-dismiss.
- **A platform- / page-wide notice** (subscription lapsed, system-wide status) →
  `Banner` at the top of the console. Same look, wider reach: Banner is the
  higher-level platform message; Alert is local to its context.
- **A decision that must block the flow** → `Dialog`. Alert never blocks.
- **One field's validation error** → the field's own error (`Field`). Alert is a
  block for a section / form, not per-field.

## Locked — don't override
- **`color` drives bg + border + icon, semantically**: primary (neutral, default),
  destructive red, info blue, warning amber, success green. `AlertIcon` auto-picks
  the icon from the color — don't recolor or mismatch it. (Color follows meaning;
  neutral when there's nothing to encode.)
- **Action buttons are a fixed recipe**: `variant='secondary' size='small'`,
  `color='neutral'` (or `destructive` to match a destructive alert), inside
  `AlertControls`. Never a primary / solid button.
- **Truncation + overflow tooltip are wired** on title / description (`lineClamp`
  opt-in — 4 is the usual cap; the tooltip shows the full text). Don't add your own.
- **Width is 256–980 px** and fills its container within that; override `maxWidth`
  rarely, never hand-pin a width.

## Composition
- Core: `Alert` › `AlertIcon` + `AlertContent` (`AlertTitle` + optional
  `AlertDescription`). Title-only is fine.
- Optional: `AlertClose` (dismiss X) · `AlertControls` (actions) · an inline `Code`
  line for an error code / command (e.g. in a destructive / config alert).
- **Not built yet — don't hand-roll:** a loading type, rich / stepper content, and
  a brand "promo" type are design-only.
  <!-- TODO(designer): revisit when they ship -->

## Judgment calls
- **color** — by meaning: a semantic color when there's a status, `primary`
  (neutral) for a general notice.
- **actions placement** — follows the alert's width, not a rule: **wide → top-right**
  (`AlertControls` as a direct `Alert` child); **narrow → bottom** (`AlertControls`
  inside `AlertContent`, leaving room for the text).
- **dismissible?** — add `AlertClose` when the user can reasonably dismiss it; omit
  when it must stay until the underlying state changes.
- **multiple alerts** — use sparingly; if several stack, order by urgency
  (error → warning → info → success).

## Writing the message
Same house microcopy as the rest of messaging — sentence case, no trailing
punctuation in the title, button labels echo the message (see the content
guidelines; wording is being finalized with technical writers).

## Pairs with
- `Button` inside `AlertControls` (secondary / small / neutral or destructive).
- `Toast` / `Banner` / `Dialog` / `Field` — the messaging siblings; see "Don't use
  it for".
- `Drawer` / `Dialog` / page sections — where Alert lives.

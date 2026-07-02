# UtilityPage — usage

> The full-page **error / utility-state** template — a branded standalone screen (decorative background + `Logo` + a card with a big title, subtitle, description, and actions) for when the *whole view* is an error or unexpected state rather than the normal app.

## Reach for it when
The entire screen has to be a status / error page — **404, 403, 500, offline, an outage / maintenance that took the app down, "something went wrong,"** or any state where the normal app can't render. It **replaces the whole view** (it brings its own background + `Logo`; it does not sit inside the app shell). Pass `title` / `subtitle` / `description` and the recovery action(s) as `children`.

## Don't use it for
- **A region / panel / table with no data**, while the app still works → `EmptyState` (the in-container sibling).
- **An inline error** bound to a form or section → `Alert` / `Field`.
- **A page- or platform-wide notice while the app still works** (including *upcoming* maintenance) → `Banner`.
- **A transient failure** → `Toast`.

**The decider is whether the normal app can still render:** the whole screen is unusable → UtilityPage; the app works and this is only a message or an empty region → the rungs above.

## The copy is the work
- **`title`** — the big mono display: an error code (`404` / `500`) or a short word (`Offline`).
- **`subtitle`** — the one-line statement ("Page not found.").
- **`description`** — the reassuring explanation + what to do next.
- **`children`** — the recovery action(s): **one primary `Button` that is the way out** ("Take me home" / "Try again"), plus at most one secondary ("Check status"). Don't pile on actions.

**Adjust the copy per state, and hold the house tone: reassure, don't blame.** For Wallarm specifically, make clear that *protection keeps running even when the console doesn't* ("on our side, not yours — your protection is still running"). Always offer a way out.

## Locked — don't override
- **The layout is the template** — decorative `AnimatedBackground` + `Logo` + the centered card with the three text slots. Don't rebuild it, move the logo, drop the background, or resize the card; you supply copy + actions, not a new layout.
- `title` / `subtitle` / `description` are **required**; actions are `Button` `children`. (The background's dim / animation timing is design-TBD — don't hand-tune it.)

## Pairs with
- `EmptyState` — the in-container sibling; the two split on *whole-screen* vs *a region*.
- `Button` — the recovery actions (as children).
- `Banner` / `Alert` / `Toast` — the in-app message rungs, for when the app still works.

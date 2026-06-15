# Toast — usage

> A transient, auto-dismissing notification fired imperatively — confirms the
> outcome of an async / background action. You don't place it in the tree.

## Reach for it when
A background or async action finishes and the user needs a brief, **non-blocking**
confirmation or status — "Saved", "Message sent", "Export started", "Connection
restored". Fire it from anywhere with `useToast().create({…})` (or `toaster.create`);
mount **one** `<Toaster />` at the app root. It appears bottom-right and dismisses
itself — the user never has to act on it.

## Don't use it for
- **Critical problems that need a decision or must be seen** → blocking `Dialog`.
  Toasts auto-dismiss and are easily missed — never gate a critical action behind one.
- **Persistent account / system state** (subscription lapsed, a feature disabled
  console-wide) → `Banner` across the top of the page. Toasts are momentary, not
  standing notices.
- **An inline message tied to a section / region** (stays in context, not transient)
  → `Alert`. A toast is momentary and corner-anchored; an `Alert` persists where it's
  relevant.
- **Inline form-field validation** → the field's own error (`Field`). Don't pop
  per-field errors as toasts.
- **Long or multi-step content** → show a one-line summary in the toast and put the
  detail behind an action or a `Dialog`.

## Locked — don't override
- **`type` drives icon + color, semantically**: success green, error red, warning
  amber, info blue, loading spinner; `default` has no icon. Don't recolor or swap an
  icon to mean something else (a custom `icon` inherits the type color unless it sets
  its own).
- **`Toaster` owns placement + stacking**: fixed bottom-right, newest first, **max 3
  visible + hover-to-expand**, portal-rendered. Don't position toasts yourself or
  build a container.
- **Auto-dismiss is built in** — simple 5 s, extended 10 s, paused on hover, with a
  progress bar. Don't add your own timer.
- **Loading toasts have no progress bar and are yours to resolve** — `update()` the
  same id to success/error, or `dismiss()` (loading → success is the sanctioned flow).
  Don't rely on a loading toast clearing itself.
- **Truncation + overflow tooltip are built in** (title 1 line simple / 2 extended,
  description 4 lines) — don't pre-truncate or add a tooltip.
- **Dark-themed surface, dismissible by default** (the X). Use `closable: false` only
  when it must stay (an in-flight loading toast).

## Layout / judgment calls
- **simple vs extended** — `simple` (title only, one line, 5 s) for a bare
  confirmation; `extended` (title + description, 10 s) when one sentence of context
  helps. Unspecified → `simple`.
- **actions** — a few short actions (commonly one, up to ~3: Undo / View / …) via
  `ToastActions`; they must stay optional, since the toast auto-dismisses. Critical or
  can't-be-missed → `Dialog` instead.
- **timestamp on its own line** — designed but not built; don't add one yet.

## Writing the message
House microcopy (being finalized with technical writers — current rules, not frozen):
- **Sentence case**, never Title Case — "Event created".
- **Short**: aim for ~3 words, one line; drop articles ("the/a/an") and filler.
- **No filler politeness** — avoid "please", "note", "successfully" (success is implied).
- **Never end in punctuation** — "Event shared with you", not "…with you."
- **Loading** = "-ing" verb + noun + "…": "Uploading file…", "Exporting event…".
- **Action labels echo the message** — "Event shared with you" → button "Open event".

## Pairs with
- `Button` inside `ToastActions` — on the dark surface use `color='neutral-alt'` (size `small`).
- `Dialog` / `Banner` / `Field` — the alternatives for the cases under "Don't use it for".
- `useToast()` + a single `<Toaster />` at the app root — the fire / mount pair.

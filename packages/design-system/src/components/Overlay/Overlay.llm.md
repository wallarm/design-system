# Overlay — usage

> The house **backdrop / scrim** — a fixed, full-viewport dimmed + lightly-blurred layer that sits behind an elevated surface to mute the page and pull focus to it. **Presentation only:** a styled `<div>`, no behavior of its own.

## Reach for it when
Almost never directly. `Dialog`, `Drawer`, and `Tour` **already render this Overlay for you** — reach for *them*, not the backdrop. Drop an `<Overlay>` in by hand only when you're building a genuinely new modal-ish surface the DS doesn't ship (a bespoke full-screen takeover), and even then it's only the *look* — you still owe the surface its behavior (see Locked).

## Don't use it for
- **A modal / confirm / message** → `Dialog` (owns its overlay).
- **A side panel** → `Drawer` (owns its overlay).
- **A guided walkthrough / spotlight** → `Tour`. The cut-out "hole" around the highlighted element is Tour's own `Spotlight`, **not** an Overlay feature — Overlay is only the dim fill behind it.
- **A popover / tooltip / dropdown menu** → those are **non-modal and take no scrim** — don't put an Overlay behind them.
- **A loading veil** → `Loader` / `Skeleton`, not a dimmed backdrop.

## Locked — don't override
- **The look is fixed** — dim + `backdrop-blur-xs`, the `component-dialog-overlay` token. **`className` is not accepted** (it's `Omit`ted); you cannot restyle, recolor, or un-blur it. No `variant` / `opacity` / color knobs.
- **Presentation only — no modality.** No focus trap, no click-to-dismiss, no scroll-lock, no portal. On its own it's an inert dim layer. Real modal behavior comes from wrapping it in a headless backdrop with `asChild` (exactly how Dialog/Drawer/Tour do it: `<Ark.Backdrop asChild><Overlay/></Ark.Backdrop>`) — that layer owns dismiss (click-outside + `Esc`), focus, and scroll-lock.
- **The fade is parent-driven** — the open/close transition keys off a `data-state` set by that wrapping backdrop; a bare `<Overlay>` with nothing driving `data-state` won't animate in/out, it just sits there.
- **z-index is computed for drawer layering** (stacked drawers each sit above the last) — don't hand-set it.

## Design-TBD — don't pre-build
Figma flags the **blur**, a possible **darker variant**, and the **dim animation / timing** as still in flux ("what can be changed"), and the spec is tagged *not done*. There's one shipped look today — use it; don't add a dark mode, a heavier blur, or custom timing ahead of the design decision.

## Pairs with
- `Dialog` / `Drawer` / `Tour` — the components that render Overlay for you; reach for these first.
- Ark UI `Dialog.Backdrop` / `Tour.Backdrop` — the headless behavior layer you wrap it in (`asChild`) when you do compose it directly.

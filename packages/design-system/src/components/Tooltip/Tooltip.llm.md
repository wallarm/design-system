# Tooltip — usage

> A small floating label shown on **hover or keyboard focus** of an element — brief,
> supplementary, **nonessential** context. Compound (`Tooltip` + `TooltipTrigger` +
> `TooltipContent`), built on Ark UI. The trigger is interactive; the content is passive.

## Reach for it when
You need to **name or briefly clarify an interactive control** on hover/focus — above
all an **icon-only control** (a button / toggle / segment with no visible text label),
a short hint, or a keyboard shortcut. Wrap the real control with
`<TooltipTrigger asChild>`. The content is one short line (or a title + a sentence).

**Rule of thumb: every icon-only button should carry a Tooltip** — a bare icon with no
label is misleading. The Tooltip is its *visible* label; the control **still** needs its
own `aria-label` as the *programmatic* name (see Locked). This is the icon-only slice of
a system-wide rule — label every interactive element meaningfully.

## Don't use it for
- **Anything the user must read or act on to succeed** → it's hover/focus-only, transient, and absent on touch. Put essential info inline (`FieldDescription`, visible `Text`) or in a `Popover`.
- **Interactive content** (links, buttons, a form, rich layout) → `Popover` (or `DropdownMenu` for a command list). Tooltip content is passive — the `interactive` prop only lets the pointer *reach* passive content (e.g. read a `Kbd`), it doesn't make a tooltip a place for controls.
- **Truncated / overflowing text** → `OverflowTooltip` — the dedicated sibling that reveals the full text *only when it's actually clipped*. Don't hand-roll a Tooltip for overflow.
- **Defining a word or abbreviation in running prose** → surface the definition inline (or behind a small *focusable* info button). A tooltip needs a focusable trigger and is scoped to interactive controls — don't wrap a prose word in a button or add `tabindex` to a `<span>` just to hang a tooltip on it.
- **A persistent message, status, or error** → the messaging ladder (`Alert` / `Banner` / `Field` / `Toast`). A tooltip vanishes; it can't carry a state.
- **The obvious** — a universally-understood icon (a close ✕), or repeating a label that's already visible. Use tooltips **sparingly**; if a screen needs them everywhere, the fix is clearer labels, not more tooltips.

## Locked — don't override
- **The trigger wraps a real, focusable element** via `<TooltipTrigger asChild>` (a `Button`, a link…). Never attach a tooltip to a non-focusable `<div>` or a bare static icon — keyboard and screen-reader users can't reach it. (Wrap a static icon in a `Button` instead of adding `tabindex`.)
- **A tooltip is supplementary, not the accessible name** — an icon-only control **still needs its own `aria-label`**; tooltip text is not a reliable accessible name. (Same rule the icon-only Button / ToggleButton / SegmentedControl carry.)
- **The look is fixed and automatic** — dark surface, `xs`/medium text, rounded, the 6px offset + auto-flip positioning, portal, hover/focus + Esc dismissal, fade/zoom animation. Don't restyle or hand-position it.
- **`Kbd` inside is first-class** — drop a `<Kbd>` in for a shortcut and it's auto-restyled to the tooltip's treatment (borderless, inverted). Don't hand-style the chip.
- It's a **label, not a container** — keep content to a line or two; real content escalates to `Popover`. (A fixed max-width / line cap is drawn in Figma but **not shipped in code** — don't rely on the tooltip to truncate long text for you.)

## Composition — the three sanctioned shapes
```tsx
<Tooltip>
  <TooltipTrigger asChild><Button variant="outline" color="neutral"><ChevronRight /></Button></TooltipTrigger>
  <TooltipContent>Right</TooltipContent>            {/* Default — one short line */}
</Tooltip>
```
- **Description** — a title + a sentence when one line of context helps: `<TooltipContent><Text size="xs" weight="medium">Title</Text><Text size="xs">…</Text></TooltipContent>`. Still brief — more than that → `Popover`.
- **With shortcut** — label + `Kbd`: `<TooltipContent>Add instance <Kbd>⌘</Kbd></TooltipContent>`.

## Judgment calls
- **`interactive`** — set `true` only when the pointer must reach the content (selectable text, a `Kbd` to read). A plain label leaves it default. Actual controls belong in a `Popover`, not behind `interactive`.
- **Delays / positioning default sensibly** (6px offset, auto-flip) — tune `openDelay` / `closeDelay` / `positioning` only for a specific need (e.g. a dense toolbar where the default delay feels sluggish). Side is automatic; override per layout. (Don't lean on a delay tweak to make a tooltip carry load-bearing info — if it's the *only* cue, it's not nonessential, and it belongs inline.)
- **Copy** — sentence case, concise, no imperative tone; name the control or its action and **don't repeat a label that's already visible**.

## Pairs with
- `Button` / any icon-only control — the trigger via `TooltipTrigger asChild` (and the control still gets its own `aria-label`).
- `Kbd` — the shortcut chip (auto-styled inside the content).
- `Popover` — the escalation when content is interactive or more than a brief hint.
- `OverflowTooltip` — the sibling for truncated text.

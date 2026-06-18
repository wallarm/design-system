# SplitButton — usage

> A layout wrapper that fuses a main-action Button with a chevron-trigger Button into one control. Presentation-only — all behavior comes from its children.

## Reach for it when
You have **one main action plus a short menu of variations of that same action** — Save / Save as draft / Save and publish; Export / Export as CSV / Export as PDF. The left button fires the most common choice immediately; the chevron opens the alternatives. It's usually a view's single primary action, so treat it as your one `primary` per view (variant/color logic lives in Button — don't re-derive it here).

## Don't use it for
- A single action with no variations → `Button`.
- A control whose whole job is to open a menu, or unrelated actions grouped together → a plain `Button` wired to `DropdownMenu`. The left half must *do* something on click, not just label the menu.
- Picking or showing a chosen value → `Select` (its `SelectButton`).
- Navigating to a page/URL → `Link`.

## Locked — don't override
- **The wrapper has no styling props.** No `variant`/`color`/`size` on `SplitButton` — Figma models those as one component, but in code you set them on the two child Buttons. Never reach for `<SplitButton color=… size=…>`.
- **Both halves share one cell of the grid** — identical `variant`, `color`, and `size` on both Buttons. They read as one control; a mismatch breaks the seam. Stay on Button's partial color×variant matrix.
- **The fused look is automatic** — inner corners square off and outline borders collapse into a single divider. Don't add your own radius, gap, or border between the halves.
- **The chevron only opens the menu; the left button carries the action.**

## Composition
`SplitButton` is presentation-only — it does **not** own the menu or any open state. You wire it: wrap the group in `DropdownMenu`, make the **chevron** Button the `DropdownMenuTrigger asChild`, and put the choices in `DropdownMenuContent` (see example).
- **Loading:** when the main action is in flight, set `loading` on the left Button and disable the chevron — don't let a variant fire mid-action.
- **Disabled:** if the action is unavailable, disable both halves; the menu only offers variants of an action you can't take.

## Pairs with
- `Button` ×2 — the required children (main + chevron-only); both on the same variant/color/size cell.
- `DropdownMenu` — the chevron's menu; compose it yourself, `SplitButton` won't.
- `NumericBadge` — optional count inside the left Button.

```tsx
<DropdownMenu>
  <SplitButton>
    <Button variant="primary" color="brand" size="large">Save</Button>
    <DropdownMenuTrigger asChild>
      <Button variant="primary" color="brand" size="large"><ChevronDown /></Button>
    </DropdownMenuTrigger>
  </SplitButton>
  <DropdownMenuContent>
    <DropdownMenuItem value="draft">Save as draft</DropdownMenuItem>
    <DropdownMenuItem value="publish">Save and publish</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

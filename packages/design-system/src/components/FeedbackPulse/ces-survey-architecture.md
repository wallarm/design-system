# Feedback Pulse — Architecture

## Overview
A popover-style component for collecting Customer Effort Score (CES) feedback on newly released features. Uses a 1–5 numeric scale with WADS `toggle-button` instances, and an optional free-form textarea that reveals after rating selection.

## Visual References
- **Primary**: Loom — numeric scale, labels at ends, textarea + submit
- **Secondary**: Vercel — clean, calm, professional feel

---

## Component Name
`feedback-pulse`

## Variant Properties

| Property | Type    | Options                             | Default   |
|----------|---------|-------------------------------------|-----------|
| State    | VARIANT | `Rating`, `Feedback`, `Submitted`   | `Rating`  |

## Component Properties (following WADS `Name#id:id` convention)

| Property  | Type    | Default                                    | Notes                                           |
|-----------|---------|--------------------------------------------|-------------------------------------------------|
| Question  | TEXT    | "How easy was it to use this feature?"     | Configurable per feature. Alternative wording: "How did we do?" with updated labels |
| Textarea  | BOOLEAN | true                                       | Visible in Feedback state, toggles textarea visibility |

---

## States

### State = Rating (initial)
User sees the question and 5 numbered buttons. No textarea yet.

```
┌─────────────────────────────────────┐
│  How easy was it to use       [X]   │
│  this feature?                      │
│                                     │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐    │
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │    │
│  └───┘ └───┘ └───┘ └───┘ └───┘    │
│  Very difficult    Very easy        │
└─────────────────────────────────────┘
```

### State = Feedback (after number selected)
One number is shown as selected (toggle-button Selected=On). Textarea and send button appear below.

```
┌─────────────────────────────────────┐
│  How easy was it to use       [X]   │
│  this feature?                      │
│                                     │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌═══┐    │
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │ ║ 5 ║    │
│  └───┘ └───┘ └───┘ └───┘ └═══┘    │
│  Very difficult    Very easy        │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Tell us why? (optional)     │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                         [ Send ]    │
└─────────────────────────────────────┘
```

### State = Submitted (confirmation, auto-dismissible)
Compact confirmation with timeout progress bar and close button. Styled as a light popover card with an auto-dismiss progress indicator (left-to-right fill rectangle).

```
┌─────────────────────────────────────┐
│ ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← timeout bar (absolute, stretches height)
│  ✓ Thanks a lot! — Wallarm Team  [X]│
└─────────────────────────────────────┘
```

---

## Existing WADS Components Used (instances, not recreated)

| Element              | WADS Component                    | Variant / Config                                                           | Key                                        |
|----------------------|-----------------------------------|----------------------------------------------------------------------------|--------------------------------------------|
| Number buttons       | `toggle-button`                   | Type=Outline, Color=Neutral, Size=Small, Icon only=Off, Left element=Off   | `c63426f6cb0e8b72b71fe41b50bfcf07cc822e28` |
| Selected number      | `toggle-button`                   | Same but Selected=On                                                       | (same set)                                 |
| Textarea             | `text-area`                       | Size=Default, Error=Off, Label=off, Description=off, Counter=off, Help text=off | `d69a6f9aa19f7433b32798f52f0ee244ea4b667a` |
| Send button          | `Button`                          | Type=Primary, Color=Brand, Size=Medium, Left element=Off, Label="Send"     | `9bc0755394bc26d3a759c452a0f06b5e9e16a891` |
| Close button (Rating/Feedback) | `Button`               | Type=Ghost, Color=Neutral, Size=Small, Icon only=On, icon swapped to `x`  | `9bc0755394bc26d3a759c452a0f06b5e9e16a891` |
| Close button (Submitted) | Internal button frame         | Absolute positioned, constraints: horizontal=MAX, vertical=CENTER          | — |
| Check icon           | `checkbox-check` (WADS Iconography) | 16×16, fill: `color-icon/success`                                       | `c829f698d49e8daa0cdae4f8a212defba1575a02` |
| Close icon           | `x` (WADS Iconography)           | —                                                                          | `35ddd651f5d0613dbec7d873d382be09d57a18fe` |

---

## Card Container Specs (matching WADS `popover` component)

All values below are sourced from the existing WADS `popover` component (`23df37f4c6de782e015675af6c0ef5396c56f7e9`).

| Property       | Token                             | Resolved Value |
|----------------|-----------------------------------|----------------|
| Background     | `color-bg/surface-2`              | white          |
| Border color   | `color-border/primary-light`      | light grey     |
| Border width   | `Border-width/border-1`           | 1px            |
| Corner radius  | `radius-12`                       | 12px           |
| Padding        | `spacing-12` (all sides)          | 12px           |
| Item spacing   | `spacing-8`                       | 8px            |
| Shadow         | Popover shadow effect style       | 2-layer drop shadow (0 2 4 black/10%, 0 4 6 black/10%) |
| Width          | **400px fixed**                   | not responsive |
| Clip content   | `true`                            | prevents child shadow overflow |

> Effect style ID from popover: `S:934163a1d21e159b7fe98255ab5992bf8b3b3238,2398:1020`

---

## Layer Structure

```
feedback-pulse (COMPONENT_SET, width=400 fixed)
│
├── State=Rating (COMPONENT, clipsContent=true)
│   ├── header (FRAME, horizontal, space-between, gap=spacing-8)
│   │   ├── Question (TEXT, configurable)
│   │   │   ├── Style: heading/sm/medium
│   │   │   └── Color: color-text/primary
│   │   └── close-button (INSTANCE — WADS Button Ghost/Neutral/Small/Icon only, x icon)
│   └── scale-group (FRAME, vertical, gap=spacing-4)
│       ├── scale-row (FRAME, horizontal, gap=spacing-8)
│       │   ├── toggle-button "1" (INSTANCE — Selected=Off, FILL width)
│       │   ├── toggle-button "2" (INSTANCE — Selected=Off, FILL width)
│       │   ├── toggle-button "3" (INSTANCE — Selected=Off, FILL width)
│       │   ├── toggle-button "4" (INSTANCE — Selected=Off, FILL width)
│       │   └── toggle-button "5" (INSTANCE — Selected=Off, FILL width)
│       └── scale-labels (FRAME, horizontal, space-between)
│           ├── "Very difficult" (TEXT — text/sm/regular, color-text/secondary)
│           └── "Very easy" (TEXT — text/sm/regular, color-text/secondary)
│
├── State=Feedback (COMPONENT, clipsContent=true)
│   ├── header (same as Rating)
│   ├── scale-group (same structure, but toggle-button "5" has Selected=On)
│   ├── text-area (INSTANCE — WADS text-area, all labels off)
│   │   └── Placeholder: "Tell us why? (optional)"
│   └── footer (FRAME, horizontal, align-right)
│       └── submit-button (INSTANCE — WADS Button Primary/Brand/Medium)
│           └── Text: "Send"
│
└── State=Submitted (COMPONENT, clipsContent=true, fixed height=48px)
    ├── timeout (RECTANGLE, absolute positioned)
    │   ├── Fill: color-component/bg-input-default
    │   └── Constraints: horizontal=STRETCH, vertical=STRETCH
    ├── check-icon (INSTANCE — checkbox-check, 16×16)
    │   └── Fill: color-icon/success
    ├── confirmation (TEXT)
    │   ├── Content: "Thanks a lot! — Wallarm Team"
    │   ├── Style: Geist Medium 14px (font vars bound)
    │   ├── Color: color-text/primary
    │   └── Layout: FILL width (grows to fill)
    └── close-button (FRAME + x icon instance, absolute positioned)
        ├── Constraints: horizontal=MAX, vertical=CENTER
        └── Icon fill: color-icon/primary
```

---

## Token Usage Summary (zero raw values)

### Spacing
| Usage                           | Token          |
|---------------------------------|----------------|
| Card padding (all sides)        | `spacing-12`   |
| Card item spacing               | `spacing-8`    |
| Scale group gap (numbers→labels)| `spacing-4`    |
| Scale row gap (between numbers) | `spacing-8`    |
| Header gap                      | `spacing-8`    |

### Typography
| Element          | Text Style            | Color Variable          |
|------------------|-----------------------|-------------------------|
| Question         | `heading/sm/medium`   | `color-text/primary`    |
| Scale labels     | `text/sm/regular`     | `color-text/secondary`  |
| Confirmation     | Geist Medium 14px (font variables bound) | `color-text/primary` |
| Textarea hint    | (inherited from WADS text-area component) | —                  |

### Colors
| Element                | Variable                         |
|------------------------|----------------------------------|
| Card background        | `color-bg/surface-2`             |
| Card border color      | `color-border/primary-light`     |
| Card border width      | `Border-width/border-1`          |
| Card radius            | `radius-12`                      |
| Check icon             | `color-icon/success`             |
| Close icon (Submitted) | `color-icon/primary`             |
| Timeout bar            | `color-component/bg-input-default` |

### Effects
| Element     | Style                          |
|-------------|--------------------------------|
| Card shadow | Popover shadow effect style (`S:934163a1d21e159b7fe98255ab5992bf8b3b3238`) |

---

## Close Button Approach

**Rating & Feedback states**: Use WADS `Button` component with `Type=Ghost, Color=Neutral, Size=Small, Icon only=On`, swapping the icon to the WADS `x` icon. This keeps it fully within the design system.

**Submitted state**: Uses a custom frame wrapper (8px padding, radius-8) with the WADS `x` icon instance inside. Absolute positioned with `horizontal=MAX, vertical=CENTER` constraints to pin it to the right center of the card. Icon color uses `color-icon/primary`.

---

## Interaction Notes
- Toggle buttons in scale-row use `Left element=false` — showing just the number text, no icons
- Each toggle-button has `layoutSizingHorizontal = FILL` to distribute evenly across the row
- In the Feedback state, exactly one toggle-button shows `Selected=On` to represent the chosen rating (button "5" selected as the default showcase)
- The textarea is optional (controlled by `Textarea` boolean property) — if hidden, the Feedback state just shows the send button
- The Submitted state has a timeout progress bar (absolute rectangle) that represents auto-dismiss progress (left-to-right fill). In code, animate its width from 0 to 100% over the dismiss duration
- The Submitted state uses `clipsContent=true` with fixed height (48px) to contain the timeout bar
- Question text is configurable — alternative wording "How did we do?" can be used with labels "Not well" / "Very well"
- Scale labels could be made configurable TEXT properties in a future iteration if needed

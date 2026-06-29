# Slider — implementation plan (code + Storybook)

> Step-by-step plan to build `Slider` + `Slider input` in the codebase, on top of **`@ark-ui/react/slider`**,
> following WADS conventions. Designed to be executed **collaboratively with review checkpoints** — each phase
> is a PR-sized chunk that can land in one attempt if green, or iterate if review flags something.
>
> **Requirements (the "what"):** [`docs/slider-handoff-requirements.md`](slider-handoff-requirements.md)
> **Rationale:** [`docs/slider-design-spec.md`](slider-design-spec.md)
> **Ark API:** https://ark-ui.com/docs/components/slider

---

## Build it with the team's skills
Devs build components through a skill-driven cycle — this plan runs **on top of** these, not beside them:

| Step | Skill | When |
|---|---|---|
| Pre-flight | **`/metrics-audit`** | Before coding — decide the interactive target(s) + any closed-target case (note below). |
| Scaffold | **`/new-component Slider`** (`Inputs`) | Phase 0 — generates `classes.ts`, `Slider.tsx`, `index.ts`, stories + barrel export. |
| Implement | `.claude/rules/` | Phases 1–6. |
| Document | **`/describe-component Slider`** | Phase 9 — generates `Slider.llm.md`. |
| Review | **`/review-pr`** | Before merge — compliance + quality. |

**Metrics target (confirm via `/metrics-audit`):** the real interactive node is the **thumb** (`role="slider"`, focusable). Single slider → consumer `data-*`/`aria-*` land on the thumb. **Range = two thumbs is a closed-target case** → expose the thumb as an addressable sub-component (or document in `Slider/ANALYTICS_GAPS.md`). No analytics-named props.

## Reference components (mirror these)
| Concern | Mirror |
|---|---|
| Field-context on the control (`useFieldContext()` → id / `aria-describedby` / `invalid`) | **Input**, **Textarea** |
| Error CVA (`error` → danger border + `focus-visible:ring-focus-destructive`) | **Input** `classes.ts` |
| Compound + `TestIdProvider`/`useTestId` cascade + exported sub-parts + `.figma.tsx` | **Checkbox**, **Radio**, **Select** |
| Label-above field chrome (`Field` + `FieldLabel`/`FieldDescription`/`FieldError`/`FieldIndicator`) | **Field** |

Slider is **an input**: the `Slider` control reads `useFieldContext()` like Input/Textarea (so a wrapping `<Field>` auto-wires label/aria/`invalid` to the Ark Slider root — the gap `NumberInput` left), and `Slider input` is the `Field`-chrome composition.

## Ground rules (apply in every phase)
From `.claude/rules/`:
- **CVA in `classes.ts`**, merged with `cn()`. No template-literal class concat.
- **`data-slot`** (kebab) on every part: `slider`, `slider-control`, `slider-track`, `slider-range`, `slider-thumb`, `slider-marker-group`, `slider-marker`, `slider-value`, `slider-label`.
- **`displayName`** on root + each sub-component. **`ref`** prop (React 19, never `forwardRef`). **Named exports only.**
- **No `any`**; **no hardcoded colors** — design tokens only.
- **Tokens in code = Tailwind utilities backed by the CSS vars**, not Figma variable IDs. Map the Figma tokens → utilities: track `color-states/primary-pressed`, fill `color-bg/fill/brand`, thumb `color-bg/surface-3` + border `color-bg/fill/brand`, text `color-text/primary`+`/secondary`, danger `color-text/danger`, `radius-full`. (Confirm exact class names against `semantic.css`.)
- **Compound = `data-testid` cascade** via `TestIdProvider` / `useTestId`.
- **Metrics:** arbitrary consumer `data-*`/`aria-*`/event props land on the **thumb** (the real interactive node), per `docs/metrics/contract.md`. No analytics-named props.
- Mirror the wrapping pattern of an existing **Ark compound** component (`SegmentedControl` = `@ark-ui/react/segment-group`, `NumberInput` = `@ark-ui/react/number-input`) — same file layout, export shape, Field wiring.
- **TDD for logic-heavy phases** (value math, clamp, range no-cross): failing test → implement → pass.

---

## Phase 0 — Pre-flight & scaffold  ·  *one shot*
**Goal:** targets decided, files scaffolded, compiling.
- **`/metrics-audit`** (pre-flight): confirm interactive target = thumb; record the range closed-target decision.
- **`/new-component Slider`** (category `Inputs`) → scaffolds `classes.ts`, `Slider.tsx`, `index.ts`, `Slider.stories.tsx` (`title: 'Inputs/Slider'`), and the barrel export. Add the rest: `Slider.test.tsx` (unit + analytics), `Slider.e2e.ts`, `Slider.llm.md`, `Slider.figma.tsx` (Code Connect) — plus one file per exported sub-part if compound (mirror Checkbox/Select layout).
- Confirm `@ark-ui/react` (`5.31.x`) is installed.
- **Accept:** `pnpm typecheck` + `lint` pass; the (empty) Slider imports in Storybook under **Inputs**.

## Phase 1 — Core single-value control  ·  *one shot → review*
**Goal:** a working single slider that drags + keyboards.
- Wrap Ark: `Slider.Root` (value `[n]`) → `Slider.Control` → `Slider.Track` → `Slider.Range` + `Slider.Thumb index={0}` (with `Slider.HiddenInput`).
- `classes.ts` CVA for track / range / thumb (tokens above, `radius-full`, fixed pixel geometry; single size).
- `data-slot` on each part; `ref` on root; `displayName`s.
- **Accept:** drag + arrow keys move the value in Storybook.
- **🔁 Checkpoint:** compare against the Figma `slider` default — track/fill/thumb proportions, colors.

## Phase 2 — States  ·  *one shot*
**Goal:** all states, token-driven, via Ark data-attributes.
- CVA maps: `:hover` and `data-focus` → **same** emphasized-thumb visual; `data-dragging` → Pressed; `data-disabled` → **root opacity 50%** + non-interactive; `data-invalid` → danger.
- **Accept:** Tab shows focus = hover; `disabled` dims the whole control; dragging shows pressed.

## Phase 3 — Range (`double`)  ·  *one shot*
**Goal:** two-thumb range.
- `value` length 2, `Slider.Thumb index={0|1}`, `thumbCollisionBehavior="none"`, `minStepsBetweenThumbs`; per-thumb `aria-label` (`["Minimum","Maximum"]`).
- **Accept:** both thumbs drag, never cross; value is `[low, high]`.

## Phase 4 — Ticks / discrete / labeled  ·  *one shot*
**Goal:** discrete + ordinal scales.
- `marks: {value, label?}[]` → `Slider.MarkerGroup` + `Slider.Marker`. Snap via `step`.
- Labeled scale: `getAriaValueText` returns the label; visible value renders the label too.
- Tick **click-to-jump:** add a `Slider.Marker` click handler (set nearest thumb) — or defer (note in story).
- **Accept:** ticks render; a `Low/Med/High` scale shows labels + correct `aria-valuetext`.

## Phase 5 — Value display + inline NumberInput  ·  *2 steps*
**Goal:** value readout + precise entry.
- **5a Value:** persistent value (label-right) via `Slider.ValueText`/value node, **or** on-drag tooltip (`data-dragging`) — enforce mutual exclusivity.
- **5b Inline input:** compose the existing **`NumberInput`**, two-way bound through `onValueChange` / Ark context `setValue`; clamp to `[min,max]`, snap to `step`; range = two inputs.
- **Accept:** typing updates the slider and clamps; tooltip shows on drag only when no persistent value.

## Phase 6 — `Slider input` field  ·  *one shot*
**Goal:** the form field — Slider as a first-class input.
- In `Slider`, **read `useFieldContext()`** (like Input/Textarea) and `mergeProps` the field's ids / `aria-describedby` / `invalid` onto the Ark `Slider.Root`.
- `Slider input` composes the **Field chrome**: `FieldLabel` (+ `FieldIndicator` when required) / value / `FieldDescription` / `FieldError`; map field `error` → Ark Root `invalid` (`data-invalid` styles the control + danger message). Value-beside-label follows the Figma `Label value` slot.
- **Accept:** `<Field required>` + `Slider input` auto-wires label/aria; error shows danger border + message — same behavior as Input.

## Phase 7 — Accessibility pass  ·  *verify*
- Confirm Ark ARIA (`role="slider"`, valuemin/max/now), `aria-valuetext` for labels, keyboard table, focus visibility, range per-thumb labels.
- Run axe (in e2e) on key variants.

## Phase 8 — Tests  ·  *ideally alongside each phase*
Per `docs/e2e-test-rules.md`:
- **Unit (Vitest):** value math, snap/clamp, range no-cross, label mapping.
- **Component (Testing Library):** drag, keyboard, range, disabled, error, input sync.
- **E2E (Playwright):** screenshot per variant · interaction · accessibility groups.
- **`data-testid` cascade** verified; **metrics** test — consumer `data-analytics-*` lands on the thumb.

## Phase 9 — Docs, Code Connect & review  ·  *one shot*
- **`/describe-component Slider`** → `Slider.llm.md` (when / when-not / locked / pairs-with: NumberInput, SegmentedControl, Field).
- Storybook stories: single · range · ticks · labeled · with-input · all states · field with error.
- **Code Connect** in `Slider.figma.tsx` (mirror `Checkbox.figma.tsx`): map Figma `slider` (`11354:181`) + `slider-input` (`11358:1807`) → the code components.
- **`/review-pr`** on the diff for compliance + quality before merge.

---

## Sequencing & risks
- **Order:** 0→1→2 (core + states, checkpoint) → 3→4→5 (capability) → 6 (field) → 7→8 (quality) → 9 (docs). Tests ride alongside, not bolted on at the end.
- **Risk — Ark version drift:** verify prop/part names against the installed `@ark-ui/react` version before each phase (the API table in requirements §12 reflects current docs).
- **Risk — Field-context gap:** `NumberInput` doesn't consume `Field` today; our `Slider input` **should** (Phase 6) — don't inherit that gap.
- **Risk — token mapping:** Figma tokens are library variables; in code they're the CSS-var-backed Tailwind utilities. Confirm the exact utility for `color-states/primary-pressed` (track) early.
- **Effort:** Phases 0–2 are a confident single sitting. 3–6 each ~one focused session with a review checkpoint. 7–9 fold in as we go.

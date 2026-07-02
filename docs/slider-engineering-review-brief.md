# Slider — engineering review brief

> **Purpose:** a focused, fresh-eyes engineering pass before the `Slider` branch goes to an engineer to review + merge. The component was built from scratch (designer + AI) on branch `artem-tryout-slider`. This pass exists to catch **pattern drift vs the existing codebase** and to **pressure-test the architecture decisions** — things a builder can't objectively self-review. **Start a clean session for it** (no build-context bias).
>
> Keep it tight: review the decisions below + the sibling-idiom diff. **Do not re-derive or re-do what's already verified.**

---

## ✅ Already verified — don't repeat

- **`typecheck` + `lint` (biome) clean** for the Slider.
- **Unit/component:** `Slider.test.tsx` — 18 tests pass (render, value model, range no-cross bounds, ordinal `aria-valuetext`, states, Field context, `data-testid` cascade, analytics-on-thumb).
- **E2E:** `Slider.e2e.ts` — interactions + accessibility groups pass in a real browser; visual screenshots are CI-baselined (per `docs/e2e-test-rules.md`).
- **Token audit (done):** no raw hex / `rgb()` / arbitrary color or text styles. Every color, shadow, radius, type size, and gap is on a DS token, matched to Figma per-part. The only non-token literals are **forced or deliberate**: `rounded-[1px]` track/fill (Figma exports the same; no `radius-1` token), `border-[3px]` pressed handle (repo has **no** border-width tokens — `border-3` is a verified no-op), `opacity-50` disabled (spec), `size-44` thumb touch target (WCAG 2.5.8).
- **Browser-verified behaviors:** drag, range no-cross, ticks/labeled + tick click-to-jump, on-drag tooltip (DS `Tooltip`, controlled by drag), inline-input two-way bind + clamp, Field wiring (label/invalid/disabled cascade).
- **DS compliance:** `/review-pr` was run at end of build (CVA / `cn` / `data-slot` / `displayName` / `ref` / `className` / exports / tokens / metrics / stories / a11y). *Optional:* the later design-polish changes (handle border, ticks, tooltip→DS component, inline `NumberInput`→`Input`, field order, value-text style, story add/removes) landed **after** that run and were each lint/typecheck/test/browser-verified — a final `/review-pr` over the complete diff is cheap if you want one clean sweep.

---

## 🔍 Review THIS — the judgment calls (the high-value part)

1. **Flat API + documented closed-target gap, vs a compound `SliderThumb`.** Range renders 2 thumbs; the consumer pass-through (`{...rest}`, incl. `data-analytics-*`) lands on the **primary thumb only**. Per-thumb attribution on the high thumb is an **accepted, documented gap** (`Slider/ANALYTICS_GAPS.md`, CG-1), chosen to honor requirements §2/§3 (flat API, private atoms). The metrics contract permits **either** an exported seam **or** a documented gap — confirm flat is the right call here, or decide to export the thumb.
2. **Slider consumes `Field` context** (`useFieldContext`, like `Input`/`Textarea`) — a **deliberate divergence from `NumberInput`** (which doesn't, a known DS gap). Confirm this is the wanted direction.
3. **No bundled `SliderField` component.** "Slider input" = plain Field composition (`<Field><FieldLabel/><Slider/><FieldDescription/></Field>`), consistent with every other input (no `InputField`/`SelectField` exists). The persistent value-beside-label readout is also a **composition** (shown in stories), not a Slider prop. Confirm this matches house preference.
4. **Inline value input is a plain `Input`** (numbers-only via `inputMode`, no stepper) — this **supersedes requirements decision #8** ("inline input must be `NumberInput`"), changed on the designer's call for a quieter look. Confirm + update the requirements decision log if keeping.
5. **`Slider.figma.tsx` Code Connect** — variant→example mappings (`Double`/`Ticks`/`Input`) are best-effort against the WADS file; validate property names + examples at `figma connect publish`.
6. **Sibling-idiom diff.** Read the Slider side-by-side against representative siblings and flag any structure / typing / test-convention drift:
   - Ark-compound wrapping → `SegmentedControl`, `NumberInput`.
   - Field-aware leaf + `data-testid` cascade → `Input`, `Checkbox`.
   - Check: file layout, export shape (`index.ts` + root `src/index.ts` barrel), `TestIdProvider`/`useTestId` usage, `ref`/`displayName`/no-`any`, story conventions (`satisfies Meta`), e2e naming.

---

## Where things are

- **Component:** `packages/design-system/src/components/Slider/` — `Slider.tsx`, `classes.ts`, `index.ts`, `Slider.stories.tsx`, `Slider.test.tsx`, `Slider.e2e.ts`, `Slider.figma.tsx`, `ANALYTICS_GAPS.md`, `Slider.llm.md`.
- **Spec & rationale:** `docs/slider-handoff-requirements.md` (the agreed "what" + decision log), `docs/slider-design-spec.md` (research/when-to-use), `docs/slider-implementation-plan.md` (the build plan).
- **Branch:** `artem-tryout-slider`. The Slider work is currently **uncommitted in the working tree** (the branch also carries unrelated AI-ready-DS docs commits — keep the eventual Slider commit scoped to the Slider files + the two barrel exports).
- **Figma:** WADS Components, Slider page — `node-id=11354-3`.

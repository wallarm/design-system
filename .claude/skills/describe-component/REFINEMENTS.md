# `describe-component` — refinement log

> Parking lot for gotchas, gaps, and friction found while **running** the skill on real components. Don't stop a run to fix the skill — park it here in one line and keep authoring. Periodically (or when a batch is done), **harvest**: fold the confirmed ones into `SKILL.md` / the template, then mark them ✅.

## How to use
- **Capture (during/after a run):** the skill missed a step, made a wrong assumption, left something ambiguous, or you answered the same off-script question twice? Add a row. Keep going.
- **Harvest (periodic):** review 🅿️ rows, fold the real ones into [`SKILL.md`](SKILL.md), mark ✅ (or ❌ with a reason). The `skill-creator` skill (`/skill-creator`) is a good companion for the rewrite pass.

**Status:** 🅿️ Parked · ✅ Folded into skill · ❌ Won't fix

## Backlog

| Date | From run | Gotcha / gap | Suggested skill change | Status |
|---|---|---|---|---|
| 2026-06-12 | BulkBar | The tier-list target name was **not an importable component** — it was internal plumbing composed by other components. The skill jumps straight to "read `{Name}/` → save `{Name}/{Name}.llm.md`" with no check that `{Name}` is real. | Add an early **"verify the target"** step: confirm `{Name}.tsx` exists and `{Name}` is exported from the package index. If it's internal plumbing or a sub-component, redirect the file to the real exported host family — and tell the designer why. | 🅿️ Parked |
| 2026-06-12 | BulkBar | Author didn't know a **sub-component** (e.g. `SelectionBulkBar`, `TableActionBar`) can't be documented on its own — the metadata generator keys `.llm.md` strictly by **top-level component directory**. | In step 5 (Save), state the keying rule explicitly: a `.llm.md` only takes effect at `components/{TopLevel}/{TopLevel}.llm.md`; sub-component guidance belongs in the parent's file. | 🅿️ Parked |
| 2026-06-12 | BulkBar | The designer's verbal answer ("secondary + icon") **conflicted with Figma + code** (brand + icon). The skill has no guidance for resolving source conflicts. | In steps 3–4, add: when the designer's answer conflicts with Figma/code, surface the conflict, draft to the authoritative source (usually Figma), and flag that line for explicit sign-off. | 🅿️ Parked |
| 2026-06-12 | BulkBar | Figma settled the button recipe — but the designer volunteered the node URL only mid-interview (no Code Connect file, no node id in code). | Strengthen step 0: if no node id is in the code, ask for the Figma URL up front, and note that the designer often has it even when the code doesn't — it frequently settles styling and locked rules. | 🅿️ Parked |
| 2026-06-12 | BulkBar | A deep component (`Table`) needed only **one feature** (the action bar) documented now → wrote a partial sheet with a TODO. "Partial is fine" is in the skill, but not how to scope a partial when documenting a cross-cutting feature rather than the whole component. | Note in step 5: a feature-scoped partial is fine — lead with a one-line scope + a `TODO` banner naming what's still uncovered. | 🅿️ Parked |
| 2026-06-12 | BulkBar | (Strategy, not the skill) The §8 deep-tier list contained a non-component (BulkBar) and omitted one that needed a sheet (Table). | Validate the deep-tier list against actual package exports; tracked in `docs/ai-ready-ds-coverage.md`. | 🅿️ Parked (strategy) |

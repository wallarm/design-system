# `storybook-docs` — refinement log

> Parking lot for friction found while **running** this skill on real components.
> Don't stop a run to fix the skill — add a one-line row and keep writing.
> Harvest periodically: fold the confirmed ones into `SKILL.md` or the reference
> files, then mark them.

## How to use

- **Capture (during or after a run):** the skill missed a step, made a wrong
  assumption, left something ambiguous, or you had to answer the same off-script
  question twice? Add a row and carry on.
- **Harvest (periodic):** review the parked rows, fold the real ones in, mark
  them. `/skill-creator` is a good companion for the rewrite pass.

Keep the three parking lots distinct, because mixing them loses things:

| Lot | For |
|---|---|
| This file | friction with the **skill** |
| `docs/storybook-docs-findings.md` | real problems in a **component** |
| `docs/ai-ready-ds-content-guidelines.md` | **microcopy** rules that generalise |

**Status:** 🅿️ Parked · ✅ Folded into skill · ❌ Won't fix

## Backlog

| Date | From run | Friction / gap | Suggested change | Status |
|---|---|---|---|---|
| 2026-08-24 | Checkbox | The first draft asserted a wrapped-label rule three reference systems agree on, without checking our own classes — `Checkbox.tsx` uses `items-center`, so the claim was wrong for us. Caught by reading the source, not by the references. | Step 1 now says to check the component's own tokens and classes before asserting behaviour, and step 3 says to document what we ship and park the divergence. | ✅ Folded (2026-08-24) |
| 2026-08-24 | Checkbox | Consulted only the two most relevant systems (Nord, Pajamas), following `describe-component`'s selective rule. Artem corrected it: consult **all seven, every time**. | The roster is mandatory, with a convergence filter to keep the budget. | ✅ Folded (2026-08-24) |
| 2026-08-24 | Button + Slider (eval runs, found independently) | Step 2's Figma recipe **dead-ends**: you cannot walk from a component node up to the page holding it. `get_metadata` with no `nodeId` returns only the file's cover page and there is no parent traversal, so the `Documentation` / `Notes` frames are unreachable without a node id. Both runs were rescued by `{Name}.figma.tsx`, which hard-codes the node URLs. | Step 2 now opens with "read `{Name}.figma.tsx`", says the upward walk is impossible, and tells the author to say so and move on rather than burning the run. `{Name}.figma.tsx` added to the step-1 source table. | ✅ Folded (2026-08-24) |
| 2026-08-24 | Slider + Stack (eval runs) | The roster marked **GitLab Pajamas** fetchable; it now 302s to a GitLab auth flow and the browser fallback hits bot verification. Also, some systems simply don't ship a component (Carbon has no layout pages, Primer no slider), which reads as a failed lookup rather than a signal. | Pajamas marked unreachable with the open-source repo as fallback; added that a system having nothing to say is itself a finding — when several don't document a shape, the guidance has to come from us. | ✅ Folded (2026-08-24) |
| 2026-08-24 | Slider (eval run) | Existing prose can be **factually wrong**, not just over budget — `WithInput` claimed live-updating and clamping, while `SliderInput` holds an uncommitted draft and commits on blur or Enter. The skill only warned about length. | Step 0 now names three failure modes for inherited prose (over budget / wrong altitude / factually wrong) and says to verify existing sentences against the source as carefully as your own. | ✅ Folded (2026-08-24) |
| 2026-08-24 | Stack (eval run) | Both arms overran the 120-word restraint bar for a six-story primitive (201 with the skill, 306 without), so the assertion may be mis-calibrated even though the skill clearly worked (one sentence vs three). | Watch across more primitives before changing the standard; the budget is per-sentence, not per-page, so a six-story page legitimately carries six sentences. | 🅿️ Parked |

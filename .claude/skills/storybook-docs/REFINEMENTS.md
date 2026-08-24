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

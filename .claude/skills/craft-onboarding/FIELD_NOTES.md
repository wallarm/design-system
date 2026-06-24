# craft-onboarding — field notes (the self-learning log)

> Gaps and lessons caught while **running this skill on real features**. This file is
> the skill's memory. It is **NOT loaded on a normal run** — it's appended to during a
> run and read only during a [HARVEST](references/HARVEST.md). Keep entries to one dated
> line. Don't fix the skill mid-run — park it here and keep helping the requester.

## When to append an entry
- The requester corrected you (wrong pattern, wrong copy, wrong target).
- The gate felt genuinely ambiguous for a real request (you weren't sure which rung).
- The `Tour` API needed a shape the recipes don't cover.
- This skill and `Tour.llm.md` disagreed (the doc wins — log the drift).
- You couldn't discover a target, or couldn't produce a preview.
- A real `Tour` *component* limitation surfaced → ALSO route it to the repo backlog
  (`Tour` docs / `docs/ai-ready-ds-judgment-backlog.md`), not only here.

## Promotion rule (guards against overfitting to one weird run)
A note graduates into `SKILL.md` / a reference **only** when it's been seen **≥2–3
times** OR it's important enough to earn a **new eval case**. Anything promoted as a
rule ships *with* an eval (eval-first). Promotion + compaction happen at harvest, never
mid-run.

**Status:** 🅿️ Parked · ✅ Harvested into the skill · ❌ Won't generalize

## Log
| Date | From | Note | Status |
|---|---|---|---|
| 2026-06-24 | iter-1 eval (exec) | A recipe showed analytics across two `onFinish` references — read as a duplicate-key footgun. Use a single `onFinish`. | ✅ Harvested (v2 recipes) |
| 2026-06-24 | iter-1 eval (grader) | A *skipped* tour re-showed because the seen-flag was set only on finish/dismiss. Set it on `onSkip` too. | ✅ Harvested (v2 recipes + launch contract) |
| 2026-06-24 | iter-1 benchmark | v1 tied a doc-armed baseline (100%/100%): its judgment overlapped `Tour.llm.md`. The skill's real edge must be discovery + preview + governance + a learning loop, not restating the doc. | ✅ Harvested (v2 P0–P3) |
| 2026-06-24 | iter-1 graders | Assertions didn't reward the hardest real move (deferred-mount drawer target via an interactive step). Make it explicit in recipes + the rubric, and test it. | ✅ Harvested (deferred-mount recipe + Step-8 rubric + iter-2 eval) |
| 2026-06-24 | iter-2 eval-4 (with-skill + grader) | Recipe D pointed `waitForStepEvent('change')` at the DS `Select` *trigger* ref, but `Select` portals its menu + renders a `HiddenSelect`, so the option click never bubbles to the wrapper — the step would hang. Re-target the inner native `<select>` (`querySelector`), like the Tour stories' checkbox→input override. | ✅ Harvested (Recipe D fixed + portaled-controls caveat) |
| 2026-06-24 | iter-2 eval-3 (with-skill) | The "multiple teams all want a login tour" collision is a recurring real shape handled by playbook §4b but has no dedicated worked example / coordinator recipe. Add one if it recurs. | 🅿️ Parked (seen 1× — promote on the next sighting) |
| 2026-06-24 | iter-2 graders (×3) | Assertions still under-reward the skill's *restraint* — "route away / build nothing / down-select to a lighter surface." Several ties hid a real with-skill edge. Add an assertion like "authors no Tour code when the gate says lighter" for the route-away evals. | 🅿️ Parked (clear pattern — promote into the eval set next harvest) |

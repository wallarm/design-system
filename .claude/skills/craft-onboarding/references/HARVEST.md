# Harvest — fold field notes back into the skill (periodically, not every run)

The skill improves by harvesting [`FIELD_NOTES.md`](../FIELD_NOTES.md) on a cadence
(every ~10 real runs, or monthly), **not** on every run. The job is as much *pruning*
as adding — an append-only skill rots (performance degrades well before the context
limit; stale advice misleads). Net size should stay roughly flat.

Run this when asked to "harvest craft-onboarding" (or on the cadence):

1. **Read** `FIELD_NOTES.md`. Cluster entries by theme.
2. **Decide each cluster:**
   - **Promote** → into `SKILL.md` or a reference — *only* if seen **≥2–3×** or it's worth an eval. Keep it lean; prefer a sharper existing line over a new one.
   - **Add an eval** → if you promote a rule, add/refresh a case in `evals/evals.json` (eval-first; a promoted rule with no eval is a future regression).
   - **Route** → a real `Tour` *component* limitation goes to the repo backlog (`Tour` docs / `docs/ai-ready-ds-judgment-backlog.md`), not into this skill.
   - **Discard** → single-run quirks that didn't recur.
3. **Compact (the part people skip):** merge duplicated guidance, delete superseded
   lines, move any deprecated pattern into a collapsed "old patterns" note rather than
   leaving it inline. Re-check `SKILL.md` is still lean (well under 500 lines) and that
   every reference is linked one level deep from `SKILL.md`.
4. **Clear** harvested entries (mark ✅ or remove). Leave 🅿️ ones that haven't hit the
   promotion threshold yet.
5. **Re-validate:** run the eval set (see `evals/evals.json`). Keep the **frozen**
   regression cases *unchanged* and *not* tuned against — they catch drift. Tune only
   against the growing set.

## Guardrails
- **Promotion threshold is the overfit guard** — don't turn one odd request into a rule.
- **Compaction is the bloat/rot guard** — adding without pruning is how the skill degrades.
- **Frozen-vs-growing eval split is the Goodhart guard** — never optimize against the held-out cases.
- **`Tour.llm.md` stays the contract of record** — if a note is really about the component, fix the doc/component, not the skill.

---
name: craft-onboarding
description: >-
  Design and generate a best-practice product-onboarding or feature-introduction
  experience using the design system's `Tour` component — autonomously, for a
  designer or PM with no engineer in the loop. Use this whenever someone wants to
  onboard users to a feature, introduce / announce / promote / launch a new feature,
  build a product tour, guided walkthrough, coachmark, spotlight, first-run or
  activation flow, "show users around", or improve adoption / fix drop-off on a new
  feature — even if they don't say the word "Tour". It decides FIRST whether a guided
  tour is even the right tool (often it isn't), then discovers the target UI, drafts
  the steps + copy, wires it, and produces a preview you can SEE. Reach for it for any
  "help users discover / learn / adopt X" request, not just literal "make a tour" asks.
---

# Craft Onboarding

Turn "we're launching feature X — help people find and use it" into a **wired,
best-practice, previewable** onboarding experience built on the design system's
`Tour` component — driven from a plain-language brief, no React or selectors required
of the requester.

## The core idea: the component renders; this skill *judges, governs, and previews*

The `Tour` component owns presentation; **`Tour.llm.md` owns the API + copy contract,
and it wins on any conflict** — don't restate it, point to it. This skill adds the
four things neither the component nor a capable generalist gets for free:

1. **Judgment** — is a guided tour even the right tool? (Usually not.)
2. **Discovery** — find the *real* UI elements to anchor to, instead of guessing.
3. **Governance** — the launch contract (segment, trigger, metric, frequency, sunset) that keeps onboarding a company standard, not company-wide noise.
4. **Preview** — a runnable artifact the requester can actually see.

Grounding (read only when a step says to): UX evidence + governance + lifecycle →
[`references/onboarding-playbook.md`](references/onboarding-playbook.md); code shapes →
[`references/tour-recipes.md`](references/tour-recipes.md); finding anchor elements →
[`references/target-discovery.md`](references/target-discovery.md); making a preview →
[`references/preview-recipe.md`](references/preview-recipe.md).

## Intake — the only three things to ask
Keep it to plain language; derive everything else.
1. **What's the feature, and what's the ONE thing a user should be able to do after?**
2. **Where does it live?** — a route/screen name, or a running URL if there is one.
3. **Who is it for, and when should it appear?** — segment + trigger moment.

If the requester already gave enough to answer the gate, don't re-ask — proceed.

## Step 1 · The gate — read nothing else yet
This is the fast path and the riskiest decision. **Default verdict: NOT a multi-step
tour.** Resolve ambiguity toward the lightest tool. **Decompose the request** — if it
mixes a legitimate need with an anti-pattern ("make an 8-step tour AND autostart on
login"), split them and answer each; don't pattern-match the whole thing into a tour.

| What's actually being asked | Right tool | Tour? |
|---|---|---|
| Mark something new / unread | a `Badge` "New" or inline hint | ❌ |
| Explain one control | `Tooltip` (or a built-in field/column description) | ❌ |
| "What's new" across several features | `Banner` / changelog, time-boxed | ❌ |
| First-run with nothing on screen | `EmptyState` (may *launch* something) | ❌ |
| The screen is just confusing / error-prone | **fix the UI** (validation, defaults, inline help) — a tour hides bad UX, doesn't fix it | ❌ |
| Re-engage lapsed / absent users | re-engagement channel (email/notification) + a contextual nudge on their *next* visit | ❌ |
| Drive **one** activation action (first scan, first rule) | a **focused** path: empty-state CTA + at most a 1–2 step *interactive* nudge | rarely |
| Announce **one** feature in context, non-blocking | a **single** `beaconStepEffect` step | ✅ 1 |
| A genuinely unfamiliar **multi-step workflow** | a **multi-step** Tour | ✅ |

If it's not a tour: say so plainly, name the right tool, give the one-line why, and
**stop** (recommending the lighter tool *is* the win). Sourced reasoning to quote is in
the playbook's §1–§2. Otherwise continue.

## Step 2 · Pin the one goal
One sentence: *"After this, the user can ___."* A second goal is a second (separately
triggered) flow. No feature-dumping. Name the target elements, the entry/trigger, and
the user value (this becomes the copy's spine).

## Step 3 · Shape it  → skim [`references/tour-recipes.md`](references/tour-recipes.md)
Map the goal to step types + effects: open with a `dialog` only if orientation helps;
`tooltip` coachmarks anchored to real elements; `beaconStepEffect` for non-blocking
discovery; **`waitForStepEvent` for any step where the user should *do* the action**
(higher completion, and required when a later target only mounts after an interaction —
the deferred-mount case). Cap at **3–5 steps, one highlight at a time.**

## Step 4 · Discover the real targets  → [`references/target-discovery.md`](references/target-discovery.md)
Don't invent selectors. **Running app:** snapshot it (Playwright MCP) and pick elements
by accessible name, capturing their `data-testid`. **Static repo:** grep the target
screen for existing `ref` / `data-testid` / `data-slot`; if a needed anchor has none,
emit the one-line diff to add a `ref`. This is the "click-the-element" gesture a no-code
tool gives a PM — do it for them.

## Step 5 · The launch contract (governance + lifecycle)
Fill these with sensible defaults and surface them — this is what makes onboarding a
*standard*, not noise. (Detail + sources: playbook §2.)
- **Segment + trigger** — who sees it, fired by what moment (prefer contextual / on-demand over blanket-on-login).
- **Activation metric** — the one event that means it worked (e.g. first-scan completed), not "tour completed."
- **Frequency + show-once** — persist a "seen" flag, set on finish/dismiss **and skip**; cap concurrent flows (don't stack a second prompt on a screen that already has one).
- **Sunset** — when does it retire? (feature adoption clears a bar, or a date.)

## Step 6 · Write the copy
`Tour.llm.md` + [`docs/ai-ready-ds-content-guidelines.md`](../../../docs/ai-ready-ds-content-guidelines.md)
**own** the rules — follow them, don't paraphrase. The spine to keep in mind:
benefit-first titles, value before mechanics, one idea per step, "Skip" always present,
never "OK". On a `waitForStepEvent` step the prompt is the step *description*, not a button.

## Step 7 · Emit + preview  → [`references/preview-recipe.md`](references/preview-recipe.md)
Default deliverable is a runnable **`FeatureTour.stories.tsx`** with a `play` function
that auto-runs the tour, **rendered** (Storybook / `Claude_Preview` MCP) so the
requester gets a screenshot/URL they can see — the analog of a no-code "preview". Ship
the raw wiring (`steps` + `useTour` + `<Tour/>`) as the secondary, engineering-facing
artifact, following the recipes exactly (config-driven, `target: () => ref.current`,
never compose internals).

## Step 8 · Self-critique, then hand off
Before presenting, score your own output against this rubric, **name any miss, and
revise once**:
- [ ] Gate honored — a tour is genuinely right (not a Badge/Tooltip/Banner/empty-state job); mixed requests were decomposed.
- [ ] One goal · 3–5 steps · no feature-dump · one highlight at a time.
- [ ] Targets are real (discovered, not guessed); deferred-mount steps gate on the interaction that mounts the next target.
- [ ] Launch contract filled: segment/trigger, activation metric, frequency + `onSkip` show-once, sunset.
- [ ] Interactive steps where the user should act; copy follows `Tour.llm.md`; Skip always available.
- [ ] A preview artifact was produced (or it's explained why not).

## When you hit a gap — park it (don't fix mid-run)
This skill is meant to **learn from real use**. During a run, append a dated one-liner
to [`FIELD_NOTES.md`](FIELD_NOTES.md) when: the requester corrects you; the gate felt
ambiguous for a real case; the `Tour` API needed a shape the recipes don't cover; the
skill and `Tour.llm.md` disagreed; or you couldn't discover a target / produce a
preview. Keep working — parking is cheap, promotion is deliberate. A component
*limitation* also goes to the relevant repo backlog (the Tour docs / design-judgment
backlog), not just here. Harvest folds notes back later → [`references/HARVEST.md`](references/HARVEST.md).

## Notes
- **Output is a prototype** — stub governance (a `localStorage` "seen" flag, logged analytics); engineering wires production. Never let "needs a backend" block the prototype.
- **`Tour.llm.md` is the contract of record.** If this skill ever disagrees with it, the doc wins — and that's a `FIELD_NOTES.md` entry.
- **"No tour" is a first-class, celebrated outcome.** The lightest sufficient tool wins.

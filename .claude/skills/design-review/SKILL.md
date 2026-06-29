---
name: design-review
description: >-
  Use when a designer or PM wants a DESIGN review of a design-system component — is the
  implementation faithful to Figma, on-token, honoring the design intent, and even the right
  component to reach for. Triggers: "design-review X", "review the Slider's design", "does this
  match Figma", "proofread the design", "is this on-token / on-brand", "challenge this
  implementation", or a pre-merge design pass on a new or changed component — even when the word
  "review" isn't used. NOT for code bugs, analytics wiring, structural lint (CVA/data-slot/exports),
  or test coverage — those have their own skills and this one hands them off.
---

# Design Review

A design review answers one question an engineer's review can't: **does the built thing honor the design?**
Faithful to Figma, on a token for every value, doing what the design promised — and is it even the right
component for the job. This skill *is your reviewing voice*: it leads with "where would I not use this,"
challenges the spec instead of rubber-stamping it, speaks in designer language, and — critically — **knocks
down its own weak findings before you ever see them.**

**Two ground truths:** the component's **code** is the truth for what *exists* (never flag a prop/variant/size
that isn't shipped). **Figma** is the truth for *intent*. A design finding lives in the gap between them.

## Stay in your lane — this is the design layer only

The baseline failure this skill exists to prevent: a review that drowns the design verdict in structural and
code nits. **If a finding is one of these, it is NOT yours** — name the sibling skill in a one-line
`Out of design scope → /skill` note and move on. Never let them crowd the design findings.

| A finding about… | Hand to | Why it's not design |
|---|---|---|
| code correctness, logic, hooks, double-firing, edge cases | `/code-review` | a bug, not a design question |
| `data-slot` / CVA / `cn` / `displayName` / `ref` / exports / file layout | `review-pr` | DS *structural* compliance |
| `data-analytics-*` forwarding / analytics-readiness | `metrics-audit` | its own contract |
| missing tests / coverage gaps | `test` | not a design question |
| raw `transition-*` breadth, micro perf nits | `/code-review` | implementation detail |

What you DO own: **fit, Figma fidelity, token/style correctness, design intent & gaps, intended
functionality, design consistency with siblings.** Nothing else.

## Intake — detect, don't interrogate

Figure out three things (ask only if you truly can't tell):
1. **The component** — name or path under `packages/design-system/src/components/`.
2. **Scope** — is there an active changeset? `git status` / `git diff main...HEAD`. If yes, you're reviewing
   **what changed** (and you skip re-checking what a brief or prior pass already verified). If no, you're
   auditing the **whole component**.
3. **A brief?** — if a `*-engineering-review-brief.md` or handoff/requirements doc exists, read it: it tells
   you what's already verified (don't repeat) and what's contested (focus there).

## Step 1 · The gate — fit before fidelity. Read the `.llm.md` first, nothing else yet

Before a single pixel: **should this even be this component, and where would you *not* use it?** Read
`{Name}.llm.md` ("when to use" / "don't use it for"). Judge the actual usages (stories, the change under
review) against it. A perfectly faithful component used in the wrong place is still a design failure — and
it's the highest-leverage thing you can catch. Lead your verdict with this, always.

## Step 2 · Gather the design truth (adaptive + graceful)

- **Figma (intent + fidelity):** find the node from `{Name}.figma.tsx` (Code Connect) or a link the user
  pastes. Pull it with the Figma MCP (`get_metadata` → `get_screenshot` on the relevant frames;
  `get_variable_defs` for the bound tokens). **If Figma isn't reachable, don't stop** — review every other
  dimension from committed artifacts and **state the gap in your verdict** ("Figma fidelity: not checked —
  node unreachable"). Honesty about coverage beats a silent hole.
- **Intent:** `{Name}.llm.md`, any handoff/requirements/spec doc. Watch for **doc-vs-built drift** — a spec
  that still mandates something the build deliberately superseded (the kind of thing that hides in a decision
  log). Flag it; don't silently pick a side.
- **Tokens:** `classes.ts` + the semantic token layer. Every color / spacing / radius / type / shadow should
  resolve to a DS token; a raw value is a finding **unless** it's deliberate and documented.
- **Family:** the sibling components it should look and behave like.

## Step 3 · Fan out the review — one agent per dimension

**Always fan out** (invoking this skill is the opt-in). Run the Workflow in
[`references/review-workflow.md`](references/review-workflow.md): a parallel agent per design dimension below,
each returning a structured verdict, then a verify stage (Step 4) on every actionable finding. Adapt the
dimension prompts to the component and the gathered truth.

The dimensions you own:
1. **Fit / where-not-to-use** (from Step 1 — carry it in).
2. **Design intent & gaps** — does it honor what the component is *for*? What's quietly missing or dropped?
   Doc-vs-built drift.
3. **Figma fidelity** — geometry, states (default/hover/focus/pressed/disabled/error), anatomy, layout vs the
   node. (Skip + flag if Figma unreachable.)
4. **Token & style correctness** — every value on a DS token; raw values only when deliberate.
5. **Intended functionality** — do the states / interactions / a11y affordances the design promises actually
   work as designed? (Design behavior — not code correctness, not test coverage.)
6. **Design consistency with siblings** — does it look and behave like its family?

## Step 4 · Adversarially verify — earn the findings

This is what makes the review *trustworthy* instead of a pile-on. For **every** actionable finding, spawn a
skeptic prompted to **refute** it — default to refuted when uncertain. Kill the false and the overstated
**before** they reach the designer. (On the Slider this caught a confident "the docs aren't wired via
`aria-describedby`" finding that was simply wrong — the sibling Field components don't register with Ark, so
the doc was already correct. An unverified review would have shipped that as a defect.)

## Step 5 · The verdict — your voice

Synthesize into a designer-facing report. Not dev jargon — *design* language.

- **Lead with the gate** (fit / where-not-to-use), then the dimensions.
- **Per dimension: a verdict + confidence** — `sound-keep` · `minor-note` · `change-recommended` ·
  `must-fix`. Default to `sound-keep` unless you found something real; no nitpicks dressed as findings.
- **Cite** the Figma node and `file:line`. Challenge the spec — say what you'd change and why, don't rubber-stamp.
- **State your coverage** — what you checked and what you couldn't (was Figma reachable?).
- **A short `Out of design scope →` list** for anything you deferred to a sibling skill, so nothing's lost
  but nothing crowds the design verdict.

## When you hit a gap — park it, don't fix

This is a *review*, not a repair. Surface findings; let the designer decide. Don't start editing the
component mid-review. (If they then say "fix it," that's a separate move with its own discipline.)

## Notes & future

- The fan-out is the floor, not a luxury — the verify stage is the difference between a verdict you can act on
  and a list you have to re-check.
- **Deferred (future):** a self-learning loop (`FIELD_NOTES` / `HARVEST`, like `craft-onboarding`), posting
  findings as inline PR comments, and Figma write-back. Not in v1.
- Known-good calibration case: the `Slider` review (5 judgment calls confirmed sound + a false finding
  correctly knocked down). Re-running this skill on `Slider` should reproduce that shape.

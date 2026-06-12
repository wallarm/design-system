---
name: describe-component
description: Generate a `.llm.md` usage guide for a design-system component — the design-intent layer (when to use, when not, what's locked, what it pairs with) that AI tools can't read from the code. Use when the user wants to document a component for AI consumption, write or update an `.llm.md`, capture usage guidance, or says "describe Button", "document Alert for AI", "write the usage doc for Dialog".
---

# Describe Component

Turn a designer's head-knowledge into a short `.llm.md` usage guide that flows — through the metadata generator and the MCP server — to the AI tools the team uses (Claude Code). The file captures **judgment**: when to reach for the component, when not, what's locked, what it pairs with.

**This is wired and real.** A saved `<Component>.llm.md` is parsed at build time (`packages/design-system/scripts/metadata/generate.ts`), embedded in `components.json`, and served by the MCP `get_component` tool under "Usage guidance" — ahead of the props. Reference example: [`HttpMethod.llm.md`](../../../packages/design-system/src/components/HttpMethod/HttpMethod.llm.md).

## The one rule: document decisions, not data

The code already exposes props, types, variants, and color maps — and the MCP already serves them. **Never repeat them in prose.** Capture only what a designer knows and the code cannot say: *when, when-not, what's locked, what it pairs with.* If the AI can read it from the code, it does not belong here. This is what keeps each file ~25 lines, not 250.

## Usage

```
/describe-component ComponentName
```

## The flow — draft first, ask least

Exhaust the code before spending the designer's time. The interview is a short follow-up, not the opening act.

### 0 · Find Figma (optional, a 5-second ask)
Figma annotations often carry intent the code doesn't — usage notes, who-it's-for, examples. First look for an existing reference: a `*.figma.tsx` Code Connect file, or a Figma node id in comments/constants (e.g. `HttpMethod` pins Figma `5179:11016`). If none is found, ask the designer once: *"Figma URL for this component? (optional — skip if there's none.)"*
Do **not** ask for a Storybook URL — we're in the repo, so read the stories directly.

### 1 · Draft from code (+ Figma)
Read the component directory at `packages/design-system/src/components/{Name}/` and write the first draft:

| Source | Read it for |
|---|---|
| `{Name}.tsx` | role, structure, ARIA, what it's built on |
| `classes.ts` | variants & compound rules → what's *locked* |
| `constants.ts` / `types.ts` | enums, fixed mappings, fallbacks |
| `index.ts` | sub-components |
| `{Name}.stories.tsx` | real usage patterns for the one example |
| sibling components | "pairs with" relationships |
| Figma (if found) | designer annotations, intent |

Write to the [template](references/llm-md-template.md). Mark genuine gaps `<!-- TODO(designer): … -->`.

### 2 · Enrich from reference systems — selectively (optional)
Only for **common-pattern** components (navigation, layout, banners, menus, bulk actions, split buttons, tours…). **Skip entirely for Wallarm-domain primitives** (`HttpMethod`, `ResponseCode`, `Ip`, `Country`, `RemoteShell`, `Attribute`, `ParameterPath`…) — no external system has them. Consult the 1–2 most relevant, and cite what you borrow:

| Reference | Best for |
|---|---|
| **Nord Health** — nordhealth.design | The exemplar: usage/API split + do/don't; closest peer that ships an AI layer |
| **GitHub Primer** — primer.style | Developer-tool patterns; "use X not Y" boundary discipline |
| **Elastic EUI** — eui.elastic.co | Security/observability, data-dense UI; messaging (banner vs callout) |
| **Atlassian** — atlassian.design | Product-app patterns, navigation, page layout |
| **IBM Carbon** — carbondesignsystem.com | Enterprise, data-dense usage docs |
| **Vercel Geist** — vercel.com/geist | Lean, concise usage guidance — closest to our own ~25-line target; modern dev-platform patterns |

This roster isn't fixed at these — add reference systems as they prove useful in practice.

### 3 · Ask the designer — targeted and iterative
Ask only what code + Figma couldn't answer, in **small batches** (a few at a time), and keep going for as many rounds as it takes to make a solid file — don't stop early, but never ask what the code already told you. **Lead with boundaries** ("where should this definitely NOT be used?") — they're easier to answer and the highest-value. For each question, give one line on why it matters for AI output.

### 4 · Sanity check (before sign-off)
Hand a fresh subagent **only** the drafted `.llm.md` — no code, Figma, or Storybook — plus 5–7 deliberately tricky prompts targeting the riskiest calls: boundary traps ("show a GraphQL operation type"), locked-rule traps ("make DELETE red"), pairing, sizing. For each, it reports: decision · which section drove it · confidence (HIGH/MED/LOW). Fix every MED/LOW with small, targeted additions. Aim for all-HIGH before showing the designer.

### 5 · Save
Write to `packages/design-system/src/components/{Name}/{Name}.llm.md`. It reaches the AI automatically on the next metadata build. Confirm to the designer that it's live, and tick it off the coverage tracker.

### 6 · Park what the skill missed
If anything about *this* run tripped the skill — a missing check, a wrong assumption, an off-script question you had to answer, a step that didn't fit — append a one-line row to [`REFINEMENTS.md`](REFINEMENTS.md). **Don't fix the skill mid-run** — park it and finish the component. The log is harvested into this skill periodically.

## The template

See [references/llm-md-template.md](references/llm-md-template.md) — six sections, all judgment, omit any that would be generic.

## Notes

- **Two authors, one voice.** This skill is the single source of the file's shape, so two designers working in parallel produce consistent files. Update the coverage tracker when you finish one.
- **Tier the depth.** Domain / blind-spot components get the full treatment; commodity primitives (`Button`, `Badge`, `Stack`) get a 3–4 line note or are skipped — don't pad them.
- **Partial is fine.** An 80%-complete file with a couple of `TODO`s beats no file.
- **Lead with "Reach for it when."** The most common AI failure on a novel component is not knowing it exists, so it hand-rolls instead — the existence cue is what prevents that.
- **Self-improving.** Friction found during a run is parked in [`REFINEMENTS.md`](REFINEMENTS.md) (step 6) and folded back into this skill in a periodic harvest — never patch the skill mid-run.

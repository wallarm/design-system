---
name: describe-component
description: Generate a `.llm.md` usage guide for a design-system component — the design-intent layer (when to use, when not, what's locked, what it pairs with) that AI tools can't read from the code. Use when the user wants to document a component for AI consumption, write or update an `.llm.md`, capture usage guidance, or says "describe Button", "document Alert for AI", "write the usage doc for Dialog".
---

# Describe Component

Turn a designer's head-knowledge into a short `.llm.md` usage guide that flows — through the metadata generator and the MCP server — to the AI tools the team uses (Claude Code). The file captures **judgment**: when to reach for the component, when not, what's locked, what it pairs with.

**This is wired and real.** A saved `<Component>.llm.md` is parsed at build time (`packages/design-system/scripts/metadata/generate.ts`), embedded in `components.json`, and served by the MCP `get_component` tool under "Usage guidance" — ahead of the props. Reference example: [`HttpMethod.llm.md`](../../../packages/design-system/src/components/HttpMethod/HttpMethod.llm.md).

## The one rule: document decisions, not data

The code already exposes props, types, variants, and color maps — and the MCP already serves them. **Never repeat them in prose.** Capture only what a designer knows and the code cannot say: *when, when-not, what's locked, what it pairs with.* If the AI can read it from the code, it does not belong here. This is what keeps each file ~25 lines, not 250.

**Precedence rule:** code is ground truth for what *exists* — never document a prop, variant, or size that isn't shipped, even if Figma shows it. Figma is ground truth for *intent*. When they diverge (either way), flag it to the designer — never silently pick a side.

## Usage

```
/describe-component ComponentName
```

## The flow — draft first, ask least

Exhaust the code before spending the designer's time. The interview is a short follow-up, not the opening act.

### 0 · Verify the target, then find Figma
**Verify first:** confirm `{Name}.tsx` exists and `{Name}` is a real exported component. Check exported-ness via the component's own `index.ts` **and** `package.json` `exports` — including a `./*` **subpath wildcard** (`@wallarm-org/design-system/{Name}`), which makes a component importable even when it's absent from the root barrel (`src/components/index.ts`). Root-barrel absence alone is at most a minor consistency gap to flag — *not* a "not a real component" verdict. The metadata generator keys `.llm.md` by a **directory scan of `src/components/`** (top-level dir name), so directory presence is what makes the doc take effect; internal plumbing and sub-components (`SelectionBulkBar`, `TableActionBar`) that aren't their own top-level directory can't hold a file. If the target genuinely isn't a real exported top-level component, redirect the guidance into the exported host family's file(s) and tell the designer why.

Then Figma (optional, a 5-second ask): annotations often carry intent the code doesn't — usage notes, do/don'ts, scratch "Notes" frames. Look for a `*.figma.tsx` Code Connect file or a node id in comments/constants (e.g. `HttpMethod` pins `5179:11016`). **A `*.figma.tsx` file is worth more than the node id — its `example()` blocks are the sanctioned compositions (variant → blessed JSX); read them as composition ground truth.** If none, ask the designer for the URL **up front** — they usually have it even when the code doesn't, and it often settles styling and locked rules. Do **not** ask for a Storybook URL — we're in the repo, so read the stories directly.

**Reading the node (remote Figma MCP):** `get_design_context` can hard-fail with *"nothing selected"* (it wants a live canvas selection even given a valid `nodeId`+`fileKey`), and `get_metadata` on a full **spec page** overflows the token limit (it packs Documentation + Notes + Anatomy + the whole variant matrix). Selection-free path that works: call `get_metadata` for the frame tree (when it's too big it saves to a file — `jq -r '.[].text'` + grep for the `Documentation` / `Notes` frame node IDs), then `get_screenshot(nodeId)` on just those frames and read the prose from the image (`curl` the returned URL → Read the PNG).

### 1 · Draft from code (+ Figma)
Read the component directory at `packages/design-system/src/components/{Name}/` and write the first draft:

| Source | Read it for |
|---|---|
| `{Name}.tsx` | role, structure, ARIA, what it's built on |
| `classes.ts` | variants & compound rules → what's *locked* |
| `constants.ts` / `types.ts` | enums, fixed mappings, fallbacks |
| `index.ts` | sub-components, exported helpers (escape hatches) |
| `{Name}.stories.tsx` | real usage patterns for the one example |
| sibling components | "pairs with" relationships |
| sibling `.llm.md` files | match their voice & section shape — divergent twins confuse the consuming AI |
| `{Name}.figma.tsx` (Code Connect, if present) | sanctioned compositions — each `example()` maps a variant to blessed JSX |
| Figma (if found) | designer annotations, intent — read **this component's own** Notes / Content-recommendation frame; don't assume a family sibling's copy frame transfers (register differs: terse toast vs institutional banner) |

Two ground-truth rules while reading:
- **Rendered stories beat argTypes.** Story controls/dropdowns can be stale; what the stories *render* is the sanctioned prop space. An argTypes-vs-story mismatch is a bug to flag, not a design signal.
- Watch for traps the code creates silently: case-sensitive lookups, code defaults that differ from design practice, spec rules (truncation, max-widths) that aren't implemented.

Write to the [template](references/llm-md-template.md). Mark genuine gaps `<!-- TODO(designer): … -->`.

### 2 · Enrich from reference systems — selectively (optional)
Only for **common-pattern** components (navigation, layout, banners, menus, bulk actions, split buttons, tags, tours…). The test is **"does an external system ship this shape?"** — not Wallarm-ness. **Skip for true domain primitives** (`HttpMethod`, `ResponseCode`, `Ip`, `Country`, `RemoteShell`, `ParameterPath`…) — no external system has them. Borderline: `Attribute` looks Wallarm-specific but is a labeled key-value / **description-list** (Ant `Descriptions`, Carbon structured-list) — a common pattern, so consult is available, not "skip, no analog exists." Consult the 1–2 most relevant, and cite what you borrow.

**Announce the decision out loud every run** — one line: *"consulting Nord + Carbon (common pattern)"* or *"skipping references (domain primitive)"* — so the designer never has to ask whether this step happened.

| Reference | Best for |
|---|---|
| **Nord Health** — nordhealth.design | The exemplar: usage/API split + do/don't; closest peer that ships an AI layer |
| **GitHub Primer** — primer.style | Developer-tool patterns; "use X not Y" boundary discipline |
| **Elastic EUI** — eui.elastic.co | Security/observability, data-dense UI; messaging (banner vs callout) |
| **Atlassian** — atlassian.design | Product-app patterns, navigation, page layout |
| **IBM Carbon** — carbondesignsystem.com | Enterprise, data-dense usage docs |
| **Vercel Geist** — vercel.com/geist | Lean, concise usage guidance — closest to our own ~25-line target; modern dev-platform patterns |

This roster isn't fixed at these — add reference systems as they prove useful in practice. Where our system **differs** from a reference *either way* — stricter (Nord allows non-interactive tags; ours are always a Badge) **or more permissive** (EUI shows one toast at a time; our `Toaster` stacks 3 + hover-expand) — document **our shipped behavior** and cite the divergence; never import the reference's rule over ours.

**Fetchability** (so the consult step doesn't silently degrade to "announce + fail"): Nord ✓ via plain `WebFetch`; Carbon / Atlassian / Primer ✗ (JS-rendered — fetches return nav shells with no usage content). Fall back to their GitHub doc sources or an `llms.txt` when a fetch comes back empty.

### 3 · Ask the designer — targeted and iterative
Ask only what code + Figma couldn't answer, in **small batches** (a few at a time), and keep going for as many rounds as it takes to make a solid file — don't stop early, but never ask what the code already told you. **Lead with boundaries** ("where should this definitely NOT be used?") — they're easier to answer and the highest-value. For each question, give one line on why it matters for AI output.

Interview craft, learned the hard way:
- **Plain prose, not forms.** Voice-friendly open questions beat structured multi-choice for judgment calls — options anchor the designer (and get dismissed).
- **One stock question worth asking once per component:** *"any sanctioned looks or uses this component can't express through its props yet?"* When yes, document the escape hatch via the component's **exports** (maps, helpers) — never via copied values.
- **Rejected rule → delete it.** If the designer declines a drafted hard rule ("not a hard stop, case-by-case"), remove the bullet entirely — doc silence lets the AI use judgment; a hedged "sometimes" rule steers worse than silence.
- **Designer-default ≠ code-default → "set X explicitly."** When the designer's stated default differs from the code's (`secondary` vs `solid`), the doc must say *set it explicitly — don't rely on the code default* — and surface the mismatch to the designer as a possible code change.
- **Designer answer conflicts with Figma/code → draft to the authoritative source** (usually Figma), surface the conflict, and flag that line for explicit sign-off.
- **Design-TBD / unshipped patterns get an explicit "don't build one yet" line — in *either* direction:** code ships more than design approves (unsanctioned affordances, e.g. NumericBadge's clickable styles), *or* Figma designs more than code ships (Figma-ahead features, e.g. Attribute's inline edit). Omission invites the AI to invent the pattern; revisit when it settles.
- **Confirm the component's *category* before drafting when it's ambiguous.** A component can sit in more than one bucket (`Dialog` is a *layout* — peer of Drawer / full-page — not "the blocking message"); surface your assumed framing to the designer early, because a recategorization changes the lead, the boundaries, and the "reach for it when."

### 4 · Sanity check (before sign-off)
Hand a fresh subagent **only** the drafted `.llm.md` — no code, Figma, or Storybook — plus 5–7 deliberately tricky prompts targeting the riskiest calls: boundary traps ("show a GraphQL operation type"), locked-rule traps ("make DELETE red"), pairing, sizing, and — when the component carries copy rules — a microcopy trap ("write the toast title for X"). For a **two-axis style matrix** (e.g. emphasis × intent), target axis *combinations* — off-grid cells, "which B for this A" — not single-axis lookups, and answer them in the doc with a worked recipe per common scenario (main / secondary / destructive / dark-surface); per-axis prose alone tests MED. **Tell the agent up front the doc is judgment-only** — the prop/type/variant/default contract lives in the code + MCP, so "no prop list / missing types / no API signature" is *out of scope*, not a weakness; it should flag only wrong or missing *judgment*. (Running several blind lenses in parallel? Give each the FULL doc verbatim — an abridged copy yields false "missing section" flags.) For each prompt it reports: decision · which section drove it · confidence (HIGH/MED/LOW). Fix every MED/LOW with small, targeted additions. Aim for all-HIGH before showing the designer.

**4b · Code-aware pass.** After the blind check passes, run one quick pass against the component source asking only: *"does any doc claim contradict the code?"* (defaults, prop names, behavior). The blind check can't see doc-vs-code drift — this catches it. Revisions to an existing `.llm.md` go through steps 4–4b exactly like fresh files.

### 5 · Save
Write to `packages/design-system/src/components/{Name}/{Name}.llm.md` — only that path takes effect (the generator keys by top-level directory; sub-component guidance lives in the parent's file). It reaches the AI automatically on the next metadata build. Confirm to the designer that it's live, and tick it off the coverage tracker.

A **feature-scoped partial** is fine when only one feature needs documenting now: lead with a one-line scope statement and a `TODO` banner naming what's still uncovered.

### 6 · Park what the run surfaced — three lots
**Skill friction** — a missing check, a wrong assumption, an off-script question, a step that didn't fit → append a one-line row to [`REFINEMENTS.md`](REFINEMENTS.md). **Don't fix the skill mid-run** — park it and finish the component. The log is harvested into this skill periodically.

**Cross-cutting design judgment** — a rule you've now written into a *second* component's file, or one that's really about density, color discipline, interaction ownership, or overflow rather than this component → append a row to the [design-judgment backlog](../../../docs/ai-ready-ds-judgment-backlog.md). It seeds the future foundations layer / design-judgment skill; component files keep their local phrasing, the general form parks there.

**UX-writing / microcopy** — a wording rule (case, brevity, tone, punctuation, button labels, empty-state copy) that generalizes beyond this component → append a row to the [content-guidelines doc](../../../docs/ai-ready-ds-content-guidelines.md). Sibling to the design-judgment backlog; seeds the future content / UX-writing skill. Component files keep their local phrasing; the general form parks there. (Register varies by surface — don't flatten a terse-toast rule onto an institutional banner.)

### Maintenance · docs age as the family grows
When a family base or sibling doc lands with new shared rules (click-owner phrasing, sanctioned renditions, casing traps), **sweep the family's earlier `.llm.md`s and back-port** — the original HttpMethod reference example needed exactly this. Revisions get the full step-4/4b treatment.

## The template

See [references/llm-md-template.md](references/llm-md-template.md) — six sections, all judgment, omit any that would be generic.

## Notes

- **Two authors, one voice.** This skill is the single source of the file's shape, so two designers working in parallel produce consistent files. Update the coverage tracker when you finish one.
- **Tier the depth — by role in the system, not name fame.** Domain / blind-spot components get the full treatment. A "commodity" that anchors a family earns a full router file too (`Badge` is the base of every domain chip; `Tag` is the interactive sibling) — the router is what keeps AI off raw primitives when a dedicated component exists. True standalone commodities (`Stack`, `Loader`) get 3–4 lines or are skipped — don't pad them.
- **Partial is fine.** An 80%-complete file with a couple of `TODO`s beats no file.
- **Lead with "Reach for it when."** The most common AI failure on a novel component is not knowing it exists, so it hand-rolls instead — the existence cue is what prevents that.
- **Self-improving.** Friction found during a run is parked in [`REFINEMENTS.md`](REFINEMENTS.md) (step 6) and folded back into this skill in a periodic harvest — never patch the skill mid-run.

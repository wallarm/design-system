# Making the Wallarm Design System AI-Ready — Kickoff Brief

> **What this file is.** A self-contained starting point for a *fresh* chat. It carries everything decided so far so the new session can begin cold, without re-reading a long exploratory conversation. Read it top to bottom, then start at **§8 — First actions**.
>
> **Status:** Methodology not yet defined. This is the launch pad, not the plan. Written June 2026, on top of latest `main`.
>
> **Deliberately not anchored to our March 2026 attempt.** March is treated as *one input among many*, not the baseline. See §4 for the only two things worth carrying forward.

---

## 1. The mission (the north star)

Enrich the existing Wallarm Design System so that AI models **use it the way a UX designer would** — choosing the right component, composing it correctly, staying on-brand — instead of the way a junior dev does: blindly wiring props and guessing at tokens.

Success = a model building an interface from our DS makes **fewer errors, better component choices, and on-brand results**, with less hand-holding.

This is about **enriching what exists**, not redesigning the system. We add a knowledge layer models can consume; we do not change the components themselves (beyond, possibly, naming/token hygiene if the methodology calls for it).

## 2. Who we optimize for (decided)

**Primary consumers: Cursor + Claude Code**, because that's what the team actually uses and the repo already speaks their dialect (`CLAUDE.md`, `.claude/rules/`, and a `.cursorrules` exists on the old branch). **Primary delivery: the MCP server we already ship** (see §3), plus in-repo files.

Treat this as the *starting assumption*, not a locked decision — confirm it in step 1 of the methodology before building.

## 3. Where we are today (repo reality, on latest `main`)

- **79 components** in `packages/design-system/src/components/`. Two rough buckets:
  - **Commodity primitives** a model already half-knows: `Button`, `Badge`, `Card`, `Input`, `Switch`, `Tabs`, `Dialog`, `Tooltip`, `Stack`, `Flex`…
  - **Wallarm-domain / novel components a model is blind to** — *this is where semantic docs likely pay off most*: `ResponseCode`, `HttpMethod`, `ParameterPath`, `RemoteShell`, `Attribute`, `Ip`, `Country`, `AppShell`, `NavPanel`, `NavRail`, `TopHeader`, `BulkBar`, `FilterInput`, `Selection`, `SplitButton`, `Tour`, `SimpleCharts`…
- **The MCP server already exists and works** — `packages/mcp` + `packages/mcp-core`:
  - Tools: `search_component`, `get_component`, `search_token`, `get_token_category`
  - Resources: `component-list`, `design-tokens`, `component-details`
  - A generator at `packages/design-system/scripts/metadata/` parses props, variants, tokens, and examples out of the code into `components.json`.
- **The gap (the whole reason for this project):** that metadata is **purely structural**. The schema (`packages/mcp-core/src/schema.ts`) has *no* field for design intent — no "when to use," "when NOT to use," composition rules, or gotchas. A model can already read our props from the code; it cannot read *why* or *when*. **There is a live MCP pipe with nothing semantic flowing through it.**
- **No `.llm.md` files exist on `main`.** The describe-component skill is **not** on `main` either (only on the old branch — see §4).

## 4. What our March 2026 attempt leaves us (and what to ignore)

All March work lives on branch **`artem/component-usage-docs`** (PR #46, still open, ~250 commits behind — *not* landing as-is). The branch is safe on origin; nothing was deleted. **Recover any file with:**

```bash
# view it:
git show origin/artem/component-usage-docs:<path>
# or pull it into the working tree:
git checkout origin/artem/component-usage-docs -- <path>
```

**Two assets worth reusing** (everything else is superseded — including the March research doc and the exact template):

1. **The authoring skill (machinery, not conclusions):**
   `.claude/skills/describe-component/SKILL.md` — a 7-phase interactive flow (Gather → Research → Interview → Draft → Stress Test → Designer Review → Save). The *process* is reusable; its template and assumptions are up for revision.
2. **The validated core idea:** *one knowledge file per component, capturing the design intent a model can't read from code.* This held up. The open questions are everything *around* it — format, sections, length, delivery.

Reference-only (look, don't depend on): `.claude/skills/describe-component/references/llm-md-template.md` (the March template), `packages/design-system/src/components/Alert/Alert.llm.md` (first worked example), `docs/WASD-LLM-Excellence-Framework.md`, `docs/WASD-Workflow-Guide.md`.

## 5. The methodology spine (the work, in order)

Define these six things. This is the agenda for the new chat.

1. **Purpose & audience** — confirm §2 (Cursor + Claude Code via MCP). Define what "it worked" looks like concretely.
2. **Scope & boundaries** — components only, or components **+ a token/foundation rules layer**? Which components get deep treatment vs. light vs. skipped (tiering — see §6 flag). *Interview "where NOT to use this" before "where to use it" — boundaries first.*
3. **Content model** — what goes in each per-component file. Resolve the prose-vs-structured question (see §6).
4. **Delivery** — how it reaches the model: files + the existing MCP server; preload vs. fetch-on-demand.
5. **Authoring workflow** — how we realistically produce this across 79 components without a 7-phase interview each. (Draft-then-review? Tiering? This is where the skill plugs in. *Validate the loop on ONE component before scaling.*)
6. **Validation** — how we'll know AI output actually improved. Nobody in the industry has solved this; even a lightweight eval beats vibes.

## 6. Two findings that MUST steer the decisions

These came out of fresh June-2026 research (§7) and are the sharpest things we know.

### Finding A — the format tension (resolve this in step 3)

The field genuinely disagrees on two axes:

| Question | Camp 1: Smashing / practitioner guides | Camp 2: Indeed benchmark + Anthropic |
|---|---|---|
| Markdown or structured/JSON? | Structured **Markdown** prose | **JSON** for facts — ~80% fewer tokens, fewer hallucinations |
| Preload or fetch-on-demand? | **Preload** every session via rules file | **Just-in-time** via MCP; don't force-feed |

**Proposed resolution to pressure-test (not gospel):** *prose for intent* (when-NOT, gotchas, judgment — Markdown) + *structured data for contracts* (props, variants, tokens — JSON, served by the MCP we already have); preload only a tiny always-on rules core, retrieve per-component detail on demand. This split is the main thing March couldn't have known.

### Finding B — the strategic flag (decide in step 2)

Two independent sources say models pick the **right component but break the foundations** — wrong typography, spacing, color — and fabricate token names. Per-component prose does **not** fix this; a *closed, named token set with enforcement* does.

**Implication:** our component-docs instinct polishes the half models are *already* okay at, and may leave the token/foundation half — where the real breakage is — untouched. The highest-leverage addition might be a thin **always-on token-rules layer** alongside the per-component files. Decide this consciously; don't default into components-only.

## 7. Curated references (verified June 2026)

### Study first — closest analogs
- **Atlassian Design System** — most mature "agentic content" strategy: per-component guidance + examples + types + metadata, shipped at multiple sizes; official MCP + llms.txt + agent skill. → https://atlassian.design/llms.txt · thinking: https://www.atlassian.com/blog/design/turning-handoffs-into-handshakes-integrating-design-systems-for-ai-prototyping-at-scale
- **shadcn/skills** — closest parallel to our skill; key lesson: reads *live project state* and injects only relevant rules (dynamic > static). → https://ui.shadcn.com/docs/skills · https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
- **Storybook MCP + Component Manifest** — most concrete blueprint for *what fields* a machine-readable component file needs; we're a Storybook shop. → https://tympanus.net/codrops/2025/12/09/supercharge-your-design-system-with-llms-and-storybook-mcp/
- **GOV.UK Design System** — gold standard for the *prose* half: "When to use / When not to use / decide between X and Y." (No AI artifact; it's the writing model.) → https://design-system.service.gov.uk/components/details/

### Concrete per-component template guidance (from team's own links)
- **Smashing Magazine — How to make a design system AI-ready** (Vitaly Friedman, Jun 2026) — structured **Markdown** specs kept in-repo; "extending code is often more effective than generating from mockups"; token layer = a closed, *named* set (no AI-invented values); points to live `llms.txt` endpoints (Atlassian, Carbon, CMS, Nord). → https://www.smashingmagazine.com/2026/06/how-make-design-system-ai-ready/
- **Murphy Trueman — Your next design system user** — the structure/naming thesis: *"Your design system is already an API; the question is whether it's a good one."* Semantic names + composition contracts. *"Structure scales. Vibes don't."* → https://blog.murphytrueman.com/your-next-design-system-user/
- **Convergent per-component sections** (synthesis across GOV.UK, Storybook Component Manifest, and 2026 practitioner guides — *not* one source) — a per-component file tends to want: metadata · overview (when / when-NOT) · anatomy · tokens used · props/API · states · code examples · cross-references. Use as a starting checklist when we design our own template in step 3.

### Strong working examples
- **Chakra UI** — cleanest split-by-concern llms.txt (`llms-components.txt` / `llms-styling.txt` / `llms-theming.txt`). → https://chakra-ui.com/docs/get-started/ai/llms
- **Carbon (IBM)** — official MCP that searches *guidance/usage docs*, not just code. → https://github.com/carbon-design-system/carbon-mcp
- **HeroUI** — clearest framing of MCP + llms.txt + skills as three deliberate layers. → https://heroui.com/docs/react/getting-started/mcp-server
- **Nord Health DS** *(study closely — closest end-to-end model)* — a real production reference shipping **both** a two-tier llms.txt (5k index + ~1M full dump) **and** an installable agent skill (`npx skills add https://nordhealth.design`) covering 55+ components, tokens, theming, and do/don't rules — via the Cloudflare "Agent Skills Discovery" RFC, working across 40+ agents (Claude Code, Cursor, Copilot). → index: https://nordhealth.design/ai/llms-txt/ · skills: https://nordhealth.design/ai/skills
- **v0 by Vercel** — best one-line definition: a registry is "a distribution specification designed to pass context from your design system to AI models." → https://v0.app/docs/design-systems

### Live `llms.txt` files to open and study (real shipped examples)
Open these to see what a shipped machine-readable index actually looks like before we design our own:
- **Carbon (IBM)** — https://carbondesignsystem.com/llms.txt — ~1.5–2k words, hierarchical: foundations → 50+ components → patterns → frameworks → source. Verified live.
- **Atlassian** — https://atlassian.design/llms.txt — paired with their MCP + multi-size content strategy (see Study-first).
- **Nord Health** — https://nordhealth.design/llms-full.txt — the "everything inlined" heavy tier (very large) next to their light index; the two-tier split in practice.
- **CMS Design System (US gov)** — https://design.cms.gov/llms.txt — a GOV.UK-style government design system. ⚠️ Returned 403 to automated fetch; open in a browser to view.

### Standards / background
- **AGENTS.md** — cross-tool agent-instructions standard (always-on "house rules" layer; not per-component detail). → https://agents.md/
- **llms.txt** — the curated index-file convention. → https://llmstxt.org/
- **Anthropic — Agent Skills** (progressive disclosure) → https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills · **Context engineering** (just-in-time > preload, smallest high-signal token set) → https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- **"Your Design System Is Not Ready for AI Agents"** — best practitioner checklist, from the 2026 AI Design Systems Conference. → https://www.intodesignsystems.com/blog/design-system-not-ready-for-ai-agents
- **zeroheight — AI in design systems: what's changing in 2026** (Elyse Holladay) — 3 ways LLMs help DS teams: MCPs/skills/guidelines, designing with code, structured relationships. (JS-rendered; couldn't fetch body — read directly.) → https://zeroheight.com/blog/ai-in-design-systems-whats-changing-in-2026/

### Evidence (be honest: it's thin)
- **Indeed / Diana Wolosin benchmark** — 77 components × 1,056 prompts × 8 formats. JSON beat Markdown (~80% fewer tokens, fewer hallucinations); "JSON for MCP contracts, Markdown for LLM instructions." Right components, wrong foundations. *Conference writeup, not peer-reviewed.* → https://intodesignsystems.substack.com/p/ai-design-system-mcp-example
- **Reality check:** there is **no** rigorous, independent, peer-reviewed study proving semantic docs improve AI UI quality. Treat all vendor benchmarks critically; isolate the variable if we build our own eval.

### Corrections (don't chase ghosts)
- **Material Design (Google) ships nothing AI-facing** — the "Material" MCP/llms.txt is **MUI** (the React lib), not Google. → https://mui.com/material-ui/getting-started/mcp/
- **Radix & Base UI** — no first-party AI layer, community-only.
- *Couldn't fetch:* the Reddit r/ExperiencedDevs thread on guiding LLMs to good UI (hard-blocked) — Artem to paste if wanted.

## 8. First actions for the new chat

1. Read this whole file. Skim the **Study-first** references (§7) and **both findings** (§6).
2. Recover and read the two March assets (§4): the skill `SKILL.md` and `Alert.llm.md`, plus the old template — to see the starting point we're revising.
3. Open the methodology at **step 1 (§5)**: confirm audience/success, then move through scope → content → delivery → authoring → validation.
4. **Validate on ONE component before scaling** — pick a domain-specific one (e.g. `ResponseCode` or `HttpMethod`) where the semantic layer matters most, prove the format + authoring loop, *then* decide how to roll out to the rest.
5. Present findings and decisions in **designer language**, not dev jargon.

---

*Generated from a June 2026 research refresh: four web-research scouts (shadcn ecosystem, AI tools/builders, design-system AI docs, standards/evidence) + five team-supplied articles. All URLs verified at time of writing.*

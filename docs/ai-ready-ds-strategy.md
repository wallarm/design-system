# AI-Ready Design System — Strategy & Action Plan

> **For:** the design team (Artem + design teammate) and the lead frontend engineer.
> **Purpose:** agree on *how* we make the Wallarm Design System usable by AI coding tools, *who* does what, and *in what order*.
> **Status:** Format + delivery already proven on one component (`HttpMethod`). This is the plan to scale it.
> **Background:** [ai-ready-ds-kickoff.md](./ai-ready-ds-kickoff.md).

---

## 1. The goal (one line)

When someone builds a UI with an AI tool (Claude Code) — often a PM or engineer with **no designer in the room** — the AI should pick the right component, compose it correctly, and stay on-brand. We give the AI the design judgment it can't read from the code.

## 2. What we've already proven

- **The format works.** Each component gets a short usage "cheat sheet" (~25 lines) capturing *judgment* — when to use it, when not, what's locked, what it pairs with. Not props or types (the code already has those). Reference: [HttpMethod.llm.md](../packages/design-system/src/components/HttpMethod/HttpMethod.llm.md).
- **It steers the AI.** A fresh AI given only that sheet made the right call on 6/6 deliberately tricky prompts, including the traps (GraphQL → Badge, don't recolor DELETE, method-picker → Select).
- **It reaches the AI.** The delivery pipe is wired and tested: the sheet flows through our MCP server to Claude Code (it shows up as "Usage guidance" when the AI looks up the component). Any new `.llm.md` is picked up automatically — no extra work.

## 3. What the honest test told us

We ran the same build task *with* and *without* the layer. **Both versions picked the right components** — a capable AI is already decent at *which* component to use. The layer's wins were in the details: it chose the right *size* for table density and followed our rules instead of lucky guesses.

**Implication:** the bigger gap is the **foundations** — spacing, type, density, and invented color/token names — which per-component files don't fix. That's a second layer (§7), and a decision for us to make together.

## 4. The two layers

1. **Per-component usage files** (`<Component>.llm.md`) — the judgment cheat sheets. One per component that matters.
2. **Foundations "house rules"** (always-on) — the closed set of real token names, the spacing/type scales, and how to apply them (hierarchy, density). Loaded into every AI session. *(Recommended; see §7.)*

## 5. The per-component file — what goes in it

Judgment only. Sections (omit any that would be generic):

- one-line "what it is"
- **Reach for it when** — the cue to pick *this* instead of hand-rolling
- **Don't use it for** — boundaries, each with the right alternative
- **Locked — don't override** — the non-negotiables
- **Sizing / judgment calls** — only the props where a human actually decides
- **Pairs with** — relationships + one tiny example

Deliberately **left out:** props, types, variant lists, color tables — the code and the pipe already serve those. (See the [HttpMethod example](../packages/design-system/src/components/HttpMethod/HttpMethod.llm.md).)

## 6. How we author them (the loop)

Designed to cost a designer as little time as possible:

1. **AI drafts** from the component code + its siblings, and flags the gaps.
2. **AI pulls context only if needed** — your Figma for that component, or how mature design systems (GOV.UK, Atlassian) describe the same kind of thing.
3. **AI asks you** the few questions code + Figma couldn't answer.
4. **You review, AI fixes.**
5. **Sanity check** — a fresh AI is handed only the sheet + tricky prompts; if it stumbles, the sheet is missing something.
6. **Save** the file next to the component.

This loop gets baked into a **skill** (§9) so both designers produce identical files.

## 7. The foundations layer (recommended track)

**Why:** our own test *and* the outside research both say the AI's real breakage is foundations, not component choice. A small always-on rules file — "use only these token names, never invent one; here are the spacing/type scales; here's how to build hierarchy and density" — addresses the half that per-component files can't.

**Decision for the team:** run this **in parallel** with component coverage, or after? *(Recommendation: in parallel — it's the highest-leverage piece.)*

## 8. Which components, and in what order (tiering)

By how blind the AI is to them:

- **Deep — write full sheets first** (Wallarm-specific / novel): ResponseCode, ParameterPath, RemoteShell, Attribute, Ip, Country, AppShell, NavPanel, NavRail, TopHeader, BulkBar, FilterInput, Selection, SplitButton, Tour, SimpleCharts, Banner. *(`HttpMethod` ✅ done.)*
- **Light — short note or skip** (commodity primitives the AI half-knows): Button, Badge, Card, Input, Switch, Tabs, Tooltip, Stack, Flex…
- **Skip** — trivial layout / leaf primitives.

~17 components in the deep tier — the focused, high-value batch.

## 9. The skill (our authoring tool, lives in the repo)

- ✅ **Built** — the rewritten skill lives at `.claude/skills/describe-component/` (`SKILL.md` + the lean template). Run `/describe-component <Name>`. It encodes the draft-first loop, the judgment-only template, and the curated reference set below.
- **Reference systems the skill consults** (only for common-pattern components — skipped for domain primitives): **Nord Health** (the exemplar), **GitHub Primer**, **Elastic EUI**, **Atlassian**, **IBM Carbon**, **Vercel Geist** (lean-format model). The roster isn't fixed — we add systems as they prove useful.
- It lives in the design-system repo. Anyone runs `/describe-component <Name>` to produce a sheet.
- **Ongoing:** every *new* component ships with a usage file — add "write the `.llm.md`" to the component definition-of-done / PR checklist, so coverage never falls behind again.

## 10. Contribution workflow

- A shared **feature branch** (e.g. `ai-usage-docs`).
- The two designers author files **piece by piece, in parallel**, using the skill — split by the tiering list (§8) so you don't collide. A simple **coverage tracker** (a checklist table in the branch) shows who's on what and what's done.
- The **lead frontend engineer reviews** the branch **in chunks** (not all 79 at once) — checking technical correctness (component names, examples) while designers own the content/judgment.
- Merge to `main` per approved chunk. The pipe then serves those sheets to every AI session.

## 11. How we'll know it worked

- **Per file:** the sanity check in the loop (§6, step 5).
- **Overall:** a lightweight before/after — a handful of real prompts built with vs without the layer, scored on (1) right component, (2) on-brand foundations, (3) "would a designer ship this first pass?" We already have the harness pattern.

## 12. Action items

| # | Action | Owner | Output |
|---|---|---|---|
| 1 | Agree on this plan | Artem + team | Sign-off |
| 2 | Rewrite the `describe-component` skill | AI + Artem | Updated skill in repo |
| 3 | Create coverage tracker + shared branch | Artem | Branch + checklist |
| 4 | Author the ~17 deep-tier sheets | 2 designers | `.llm.md` files |
| 5 | Build the foundations layer | TBD | Always-on rules file |
| 6 | Review + merge to `main` | FE lead | Coverage on `main` |
| 7 | Stand up the before/after eval | AI + Artem | Measured lift |
| 8 | Add `.llm.md` to component definition-of-done | FE lead | PR checklist update |

## 13. Decisions to confirm together

1. **Foundations layer** — in parallel with component coverage, or after?
2. **Branch name** + how granular the FE-lead review chunks should be.
3. **Who owns the foundations layer** — design or frontend?
4. **Light-tier primitives** — minimal note, or skip entirely for now?

# Research: AI-Consumable Component Documentation

Best practices gathered from industry leaders and emerging standards (March 2026).

## Table of Contents

1. [GOV.UK Design System — Documentation Structure](#govuk-design-system)
2. [shadcn/skills — AI Knowledge Packages](#shadcnskills)
3. [Anthropic — Context Engineering](#anthropic-context-engineering)
4. [v0 by Vercel — Registry-Based Context](#v0-registry)
5. [Key Takeaways for .llm.md Files](#key-takeaways)

---

## GOV.UK Design System

**Source:** [How we document components and patterns](https://designnotes.blog.gov.uk/2018/11/05/how-we-document-components-and-patterns-in-the-gov-uk-design-system/)

The GOV.UK Design System is widely regarded as the gold standard for component documentation. Every component follows the same content pattern:

1. **What it is** — title, live example, short description
2. **When to use it** — situations where the component should be used
3. **When not to use it** — wrong use cases with alternatives suggested
4. **How it works** — functionality, implementation, adaptation guidance
5. **Research** — evidence and user research behind design decisions
6. **Known issues** — unresolved problems or limitations, documented honestly

### Writing principles

- **Consistency** — all components follow the same structure so users know what to expect
- **Clarity** — clear, inclusive language over technical jargon
- **Usefulness** — "everything we say has a clear point" — no filler
- **Honesty** — gaps and known issues are documented openly; teams don't need perfection before publication

### What we adopted

- The "When NOT to Use" before "When to Use" ordering (boundaries-first approach)
- The consistent structure across all components
- The principle that every section must earn its place

### What we should add

- **Known Issues / Gotchas** section — GOV.UK documents these openly. AI tools benefit from knowing component quirks upfront rather than discovering them at runtime
- **Research/evidence notes** — when a "don't use X for Y" rule exists, briefly noting *why* helps AI tools make better judgment calls in edge cases

---

## shadcn/skills

**Source:** [shadcn/ui Skills docs](https://ui.shadcn.com/docs/skills) | [March 2026 changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4)

shadcn/skills (launched March 2026) is the closest parallel to what we're building. It provides AI agents with a "specialized context layer" about the design system, reducing hallucinations and mistakes.

### How it works

1. **Project detection** — finds `components.json` to understand project setup
2. **Context injection** — runs `shadcn info --json` to extract framework, Tailwind version, installed components, icon library, path aliases
3. **Pattern enforcement** — AI follows composition rules (e.g., "use FieldGroup for forms", semantic color usage)
4. **Component discovery** — before generating code, the agent uses `shadcn docs`, `shadcn search`, or MCP tools to find relevant documentation

### What it includes

- Full CLI reference (init, add, search, view, docs, diff, info, build)
- Theming guidance (CSS variables, OKLCH colors, dark mode, custom variants)
- Registry authoring details for custom component registries
- MCP server setup for component search and installation

### Key insight

shadcn/skills focuses on **composition rules and pattern enforcement**, not just "here's what exists." The skill doesn't just list components — it tells the agent *how components must be combined*. Our `.llm.md` files should do the same: not just describe variants, but enforce how they compose.

### What we adopted

- The skill-as-knowledge-package pattern (our describe-component skill)
- Pattern enforcement language in composition sections
- MCP as a discovery mechanism alongside file-based knowledge

---

## Anthropic Context Engineering

**Source:** [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

Anthropic's engineering team published a guide on structuring context for AI agents. The core principle:

> "Find the smallest set of high-signal tokens that maximize the likelihood of your desired outcome."

### Key principles

- **Treat context as a finite resource** — every token depletes the model's "attention budget." Context rot occurs as context grows, creating diminishing returns.
- **Minimum Viable Context (MVC)** — start minimal, expand empirically based on observed failure modes. Minimal doesn't mean short — it means every token pulls its weight.
- **Goldilocks prompts** — avoid overly rigid if-then logic (brittle) and vague guidance (assumes shared understanding). Explain the *why* so the model can generalize.
- **Examples > exhaustive rules** — diverse, canonical examples showing expected behavior beat lengthy edge-case lists.
- **Just-in-time retrieval** — don't pre-load everything. Retrieve context when needed, not upfront.

### Structural recommendations

- Organize into distinct sections using XML tags or Markdown headers
- Keep tools minimal and non-overlapping in function
- Make tool descriptions unambiguous enough that a human could definitively choose the right one

### Common mistakes

1. **Bloated tool sets** with ambiguous decision points
2. **Over-engineering prompts** with complex brittle logic instead of flexible heuristics
3. **Stuffing edge cases** into prompts to address every possible rule
4. **Pre-loading all relevant data** upfront rather than retrieving just-in-time

### What we adopted

- NOT repeating TypeScript interface details in `.llm.md` (that's in code — high-signal tokens only)
- Omitting sections that would be empty or generic rather than filling with filler
- Using progressive disclosure (SKILL.md → references/ → component files)

---

## v0 Registry

**Source:** [v0 Design Systems docs](https://v0.app/docs/design-systems)

v0 by Vercel uses the Shadcn Registry as its distribution mechanism — "a distribution specification designed to pass context from your design system to AI Models."

### What v0 consumes

- **Component source code** — direct access to customized component code
- **Design tokens** — CSS variables for colors, fonts, spacing (shadcn/ui CSS variables standard)
- **Visual references** — metadata, file content, and styles passed via API
- **Registry dependencies** — component relationships and dependency chains

### How it works

Each registry entry follows the registry-item JSON specification with source code files, file paths, target paths, and registry dependencies. The "Open in v0" button triggers an API call with all metadata, giving v0 a "starting point and context on your specific design system."

### Key insight

v0 proves that AI tools need **both structural data (code, types) and semantic context (how things should be used)** to generate good output. The registry handles structural; our `.llm.md` files handle semantic. They're complementary layers.

### Limitation noted

v0 is "specifically trained on the default implementations" of shadcn/ui — heavily customized primitives may not work as well. This underscores why **custom semantic documentation** (our `.llm.md` approach) matters for non-standard design systems.

---

## Key Takeaways

### For our `.llm.md` template

| Principle | Source | How we apply it |
|-----------|--------|----------------|
| Boundaries first | GOV.UK | "When NOT to Use" comes before "When to Use" |
| Known issues section | GOV.UK | Add a "Gotchas" section for component quirks |
| Composition enforcement | shadcn/skills | Patterns section should say "must" not just "can" |
| Minimum viable context | Anthropic | Don't repeat what TypeScript already expresses |
| Examples over rules | Anthropic | 2-4 diverse code examples beat a paragraph of rules |
| Honest about gaps | GOV.UK | Mark unknowns as TODO rather than inventing answers |
| Semantic + structural | v0 | `.llm.md` is the semantic layer; code is the structural layer |

### On the agent question

- **One skill is enough for now.** shadcn/skills is a single skill, not a skill+agent pair.
- The describe-component workflow is inherently interactive (needs human input) = skill pattern.
- An agent makes sense later for automated tasks: "review all `.llm.md` for consistency", "auto-update when code changes."
- Starting with one skill keeps complexity low for team evaluation.

### On distribution

The industry is converging on three channels (we're already planning all three):
1. **MCP** — structured data, search, suggestions (our `packages/mcp/`)
2. **Files** — detailed knowledge, reference material (our `.llm.md` + `guidelines/`)
3. **Skills** — complex workflows, multi-step tasks (our `.claude/skills/`)

---

*Research conducted March 18, 2026. Sources may have been updated since.*

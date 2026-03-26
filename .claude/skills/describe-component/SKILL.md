---
name: describe-component
description: Generate a .llm.md knowledge file for a design system component. Use this skill whenever the user wants to document a component for AI consumption, create an .llm.md file, describe a component's usage guidance, or capture "when to use / when not to use" knowledge. Also trigger when the user says "describe Button", "document Alert for AI", "create knowledge file for Dialog", "write llm.md", or references the LLM Excellence initiative for any specific component.
---

# Describe Component

Help a designer enrich a design system component with semantic context that AI tools can't extract from code alone. The output is a `.llm.md` knowledge file — the bridge between what the code *is* and what the designer *intended*.

**Why this matters for end users:** AI tools can already read props and types. But without design intent, they'll use Alert when they should use Toast, pick the wrong Button variant, or compose components in ways that break your design language. The `.llm.md` file you create here flows through MCP to every AI tool your team uses — every file you write makes every future AI interaction better.

**The pipeline:**
```
You (designer) + this skill
        ↓
   .llm.md file (saved next to component)
        ↓
   Metadata generator parses it at build time
        ↓
   MCP server serves it to AI tools
        ↓
   Developers, PMs, backend engineers get better AI-generated code
```

## Usage

```
/describe-component ComponentName
```

**Example 1:**
```
/describe-component Button
→ Researches code + Figma → asks you about usage boundaries → writes Button.llm.md
```

**Example 2:**
```
/describe-component Alert
→ Finds 6 sub-components → asks about Alert vs Toast vs Dialog boundaries → writes Alert.llm.md
```

## How It Works

The skill runs in five phases. Your input is concentrated in Phases 0 and 2 — the rest is automated.

### Phase 0: Gather Sources

Before touching any code, ask the designer for context:

> "I'm going to research **{ComponentName}**. Two things will help me write a better knowledge file:
>
> 1. **Figma URL** — the component's design spec (variants, states, your design notes)
> 2. **Storybook URL** — the live component page (or I can work from the stories file)
>
> If you don't have one or both, no problem — I'll work with what's available."

The Figma URL matters because you as a designer capture intent there (spacing rules, variant restrictions, usage notes) that often doesn't make it into code. The Storybook URL shows how the implementation actually looks. Together with the source code, these three sources give a near-complete picture — the interview fills the remaining gaps.

### Phase 1: Automated Research

The goal is to exhaust what can be learned from code and Figma before asking the designer anything. This respects your time — no questions about things that are already documented.

**Read the component directory** at `packages/design-system/src/components/{ComponentName}/`:

| File | What to look for |
|------|-----------------|
| `{ComponentName}.tsx` | Props interface, JSDoc, render structure, ARIA attributes, context usage |
| `classes.ts` | CVA variants, compound variants, defaults — this is where the variant system lives |
| `types.ts` / `const.ts` | Exported types, enums, constants |
| `index.ts` | Public exports — reveals sub-component list |
| Sub-component files (`{Name}*.tsx`) | Each sub-component's props, role, slot name |
| `{ComponentName}.stories.tsx` | All stories, arg types, code patterns demonstrated |
| `{ComponentName}.figma.tsx` | Figma↔code prop mappings (if Code Connect exists) |

**If the designer provided a Figma URL**, query the Figma MCP:
- `get_design_context` → full design spec, visual variants
- `get_screenshot` → visual reference to show back to the designer
- `get_metadata` → layer structure, auto-layout
- `get_code_connect_map` → existing Figma↔Code mappings

**Compile a Research Brief** and present it in **designer-friendly language**. The brief should translate code findings into visual/behavioral terms the designer thinks in — not raw prop counts.

```
RESEARCH BRIEF: {ComponentName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What I found:
- {standalone component | compound component with N parts: list them}
- {N visual variants}: {describe in design terms, e.g., "4 styles (primary, outline, ghost, secondary) × 4 colors (brand, neutral, neutral-alt, destructive) × 3 sizes"}
- {N stories in Storybook}: {list key ones, e.g., "Basic, All Variants, With Icons, Loading, Disabled, Full Width"}
- {Figma findings}: {design notes, variant structure, or "not provided"}
- {Accessibility}: {keyboard behavior, ARIA patterns found in code}
- {Restrictions}: {compound variant rules, e.g., "ghost style can't be used with destructive color"}

What I still need from you:
- {list genuine gaps — things code and Figma couldn't tell us}
```

The brief should make the designer think "yes, that's right" or "no, you're missing X" — it's a checkpoint before the interview.

### Phase 2: Iterative Interview

This is the designer's core contribution — the knowledge that only lives in their head. The interview is a conversation, not a questionnaire. It continues until there's enough confidence to write every section of the `.llm.md` file.

**Start with boundaries, not features.** It's much easier to say "definitely don't use this for X" than to enumerate every valid use case. Lead with exclusions — everything not excluded is implicitly valid.

**For each question, briefly explain why it matters for AI quality** — this helps the designer give sharper, more targeted answers.

#### Round 1 — Boundaries & Gotchas

1. **Where NOT to use** — "Where should {ComponentName} definitely NOT be used? What are the cases where people reach for it but should use something else?"
   *Why this matters: without this, AI tools will use {ComponentName} for everything that looks vaguely similar — e.g., using Alert for transient messages that should be Toasts.*
   Let the designer list exclusions freely. Then clarify: "So everything not on this list is fair game?"

2. **What surprises people** — "What's the non-obvious thing about {ComponentName}? Anything that looks like it should work a certain way but doesn't?"
   *Why this matters: the AI will hit the same surprises developers do — better to document them upfront.*

3. **Common mistakes in practice** — "When you review PRs or designs, what mistakes do you see most with {ComponentName}? Wrong style choice, wrong context, something missing?"
   *Why this matters: the "Do's and Don'ts" section directly prevents repeat mistakes across the whole team.*

4. **Key relationships** — "Which components does {ComponentName} appear with most often? Any required pairings or things that should never be combined?"
   *Why this matters: AI tools compose components in isolation. This teaches them real-world groupings.*

#### Round 2+ — Targeted Follow-ups

After Round 1, identify what's still unclear and ask focused questions. Possible topics:

- **Variant selection** — "When to use {variant A} vs {variant B}?" (only for components with many visual options)
- **Design constraints** — "Any hard rules? Like 'max one primary Button per screen' or 'destructive action always needs confirmation Dialog'?"
- **Edge cases** — "Long text, empty states, many items, responsive behavior — anything that needs special handling?"
- **Platform patterns** — "In the Wallarm Console specifically, are there patterns for how {ComponentName} is used?"
- **Accessibility from design perspective** — "Any rules you enforce in design review? Like 'icon-only buttons must have a text label in the tooltip'?" (The code already captures technical ARIA — this is about design-level a11y rules.)
- **Content rules** — "Any rules about the labels, text, or terminology used inside this component?"

#### When to stop

After each round, briefly summarize what you now know and what's still unclear — so the designer can see progress and decide whether to continue. Stop when:
- The designer signals completion ("that's it", "looks good", "nothing else")
- You can confidently write every section without guessing
- Remaining gaps are minor enough to mark as `<!-- TODO: needs input -->` without undermining the file's value

#### Interview etiquette

- Present what you already know first — never ask what code already told you
- Accept brief answers — "same as Button" or "yeah, that's right" are perfectly valid
- If the designer says "skip" or "not sure", mark it as TODO and move on — partial knowledge files are better than no knowledge files
- Batch related questions when it makes sense, but don't overwhelm with a wall of text

### Phase 3: Draft Generation

Read the template from `references/llm-md-template.md` in this skill's directory. Use it as the structure, but adapt based on component type and what the interview revealed.

Key principles:
- **"When NOT to Use" comes before "When to Use"** — boundaries first, valid cases second
- **Don't parrot TypeScript** — the variants table is not a copy of the props interface. Focus on *when* and *why* to pick each variant, not the type signature
- **Code examples from reality** — prefer patterns from actual Storybook stories over invented ones. Diverse, canonical examples beat lengthy prose
- **Composition rules are prescriptive** — state how components *must* be composed, not how they *can* be. "Alert requires AlertContent" not "Alert can optionally contain AlertContent"
- **Write for AI consumers** — clear, structured, scannable. An LLM reading this file should make correct component choices without any other context
- **Every section must earn its place** — if a section would be empty or generic for this component, omit it entirely

### Phase 4: Stress Test

Before showing the draft to the designer, run an automated validation. Spawn a subagent that role-plays as a developer who has **only** the `.llm.md` file — no access to code, Storybook, or Figma. Give it 6-8 ambiguous prompts that test whether the document provides enough information to make the correct decision.

**Why this step exists:** The interview feels complete in the moment, but gaps only become visible when someone tries to *use* the document cold. This catches missing guidance before the designer signs off.

**How to construct the test prompts:**

Design prompts that target the highest-risk decisions — the ones where an AI is most likely to make the wrong choice:

1. **Boundary tests** (2-3 prompts) — scenarios where the component should NOT be used but an AI might reach for it anyway. E.g., "Show the user a success message after deleting a rule" (should be Toast, not Alert).
2. **Variant selection tests** (1-2 prompts) — scenarios where the AI must pick the right variant/color/option. E.g., "Inside a delete dialog, emphasize the action is irreversible" (should be destructive color).
3. **Composition tests** (1-2 prompts) — scenarios that test layout decisions. E.g., "Put an alert in a 280px sidebar" (should use bottom actions, not top-right).
4. **Edge case tests** (1-2 prompts) — scenarios at the boundary of what the document covers. E.g., "Build an alert with a custom star icon" (icon override rules).
5. **Content test** (1 prompt) — a badly-written title that violates the content guidelines. E.g., "Please Note: The Following Items Have Been Successfully Updated" (multiple violations).

**For each prompt, the subagent must:**
1. State what decision it would make
2. Quote the specific section that informed the decision
3. Rate confidence: HIGH / MEDIUM / LOW
4. If MEDIUM or LOW, explain what's missing

**After the test, compile results:**
- Count HIGH / MEDIUM / LOW
- List any gaps (things the document should cover but doesn't)
- List any ambiguities (things mentioned but not clear enough)

**Then fix the gaps** — update the `.llm.md` draft to address any MEDIUM or LOW findings before presenting to the designer. Small, targeted additions are best — don't bloat the document.

### Phase 5: Designer Review

Present the complete draft **along with the stress test results** to the designer:

> "Here's the draft. I also ran a stress test — 8 ambiguous prompts against the document. Results: {X} HIGH confidence, {Y} MEDIUM, {Z} LOW. I've already fixed the gaps I found. Take a look — anything to add, correct, or emphasize?"

Highlight which parts came from code (the AI can verify those) vs which came from the interview (the designer should validate those). Apply corrections and iterate until the designer approves.

### Phase 6: Save & Connect

Write the final file to:
```
packages/design-system/src/components/{ComponentName}/{ComponentName}.llm.md
```

After saving, explain the downstream impact:

> "Done. **{ComponentName}.llm.md** is saved next to the component source. Here's what happens next:
>
> - The metadata generator will parse this file at build time and include the semantic context in `dist/metadata/components.json`
> - The MCP server will serve this context to any AI tool that queries the design system
> - From now on, when anyone asks an AI 'build me a form with...' or 'show a notification...', the AI will have your design guidance to make the right choice
>
> Want to test another component, or adjust the template based on this experience?"

## Notes

- The `.llm.md` file is for AI consumption first, human readability second. Optimize for scannability and clear decision criteria.
- Don't duplicate what TypeScript interfaces already express. Focus on the semantic layer: when, why, how, with whom, and what to avoid.
- The "When NOT to Use" section has the highest impact — it prevents the most common AI mistake: using the wrong component for a use case.
- Keep code examples minimal but realistic. A 3-line snippet showing the right pattern beats a 30-line example.
- Partial files are fine. If the designer can't answer everything, save what you have with TODO markers. An 80% complete `.llm.md` is infinitely better than no `.llm.md`.

# Wallarm Design System: LLM Excellence Framework

## Strategic Research & Implementation Roadmap

**Author:** Claude (AI Research Assistant) for Artem Miskevich, Head of Design & DS Manager
**Date:** March 17, 2026
**Scope:** Full discovery, gap analysis, and action plan for making WASD (Wallarm Design System) the gold standard for LLM-friendly design systems

---

## 1. Executive Summary

Wallarm Design System (WASD) is already **ahead of 95% of design systems** in terms of LLM-readiness. You have a working MCP server, automated metadata generation via AST parsing, specialized Claude agents, skills, and rules. This is a strong foundation.

However, the current system captures **structural information** (props, types, variants) but largely misses **semantic knowledge** — the "why," "when," and "how" that separates competent code generation from *excellent, consistent, on-brand* interface building. The system knows **what** components exist but doesn't fully convey **why** to choose one over another, **how** to compose them into real interfaces, or **what rules** govern the writing, data formatting, and UX patterns above the component level.

This document proposes a layered framework — **WASD LLM Excellence** — that transforms your design system from a component catalog into a comprehensive AI-consumable knowledge base for building production-quality Wallarm interfaces.

---

## 2. Current State Assessment

### 2.1 What's Already Built (Strengths)

**Architecture & Infrastructure:**
- Monorepo (Turborepo + pnpm) with 56 components, clean separation of concerns
- `@wallarm-org/mcp` server (v0.1.0) — 4 tools (`search_component`, `get_component`, `search_token`, `get_token_category`) + 3 resources
- `@wallarm-org/mcp-core` — Zod schemas for type-safe metadata
- Automated metadata generation via ts-morph AST parsing at build time
- Storybook v10 with MCP addon
- Figma Code Connect integration

**AI Agent Infrastructure:**
- `CLAUDE.md` — project-level instructions (7KB, well-structured)
- `AGENTS.md` — routing to 4 specialized agents (Design System, Test, Component Architect, CI/CD)
- `.claude/agents/` — detailed agent prompts
- `.claude/rules/` — component-development, coding-standards, test-id, e2e rules
- `.claude/skills/` — `/new-component`, `/review-pr`, `/filter-field-design`
- Ralph autonomous agent for PR completion

**Component Quality:**
- CVA (class-variance-authority) for all variant definitions
- Ark UI headless primitives for accessible foundations
- Compound component patterns with Context
- Test ID cascading system
- `data-slot` attributes on every component
- Full Tailwind CSS v4 token system

### 2.2 Current LLM-Readiness Score: ~60/100

| Dimension | Score | Status |
|-----------|-------|--------|
| Component API documentation (props, types) | 9/10 | Excellent |
| Variant system documentation | 7/10 | Good (dynamic variants lost) |
| Design tokens accessibility | 8/10 | Good |
| MCP server functionality | 8/10 | Good |
| Usage examples from Storybook | 6/10 | Extracted but raw, no semantic context |
| "When to use" guidance per component | 2/10 | Almost absent from metadata |
| Composition patterns & rules | 2/10 | Not captured in metadata |
| Accessibility guidance | 2/10 | In code but not in AI-consumable form |
| UX copywriting standards | 0/10 | Does not exist |
| Data display patterns (dates, numbers, statuses) | 1/10 | Utilities exist, no guidelines |
| Interface assembly patterns (page layouts, flows) | 0/10 | Does not exist |
| Cross-component consistency rules | 1/10 | Implicit, not codified |
| Onboarding for non-designers (PMs, backend devs) | 1/10 | Not designed for this audience |

### 2.3 Gap Analysis: What's Missing for True LLM Excellence

**Layer 1 — Component Knowledge Gaps:**
- No "when to use" / "when NOT to use" descriptions per component
- No composition patterns (which sub-components are required vs optional, child ordering)
- No accessibility profiles (ARIA roles, keyboard patterns, screen reader behavior)
- Sub-component descriptions not captured in metadata
- Compound variants (CVA compoundVariants) not documented
- Dynamic variants (e.g., Badge colors) show as empty arrays
- Prop relationships (controlled/uncontrolled pairs, mutual exclusions) not expressed
- No component decision trees ("need a notification? → transient: Toast, persistent: Alert, blocking: Dialog")

**Layer 2 — Above-Component Knowledge Gaps:**
- No UX copywriting guidelines (tone, voice, error messages, empty states, CTAs)
- No data display standards (date formats, number formats, currency, percentages, durations)
- No status/state display conventions (how to show loading, error, empty, success consistently)
- No page layout patterns (common page structures, spacing rhythms, content hierarchies)
- No navigation patterns (breadcrumb rules, tab usage, sidebar conventions)
- No form patterns (validation messaging, field ordering, progressive disclosure)
- No responsive behavior guidelines

**Layer 3 — Platform Knowledge Gaps:**
- No Wallarm-specific product context (what the platform does, user personas, domain terminology)
- No existing UI patterns from the product (how existing pages are structured)
- No iconography guidelines (when to use which icon, icon + text vs icon-only rules)
- No color usage guidelines beyond tokens (when to use brand vs neutral, semantic color rules)

---

## 3. The LLM Excellence Framework

### 3.1 Architecture Overview

The framework is organized into **three tiers** that progressively enrich the AI's understanding:

```
┌─────────────────────────────────────────────────────────┐
│                    TIER 3: PLATFORM                      │
│  Product context, domain knowledge, existing patterns    │
├─────────────────────────────────────────────────────────┤
│                  TIER 2: GUIDELINES                       │
│  UX writing, data patterns, layouts, forms, a11y         │
├─────────────────────────────────────────────────────────┤
│                 TIER 1: COMPONENTS                        │
│  Enhanced metadata, composition, decision trees          │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Delivery Mechanisms

The framework leverages multiple delivery channels, each with different strengths:

| Mechanism | Best For | Consumed By | Already Exists? |
|-----------|----------|-------------|-----------------|
| **MCP Server** (enhanced) | Component API, tokens, search | All AI tools (Claude, Cursor, Windsurf) | Yes, needs enhancement |
| **Claude Skills** (new) | Complex workflows, multi-step tasks | Claude Code, Cowork | Partially (3 skills) |
| **CLAUDE.md** (enhanced) | Project context, high-level rules | Claude Code sessions | Yes, needs expansion |
| **Markdown knowledge base** | Detailed guidelines, patterns | AI tools reading files | No |
| **Cursor/Windsurf rules** | Editor-specific behavior | Cursor, Windsurf | No |
| **Component .md files** | Per-component deep knowledge | AI tools + humans | No |
| **Enhanced metadata schema** | Structured component data | MCP server | Partial |

### 3.3 Key Design Principle: Progressive Disclosure

Not everything should be in every AI prompt. The system should be designed so that:

1. **Always available** (in CLAUDE.md / .cursorrules): High-level principles, file references, component list
2. **On-demand via MCP**: Component details, tokens, search
3. **Deep-dive via skills**: Complex workflows (building a form, creating a page layout)
4. **Reference via .md files**: Detailed guidelines that skills and agents can read when needed

This prevents context window bloat while ensuring depth is always accessible.

---

## 4. Tier 1: Enhanced Component Knowledge

### 4.1 Component Knowledge Files

**Deliverable:** One `.llm.md` file per component (or per component group) in the component directory.

**Why `.llm.md`?** These files are specifically for AI consumption. They won't clutter human docs, can be parsed by the metadata generator, and are easy to maintain alongside component code.

**Structure for each component file:**

```markdown
# Button

## When to Use
- Primary actions on a page (Submit, Save, Create)
- Secondary actions that need visual weight (Cancel, Reset)
- Navigation actions that look like actions (not links)

## When NOT to Use
- Navigation between pages → use Link
- Toggling a boolean state → use Switch or ToggleButton
- Actions in a menu → use DropdownMenu items
- Icon-only compact actions → use ToggleButton with icon

## Composition
Required: Button is a standalone component, no sub-components needed.
With icons: Place icon before text for leading, after for trailing.
Icon-only: Pass only an icon child; aria-label is REQUIRED.

## Accessibility
- Keyboard: Enter/Space activates
- Always has accessible name (text content or aria-label)
- Disabled buttons are focusable but not actionable
- Loading state: aria-busy="true", button is disabled

## Common Patterns
### Form Submit Button
\`\`\`tsx
<Button type="submit" variant="primary" color="brand">Save Changes</Button>
\`\`\`

### Destructive Action with Confirmation
\`\`\`tsx
<Button variant="primary" color="destructive" onClick={openConfirmDialog}>
  Delete Rule
</Button>
\`\`\`

### Button Group (Primary + Secondary)
\`\`\`tsx
<Flex gap="3">
  <Button variant="primary">Save</Button>
  <Button variant="outline" color="neutral">Cancel</Button>
</Flex>
\`\`\`

## Do's and Don'ts
- DO: Use `color="destructive"` for dangerous actions
- DO: Use `variant="outline"` or `ghost` for secondary actions
- DON'T: Put two `variant="primary"` buttons side by side
- DON'T: Use Button for navigation (use Link with asChild)
- DON'T: Disable a button without explaining why (use tooltip)
```

**Scope:** Create `.llm.md` for every component (56 files). Prioritize by usage frequency.

### 4.2 Enhanced Metadata Schema

**Deliverable:** Extend `mcp-core` schema and metadata parsers.

New fields to add to `ComponentMetadata`:

```typescript
// In mcp-core/src/schema.ts
const componentMetadataSchema = z.object({
  // ... existing fields ...

  // NEW: Usage guidance
  whenToUse: z.string().optional(),      // Parsed from .llm.md "When to Use"
  whenNotToUse: z.string().optional(),   // Parsed from .llm.md "When NOT to Use"

  // NEW: Composition
  composition: z.object({
    requiredChildren: z.array(z.string()).optional(),
    optionalChildren: z.array(z.string()).optional(),
    childOrdering: z.string().optional(),
    pattern: z.enum(['standalone', 'compound-required', 'compound-optional', 'wrapper']).optional(),
  }).optional(),

  // NEW: Accessibility
  accessibility: z.object({
    ariaRoles: z.array(z.string()).optional(),
    keyboardPattern: z.string().optional(),
    screenReaderNotes: z.string().optional(),
  }).optional(),

  // NEW: Related components
  relatedComponents: z.array(z.object({
    name: z.string(),
    relationship: z.enum(['alternative', 'companion', 'parent', 'child']),
    note: z.string().optional(),
  })).optional(),

  // NEW: Tags for better search
  tags: z.array(z.string()).optional(),

  // NEW: Category
  category: z.enum([
    'actions', 'data-display', 'inputs', 'layout',
    'loading', 'messaging', 'navigation', 'overlay', 'primitives'
  ]).optional(),
})
```

New fields for `SubComponentMetadata`:

```typescript
const subComponentMetadataSchema = z.object({
  name: z.string(),
  description: z.string().optional(),  // NEW: Parse from JSDoc
  required: z.boolean().optional(),     // NEW: Is this sub-component required?
  props: z.array(propMetadataSchema),
})
```

### 4.3 Component Decision Trees

**Deliverable:** A new MCP tool `suggest_component` that takes a use case description and returns the best component.

```typescript
// New tool: suggest_component
Input: { useCase: string }  // e.g., "show a success message after form submission"
Output: Ranked suggestions with reasoning

// Example output:
1. Toast (score: 95) — Best for transient success feedback that auto-dismisses
2. Alert (score: 60) — Good for persistent success messages in page context
3. Dialog (score: 20) — Overkill for simple success feedback
```

This tool would use the `whenToUse` / `whenNotToUse` fields plus component tags and categories for intelligent matching.

### 4.4 New MCP Tool: `get_pattern`

```typescript
// New tool: get_pattern
Input: { pattern: string }  // e.g., "form", "data-table-page", "confirmation-dialog"
Output: Complete pattern with component composition, code example, and guidelines
```

### 4.5 The `/describe-component` Skill — Automated .llm.md Generator

This is the **cornerstone skill** of the entire framework. Instead of manually writing 56+ `.llm.md` files from scratch, this skill acts as an intelligent interviewer and researcher that **gathers information from three sources** — Figma, Storybook, and the human expert (you) — and synthesizes it into a standardized, high-quality knowledge file.

#### Why This Skill Is Critical

Writing a good `.llm.md` file requires knowledge that lives in three different places:

| Knowledge Source | What It Knows | How to Access |
|-----------------|---------------|---------------|
| **Figma** | Design intent, visual variants, spacing, states, edge cases, designer notes | Figma MCP (`get_design_context`, `get_metadata`, `get_variable_defs`, `get_code_connect_map`) |
| **Storybook + Code** | Implementation reality, props API, variant system, actual examples, accessibility attributes | Storybook MCP + reading `.tsx`, `.stories.tsx`, `classes.ts` files |
| **Human Expert (you)** | Design rationale, "when to use" decisions, cross-component relationships, product context, common mistakes, edge case gotchas | Interactive interview |

No single source has the full picture. The skill merges all three.

#### Skill Workflow: 5 Phases

```
┌──────────────────────────────────────────────────────────────┐
│  PHASE 1: AUTOMATED RESEARCH (no human input needed)         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  Read Code   │  │ Query Figma  │  │ Read Storybook     │  │
│  │  .tsx files   │  │  MCP tools   │  │  stories + docs    │  │
│  │  classes.ts   │  │  screenshots │  │  examples + args   │  │
│  │  types.ts     │  │  variants    │  │  interactions      │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬──────────┘  │
│         └─────────────────┼─────────────────────┘            │
│                           ▼                                  │
│              ┌────────────────────────┐                      │
│              │  Compiled Research      │                      │
│              │  Brief (internal)       │                      │
│              └────────────┬───────────┘                      │
├───────────────────────────┼──────────────────────────────────┤
│  PHASE 2: SMART INTERVIEW (interactive, 3-4 questions)       │
│                           ▼                                  │
│  "I've analyzed Button from Figma and Storybook. Here's      │
│   what I already know: [summary]. Now I need your input on   │
│   a few things I can't determine from code alone..."         │
│                                                              │
│  Q1: Usage decisions (when to use / not use)                 │
│  Q2: Common mistakes & gotchas                               │
│  Q3: Cross-component relationships                           │
│  Q4: Product-specific context                                │
├──────────────────────────────────────────────────────────────┤
│  PHASE 3: DRAFT GENERATION                                   │
│  → Generates complete .llm.md following standard template     │
│  → Presents draft for review                                 │
├──────────────────────────────────────────────────────────────┤
│  PHASE 4: REFINEMENT INTERVIEW (optional, 1-2 questions)     │
│  "Here's the draft. Anything to add or correct?"             │
│  → Human reviews, adds nuances, fixes inaccuracies           │
├──────────────────────────────────────────────────────────────┤
│  PHASE 5: FINALIZE & SAVE                                    │
│  → Writes final .llm.md to component directory               │
│  → Optionally updates metadata schema if new patterns found  │
└──────────────────────────────────────────────────────────────┘
```

#### Phase 1: Automated Research (Detail)

The skill reads everything it can **before asking the human a single question**. This respects the expert's time — instead of asking "what props does Button have?" (which code already knows), it asks only what code *can't* tell us.

**From Source Code** (reading files directly):
- `Button.tsx` → props interface, JSDoc comments, render structure, ARIA attributes, ref forwarding
- `classes.ts` → all CVA variants, compound variants, default values
- `types.ts` → exported type definitions, enum values
- `index.ts` → what's exported, sub-component list
- `context.ts` / `hooks.ts` → internal state patterns, context dependencies

**From Figma MCP** (via available tools):
- `get_design_context(fileKey, nodeId)` → full design spec, visual variants, spacing, padding
- `get_metadata(fileKey, nodeId)` → layer structure, auto-layout rules, constraints
- `get_screenshot(fileKey, nodeId)` → visual reference for understanding design intent
- `get_variable_defs(fileKey, nodeId)` → design tokens used by this component
- `get_code_connect_map(fileKey, nodeId)` → existing Figma↔Code mappings from `.figma.tsx`

**From Storybook** (reading story files + optionally Storybook MCP):
- `Button.stories.tsx` → all story examples, arg types, doc descriptions
- Storybook MCP at `localhost:6006/mcp` → interactive docs, rendered examples

**The skill compiles a Research Brief** — an internal summary like:

```
RESEARCH BRIEF: Button
━━━━━━━━━━━━━━━━━━━━━
Props: 12 (variant, color, size, disabled, loading, asChild, ...)
Variants: 3 axes (variant: 4 options, color: 4 options, size: 3 options)
Compound variants: 8 (disable certain color+variant combos)
Sub-components: None (standalone)
Figma variants: 48 combinations in Figma file
Figma notes: "Use Primary/Brand for main CTA, limit to 1 per screen"
Code Connect: Maps Figma "Type" → variant, "Size" → size, "State" → loading
Storybook examples: 10 stories (Basic, Variants, Sizes, Disabled, Loading, Icons, Badge, IconOnly, LinkAsButton, FullWidth)
Accessibility: No explicit ARIA roles in code, keyboard handling via native <button>
JSDoc: "Primary interactive button component"

GAPS IDENTIFIED (need human input):
- When to use Button vs Link vs ToggleButton (not in code)
- Maximum buttons per page/section (design rule, not code rule)
- Preferred color for destructive actions (implicit but not documented)
- Common composition patterns with other components
```

#### Phase 2: Smart Interview (Detail)

The skill asks **only questions it couldn't answer from research**. Questions are multiple-choice where possible to speed things up. The interview is structured in **rounds** — the first round covers critical gaps, subsequent rounds go deeper.

**Round 1 — Core Usage Decisions (always asked):**

```
I've analyzed Button from Figma and code. Here's what I found:
- 4 variants (primary, outline, ghost, secondary)
- 4 colors (brand, neutral, neutral-alt, destructive)
- 3 sizes (large, medium, small)
- 10 Storybook examples covering most combinations

Now I need your design expertise on a few things:

Q1: WHEN TO USE
When should someone choose Button over these alternatives?
  a) Button vs Link — when does an action deserve a button vs a link?
  b) Button vs ToggleButton — where's the boundary?
  c) Any cases where people mistakenly use Button?
  [Free text or quick answers]

Q2: KEY DESIGN RULES
I noticed Figma has a note "limit primary to 1 per screen."
Are there other rules like this? For example:
  a) Max number of buttons in a button group?
  b) Required pairing rules (e.g., "destructive always needs a Cancel")?
  c) Colors restricted to certain contexts?

Q3: COMMON MISTAKES
What mistakes do developers/PMs make most often with Button?
  (e.g., using it for navigation, wrong variant choice, missing labels)

Q4: RELATIONSHIPS
Which components does Button most often appear together with?
  (e.g., Dialog footer, Form bottom, Card actions, Table row actions)
```

**Round 2 — Deep Dive (asked only if Round 1 reveals gaps):**

```
Q5: ACCESSIBILITY GOTCHAS
I see the component doesn't have explicit ARIA roles.
Any a11y rules you enforce in design review?

Q6: PRODUCT-SPECIFIC PATTERNS
In the Wallarm Console specifically, are there Button usage
patterns unique to your product? (e.g., "Create Rule" is always
primary/brand, "Delete" is always primary/destructive with
confirmation dialog)
```

#### Phase 3: Draft Generation

The skill generates the `.llm.md` file following a **strict standardized template**:

```markdown
# {ComponentName}

> {One-line description from JSDoc or Figma}

## Category
{actions | data-display | inputs | layout | loading | messaging | navigation | overlay | primitives}

## When to Use
{Bullet list from interview Q1 + Figma notes, written as clear decision criteria}

## When NOT to Use
{Negative cases from interview, with alternatives: "→ use {Component} instead"}

## Anatomy
{For compound components: required vs optional sub-components, ordering}
{For standalone: key visual parts (icon slot, label, badge slot)}

## Variants & Options
| Variant | Options | Default | Notes |
|---------|---------|---------|-------|
| variant | primary, outline, ghost, secondary | primary | ... |
| color | brand, neutral, neutral-alt, destructive | brand | ... |
| size | large, medium, small | large | ... |

### Variant Rules
{Compound variant restrictions from classes.ts, e.g., "ghost + destructive is not available"}

## Composition Patterns
### Pattern: {Name}
{Description + code example from Storybook or synthesized}
```tsx
<Flex gap="3">
  <Button variant="primary">Save</Button>
  <Button variant="outline" color="neutral">Cancel</Button>
</Flex>
```

## Accessibility
- Keyboard: {from code analysis}
- ARIA: {from code + interview}
- Screen reader: {from code + interview}
- Focus: {from code analysis}

## Do's and Don'ts
| Do | Don't |
|----|-------|
| Use `color="destructive"` for dangerous actions | Put two primary buttons side by side |
| Use `variant="outline"` for secondary actions | Use Button for page navigation |
| ... | ... |

## Related Components
| Component | Relationship | When to prefer |
|-----------|-------------|----------------|
| Link | Alternative | For navigation actions |
| ToggleButton | Alternative | For boolean toggles |
| Dialog | Companion | Often used in Dialog footer |
| ... | ... | ... |

## Platform Context
{Wallarm-specific usage patterns from interview Q6}

## Tags
{Searchable tags: action, cta, submit, form, interactive}
```

#### Phase 4 & 5: Refinement & Save

The skill presents the draft and asks: "Here's what I've put together. Anything to add, correct, or emphasize?" After the human approves (or provides corrections), the file is saved to the component directory.

#### Skill Invocation Examples

```
User: /describe-component Button
Agent: [reads code, queries Figma MCP, reads stories]
       "I've analyzed Button. Here's what I found: [brief].
        Now 4 questions for you..."

User: /describe-component Alert
Agent: [reads code — finds compound component with 6 sub-components]
       [queries Figma — finds design notes about color usage]
       "Alert is a compound component. I found 6 sub-components and
        5 color variants. Here's what I already know: [brief].
        I have specific questions about required vs optional children
        and your rules for choosing Alert vs Toast vs Dialog..."

User: /describe-component Table
Agent: [reads code — finds complex component with virtualization, TanStack integration]
       [queries Figma — finds multiple table patterns]
       "Table is your most complex component. I found column visibility,
        virtualization, sorting, and 12 sub-components. This will need
        a more detailed interview. Let's start with the most common
        table patterns in Wallarm Console..."
```

#### Batch Mode

For efficiency, the skill supports a batch mode to describe multiple related components:

```
User: /describe-component --batch inputs
Agent: "I'll create .llm.md files for all input components:
        Input, Textarea, NumberInput, Select, Checkbox, Radio,
        Switch, DateInput, DateRangeInput, TimeInput.
        I'll research all of them first, then interview you
        about the group — many questions overlap across inputs."
```

This is dramatically faster than doing each one individually, because questions like "what are your form validation patterns?" apply to all input components.

#### Template Variants

The standard template adapts based on component type:

| Component Type | Template Adjustments |
|---------------|---------------------|
| **Standalone** (Button, Badge) | No anatomy section, focus on variant selection |
| **Compound** (Alert, Dialog) | Expanded anatomy with required/optional children |
| **Layout** (Flex, Stack) | Focus on spacing patterns, responsive behavior |
| **Input** (Input, Select) | Focus on form integration, validation, Field context |
| **Data Display** (Table, Code) | Focus on data formatting, loading states, empty states |
| **Overlay** (Dialog, Drawer, Popover) | Focus on trigger patterns, stacking, dismissal |

---

## 5. Tier 2: Above-Component Guidelines

This is where you go from "correct components" to "correct interfaces." Each guideline becomes a markdown file in a `/guidelines/` directory AND a Claude skill for active enforcement.

### 5.1 UX Copywriting Guidelines

**File:** `guidelines/ux-copywriting.md`
**Skill:** `/ux-copy` — Reviews and generates UI text following Wallarm voice & tone

**Contents should cover:**

- **Voice & Tone**: Wallarm's personality in UI text (professional, clear, security-focused)
- **Capitalization rules**: Title Case for headings, Sentence case for labels, buttons, etc.
- **Button labels**: Action verbs ("Save", "Create Rule", "Delete"), never generic ("OK", "Submit", "Click Here")
- **Error messages pattern**: What happened → Why → How to fix. Example: "Unable to save the rule. The IP range overlaps with an existing rule. Remove the conflicting range or edit the existing rule."
- **Empty states**: Explain what will appear here + provide action. Example: "No rules configured yet. Create your first rule to start filtering traffic."
- **Confirmation dialogs**: Question format with clear consequences. Example: "Delete this rule? All traffic matching this rule will no longer be filtered. This action cannot be undone."
- **Loading states**: "Loading rules...", "Analyzing traffic...", never just "Loading..."
- **Success messages**: Confirm what happened. "Rule created successfully" not just "Success"
- **Placeholder text**: Descriptive, not generic. "e.g., 192.168.1.0/24" not "Enter value"
- **Tooltips**: Brief, informative, no period at end
- **Truncation rules**: When to truncate, ellipsis placement, tooltip on hover

### 5.2 Data Display Patterns

**File:** `guidelines/data-display.md`
**Skill:** `/data-format` — Enforces consistent data formatting

**Contents should cover:**

- **Dates**: ISO 8601 for APIs, "Mar 17, 2026" for UI, "2 hours ago" for recent events, always show timezone for absolute times
- **Numbers**: Use `abbreviateNumber()` utility for large numbers (1.2K, 3.4M), use locale-aware formatting for precision numbers
- **Percentages**: One decimal max (99.9%), show direction (↑ 12.3%), use color coding (green for positive, red for negative)
- **Durations**: "2h 30m" for short, "3 days" for longer, "< 1 min" for very short
- **IP addresses**: Monospace font (Code component), truncate with tooltip for ranges
- **Status indicators**: Badge component with semantic colors (green=active, red=blocked, amber=warning, gray=inactive)
- **Currency**: Always show currency code, locale-aware formatting
- **File sizes**: Binary units (KB, MB, GB), one decimal max
- **Counts with zero state**: "0 rules" not "No rules" in data contexts (tables, badges)
- **Timestamps in tables**: Consistent format across all tables, relative times with absolute on hover

### 5.3 Form Patterns

**File:** `guidelines/forms.md`
**Skill:** `/form-pattern` — Guides consistent form construction

**Contents:**

- **Field ordering**: Most important first, related fields grouped, progressive disclosure for advanced options
- **Validation timing**: Validate on blur for individual fields, on submit for cross-field validation
- **Error display**: Inline errors below fields (Field component), summary at top for multiple errors
- **Required vs optional**: Mark optional fields (not required ones — most should be required)
- **Field widths**: Match expected input length (IP field narrower than description field)
- **Button placement**: Primary action right-aligned, Cancel before Submit
- **Disabled states**: Always explain why via tooltip
- **Multi-step forms**: Progress indicator (Tabs or Breadcrumbs), save intermediate state

### 5.4 Page Layout Patterns

**File:** `guidelines/page-layouts.md`
**Skill:** `/page-layout` — Generates consistent page structures

**Contents:**

- **Standard page anatomy**: Page header (breadcrumb + title + actions) → Filters → Content → Pagination
- **Table page pattern**: Header with title + Create button, filter bar, data table, pagination
- **Detail page pattern**: Breadcrumb back, entity header with status badge, tabbed content sections
- **Settings page pattern**: Sidebar navigation (Tabs vertical), content area, save actions sticky footer
- **Dashboard page pattern**: KPI cards row, charts grid, recent activity table
- **Empty page pattern**: Illustration + explanation + CTA
- **Spacing rhythm**: Consistent gaps between sections (use Stack with specific gap values)
- **Content width**: Max-width constraints for readability

### 5.5 Status & State Patterns

**File:** `guidelines/states.md`
**Skill:** `/states` — Ensures consistent state handling

**Contents:**

- **Loading states**: Skeleton for known layouts, Loader spinner for unknown content, "Loading [entity]..." text
- **Empty states**: Illustration + explanation + primary action CTA
- **Error states**: Alert component (color=destructive), retry action when applicable
- **Success states**: Toast for transient, Alert for persistent in context
- **Partial states**: Skeleton for loading sections within loaded pages
- **Disabled vs readonly**: Disabled = can't interact (grayed out), Readonly = can view but not edit (normal appearance)
- **Selection states**: Checkbox for multi-select, Radio for single-select, highlight row/card on selection

### 5.6 Navigation Patterns

**File:** `guidelines/navigation.md`

**Contents:**

- **Breadcrumbs**: Always show on non-root pages, last item is current page (not clickable)
- **Tabs**: For same-page content switching, not for navigation between pages
- **Sidebar navigation**: For settings and configuration pages
- **Back button**: Use breadcrumbs, not a standalone back button
- **Deep linking**: All tab states and filter states should be URL-addressable

### 5.7 Accessibility Guidelines

**File:** `guidelines/accessibility.md`
**Skill:** `/a11y-check` — Validates accessibility of generated interfaces

**Contents:**

- **Color contrast**: All text meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large)
- **Keyboard navigation**: All interactive elements focusable, logical tab order, visible focus rings
- **Screen reader**: All images have alt text, all icons have labels, dynamic content uses aria-live
- **Motion**: Respect `prefers-reduced-motion`, provide alternatives for animations
- **Form accessibility**: Labels linked to inputs, error messages linked via aria-describedby
- **Modal accessibility**: Focus trap, return focus on close, ESC to dismiss

### 5.8 Iconography Guidelines

**File:** `guidelines/iconography.md`

**Contents:**

- **When to use icons**: Paired with text for scannability, standalone only for universally understood actions (close, search, settings)
- **Icon + text rules**: Icon before text for actions, icon after text for external links
- **Icon sizing**: Match text size (use icon token sizes), maintain optical balance
- **Icon color**: Inherit text color (`currentColor`), use semantic colors for status icons
- **Custom icons**: Contribution process, SVG requirements, naming convention

---

## 6. Tier 3: Platform Knowledge

### 6.1 Product Context File

**File:** `guidelines/wallarm-platform.md`

This file gives AI tools context about what Wallarm is and what interfaces they're building. Without this, an LLM will generate generic interfaces instead of Wallarm-appropriate ones.

**Contents:**

- **What Wallarm is**: API security platform (WAF, API discovery, vulnerability detection)
- **User personas**: Security engineer, DevOps, CTO, compliance officer
- **Domain terminology**: Rules, triggers, attacks, incidents, endpoints, API specifications, vulnerabilities
- **Common entities**: Rules (IP rules, behavioral rules, virtual patches), Attacks (hits, payloads, sources), APIs (endpoints, schemas, parameters)
- **Navigation structure**: Main sections of the platform (Dashboard, Attacks, Rules, API Discovery, Settings)
- **Data density**: Security products are data-heavy — tables with many columns, dashboards with charts, detail pages with logs

### 6.2 Existing UI Patterns Library

**File:** `guidelines/existing-patterns.md`

Document actual patterns used in the Wallarm Console today, so AI generates code consistent with the existing product.

**Contents:**

- **Attack list page**: How attacks are displayed (table with columns, filters, detail drawer)
- **Rule creation flow**: How rules are created (multi-step dialog, field dependencies)
- **Dashboard layout**: KPI cards, chart arrangement, time range selector
- **Settings organization**: How settings pages are structured
- **Common filter combinations**: What filter types are used together

---

## 7. Skills & Agents Roadmap

### 7.1 New Skills to Create

| # | Skill Name | Trigger | What It Does |
|---|-----------|---------|--------------|
| **0** | **`/describe-component`** | **"describe Button", "create llm.md", "document component"** | **THE CORNERSTONE SKILL. Researches Figma + Storybook + interviews human → generates standardized .llm.md file. See Section 4.5 for full detail.** |
| 1 | `/ux-copy` | "write UI text", "error message", "empty state text" | Generates UI text following Wallarm voice & tone guidelines. Reads `guidelines/ux-copywriting.md` |
| 2 | `/data-format` | "format dates", "display numbers", "show status" | Enforces data display consistency. Reads `guidelines/data-display.md` |
| 3 | `/form-pattern` | "create a form", "add form fields", "validation" | Builds consistent forms with proper field ordering, validation, layout. Reads `guidelines/forms.md` |
| 4 | `/page-layout` | "create a page", "build a view", "new page" | Generates page layouts following Wallarm patterns. Reads `guidelines/page-layouts.md` |
| 5 | `/a11y-check` | "check accessibility", "a11y", "screen reader" | Validates and fixes accessibility issues. Reads `guidelines/accessibility.md` |
| 6 | `/states` | "loading state", "empty state", "error state" | Generates proper loading/empty/error/success state implementations |
| 7 | `/component-picker` | "which component should I use", "what's the best component for" | Interactive component selection wizard using decision trees |
| 8 | `/ui-review` | "review this interface", "check this UI", "is this correct" | Reviews generated UI code against all guidelines and suggests improvements |
| 9 | `/prototype` | "quick prototype", "wireframe", "mockup" | Rapid prototyping skill optimized for PMs — creates working HTML prototypes |
| 10 | `/icon-picker` | "which icon", "find icon for", "icon for action" | Searches icon library with semantic understanding |

### 7.2 Enhanced Existing Agents

**Design System Agent** — Enhance with:
- Auto-read of relevant `.llm.md` file when working on a component
- Composition validation (checks sub-component usage against composition rules)
- Accessibility checklist enforcement from metadata

**Component Architect Agent** — Enhance with:
- Read guidelines for forms, layouts, states when designing new components
- Auto-suggest related components and composition patterns
- Decision tree for pattern selection based on use case

### 7.3 New Agents

| Agent | Role | When Triggered |
|-------|------|----------------|
| **UI Consistency Agent** | Reviews generated code against all guidelines | After any UI code generation |
| **UX Copy Agent** | Reviews and corrects all UI text in generated code | When generating UI with text content |
| **Platform Context Agent** | Injects Wallarm-specific context into component choices | When building Wallarm product features |

---

## 8. MCP Server Enhancements

### 8.1 New Tools

| Tool | Input | Output | Purpose |
|------|-------|--------|---------|
| `suggest_component` | `{ useCase: string }` | Ranked component suggestions | Help LLMs pick the right component |
| `get_pattern` | `{ pattern: string }` | Full pattern with code | Provide common UI patterns |
| `get_guideline` | `{ topic: string }` | Relevant guideline content | Access to above-component guidelines |
| `validate_composition` | `{ component: string, children: string[] }` | Validation result | Check if component composition is correct |
| `get_related_components` | `{ component: string }` | Related components with context | Discover companion components |

### 8.2 Enhanced Existing Tools

**`get_component`** — Now returns:
- "When to Use" / "When NOT to Use" sections
- Composition requirements
- Accessibility profile
- Related components
- Do's and Don'ts

**`search_component`** — Now searches:
- Tags and categories
- "When to use" descriptions
- Related components

### 8.3 New Resources

| Resource URI | Content |
|-------------|---------|
| `ds://guidelines/{topic}` | UX copywriting, data display, forms, etc. |
| `ds://patterns/{name}` | Common UI patterns with code |
| `ds://platform` | Wallarm product context |
| `ds://decision-tree/{use-case}` | Component selection guidance |

---

## 9. .cursorrules / Editor Integration

**Deliverable:** `.cursorrules` file in repo root for Cursor users, equivalent for Windsurf.

**Contents:**

```
You are building interfaces with the Wallarm Design System (@wallarm-org/design-system).

Core rules:
- Always import from '@wallarm-org/design-system' or '@wallarm-org/design-system/{Component}'
- Use the MCP server (wallarm-ds) to look up components, props, and tokens before writing code
- Never use raw HTML elements when a design system component exists (e.g., use <Button> not <button>)
- Always use semantic design tokens, never raw colors or spacing values
- All text in the UI must follow the UX copywriting guidelines in guidelines/ux-copywriting.md
- Format all dates, numbers, and statuses according to guidelines/data-display.md
- Build forms following the patterns in guidelines/forms.md
- Use the page layout patterns in guidelines/page-layouts.md for new pages

Before generating UI code, always:
1. Query the MCP server for relevant components
2. Read the component's .llm.md file for usage guidance
3. Check guidelines/ for relevant above-component patterns
4. Validate your composition against the component's requirements
```

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3) — "Component Knowledge"

**Goal:** Every component has rich AI-consumable documentation.

| Task | Effort | Priority | Owner |
|------|--------|----------|-------|
| **Build `/describe-component` skill** | 2-3 days | **P0** | DS team + Frontend dev |
| Run `/describe-component` for top 20 most-used components (with Artem as interviewer) | 3-4 days | P0 | Artem + AI skill |
| Extend metadata schema with new fields | 1 day | P0 | Frontend dev |
| Update metadata parsers to read `.llm.md` files | 1-2 days | P0 | Frontend dev |
| Add sub-component descriptions to metadata | 0.5 day | P0 | Frontend dev |
| Run `/describe-component --batch` for remaining 36 components | 2-3 days | P1 | Artem + AI skill |
| Register wallarm-ds MCP in `.mcp.json` | 0.5 hour | P0 | Frontend dev |
| Add `.cursorrules` file to repo | 0.5 day | P1 | DS team |

**Definition of Done:** Every component has when-to-use, composition rules, accessibility notes, and dos/don'ts accessible via MCP. All `.llm.md` files generated through the standardized `/describe-component` skill pipeline.

### Phase 2: Guidelines (Weeks 4-6) — "Above Components"

**Goal:** All major above-component patterns are documented and enforceable.

| Task | Effort | Priority | Owner |
|------|--------|----------|-------|
| Write UX copywriting guidelines | 2 days | P0 | Design/Content |
| Write data display patterns | 1 day | P0 | Design |
| Write form patterns | 1 day | P0 | Design |
| Write page layout patterns | 2 days | P0 | Design |
| Write status/state patterns | 1 day | P1 | Design |
| Write accessibility guidelines | 1 day | P1 | Design |
| Write iconography guidelines | 0.5 day | P2 | Design |
| Write navigation patterns | 0.5 day | P2 | Design |
| Create `/ux-copy` skill | 0.5 day | P0 | DS team |
| Create `/data-format` skill | 0.5 day | P0 | DS team |
| Create `/form-pattern` skill | 0.5 day | P1 | DS team |
| Create `/page-layout` skill | 0.5 day | P1 | DS team |

**Definition of Done:** LLM can generate a complete Wallarm-style page with correct text, data formatting, form patterns, and layout.

### Phase 3: Intelligence (Weeks 7-9) — "Smart Assistance"

**Goal:** AI doesn't just look up components — it suggests, validates, and reviews.

| Task | Effort | Priority | Owner |
|------|--------|----------|-------|
| Implement `suggest_component` MCP tool | 1-2 days | P0 | Frontend dev |
| Implement `get_pattern` MCP tool | 1-2 days | P1 | Frontend dev |
| Implement `get_guideline` MCP tool | 1 day | P1 | Frontend dev |
| Create `/component-picker` skill | 1 day | P1 | DS team |
| Create `/ui-review` skill | 1-2 days | P1 | DS team |
| Create `/prototype` skill for PMs | 1-2 days | P2 | DS team |
| Enhance search scoring with tags/categories | 0.5 day | P1 | Frontend dev |

**Definition of Done:** LLM can suggest the right component for a use case, generate pattern-compliant code, and self-review against guidelines.

### Phase 4: Platform (Weeks 10-12) — "Wallarm Context"

**Goal:** AI generates interfaces that feel like Wallarm, not generic React apps.

| Task | Effort | Priority | Owner |
|------|--------|----------|-------|
| Document Wallarm platform context | 2 days | P1 | Design + Product |
| Document existing UI patterns from Console | 3-4 days | P1 | Design |
| Create `/a11y-check` skill | 1 day | P2 | DS team |
| Create `/states` skill | 0.5 day | P2 | DS team |
| Create UI Consistency Agent | 1 day | P2 | DS team |
| End-to-end testing: PM builds a prototype | 2 days | P0 | PM + Design |

**Definition of Done:** A PM with no frontend experience can prompt "Create a page that shows a list of API endpoints with their risk scores" and get a working, on-brand prototype.

---

## 11. Success Metrics

### Quantitative
- **Component accuracy**: % of generated code that uses the correct component for the use case (target: >90%)
- **Guideline compliance**: % of generated UI text, data formats, and layouts that follow guidelines (target: >85%)
- **First-attempt quality**: % of generated prototypes that need zero structural corrections (target: >70%)
- **MCP tool usage**: Number of MCP queries per coding session (target: increase 3x)

### Qualitative
- PMs can create working prototypes without asking designers for help
- Backend developers produce UI code that passes design review without major changes
- Designers spend less time on reviews because AI-generated code is already consistent
- New team members can build on-brand interfaces within their first week

---

## 12. File Structure (Final State)

```
wallarm-design-system/
├── .cursorrules                          # Editor AI rules
├── CLAUDE.md                             # Enhanced project instructions
├── AGENTS.md                             # Agent routing (updated)
├── .claude/
│   ├── agents/
│   │   ├── design-system.md              # Enhanced with .llm.md reading
│   │   ├── test.md
│   │   ├── component-architect.md
│   │   ├── ci.md
│   │   ├── ui-consistency.md             # NEW
│   │   └── ux-copy.md                    # NEW
│   ├── rules/
│   │   ├── component-development.md
│   │   ├── coding-standards.md
│   │   ├── test-id.md
│   │   └── e2e.md
│   └── skills/
│       ├── new-component/
│       ├── review-pr/
│       ├── describe-component/           # NEW — Cornerstone skill (see 4.5)
│       ├── ux-copy/                      # NEW
│       ├── data-format/                  # NEW
│       ├── form-pattern/                 # NEW
│       ├── page-layout/                  # NEW
│       ├── a11y-check/                   # NEW
│       ├── states/                       # NEW
│       ├── component-picker/             # NEW
│       ├── ui-review/                    # NEW
│       ├── prototype/                    # NEW
│       └── icon-picker/                  # NEW
├── guidelines/                           # NEW: AI-consumable knowledge base
│   ├── ux-copywriting.md
│   ├── data-display.md
│   ├── forms.md
│   ├── page-layouts.md
│   ├── states.md
│   ├── navigation.md
│   ├── accessibility.md
│   ├── iconography.md
│   ├── wallarm-platform.md
│   └── existing-patterns.md
├── packages/
│   ├── design-system/
│   │   └── src/components/
│   │       ├── Button/
│   │       │   ├── Button.tsx
│   │       │   ├── Button.llm.md         # NEW: AI knowledge file
│   │       │   ├── ...
│   │       ├── Alert/
│   │       │   ├── Alert.tsx
│   │       │   ├── Alert.llm.md          # NEW
│   │       │   ├── ...
│   │       └── ... (56 components)
│   ├── mcp/                              # Enhanced with new tools
│   │   └── src/tools/
│   │       ├── search-component.ts
│   │       ├── get-component.ts          # Enhanced output
│   │       ├── suggest-component.ts      # NEW
│   │       ├── get-pattern.ts            # NEW
│   │       ├── get-guideline.ts          # NEW
│   │       └── ...
│   └── mcp-core/                         # Enhanced schema
└── ...
```

---

## 13. Comparative Analysis: Approach Options

### Option A: "MCP-First" (Recommended)

Everything flows through the MCP server. Component knowledge, guidelines, patterns — all served via MCP tools and resources.

**Pros:** Works with any AI tool (Claude, Cursor, Windsurf, v0, etc.); single source of truth; structured, searchable.
**Cons:** Requires MCP server enhancements; some AI tools have limited MCP support.

### Option B: "Files-First"

Everything is in markdown files. AI tools read files directly from the repository.

**Pros:** Simple to create and maintain; no code changes needed; works everywhere.
**Cons:** Requires AI to know which file to read; no search/suggestion capability; context window heavy.

### Option C: "Skill-First"

Everything is encoded as Claude Code skills. Each skill contains domain knowledge.

**Pros:** Rich, interactive workflows; great for Claude Code users; can combine multiple guidelines.
**Cons:** Only works in Claude Code/Cowork; not portable to Cursor/Windsurf.

### Recommended: Hybrid A + B + C

**Use all three mechanisms**, with each serving its optimal role:

- **MCP** = structured data, search, suggestions (components, tokens, patterns)
- **Files** = detailed guidelines, reference material (ux-copy, data-display, etc.)
- **Skills** = complex workflows, multi-step tasks (building a form, prototyping a page)

The markdown files ARE the source of truth. MCP server reads them and serves them structured. Skills read them and guide workflows. This way, you maintain in one place and deliver through three channels.

---

## 14. Quick Wins (Start This Week)

These require minimal effort but have outsized impact:

1. **Add wallarm-ds MCP to `.mcp.json`** — Currently missing! Users have to configure it manually. (30 minutes)

2. **Add `.cursorrules` file** — Even a basic one dramatically improves Cursor experience. (1 hour)

3. **Write `.llm.md` for Button, Alert, Dialog, Table, Select** — The 5 most-used components. (2-3 hours)

4. **Enhance CLAUDE.md** — Add explicit references to guidelines/ directory and component .llm.md files. (1 hour)

5. **Create a UX copywriting cheat sheet** — Even a simple list of "error message format: What → Why → How to fix" improves every AI interaction. (2 hours)

---

## 15. Key References & Inspiration

- **Hardik Pandya**: "Expose Your Design System to LLMs" — structured markdown spec files as the foundation
- **Oleksandra Huba**: "Dear LLM, here's how my design system works" — three-layer approach (prompts, rules, workflow enforcement)
- **shadcn/ui**: Open-code philosophy — AI can read and modify actual component code
- **Vercel v0**: Design system as model input — structured data guides generation
- **Anthropic**: Building Effective AI Agents — multi-agent systems with specialized domain experts
- **Marie Claire Dean**: 63 Design Skills for Claude — comprehensive skill pack for design practitioners
- **Figma MCP**: Design system context delivery via Model Context Protocol
- **Carbon for AI (IBM)**: Extended design system with AI-specific patterns for transparency and explainability

---

*This document represents the complete findings of a deep research phase. The next step is to prioritize, assign, and begin Phase 1 execution.*

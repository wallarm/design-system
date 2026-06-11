# .llm.md Template Reference

This is the standard template for component knowledge files. Adapt sections based on component type — not every section applies to every component.

## Table of Contents

1. [Full Template](#full-template)
2. [Template Adjustments by Type](#template-adjustments-by-type)
3. [Section Guidance](#section-guidance)

## Full Template

```markdown
# {ComponentName}

> {One-line description}

## Category
{actions | data-display | inputs | layout | loading | messaging | navigation | overlay | primitives}

## When NOT to Use
{List of wrong use cases with correct alternatives: "→ use {Component} instead"}
{This section comes FIRST because it defines boundaries — everything not listed here is valid}

## When to Use
{Bullet list — the positive cases, derived from what's left after exclusions + interview insights}

## Anatomy
{For compound components: list sub-components with required/optional}
{For standalone: key visual parts (icon slot, label, etc.)}
{Skip for simple components like Badge, Text}

## Variants & Options
| Prop | Options | Default | Notes |
|------|---------|---------|-------|
{From CVA variants in classes.ts}

### Variant Rules
{Compound variant restrictions, e.g., "ghost + destructive is not available"}
{Skip if no compound variants}

## Composition Patterns
### {Pattern Name}
{Description — use prescriptive language: "must", "always", "requires"}
```tsx
{Code example — prefer real patterns from stories, adapt if needed}
\```
{Repeat for 2-4 most common patterns}

## Accessibility
- **Keyboard:** {from code analysis}
- **ARIA:** {roles, attributes found in code}
- **Screen reader:** {from code + interview}
- **Focus:** {focus management patterns}

## Gotchas
{Things that surprise people or behave unexpectedly — 2-4 bullets}
{E.g., "Icon-only Button requires aria-label — screen readers will announce nothing without it"}
{E.g., "ghost variant has no visible boundary — users may not realize it's clickable"}
{Omit if nothing non-obvious surfaced during interview}

## Do's and Don'ts
| Do | Don't |
|----|-------|
{From interview + code analysis, 3-6 rows}

## Related Components
| Component | Relationship | When to prefer |
|-----------|-------------|----------------|
{From interview + code analysis}

## Platform Context
{Wallarm-specific usage patterns from interview}
{If no platform context gathered, omit this section entirely}

## Tags
{Comma-separated searchable tags}
```

## Template Adjustments by Type

| Type | Adjustments |
|------|------------|
| **Standalone** (Button, Badge) | Skip Anatomy if trivial |
| **Compound** (Alert, Dialog) | Expand Anatomy, emphasize required vs optional children and ordering |
| **Layout** (Flex, Stack) | Focus on spacing patterns, responsive behavior |
| **Input** (Input, Select) | Focus on form integration, Field context, validation |
| **Data Display** (Table, Code) | Focus on data formatting, loading/empty states |
| **Overlay** (Dialog, Popover) | Focus on trigger patterns, stacking, dismissal |

## Section Guidance

### "When NOT to Use" comes before "When to Use"

This is intentional. It's easier for the expert to define what a component is NOT for, and everything else is implicitly fair game. The negative list is also more actionable for AI consumers — it prevents the most common misuses.

### Code Examples in Composition Patterns

Prefer real patterns from Storybook stories over invented ones. If a story shows a pattern well, adapt it. If not, synthesize from code analysis + interview. Keep examples minimal — just enough to show the composition, not a full page.

Use **prescriptive language** in composition descriptions. Instead of "Alert can contain AlertContent and AlertIcon," write "Alert requires AlertContent. AlertIcon is optional but recommended for all color variants except neutral." This is the shadcn/skills pattern — enforcement, not suggestion.

### Gotchas

This section captures what surprises people — the non-obvious behaviors, the edge cases that bite developers on first use. It's sourced from the interview question "what trips people up?" rather than a formal bug list.

Good gotchas are specific and actionable:
- "Icon-only Button requires `aria-label` — screen readers announce nothing without it"
- "Toast auto-dismisses after 5 seconds — don't use for errors that need user acknowledgment"
- "Select with more than ~50 options becomes sluggish — use a searchable pattern instead"

Bad gotchas are generic or obvious:
- "Make sure to pass required props" (obvious)
- "Test on different screen sizes" (generic advice, not component-specific)

If the interview didn't surface anything surprising, omit the section entirely.

### Platform Context

Only include this section if the interview yielded Wallarm-specific patterns. Don't fill it with generic advice — it should contain insights like "In the Wallarm Console, the Delete Rule button always uses `color='destructive'` and opens a confirmation Dialog."

### Tags

Think about what an AI tool would search for. Include: the component's role (e.g., "cta", "form-control"), related concepts ("notification", "feedback"), and synonyms ("modal" for Dialog, "dropdown" for Select).

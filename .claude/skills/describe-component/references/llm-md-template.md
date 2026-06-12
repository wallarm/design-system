# `.llm.md` template (judgment-only)

The usage guide captures design *intent*, not the API. Keep it ~25 lines. **Omit any section that would be generic** for the component — every section must earn its place.

> Never reprint props, types, variant lists, or color maps. The code and the MCP serve those. If the AI can read it from the code, it doesn't belong here.

## Template

```markdown
# {ComponentName} — usage

> {One line: what it is + display-only / interactive flag.}

## Reach for it when
{The cue that should make the AI pick THIS instead of hand-rolling. Name the
real contexts. For a domain primitive this is the most important section —
"whenever X appears on screen, use this; never hand-roll a Badge or Text."}

## Don't use it for
- {Wrong use} → use `{Alternative}`. {one-line why}
- {Wrong use} → use `{Alternative}`.

## Locked — don't override
- {The non-negotiables: automatic/semantic colors, fixed icons, read-only
  behavior, required composition — what the AI must not touch.}

## Sizing / judgment calls
{Only the props where a human actually decides, and the rule for deciding. If
size/spacing follows a general foundations rule, point to it — don't repeat it.}

## Pairs with
- `{Component}` — {relationship}, with one tiny inline example.
```

## Section guidance

- **Reach for it when** (the lead) — the existence signal. The #1 AI failure on a novel component is not knowing it exists. Make it concrete.
- **Don't use it for** — boundaries first; each wrong use names the right alternative. Prevents the most common misuse.
- **Locked — don't override** — prescriptive: "color is automatic, don't override," not "color can be set." Fold gotchas in here.
- **Composition** (compound components only) — when the children are *optional arrangements* (full / flag-only / name-only forms, strict ordering), give them their own `## Composition` section listing the sanctioned forms and when each is right; keep **Locked** for true non-negotiables. Design-TBD patterns get an explicit "don't build one yet" line — silence invites invention.
- **Sizing / judgment calls** — document a prop only if the human chooses it. If the code derives it automatically, leave it out — the AI doesn't decide it.
- **Pairs with** — real-world groupings + a 3-line example. Replaces a long "composition patterns" section.

## Adjust by component type

| Type | Adjustment |
|---|---|
| Domain primitive (`HttpMethod`, `ResponseCode`) | Lead hard on "Reach for it when"; skip external research |
| Compound (`Dialog`, `Alert`, `Country`, `Ip`) | Required composition under "Locked"; optional arrangements get a `## Composition` section; one example in "Pairs with" |
| Commodity primitive (`Button`, `Stack`) | 3–4 lines total, or skip — the AI half-knows these. Exception: a commodity that anchors a family (`Badge`, `Tag`) earns a full router file |
| Layout (`Stack`, `Flex`) | Focus on spacing/rhythm judgment; defer to the foundations rules |

## What to leave out (vs. the old template)

Category · Anatomy (unless compound & non-obvious) · Variants & Options table · Variant Rules · Accessibility (unless it's a *design-level* rule) · Do's/Don'ts table (fold into boundaries + locked) · Tags · Platform Context (unless genuinely specific). All of it is either contract the code already serves, or noise.

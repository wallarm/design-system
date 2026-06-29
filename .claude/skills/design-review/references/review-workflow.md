# Design-review fan-out — Workflow recipe

The execution engine for `design-review`. Adapt this `Workflow` script to the component and the design truth
you gathered. The shape is proven (it's the Slider review): **one agent per design dimension in parallel →
adversarially verify every actionable finding → you synthesize the verdict** (Step 5 in `SKILL.md`).

## Principles baked into the prompts

- **Stay in the design lane.** Every reviewer is told to hand code/structure/analytics/test findings to the
  sibling skill, not report them. This is the single most important instruction — the unguided baseline
  drowned the design verdict in `data-slot` and test-coverage nits.
- **Default to `sound-keep`.** Reviewers cite `file:line` and the Figma node; no nitpicks dressed as findings.
- **Graceful Figma.** The fidelity reviewer skips + reports "not checked" if the node is unreachable, rather
  than failing the run.
- **Verify, don't pile on.** The verify stage refutes; it kills false/overstated findings before synthesis.

## The script (adapt the bracketed parts)

```javascript
export const meta = {
  name: 'design-review',
  description: 'Design-layer review of <Component>: fit, Figma fidelity, tokens, intent, behavior, consistency',
  phases: [
    { title: 'Review', detail: 'one agent per design dimension, parallel' },
    { title: 'Verify', detail: 'adversarially refute every actionable finding' },
  ],
}

const COMPONENT = '<Name>'                 // e.g. 'Slider'
const DIR = `packages/design-system/src/components/${COMPONENT}`
const FIGMA_NODE = '<node-id or "">'        // from <Name>.figma.tsx, or '' if none/unreachable
const SCOPE = '<whole-component | changeset: what changed>'
const ALREADY_VERIFIED = '<from a brief, or "nothing">'

// Shared grounding — the lane discipline lives here.
const GROUNDING = `
DESIGN review of the ${COMPONENT} component (React 19 / Ark-UI / Tailwind / CVA design system).
Scope: ${SCOPE}. Already verified (do NOT re-check): ${ALREADY_VERIFIED}.
Figma node: ${FIGMA_NODE || 'NONE — review from committed artifacts and report Figma fidelity as "not checked"'}.

YOU REVIEW THE DESIGN LAYER ONLY. If a finding is about code correctness, a bug, hooks, structural compliance
(data-slot / CVA / cn / displayName / ref / exports / file layout), analytics forwarding, or test coverage —
it is NOT yours. Note it in one line as "out of design scope → /code-review | review-pr | metrics-audit | test"
and move on. Do NOT report it as a design finding. Read the ACTUAL files; cite file:line and the Figma node.
Default to sound-keep unless you find something real. No nitpicks dressed as findings.

Read: ${DIR}/* (especially ${COMPONENT}.tsx, classes.ts, ${COMPONENT}.llm.md, ${COMPONENT}.stories.tsx,
${COMPONENT}.figma.tsx), the semantic token layer, and the sibling components it belongs with.
`

const REVIEW_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    dimension: { type: 'string' },
    verdict: { type: 'string', enum: ['sound-keep', 'minor-note', 'change-recommended', 'must-fix'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    coverage: { type: 'string', description: 'what you could and could NOT check (e.g. Figma reachable?)' },
    summary: { type: 'string', description: 'designer language, outcome first — no dev jargon' },
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          location: { type: 'string', description: 'file:line and/or Figma node' },
          detail: { type: 'string' },
          recommendation: { type: 'string' },
        },
        required: ['title', 'severity', 'location', 'detail', 'recommendation'],
      },
    },
    outOfScope: { type: 'array', items: { type: 'string' }, description: 'deferred → which sibling skill' },
  },
  required: ['dimension', 'verdict', 'confidence', 'coverage', 'summary', 'findings'],
}

const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    finding: { type: 'string' },
    refuted: { type: 'boolean', description: 'true if it does NOT hold up — default true when uncertain' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    reasoning: { type: 'string', description: 'grounded in re-read code/Figma; cite file:line' },
    adjustedSeverity: { type: 'string', enum: ['low', 'medium', 'high', 'none'] },
  },
  required: ['finding', 'refuted', 'reasoning', 'adjustedSeverity'],
}

// The design dimensions you own (drop #3 to a flagged skip if Figma is unreachable).
const DIMENSIONS = [
  { key: 'fit',         prompt: `FIT / WHERE-NOT-TO-USE. Read ${COMPONENT}.llm.md ("when to use" / "don't use it for"). Judge the actual usages (stories + the change) against it. Is this even the right component, and is it used where it should be? A faithful component in the wrong place is still a design failure — this leads the verdict.` },
  { key: 'intent',      prompt: `DESIGN INTENT & GAPS. Does the build honor what the component is FOR (${COMPONENT}.llm.md + any handoff/requirements/spec)? What's quietly missing or dropped? Flag doc-vs-built DRIFT (a spec/decision-log that still mandates something the build superseded) — don't silently pick a side.` },
  { key: 'fidelity',    prompt: `FIGMA FIDELITY. Compare the implementation to Figma node ${FIGMA_NODE}: geometry, every state (default/hover/focus/pressed/disabled/error), anatomy, layout. Use the Figma MCP (get_metadata → get_screenshot; get_variable_defs). If the node is unreachable, set verdict by what you can see and report coverage "Figma not checked".` },
  { key: 'tokens',      prompt: `TOKEN & STYLE CORRECTNESS. Every color / spacing / radius / type / shadow in classes.ts should resolve to a DS semantic token. A raw value (hex/rgb/arbitrary [..]) is a finding UNLESS it's deliberate and documented (e.g. a forced literal with no matching token). This is design-token correctness — NOT CVA/structural compliance (that's review-pr).` },
  { key: 'behavior',    prompt: `INTENDED FUNCTIONALITY. Do the states, interactions, and a11y affordances the DESIGN promises actually work as designed (focus visibility, keyboard affordance, the documented gestures)? Design behavior only — not code correctness, not test coverage.` },
  { key: 'consistency', prompt: `DESIGN CONSISTENCY WITH SIBLINGS. Does it look and behave like its family (the components it sits beside)? Flag design divergence that isn't justified — not structural/idiom drift (that's review-pr).` },
]

phase('Review')
const results = await pipeline(
  DIMENSIONS,
  d => agent(`${GROUNDING}\n\n${d.prompt}`, { label: `review:${d.key}`, phase: 'Review', schema: REVIEW_SCHEMA }),
  (review, d) => {
    if (!review) return null
    const actionable = (review.findings || []).filter(f => f.severity !== 'low' || review.verdict !== 'sound-keep')
    if (actionable.length === 0) return { review, verified: [] }
    return parallel(actionable.map(f => () =>
      agent(`${GROUNDING}\n\nAdversarially verify this ${review.dimension} finding. Try hard to REFUTE it — overstated "drift" findings are common. refuted=true if it's wrong, a non-issue, an intended/documented deviation, or a nitpick. refuted=false ONLY if it's a real, actionable DESIGN issue.\n\n[${f.severity}] ${f.title} — ${f.detail}\nlocation: ${f.location}\nrecommendation: ${f.recommendation}`,
        { label: `verify:${review.dimension}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then(v => ({ ...f, verdict: v })))
    ).then(verified => ({ review, verified: verified.filter(Boolean) }))
  },
)

return {
  dimensions: results.filter(Boolean).map(r => ({
    dimension: r.review.dimension, verdict: r.review.verdict, confidence: r.review.confidence,
    coverage: r.review.coverage, summary: r.review.summary,
    findings: r.review.findings, outOfScope: r.review.outOfScope || [], verified: r.verified || [],
  })),
}
```

## After it returns

You (the main agent) synthesize per Step 5 of `SKILL.md`: lead with **fit/where-not-to-use**, give each
dimension a verdict + confidence in designer language, fold in the verify results (drop anything refuted),
cite the node + `file:line`, state coverage, and end with the short `Out of design scope →` list. Don't just
relay the JSON — judge it.

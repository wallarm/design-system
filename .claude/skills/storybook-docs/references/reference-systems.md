# The reference design systems

Consult **all seven, every run**. Not "the one or two most relevant" — the whole
point is that agreement between independent systems is the closest thing we have
to evidence that a rule is real rather than one team's house style. A single
system telling you something is an opinion.

Announce the consult in one line at the start so the designer never has to ask
whether it happened.

## The roster

Paths follow each system's own URL shape; swap the component name in.

| System | Where | Fetching | Good for |
|---|---|---|---|
| **IBM Carbon** | `carbondesignsystem.com/components/<name>/usage/` | Plain `WebFetch` **truncates**. Use the browser pane and `get_page_text`, or the source at `raw.githubusercontent.com/carbon-design-system/carbon-website/main/src/pages/components/<name>/usage.mdx` | **The richest of the seven, and the house inspiration.** Only one with a full behaviours section and explicit do/don'ts |
| **Nord Health** | `nordhealth.design/components/<name>/` | ✓ | Crisp when-to / when-not-to, hard numbers ("avoid past ten options"), label microcopy |
| **GitLab Pajamas** | `design.gitlab.com/components/<name>/` | ⚠️ **Currently unreachable** — 302s to a GitLab auth flow, and the browser pane hits bot verification. Don't try to get past it; note it and move on. Its docs are open-source, so `gitlab-org/gitlab-services/design.gitlab.com` is the fallback | Best at control-choice boundaries — checkbox vs radio vs toggle vs combobox, each with a reason |
| **Vercel Geist** | `vercel.com/geist/<name>` | ✓ | Lean and modern; sharp on state semantics ("indeterminate is not a third value") |
| **Elastic EUI** | `eui.elastic.co/docs/components/...` | ✓ | Security and observability UI, data-dense patterns, strongest on label wording |
| **GitHub Primer** | `primer.style/product/components/<name>/` | ✓ | Thin on usage — validation and grouping notes only. Check it, expect little |
| **Atlassian** | `atlassian.design/components/<name>/examples` | ✓ | Near-empty for prose; often a one-line definition. Check it and move on |

**If a page won't fetch, open it in the browser pane and use `get_page_text`.**
That rescues most of them — it is how Carbon gets read at all. Don't let the
consult quietly degrade into "announced it, got nothing".

Two honest limits, so nobody burns a run on them:

- **Pajamas is behind an auth wall** as of 2026-08. Note it as unreachable and
  move on; the browser fallback hits bot verification too.
- **Not every system ships every component.** Carbon has no layout pages at all,
  and Primer has no slider. A system with nothing to say is a finding in itself:
  when several of them don't document a shape, the guidance has to come from us,
  and that is worth saying out loud rather than treating as a failed lookup.

Expect Carbon, Nord, Geist and EUI to carry the substance, and Primer and
Atlassian to be near-misses. Still attempt all seven: which ones have something
varies by component, and reachability changes over time — re-test Pajamas
occasionally rather than assuming it stays blocked.

## The convergence filter

Seven systems will hand you a page of material for a two-sentence budget. Filter
by agreement:

- **Two or more systems state it independently** → earns consideration.
- **One system states it** → almost never earns a place. It's likely their house
  style, or too fine-grained for us.
- **All of them state it** → it's probably a boundary, and boundaries lead.

Convergence is a filter on *what to consider*, not permission to exceed the
budget. Three converging rules and room for one means you still pick one.

## When we differ from a reference

Document **what we ship**, and park the divergence in the findings file. This
runs in both directions and both are normal:

- **We're stricter.** Nord allows non-interactive tags; ours are always a `Badge`.
- **We're more permissive.** EUI shows one toast at a time; our `Toaster` stacks
  three with hover-expand.
- **We contradict them outright.** Carbon and EUI want wrapped checkbox labels
  top-aligned; ours centre. Their rule stays out of our docs, and the gap gets
  parked as a finding.

Never import a reference's rule over our shipped behaviour. A Storybook page that
describes something the component doesn't do is worse than a page that says
nothing, because a reader will design against it.

## When to skip a system

Genuinely never for a common pattern. For a **Wallarm domain primitive** —
`HttpMethod`, `ResponseCode`, `Ip`, `Country`, `ParameterPath`, `RemoteShell` —
no external system ships the shape, so the consult has nothing to return. Say so
in one line and move on.

The test is **"does an external system ship this shape?"**, not "does this feel
Wallarm-specific". `Attribute` looks proprietary but is a description list, which
Carbon, Ant and Atlassian all ship. `FilterInput` is a query builder, which is a
well-documented pattern. Both are worth consulting.

For an agnostic pattern with no direct component analogue, a plain web search for
the **pattern** rather than the component name often surfaces the when/when-not
framing. Cite what you borrow.

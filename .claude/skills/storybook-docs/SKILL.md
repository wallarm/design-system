---
name: storybook-docs
description: Write or level up a component's Storybook Overview page — the short prose that explains what the component is for and what each story shows, sourced from the code, our Figma file, and the seven reference design systems. Use whenever the user wants to document a component in Storybook, standardise or tidy an existing docs page, add descriptions to stories, or says things like "document Select in Storybook", "the Button page has no description", "make the Tabs docs match Checkbox", "add story descriptions", "level up the docs for X". Also use when the user is reviewing Storybook and complains a page is bare, inconsistent, or hard to digest. This is documentation-only work — it never changes a component's design, API, or behaviour.
---

# Storybook docs

Turn a bare Storybook page into one that reads as documented: a couple of
sentences saying what the component is for and which control to reach for
instead, then one sentence beside every story saying what you are looking at.

The pages are what the whole company sees, so consistency is the point. Ninety-five
story files went in with wildly different amounts of prose — `WallyIcon` and
`AnimatedBackground` had paragraphs while `Button`, `Checkbox` and `Select` had
nothing at all. This skill exists to level that out, one page at a time, in one
voice.

## The scope boundary — read this first

**This is documentation-only work.** Never change a component's design, API,
visuals, or behaviour, and never "fix while you're in there". You are only ever
allowed to write:

- `parameters.docs.description.component` in a story file's `meta`
- JSDoc comments (`/** … */`) above exported stories
- story names and ordering, when they actively mislead

Documenting a component *will* surface real problems in it — that is one of the
most valuable things about doing this work carefully. When it happens, park the
finding in [`docs/storybook-docs-findings.md`](../../../docs/storybook-docs-findings.md)
with enough detail to act on later, and carry on. Do not file a Jira issue
mid-run; the findings file is processed in batches so the design-system project
doesn't fill up with half-formed observations.

## The one rule: short, or it doesn't get read

**A component description is one or two sentences. Three only when a component
genuinely earns it. Every story gets one sentence.** This is not a stylistic
preference — a page nobody finishes is worse than a page with less on it, and a
long description competes with the examples right below it for attention.

That budget is the whole discipline of this skill. You will gather far more
material than fits, from the code, from Figma, and from seven reference systems.
**The job is choosing the best line, not accumulating lines.** Everything you
leave out is still useful — it tells you what to park and what to skip.

The [prose standard](references/prose-standard.md) has the filters, the worked
examples, and the failure modes. Read it before writing.

## What is already automatic

Don't hand-author any of this — the shared frame in `packages/design-system/.storybook/docs/`
produces it for every page:

- the `Overview` page name, the H1, the links row (component folder on GitHub, Figma)
- the `Examples` section, with a heading per story
- the `Component API` props table, and the closing `Feedback` section
- the sticky table of contents

So your entire output for a component is prose: one description, and one line per
story. If the *frame* needs changing rather than the prose, that is a different
job — [`references/frame.md`](references/frame.md) explains how it works and the
Storybook traps around it.

## Usage

```
/storybook-docs ComponentName
```

## The flow

### 0 · Verify the target

The unit here is a **story file**, not a component directory — each `*.stories.tsx`
renders its own Overview page. That differs from `.llm.md` work, and it matters:
`FilterInput` has five story files and therefore five pages, while a sub-component
with no story file has none and can't be documented directly.

Find the file, and check whether it already has a description and story JSDoc:

```bash
find packages/design-system/src -name '<Name>*.stories.tsx'
grep -c '^/\*\*' <path>          # existing story descriptions
grep -n 'description' <path>      # existing component description
```

**Every page goes through this skill, including the ones that already have prose.**
A 🟡 row in the coverage tracker is not "done" — it means prose exists, nothing
more. Only a run that judged the wording against the standard earns ✅, so treat
a 🟡 exactly like a ☐: read what's there, keep the lines that hold up, rewrite
the ones that don't.

When prose already exists you are **levelling, not filling**, which is the harder
half of the job and where most of the ninety-five pages sit. Expect three kinds
of problem:

- **Over budget.** Slider's description was a hundred words of build detail;
  Heading's is four paragraphs of type theory. Good writing, wrong page — cut it.
- **Wrong altitude.** Contract detail (analytics attributes, ref forwarding)
  belongs in the code, near whoever needs it, not on the page a designer opens.
- **Factually wrong.** This is the one to watch for, because it reads as
  finished. Slider's `WithInput` sentence claimed typing updates the slider live
  and clamps; `SliderInput.tsx` actually holds an uncommitted draft and commits on
  blur or Enter, deliberately, so clamping doesn't fight a half-typed number.
  **Verify existing sentences against the source as carefully as your own** — an
  inherited claim is not evidence.

If the target isn't a real exported component, say so and stop rather than
documenting something that can't be imported.

### 1 · Read the code and the stories

Read the component directory. Ground-truth rules, learned the hard way:

| Source | Read it for |
|---|---|
| `{Name}.tsx` | what it is, what it's built on, structural behaviour |
| `classes.ts` | variants and compound rules — what's locked |
| `{Name}.stories.tsx` | **what each story actually renders** |
| `{Name}.figma.tsx` | sanctioned compositions, and the Figma node ids for step 2 |
| `index.ts` | sub-components worth naming in prose |
| sibling components | the alternatives your boundaries will point at |

- **What the stories render beats what argTypes claim.** Controls go stale; the
  rendered story is the sanctioned surface. A mismatch is a finding, not a signal.
- **Never describe a prop, variant, or state that isn't shipped**, even if Figma
  shows it. The props table right below your prose will contradict you.
- Check the component's **own tokens and classes** before asserting behaviour.
  Writing "wrapped labels stay top-aligned" would have been wrong for Checkbox —
  it uses `items-center`. That gap became the first parked finding.

### 2 · Read our Figma file

Figma carries *intent* the code cannot state, and it is the only source that will
tell you what a variant is **for**.

**Start with `{Name}.figma.tsx`** — the Code Connect file, if the component has
one. It hard-codes the node URLs, and its `example()` blocks map each variant to
sanctioned JSX, so it answers two questions at once: which node to read, and
which compositions are blessed. On `Button` it also settled the variant matrix
outright.

Only ask the designer for a node URL when there's no Code Connect file. The
WADS Components file key is `VKb5gW46uSGw0rqrhZsbXT`.

Then read the node, keeping in mind that **you cannot walk upward from a
component node to the page that holds it**. `get_metadata` with no `nodeId`
returns only the file's cover page, and there is no parent traversal — so without
a node id from Code Connect or the designer, the `Documentation` and `Notes`
frames are simply unreachable. Say so and move on rather than burning the run.

With a node id in hand:

1. `get_metadata` on it to get the frame tree.
2. Find the `Documentation` and `Notes` frames in it.
3. `get_screenshot` each child section, at `maxDimension` ≈ **the frame's width**
   (usually 960). A tall frame requested whole scales its text below readability.
4. `curl` the returned URL and read the PNG.

What you're looking for is the thing the code can't say. On Checkbox: the plain
item is drawn in all four label permutations, but **the card rendition only ever
appears with a description** — so cards exist *to carry* one, and a card with a
bare label wastes the room it asks for. That single observation was worth more
than anything the code offered.

The `Notes` frame is often a scratch pad of **open questions**, not guidance
("other content in card → pics, icons etc"). Unsettled design gets parked in the
findings file and stays out of the prose — silence is safer than inventing a rule,
because a rule in Storybook will be followed.

### 3 · Consult the reference design systems — all of them, every time

Announce it in one line so nobody has to ask whether it happened: *"Consulting
all seven: Carbon, Nord, Pajamas, Geist, EUI, Primer, Atlassian."*

Seven systems will hand you far more than two sentences can hold, so apply the
convergence filter: **guidance that two or more systems state independently earns
consideration; single-source guidance almost never does.** Agreement across
systems is the closest thing to evidence that a rule is real rather than one
team's house style.

Where we differ from a reference — in either direction — **document what we ship**
and park the divergence. Never import their rule over ours.

The roster, the exact URLs, which ones actually fetch, and what each is good for
are in [`references/reference-systems.md`](references/reference-systems.md).

### 4 · Write

Boundaries first. The most useful thing a component page can do is stop someone
using the wrong control, so the description leads with *reach for X instead when*
— and all seven reference systems lead theirs the same way.

Then one sentence per story, saying what's in the frame plus one grain of
information the story name doesn't already give. Read
[`references/prose-standard.md`](references/prose-standard.md) for how, and hold
the sentence budget.

Mechanics: a multi-sentence component description reads best assembled from an
array so the sentences stay individually editable —

```tsx
const DESCRIPTION = [
  'What it collects, and which control to reach for instead.',
  'The one further thing worth knowing.',
].join(' ');
```

and story descriptions are plain JSDoc above the export:

```tsx
/** What this frame shows, and the one thing worth knowing about it. */
export const Basic: StoryFn<typeof meta> = () => …
```

### 5 · Verify it on the page

Prose that reads well in a diff can read badly on the page. Run Storybook, open
the component, and read it as a stranger would:

```bash
pnpm --filter=@wallarm-org/design-system storybook
```

Then check the things that actually go wrong: every story has a description; the
description doesn't restate the story name; nothing contradicts the props table
just below; no sentence spills past the budget. `pnpm lint:fix` and `pnpm typecheck`
before you finish — story files are typechecked like any other source.

### 6 · Park what the run surfaced

Three destinations, so nothing is lost and nothing lands in the wrong place:

- **A real problem in the component** → [`docs/storybook-docs-findings.md`](../../../docs/storybook-docs-findings.md),
  in the format that file defines. Never fixed here.
- **Friction with this skill** — a missing step, a wrong assumption, a question
  you had to answer off-script → a one-line row in [`REFINEMENTS.md`](REFINEMENTS.md).
  Don't stop the run to fix the skill; park it and finish the component.
- **A microcopy rule that generalises** beyond this component (label case,
  punctuation, button wording) → park it rather than repeating it on ninety-five
  pages. One page is the wrong home for a house-wide rule.

### 7 · Tick it off and commit

Update [`docs/storybook-docs-coverage.md`](../../../docs/storybook-docs-coverage.md),
then commit with a `docs(<component>):` subject saying what the prose now leads
with — not just "add descriptions".

Use `git -C <repo>` rather than relying on the working directory; a stray `cd`
earlier in a session breaks relative paths.

## Judgment notes

- **Tier by how much judgment the component needs, not by fame.** A control with
  real alternatives (`Checkbox`, `Select`, `Switch`, `Tabs`) earns a full
  boundaries-first description. A layout primitive (`Stack`, `Flex`) needs a line
  and nothing more — padding it out is worse than leaving it short.
- **Family siblings share a voice.** Before writing `TimeInput`, read `DateInput`.
  Divergent twins read as neglect even when both are individually fine.
- **A description that only restates the name is worse than none** — it costs the
  reader a line and teaches them nothing, and it makes the page look finished
  when it isn't.
- **When the designer rejects a rule you drafted, delete it** rather than hedging.
  A "sometimes" rule steers worse than silence.

# The prose standard

Everything here serves one goal: a reader should be able to land on a component
page, spend fifteen seconds, and know whether this is the right component and
what they're looking at.

## The budget

| | Length |
|---|---|
| Component description | **1–2 sentences.** Three only when the component genuinely earns it |
| Story description | **1 sentence.** Two when the second one does real work |

The budget is the hard part of this work, not the writing. Seven reference
systems, a Figma file, and the source will hand you a page's worth of material.
Choosing is the skill.

## What earns a place

In priority order. If two candidates compete and you can only fit one, the
higher one wins.

1. **A boundary** — "reach for `Radio` when only one choice is allowed". The most
   expensive mistake a reader can make is using the wrong component, and it's the
   one thing they can't discover from the props table. Every reference system
   leads with this; so do we.
2. **Intent behind a variant** — *why* the variant exists, not that it exists.
   "Cards exist to carry a description" is worth a sentence. "`variant='card'`
   renders a card" is worth nothing; the reader can see the card.
3. **A rule that is invisible in the rendered story** — indeterminate is a state
   you set and a click never produces; clear it when every child resolves.
4. **A structural consequence worth knowing** — adding a description switches the
   row to a grid so the text aligns with the label rather than the box.

## What never earns a place

- **Anything the props table already says.** It renders directly below your
  prose. Listing props, types, or defaults duplicates it and dates faster.
- **Restating the story's name.** "The checked state." tells the reader what the
  heading already told them, and makes the page look finished when it isn't.
- **A rule we don't actually follow.** Carbon and EUI both say wrapped labels
  stay top-aligned; ours centre. Documenting their rule would make our own docs
  wrong. Park the divergence instead.
- **Unsettled design.** A rule published in Storybook gets followed. If Figma's
  notes are still asking the question, the page stays quiet.
- **A house-wide microcopy rule**, on all ninety-five pages. Park it once.

## Voice

Write for a competent colleague who hasn't used this component. Plain sentences,
present tense, no hedging, no marketing.

- **Name the alternative, don't gesture at it.** "reach for `Switch` when the
  change takes effect immediately" beats "consider other controls for immediate
  changes".
- **Backtick every component and prop name.** They're identifiers; readers scan
  for them.
- **Prefer the concrete number** when one exists. "Past roughly ten options" is
  actionable; "for long lists" isn't.
- **Say what it's for, not what it is.** "Collects any number of choices from a
  limited set" beats "A checkbox is an input control".

## Worked example — Checkbox

The component description, at two sentences, doing three boundaries and an upper
bound:

> Collects any number of choices from a limited set, or turns a single option on
> or off — reach for `Radio` when only one choice is allowed, and `Switch` when
> the change takes effect immediately instead of on submit. Past roughly ten
> options, a `Select` reads better than a long column of boxes.

Story lines, and what each one is doing:

| Story | Sentence | Why it earns its place |
|---|---|---|
| Basic | The smallest useful composition — `CheckboxIndicator` plus `CheckboxLabel`. Keep labels to a few words in sentence case, and reword rather than truncate. | names the required parts, then a label rule three systems agree on |
| Indeterminate | `checked='indeterminate'` is for a parent whose children are only partly selected. Set it deliberately — a click never produces it — and clear it once every child is checked or unchecked. | the invisible rule; nothing in the rendered story shows this |
| Card | `variant='card'` gives every option its own bordered surface. Cards exist to carry a description — that is what the extra room is for, and a card holding a bare label wastes it. | Figma's intent, which no other source states |
| Group | `CheckboxGroup` ties several checkboxes to one `name` and one array of values, and owns the spacing between them. Every box stays independent: ticking one must never move another, unless it is a parent selecting all of its children. | a behavioural contract two systems state independently |

What was gathered and deliberately dropped: Primer's group-level validation rule
(single source), Geist's "3 of 5 selected" counter copy (too fine-grained for the
budget), Carbon's form spacing values (a foundations rule, not a checkbox rule),
and the wrapped-label alignment rule (we don't follow it — parked as a finding).

## One mechanical trap

**Never let a code span wrap across two JSDoc lines.** Markdown reads the
continuation as an indented code block, so the sentence renders in three pieces
with a grey box in the middle — invisible in the diff, obvious on the page.

Either keep the backticked phrase on one line, or use plain quotes when the thing
you're quoting is prose rather than an identifier. This scan finds every case:

```bash
grep -rn '^ \*' --include='*.stories.tsx' packages/design-system/src \
  | awk -F: '{ n = gsub(/`/, "`", $0); if (n % 2) print }'
```

## Failure modes

**Padding a primitive.** `Stack` does not need a boundaries-first paragraph. If
there is genuinely one line to say, say one line.

**The developer paragraph.** Slider's existing description covers analytics
attributes, ref forwarding and `data-*` — real information, wrong page. The
Overview page answers "should I use this and what am I looking at". Contract
detail belongs in the code and the props table.

**The type-theory essay.** Heading's four paragraphs on the size ramp are good
writing that overruns the budget. Cut to the decision the reader is making.

**Boundaries with no alternative.** "Don't use this for long lists" leaves the
reader stuck. Name what to use instead, always.

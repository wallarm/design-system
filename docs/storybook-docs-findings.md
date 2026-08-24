# Storybook documentation — parked findings

A parking lot for problems noticed while standardising the Storybook component
documentation. **Nothing here is a ticket yet.** The documentation pass is
deliberately docs-only: it never changes a component's design, API, or
behaviour. When a doc pass turns up a real problem in the component itself, it
lands here with enough detail to file later, and the pass moves on.

Process it in batches — read the list, decide what deserves a Jira issue, file
those, and mark the rest closed. That keeps the design-system Jira project from
filling up with half-formed observations.

## How to add an entry

One `###` heading per finding, newest last, with these lines:

- **What** — the problem in one sentence.
- **Evidence** — file and line, or the reference systems that disagree with us.
- **Why it matters** — what a consumer sees or gets wrong.
- **Suggested action** — the smallest change that would settle it.
- **Found while** — which component's docs surfaced it.
- **Status** — `Open`, `Filed (WDS-nnn)`, or `Closed — <reason>`.

---

### Checkbox: a wrapped label centres against the box

- **What** — When a checkbox label wraps to a second line, the box centres
  against the two lines instead of staying aligned with the first.
- **Evidence** — `packages/design-system/src/components/Checkbox/Checkbox.tsx:18`
  sets `items-center` on the root. Carbon and EUI both specify the opposite, and
  Carbon carries an explicit don't for vertically centring wrapped text.
- **Why it matters** — Long labels are common in filter lists, where the control
  drifting to the middle of the text breaks the scan line down a column of
  options. It also means our docs cannot state the wrapping rule the reference
  systems agree on, so the guidance stays silent.
- **Suggested action** — Consider `items-start` for the no-description case, and
  check it against the existing `items-center` look for single-line labels
  before changing anything.
- **Found while** — documenting `Checkbox`.
- **Status** — Open.

### Checkbox card: unresolved design questions in Figma

- **What** — The Checkbox page's `Notes` frame holds two open questions rather
  than guidance: whether a card may hold other content (images, icons) and
  whether the current layout is right.
- **Evidence** — Figma `WADS-Components`, Checkbox page node `205:4244`, Notes
  frame `1361:13771`.
- **Why it matters** — Until they are settled the docs must stay silent, and
  silence invites consumers to invent their own card content.
- **Suggested action** — Settle both, then add a sentence to the Card example.
- **Found while** — documenting `Checkbox`.
- **Status** — Open.

## Known limitations we chose to live with

Not findings — decisions worth remembering so they are not rediscovered.

- **The docs page does not follow the theme toggle.** Storybook renders docs
  pages on its own light surface in both themes; only the story canvas responds
  to `data-theme`. The shared Overview frame therefore pins its light-theme
  colours in dark mode. Making the page itself dark would mean overriding
  Storybook's entire docs stylesheet, which is out of proportion to the benefit.
  Carbon's own documentation behaves the same way.

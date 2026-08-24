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

### Button: the type system allows variant/colour pairings that aren't designed

- **What** — `variant` × `color` type-checks to 16 combinations, but only 13 are
  drawn. `variant='primary' color='neutral'` compiles and renders **with no
  background at all**.
- **Evidence** — `Button.tsx` `compoundVariants` covers brand (primary, ghost,
  secondary), neutral and neutral-alt (outline, ghost, secondary) and destructive
  (all four). `Button.figma.tsx` draws the same set. The `Variants` story shows
  exactly the supported pairings, so the gap is invisible until someone reaches
  for an unsupported one.
- **Why it matters** — Nothing stops a consumer picking a pairing that renders
  invisibly, and the props table advertises all 16.
- **Suggested action** — Narrow the type so only designed pairings are
  expressible, or add the missing compounds.
- **Found while** — documenting `Button`.
- **Status** — Open.

### Button: the IconOnly story has no accessible name

- **What** — The `IconOnly` story renders three icon-only buttons with no
  `aria-label` and no `Tooltip`, so nothing on screen or in the accessibility
  tree says what they do.
- **Evidence** — `Button.stories.tsx`, `IconOnly` story: zero occurrences of
  `aria-label`.
- **Why it matters** — This is the sanctioned example people copy into product
  code, so the omission propagates. The docs now tell readers to add both, which
  makes the story contradict its own description.
- **Suggested action** — Add `aria-label` and a `Tooltip` to the story.
- **Found while** — documenting `Button`.
- **Status** — Open.

### Button: neutral-alt hover states apply while disabled

- **What** — The `neutral-alt` compound variants use `hover:` and `active:`
  without the `not-disabled:` guard its siblings carry, so a disabled
  `neutral-alt` button still lights up on hover.
- **Evidence** — `Button.tsx`: brand, neutral and destructive compounds use
  `hover:not-disabled:…`; all three `neutral-alt` compounds use plain `hover:`.
- **Why it matters** — A disabled control that reacts to the pointer reads as
  available.
- **Suggested action** — Add the `not-disabled:` guard to the three `neutral-alt`
  compounds.
- **Found while** — documenting `Button`.
- **Status** — Open.

### Button: size='inline-edit' is public but belongs to InlineEdit

- **What** — `ButtonBase` ships a fourth size, `inline-edit`, which is reachable
  on `Button` but appears in no story and no Figma variant.
- **Evidence** — `ButtonBase/classes.ts` size variants and the `iconOnly`
  compounds include `inline-edit`.
- **Why it matters** — It reads as internal plumbing for `InlineEdit` while being
  offered to every consumer through the props table.
- **Suggested action** — Decide whether it's public. If not, keep it internal to
  `ButtonBase`.
- **Found while** — documenting `Button`.
- **Status** — Open.

## Known limitations we chose to live with

Not findings — decisions worth remembering so they are not rediscovered.

- **The docs page does not follow the theme toggle.** Storybook renders docs
  pages on its own light surface in both themes; only the story canvas responds
  to `data-theme`. The shared Overview frame therefore pins its light-theme
  colours in dark mode. Making the page itself dark would mean overriding
  Storybook's entire docs stylesheet, which is out of proportion to the benefit.
  Carbon's own documentation behaves the same way.

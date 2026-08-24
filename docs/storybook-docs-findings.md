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

### SplitButton relies on a class name to detect outline buttons

- **What** — The group collapses its gap and overlaps the inner borders by
  matching a Tailwind class on its children: `has-[>.bg-component-outline-button-bg]`.
  So the layout depends on `Button` continuing to emit that exact utility.
- **Evidence** — `SplitButton/classes.ts`, with the comment "Outline buttons
  (detected via unique bg class)".
- **Why it matters** — A refactor of `Button`'s outline styling silently breaks
  every split button's seam, and nothing in either component's tests would say
  why. It also means a consumer can't get the collapsed look on a variant we
  haven't anticipated.
- **Suggested action** — Detect it from a prop or `data-` attribute rather than a
  style class, or note the coupling in both files.
- **Found while** — documenting `SplitButton`.
- **Status** — Open.

### SplitButton does not constrain its two halves to match

- **What** — Both halves are free-standing `Button`s, so nothing stops a consumer
  giving them different variants, colours or sizes — which breaks the joined-corner
  illusion the component exists to create.
- **Evidence** — `SplitButton.tsx` renders `children` inside a `role='group'`
  wrapper with no validation; the docs now have to carry the rule in prose.
- **Why it matters** — A rule that lives only in documentation gets broken.
- **Suggested action** — Decide whether this is worth constraining, or accept
  that the pairing stays a documented convention.
- **Found while** — documenting `SplitButton`.
- **Status** — Open.

### ToggleButton's brand/outline unpressed state is identical to neutral

- **What** — With `variant='outline'`, the unpressed `brand` and `neutral`
  compounds resolve to the same border, background and text colour; they only
  diverge once pressed.
- **Evidence** — `ToggleButton.tsx` compound variants: `color: 'brand', variant:
  'outline', active: false` and the `neutral` equivalent differ only in the focus
  ring token.
- **Why it matters** — The `VariantsAndColors` story shows two columns that look
  identical until clicked, which reads as a rendering bug rather than a design
  decision.
- **Suggested action** — Confirm this is intended. If it is, the story could show
  the pressed state alongside so the difference is visible.
- **Found while** — documenting `ToggleButton`.
- **Status** — Open.

### Field context is read by only three of the controls it wraps

- **What** — `Field` looks like it labels any control placed inside it, but only
  `Input`, `Textarea` and `Slider` read Ark's field context. For `Switch`,
  `Radio`, `Checkbox`, `NumberInput`, `Select`, `InputOTP` and the date/time
  inputs, `Field` supplies layout only — the id, `aria-describedby` and
  `aria-invalid` wiring does not happen.
- **Evidence** — `useFieldContext` appears in exactly four files:
  `Field/FieldIndicator.tsx`, `Input/Input.tsx`, `Textarea/Textarea.tsx` and
  `Slider/Slider.tsx`. Field's own stories nevertheless demonstrate `Switches`,
  `Radios`, `Checkboxes`, `NumberInputs` and `Selects`.
- **Why it matters** — The gap is invisible: the page looks correct, and a
  screen reader gets nothing. Because the stories show these combinations, they
  read as sanctioned and wired.
- **Suggested action** — Either have the remaining controls read the context, or
  make the labelling requirement explicit at the point of composition. This is
  the same gap the AI usage docs recorded as spanning seven inputs, so it is
  known and worth doing properly rather than per component.
- **Found while** — documenting `Field`.
- **Status** — Open.

### Input spreads its props twice, discarding the merge with field context

- **What** — `Input` merges field props with its own (`mergeProps(field?.getInputProps(), props)`)
  and then spreads `props` again after the merged object, so for any key present
  in both, the merge is thrown away and the consumer's value wins outright.
- **Evidence** — `Input/Input.tsx`: `<input {...mergedProps} {...props} …>`.
- **Why it matters** — The merge exists to combine the field's handlers and
  attributes with the consumer's. Where both supply one, the field's is silently
  dropped, which is precisely the case the merge was written for.
- **Suggested action** — Drop the second spread, or spread `props` first and the
  merged object second, whichever matches the intent.
- **Found while** — documenting `Input`.
- **Status** — Open.

### size='inline-edit' is public on Input as well as Button

- **What** — The same undeclared fourth size appears on `Input`
  (`h-28`), reachable by consumers but absent from every story and from Figma.
- **Evidence** — `Input/classes.ts` size variants; matches the `Button` finding
  above.
- **Why it matters** — Two components now leak an internal size for `InlineEdit`,
  which suggests the pattern will spread rather than a one-off slip.
- **Suggested action** — Decide once, for the family, whether `inline-edit` is a
  public size or internal plumbing.
- **Found while** — documenting `Input`.
- **Status** — Open.

### DateFormatProvider documents an hourCycle prop that no component accepts

- **What** — `DateFormatProvider`'s own doc comment says the hour cycle "can be
  overridden per-input via the `hourCycle` prop". No date or time component
  accepts such a prop.
- **Evidence** — `grep -n 'hourCycle?:'` across `DateInput`, `TimeInput`,
  `DateRangeInput` and `Calendar` returns nothing, and `DateInput.tsx` states the
  opposite in its own comment: hour cycle is "sourced exclusively from
  `DateFormatProvider`".
- **Why it matters** — Two comments in the same family contradict each other, and
  the wrong one is the more discoverable. Someone will try the prop, find it
  type-errors, and not know which behaviour was intended.
- **Suggested action** — Decide which is true and correct the comment, or add the
  prop. The exclusive-provider behaviour looks deliberate, in which case only the
  comment is wrong.
- **Found while** — documenting the date family.
- **Status** — Open.

### NumberInput starts at zero rather than empty

- **What** — `NumberInput` defaults `defaultValue` to the string `'0'`, so an
  untouched field reads as an answered one.
- **Evidence** — `NumberInput.tsx`: `defaultValue = '0'`.
- **Why it matters** — On a required numeric field a reader can submit zero
  without ever deciding it, and nothing in the interface distinguishes a
  deliberate zero from an untouched default.
- **Suggested action** — Consider defaulting to empty and letting callers pass a
  starting value, or confirm zero is intended for the fields this is used on.
- **Found while** — documenting `NumberInput`.
- **Status** — Open.

### Text size='md' sets no font size and inherits from its container

- **What** — The `md` step in the text ramp applies no font size of its own, so
  a `Text` at `md` renders at whatever size surrounds it rather than at a known
  step.
- **Evidence** — Documented as a known gap in `Text.stories.tsx`'s own
  description before this pass, and visible in the `Sizes` story where `md` does
  not sit between `sm` and `lg` as the ramp implies.
- **Why it matters** — A size step that silently means "inherit" is worse than a
  missing step: the same code renders differently depending on where it is
  dropped, and the ramp stops being a ramp.
- **Suggested action** — Give `md` its own size, or remove it from the scale.
- **Found while** — documenting `Text`. The page now warns about it on the
  `Sizes` story, which should be removed once the gap is closed.
- **Status** — Open.

## Known limitations we chose to live with

Not findings — decisions worth remembering so they are not rediscovered.

- **The docs page does not follow the theme toggle.** Storybook renders docs
  pages on its own light surface in both themes; only the story canvas responds
  to `data-theme`. The shared Overview frame therefore pins its light-theme
  colours in dark mode. Making the page itself dark would mean overriding
  Storybook's entire docs stylesheet, which is out of proportion to the benefit.
  Carbon's own documentation behaves the same way.

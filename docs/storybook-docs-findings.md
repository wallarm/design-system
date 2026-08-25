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

### Dialog's description claimed a position it does not have

- **What** — Dialog's Storybook description said it "appears from the right side
  of the screen" and is "Drawer without resize functionality". The position claim
  is true of both, and the resize claim is the wrong difference: `kind` changes
  nesting behaviour, not resizing.
- **Evidence** — `Dialog.tsx` renders `<Drawer kind='dialog'>`; `DrawerPositioner`
  is `fixed` on all four edges for both; and `kind` is consumed only by
  `DrawerNestingContext` for the same-kind push-back. `DrawerResizeHandle` is a
  separately exported part that Dialog simply does not re-export.
- **Why it matters** — The two components are the same panel, and the real
  difference is which one can run non-modal and be resized. A reader choosing
  between them from the old description would have learned nothing useful.
- **Suggested action** — None in the docs; already corrected. Worth deciding
  whether `Dialog` should exist as a separate entry at all, or be documented as a
  configuration of `Drawer`.
- **Found while** — documenting the overlay family.
- **Status** — Closed — the docs now describe the real difference.

### Tour's stories carry documentation prose inside the canvas

- **What** — Several Tour stories render a paragraph of explanatory copy and a
  keyboard-shortcut legend inside the story frame, duplicating what the page
  description now says.
- **Evidence** — `Tour.stories.tsx` around the `Overview` story: a secondary
  `Text` block restating the component's purpose, plus `Kbd` rows listing arrow,
  Escape and Tab behaviour.
- **Why it matters** — It is documentation rendered as though it were part of the
  component, which is the confusion the annotation style exists to prevent. It
  also now says the same thing twice on one page.
- **Suggested action** — Done. The five duplicated paragraphs are gone, since the
  story sentences above each frame now say the same thing, and the keyboard legend
  is annotation-styled and cut to one word per row.
- **Found while** — documenting `Tour`.
- **Status** — Closed — removed rather than parked, on Artem's call.

### FeedbackPulse's Playground story opens itself on page load

- **What** — The story starts with `open` set to `true`, and `FeedbackPulse`
  portals to `document.body`, so opening the Overview page makes a feedback card
  appear pinned to the corner of the whole page rather than inside the story
  frame.
- **Evidence** — `FeedbackPulse.stories.tsx`, `Playground`: `useState(true)`.
  Closed-on-load would be the honest demo, and the Escape test already clicks the
  trigger to open it — but `Should show the confirmation when feedback is sent`
  goes straight to this story and clicks a score, so it depends on the card being
  up already.
- **Why it matters** — A reader landing on the docs page is interrupted by a
  survey they did not open, from a component they were only reading about.
- **Suggested action** — Default the story closed and add a trigger click to the
  one e2e test that assumes otherwise. Small, but it touches a test, so it wants
  its own change rather than riding along with a documentation pass.
- **Found while** — documenting `FeedbackPulse`; reported by Artem from the page.
- **Status** — Open.

### NumericBadge turns clickable from onClick, while hiding the prop

- **What** — `NumericBadge` omits `clickable` from its public props, then derives
  it from whether an `onClick` was passed. So a consumer cannot ask for the
  clickable styling, but gets it as a side effect of attaching a handler.
- **Evidence** — `NumericBadge.tsx`: `Omit<VariantProps<typeof numericBadgeVariants>, 'clickable'>`
  alongside `const isClickable = !!onClick`.
- **Why it matters** — A count is not a control, and nothing in the design says a
  count should look pressable. Hiding the prop suggests the affordance was not
  meant to be reachable, yet the most ordinary thing a consumer might do turns it
  on.
- **Suggested action** — Decide whether a clickable count is sanctioned. If it is,
  expose the prop; if not, stop deriving it.
- **Found while** — documenting `NumericBadge`.
- **Status** — Open.

## Known limitations we chose to live with

Not findings — decisions worth remembering so they are not rediscovered.

- **The docs page does not follow the theme toggle.** Storybook renders docs
  pages on its own light surface in both themes; only the story canvas responds
  to `data-theme`. The shared Overview frame therefore pins its light-theme
  colours in dark mode. Making the page itself dark would mean overriding
  Storybook's entire docs stylesheet, which is out of proportion to the benefit.
  Carbon's own documentation behaves the same way.

### EmptyState: the flagship example demonstrates the wrong actions for its type

- **What** — The `CollectionEmpty` story pairs the `collection-empty` type with
  "Reset filters" and "Refresh" buttons, which are `no-results` actions, and its
  copy is placeholder text ("Title text goes here").
- **Evidence** — `packages/design-system/src/components/EmptyState/EmptyState.stories.tsx:64`.
  Our own usage guide, plus Carbon, EUI and Geist, all split the types by *why*
  the region is empty: a first-use or empty collection gets a create action, a
  filtered-to-nothing view gets a clear-the-filter action.
- **Why it matters** — It is the first example on the page and the one people
  copy, so the canonical snippet teaches the one pairing the guidance forbids.
  The placeholder title also means the page never shows the invitation-style
  wording the copy rules ask for.
- **Suggested action** — Give the story a real first-use scenario — a verb-led
  title and a primary "Create…" button with an optional secondary — and leave
  filter-clearing to `NoResults`.
- **Found while** — documenting `EmptyState`.
- **Status** — Open.

### UtilityPage: the Offline story carries the 500 story's subtitle

- **What** — `Offline` states "Something broke." above a description that says the
  connection dropped and will reconnect on its own, so the headline contradicts
  the copy below it and duplicates the `500` story word for word.
- **Evidence** — `packages/design-system/src/components/UtilityPage/UtilityPage.stories.tsx`,
  `Offline.args.subtitle`. Carbon and Atlassian both ask an error message to name
  the actual problem; our own usage guide asks the subtitle to be the one-line
  statement of what happened.
- **Why it matters** — Offline is the one state where nothing is broken, and
  saying it is undercuts the reassurance the description then tries to give.
  It is also the sanctioned copy people will lift.
- **Suggested action** — Reword to the state, e.g. "You're offline." or
  "Connection lost."
- **Found while** — documenting `UtilityPage`.
- **Status** — Open.

### UtilityPage: hand-rolled typography instead of the type components

- **What** — The template styles its own heading and body text
  (`font-mono text-6xl` on an `h1`, raw `p` elements) rather than composing
  `Heading` / `Text`, and its three copy slots are plain `string` props, so a
  consumer cannot pass a formatted node.
- **Evidence** — `packages/design-system/src/components/UtilityPage/UtilityPage.tsx:31-40`.
  `EmptyState` next to it composes `Text` for its description.
- **Why it matters** — A typography change in the foundations will not reach this
  page, and the sibling pair drifts. The string-only props also block a link
  inside the description, which several of the states plausibly want.
- **Suggested action** — Compose `Heading` / `Text` where the ramp allows it, and
  widen the copy props to `ReactNode`. Both are behaviour-visible, so pair with a
  screenshot check.
- **Found while** — documenting `UtilityPage`.
- **Status** — Open.

### FilterInput stories: non-token chrome on public docs pages

- **What** — The scaffolding around the specimens is raw Tailwind rather than
  design-system surface: `bg-blue-500` trigger buttons, a `bg-blue-50` info
  panel, `text-gray-600` labels, `bg-gray-100` JSON debug boxes, and hand-styled
  `<kbd>` spans where the DS ships a `Kbd` component.
- **Evidence** — `FilterInputOperatorMenu.stories.tsx` (the `Open Menu` button and
  the keyboard panel), `FilterInput.stories.tsx` and
  `FilterInputComposition.stories.tsx` (the `bg-gray-100` expression dumps).
- **Why it matters** — These are the pages a reader opens to judge the pattern,
  and the loudest thing on several of them is a stock-blue button that exists in
  no product screen. The `<kbd>` spans also mean the docs contradict `Kbd`.
- **Suggested action** — Swap the triggers for `Button`, the panel for the
  annotation style, the `<kbd>` spans for `Kbd`, and give the expression dumps a
  neutral token surface. Story-file only, so it is safe from the component's
  point of view.
- **Found while** — documenting the `FilterInput` family.
- **Status** — Partly done. The operator-menu and field-menu pages now use a DS
  `Button` trigger and the annotation style, and the hand-styled `<kbd>` panel is
  gone. `Toast`, `Dialog` and `Drawer` have since had the same treatment, and the
  rule is now a section of the skill rather than a per-page judgement. Still open:
  the `bg-gray-100` expression dumps on the `FilterInput` and `Composition`
  pages, and the remaining loud pages (`Selection`, `Table`, `Tour`,
  `OverflowTooltip`, `InlineEdit`, `Card`, `AppShell`, `Tooltip`, `TreeView`).

### FilterInput: the BackendIntegration example demonstrates a pattern we forbid

- **What** — The story fakes a fetch with `useState(() => { setTimeout(...) })`,
  using a state initialiser as an effect, and `Simple` still carries a
  `console.log` (the one lint warning in the folder).
- **Evidence** — `FilterInputComposition.stories.tsx`, `BackendIntegration.render`
  and `Simple.render`. Our coding standards rule out `useEffect` for derived
  state and `console` in shipped code; a state initialiser with a timer inside is
  worse than either.
- **Why it matters** — It is the sanctioned answer to "how do I wire this to the
  backend", so it is the snippet people copy into product code.
- **Suggested action** — Rewrite with a plain `useEffect` and a documented mock
  delay, and drop the `console.log`.
- **Found while** — documenting the `FilterInput` family.
- **Status** — Open.

### FilterInput: three of the five pages document internals nobody should compose

- **What** — `FilterInputChip` (21 stories), `FilterInputFieldMenu` (11) and
  `FilterInputOperatorMenu` (8) each get a full Overview page, while the usage
  guidance is that the pattern owns all three and consumers must not hand-wire
  them. Forty of the family's sixty-one stories are therefore internal-only.
- **Evidence** — The five story files under
  `packages/design-system/src/components/FilterInput/stories/`, against the
  "self-contained UI / exported only for rare custom builds" rule in the
  component's usage guide.
- **Why it matters** — A reader browsing `Patterns/` cannot tell which of the
  five pages they are meant to use, and the sub-pages carry the most
  implementation-flavoured stories in the library.
- **Suggested action** — Decide whether the three internal pages belong in the
  public sidebar at all; if they stay, group them under an `Internals` node so
  the entry point is unambiguous.
- **Found while** — documenting the `FilterInput` family.
- **Status** — Open.

### Kbd: the props types are never exported

- **What** — `KbdProps` and `KbdGroupProps` are declared with `type` but not
  exported, and `index.ts` re-exports only the components.
- **Evidence** — `packages/design-system/src/components/Kbd/Kbd.tsx:24`,
  `KbdGroup.tsx:4`, `Kbd/index.ts`. The component rules require exporting both
  the component and its props type from `index.ts`.
- **Why it matters** — A consumer cannot type a wrapper around `Kbd`, and the
  Overview page's API table comes out nearly empty: `size` shows no options and
  `children` is missing, so the page cannot tell anyone that `xsmall` exists.
- **Suggested action** — Export both prop types and add them to `index.ts`.
- **Found while** — documenting `Kbd`.
- **Status** — Open.

### Separator: the props table omits `spacing`, its main knob

- **What** — The API table lists `orientation` and `decorative` but not
  `spacing`, the 22-step scale that sets the margin around the rule.
- **Evidence** — `Separator.tsx` takes `spacing` through
  `VariantProps<typeof separatorVariants>`; the rendered Overview table shows
  only the explicitly declared props. `EmptyState`'s `type` (also a variant prop,
  but declared on the interface) does appear.
- **Why it matters** — The one thing a reader has to decide about a separator is
  how much air it carries, and the API section does not admit the prop exists.
- **Suggested action** — Declare `spacing` on the exported props type, or add an
  `argTypes` entry so docgen picks it up. Worth checking which other components
  hide variant-only props the same way.
- **Found while** — documenting `Separator`.
- **Status** — Open.

### Icons: the gallery tiles are click-only

- **What** — Each tile in `AllIcons` is a `div` with an `onClick` that copies the
  JSX, so copying an icon name cannot be done from the keyboard, and the copy
  affordance is a `title` tooltip.
- **Evidence** — `packages/design-system/src/icons/module/Icons.stories.tsx`,
  the gallery grid. The story file also builds its layout from inline `style`
  objects and returns a keyless fragment from a `map`, which logs a React warning
  on the page.
- **Why it matters** — This is the most-visited page in Storybook and the one
  designers and engineers use as a picker; a mouse-only copy is a real barrier,
  and it reads oddly on a design system that audits its own components for this.
- **Suggested action** — Make each tile a `button`, and add the missing key.
  Story-file only.
- **Found while** — documenting `Primitives/Icons`.
- **Status** — Open.

### Loader: no way to give the spinner an accessible name

- **What** — `Loader` destructures only its own props and spreads nothing, so a
  consumer cannot pass `aria-label`, `role`, `className` or any other attribute.
  The only escape is wrapping it in an element of your own.
- **Evidence** — `packages/design-system/src/components/Loader/Loader.tsx:38-45`.
  Nord ships a `label` prop and hides the spinner from assistive tech without
  one; Primer ships `srText` defaulting to "Loading"; EUI requires a title or
  the icon goes `aria-hidden`. Three systems converge and we ship neither.
- **Why it matters** — Every consumer has to reinvent the live region, so most
  will not, and a spinner is exactly the moment a non-sighted user needs telling.
  It also blocks analytics attributes on a loading state.
- **Suggested action** — Either forward rest props, or add an optional `label`
  that renders the `role="status"` wrapper. Coordinate with the loading-a11y
  foundations gap already parked in the design-judgment backlog.
- **Found while** — documenting `Loader`.
- **Status** — Open.

### Loader: the usage guide names a default colour the code does not have

- **What** — The component's usage guide says `color` defaults to `primary`.
  `loaderVariants` declares no `defaultVariants`, so with no `color` the spinner
  simply inherits the current text colour.
- **Evidence** — `Loader.tsx:8-26` against `Loader.llm.md` ("`primary` default").
- **Why it matters** — Inheriting is arguably the better behaviour, but the two
  documents disagree, and the Storybook page now describes the code.
- **Suggested action** — Decide which is intended: add `defaultVariants` or
  correct the usage guide.
- **Found while** — documenting `Loader`.
- **Status** — Open.

### Progress: the colour prop exposes the whole palette

- **What** — `color` offers every palette hue (brand, slate, red, worange, amber,
  yellow, lime, green, emerald, teal, cyan, sky, blue, indigo and more) on a
  component whose guidance is "stay on `brand` unless a status genuinely
  applies".
- **Evidence** — `packages/design-system/src/components/Progress/constants.ts`,
  rendered in the `Colors` story.
- **Why it matters** — A fourteen-colour menu reads as an invitation to pick a
  colour, and a progress bar's colour is one of the few places where hue carries
  meaning (failing, blocked, complete). The wide surface makes the meaningful
  choice indistinguishable from a decorative one.
- **Suggested action** — Consider narrowing to the status-bearing set, or keep
  the palette and mark the status subset in the type.
- **Found while** — documenting `Progress`.
- **Status** — Open.

### Skeleton: the comparison stories never say which column is which

- **What** — `Shapes` and `Wrap` put placeholders in the left column and the real
  components in the right with nothing labelling either, so the reader has to
  infer the comparison.
- **Evidence** — `Skeleton.stories.tsx`, both stories. The code carries
  `{/* Title */}`-style comments that never render.
- **Why it matters** — It is the one page where the whole point is that the
  placeholder matches the content's measurements, and the pairing is left
  implicit.
- **Suggested action** — Add a two-word annotation over each column
  ("placeholder" / "real"). Flagged rather than done, because the docs pass only
  restyles annotations a story already has.
- **Found while** — documenting `Skeleton`.
- **Status** — Open.

### Logo: the Styles story never says which colour value each row is

- **What** — `Styles` stacks three rows (`default`, `white`, `full-white`) with
  only the background telling them apart, and no label naming the prop value.
  `Sizes` has the same gap across its three columns.
- **Evidence** — `packages/design-system/src/components/Logo/Logo.stories.tsx`.
- **Why it matters** — `white` and `full-white` sit on identical dark surfaces
  and differ only in the icon's colour, so a reader cannot map row to value
  without opening the code.
- **Suggested action** — Add a two-word annotation per row and per column.
  Flagged rather than done, because this pass only restyles labels a story
  already has.
- **Found while** — documenting `Logo`.
- **Status** — Open.

### Brand: there is no logo-usage page, and the reference systems cannot supply one

- **What** — Storybook documents the `Logo` component's props but nothing about
  using the brand: clear space, minimum legible size, what not to do (recolour,
  stretch, add effects, place on a busy photo), and when the mascot may appear
  next to the logo.
- **Evidence** — Consulting all seven reference systems returned almost nothing
  usable: Atlassian's Logo page is a one-line definition, Primer keeps brand
  rules in a separate brand toolkit outside the design system, Carbon's are
  IBM-internal, and Nord ships no logo component at all. The guidance has to
  come from us.
- **Why it matters** — `Logo` and `WallyIcon` are the two components where misuse
  is a brand problem rather than a UI problem, and the pages that would prevent
  it do not exist.
- **Suggested action** — A short `Brand/Usage` docs page (clear space, minimum
  sizes, the misuse set, mascot-versus-logo), sourced from Figma rather than
  written here.
- **Found while** — documenting `Brand/Logo` and `Brand/WallyIcon`.
- **Status** — Open.

### FilterInputChip: a long attribute label wipes out the value

- **What** — Every chip segment except the last value carries `flex-shrink: 0`,
  so when the content exceeds the chip's cap the last value absorbs the entire
  deficit and collapses to **zero width** — no ellipsis, no sign it is there.
  The value is the only part of the chip that disappears, and it is the part the
  filter actually matches on.
- **Evidence** — Measured in the running Storybook.
  `FilterInputChip → WithLongText`: chip 320px (its `max-w-[320px]` holds),
  attribute segment 308.9px at `shrink-0`, operator 10.5px, **value 0px**.
  `PairedWithLongText`: chip 380px, first attribute 219px, base value capped at
  90px as intended, **second value 0px** and the remove button squeezed.
  `FilterInputChip.tsx:137` (`className='shrink-0'` on the attribute segment),
  `:164` (the 320/380 cap), `:199` (the 90px paired-value cap).
- **Why it matters** — Field labels come from a backend schema, so their length
  is not ours to control, and several in the shipped attack-vectors set are long.
  A user then sees a chip naming the field and the operator with nothing after
  it, which reads as an empty or broken filter. The `max-w-[90px]` patch on the
  paired base value (commented `AS-1179`) is the same bug fixed for one segment
  only.
- **Suggested action** — Give the attribute segment `min-w-0` and a share of the
  budget (a percentage max-width, or a flex basis) so it truncates with an
  ellipsis before the value loses its last pixel, and guarantee the value a
  minimum width. Worth deciding the priority explicitly: if the chip has to drop
  something, the field label is the safer thing to abbreviate.
- **Found while** — reviewing the `FilterInput` docs pages with Artem.
- **Status** — Filed (WDS-174).

### FilterInputFieldMenu: Recent and Suggestions can never appear together

- **What** — The menu renders its Suggestions section only when there are no
  recent conditions (`!filterText && showSuggestions && !showRecent`), so passing
  both props shows Recent alone.
- **Evidence** —
  `FilterInputMenu/FilterInputFieldMenu/FilterInputFieldMenu.tsx:155-170`.
  Verified in the browser: with both props set, only the Recent section renders.
  The `WithRecentAndSuggestions` story existed to show both and never could.
- **Why it matters** — It reads as intentional (suggestions are the cold-start
  fallback, and two shortcut sections at once would be noise) but it is written
  nowhere, so the next person to add a suggestions list will file it as a bug.
- **Suggested action** — Confirm the rule is intended, then either state it in
  the component's usage guide or let the two stack. The story now documents the
  current behaviour either way.
- **Found while** — fixing the `FilterInputFieldMenu` page with Artem.
- **Status** — Open.

### FilterInputFieldMenu: no `positioning` means the menu lands in the page corner

- **What** — The menu is anchored entirely by the `positioning` object its parent
  supplies. Rendered without one, the Ark portal has nothing to measure and the
  panel pins itself to the top-left of the viewport.
- **Evidence** — Measured on the old Overview page: ten positioners portaled to
  `<body>`, every one at `top: 0, left: 0`, stacked, which is also why the shadow
  looked far heavier than the `shadow-md` it actually carries. The e2e suite
  carried a bespoke `gotoFieldMenu` helper in two files purely to work around it.
- **Why it matters** — Only `FilterInput` composes this today, so no product
  surface is affected, but the failure is silent and the fix is not discoverable
  from the props table.
- **Suggested action** — Optional: fall back to a sane anchor, or warn in
  development when `open` is true and no `positioning` was given. The stories are
  fixed regardless.
- **Found while** — fixing the `FilterInputFieldMenu` page with Artem.
- **Status** — Open.

### FilterInput: only half the field types offer the presence operators

- **What** — `is_null` / `is_not_null` are offered for `string`, `boolean` and
  `enum` fields but not for `integer`, `float` or `date`, so a query cannot ask
  whether a numeric or date field is set.
- **Evidence** — `FilterInput/lib/constants.ts:123-136` (`OPERATORS_BY_TYPE`).
  `integer` also carries `in` while `float` does not, and `between` exists only
  for `date`.
- **Why it matters** — A missing numeric value is as real as a missing string —
  "no response time recorded" is a normal thing to filter for — and the asymmetry
  reads as an oversight rather than a decision. It also made the old story prose
  wrong: it listed `between` and the presence checks for integer, and the menu
  shows neither.
- **Suggested action** — Decide per type whether the presence pair belongs, and
  document the answer. Cheap to add if the backend already supports null checks
  on those columns.
- **Found while** — fixing the `FilterInputOperatorMenu` page with Artem.
- **Status** — Open.

### Alert and Toast: the sanctioned examples break the house microcopy rules

- **What** — Alert's stories title their examples in Title Case ("Primary Alert",
  "Critical Error", "Alert with Two Action Buttons") and Toast's fire titles like
  "Success!", "Loading...", "Error occurred" with terminal punctuation. Both
  contradict the messaging microcopy rules the components' own usage guides carry:
  sentence case, no trailing punctuation, no "successfully", aim for three words.
- **Evidence** — `Alert.stories.tsx` (every story), `Toast.stories.tsx`
  (`ToastDemo`'s six types). `Alert.llm.md` and `Toast.llm.md` both state the
  rules; Carbon and Atlassian independently ask an error title to name what
  stopped rather than shout.
- **Why it matters** — These are the strings people copy. A page that teaches the
  right component with the wrong words spreads the wrong words, and the messaging
  family is exactly where the copy is the work.
- **Suggested action** — Rewrite the example strings to the house rules once the
  technical writers settle them ("Event created", "Uploading file…"). Story copy
  only, no component change.
- **Found while** — documenting `Alert` and `Toast`.
- **Status** — Open.

### Messaging: two reference systems ship a success banner and we deliberately do not

- **What** — Our `Banner` has no success variant: "it worked" is a `Toast`. Nord's
  banner and Primer's Banner both ship success tones, and Nord's banner is
  section-scoped, which is our `Alert`'s job rather than our `Banner`'s.
- **Evidence** — `Banner/classes.ts` variants (primary, secondary, destructive,
  info, warning); nordhealth.design/components/banner (`'info' | 'danger' |
  'success' | 'warning'`, "place at the top of the section it applies to");
  primer.style Banner (critical, info, success, warning, upsell).
- **Why it matters** — Nothing to change today, but the naming collision is a real
  trap for anyone reading another system's docs: their "banner" is our "alert".
  Worth stating in our own guidance rather than leaving people to discover it.
- **Suggested action** — Keep what we ship. Consider one line in the Banner usage
  guide naming the collision, so a designer arriving from Nord or Primer does not
  reach for a success banner.
- **Found while** — documenting the messaging family.
- **Status** — Open.

### Stack: children that are not elements are silently dropped

- **What** — `Stack` maps its children through `getValidChildren`, which filters on
  `isValidElement`, so a bare string or number child renders nothing at all:
  `<VStack>Saving…</VStack>` is empty.
- **Evidence** — `Stack/Stack.tsx` (the `clones` memo) and `Stack/utils.ts`
  (`Children.toArray(children).filter(isValidElement)`). `Flex` next to it has no
  such filter and renders text fine.
- **Why it matters** — It is the most-used layout primitive in the library and the
  failure is silent: no warning, no fallback, just missing content. The two
  siblings also behave differently on the same input, which nobody would predict.
- **Suggested action** — Either render non-element children as-is, or warn in
  development. The Storybook page now states the rule, but a component that
  swallows content deserves better than a documented workaround.
- **Found while** — documenting `Stack`.
- **Status** — Open.

### Layout stories: stock-blue demo boxes, and one example that cannot show its own point

- **What** — `Flex`, `Stack` and `ScrollArea` all build their specimens from a
  local `Box` helper coloured `bg-blue-500`, a raw Tailwind hue rather than a
  token. In `Stack`'s `FlexBehavior`, the `fullWidth` row is visually identical to
  the `default` row, because the boxes are a fixed width and stretching the
  container changes nothing you can see.
- **Evidence** — the `Box` helpers in `Flex.stories.tsx`, `Stack.stories.tsx` and
  `ScrollArea.stories.tsx`; the second group of `FlexBehavior`.
- **Why it matters** — These are the pages people open to learn the spacing
  system, and the colour in them exists in no product screen. An example that
  cannot demonstrate the prop it is named after teaches nothing.
- **Suggested action** — Move the `Box` helpers onto a neutral token surface, and
  give the `fullWidth` example a child that actually fills (or a visible container
  edge) so the difference shows.
- **Found while** — documenting the layout folder.
- **Status** — Open.

### AnimatedBackground: the description promised it never takes pointer events

- **What** — The old page description said the background "never intercepts
  pointer events". The pixel variant's `game` prop switches on `pointer-events-auto`
  while the game runs, and the `PixelWithCard` story turns it on without saying so.
- **Evidence** — `AnimatedBackground/pixel/PixelBackground.tsx` (`gameActive &&
  'pointer-events-auto'`, twice) against the previous `docs.description.component`.
  Corrected on the page in this pass.
- **Why it matters** — Anyone laying interactive content over the background would
  have trusted the old sentence. It is also the only place `game` is documented at
  all, and it is a genuine feature rather than dead code.
- **Suggested action** — Decide whether `game` is a supported prop or an easter egg
  that should be hidden from the API, and say which in the component's own docs.
- **Found while** — documenting `AnimatedBackground`.
- **Status** — Open.

### Breadcrumbs: a "WIP" tooltip ships on the docs page

- **What** — `WithTruncation` wraps the ellipsis in a `Tooltip` whose entire
  content is the string "WIP", so hovering the collapse control on a public page
  shows a work-in-progress marker.
- **Evidence** — `Breadcrumbs.stories.tsx`, the `WithTruncation` story. The
  component's usage guide also records that per-item truncation with a tooltip is
  drawn in Figma but not shipped, which is presumably what the marker refers to.
- **Why it matters** — It reads as an unfinished component to anyone browsing, and
  it hides the one thing the story is meant to teach: that the ellipsis expands
  the middle of the trail.
- **Suggested action** — Replace it with the real tooltip copy, or drop the
  tooltip and let the ellipsis speak for itself.
- **Found while** — documenting `Breadcrumbs`.
- **Status** — Open.

### Link: the variant stories cannot be read without opening the code

- **What** — `Types`, `Weight` and `Sizes` each render several links whose text is
  the identical word "Link", with nothing naming which variant is which. `Types`
  also demonstrates `alt` — the inverted family meant for dark surfaces — on the
  light canvas, where it is pale blue on white and close to illegible.
- **Evidence** — `Link.stories.tsx`, all three stories; verified in the browser.
- **Why it matters** — The reader cannot map row to prop, and the one variant that
  needs a dark surface is shown failing on a light one, which invites the
  conclusion that `alt` is simply low-contrast.
- **Suggested action** — Label the rows, and put the `alt` example on a dark
  surface. Flagged rather than done, because this pass only restyles labels a
  story already has.
- **Found while** — documenting `Link`.
- **Status** — Open.

### Alert: the MinMaxWidth story cannot demonstrate either bound

- **What** — `Alert` is a block-level flex container with `min-width: 256px` and
  `max-width: 980px` and no width of its own, so it simply takes the container's
  width, clamped. Both bounds are therefore invisible in a canvas that sits
  between them, which is every canvas the story renders in.
- **Evidence** — Measured on the Overview page. At a 1600px window (938px
  canvas): the "short content" alert is **938px**, the "long content" alert is
  **938px**, and only the `maxWidth={500}` one differs at **500px**. At an 800px
  window the canvas collapses to 256px and **all three** sit at the minimum, so
  the same story shows completely different widths depending on window size —
  a consequence of `layout: 'centered'` shrink-to-fitting the story root.
  `Alert.tsx:66` applies both bounds as inline style.
- **Why it matters** — The labels named the two bounds, so the page asserted a
  256px alert next to a 938px one. Corrected to describe what is actually
  visible, but the story still cannot show either limit.
- **Suggested action** — Each example needs a container that crosses its bound.
- **Found while** — Artem spotted the min-width label on the rendered page.
- **Status** — Closed — rebuilt on Artem's go. Four rows, each measured: a 200px
  container (alert holds 256 and overflows it), a 600px container (fills at
  598), an 1100px container inside an `overflow-x-auto` wrapper (stops at 980,
  leaving the container visibly empty), and `maxWidth={500}` in a 600px container.
  Dashed container edges make the bound visible, and the story takes
  `layout: 'padded'` so the canvas no longer shrink-wraps it.

### Visual e2e baselines are stale on this branch

- **What** — Around thirty story files have changed rendered output during this
  documentation pass — every annotation-label conversion, plus the two menu story
  harnesses — while no screenshot baseline has been regenerated.
- **Evidence** — `git diff --name-only main...HEAD`: 72 story files changed, zero
  files under any `*.e2e.ts-snapshots/`. `Alert`, `Badge`, `Button`, `DateInput`,
  `DateRangeInput`, `Icons`, `Indicator`, `NumericBadge`, `OverflowTooltip`,
  `Progress`, `Skeleton`, `SplitButton`, `Stack`, `Flex`, `TimeInput`, `Toast`,
  `Tour`, `WallyIcon` and the two FilterInput menu pages are the substantive ones.
- **Why it matters** — The visual e2e jobs will fail on this branch until the
  baselines are regenerated. This is expected for a pass whose whole point is
  restyling in-canvas labels, but it must not come as a surprise at PR time.
- **Suggested action** — Regenerate with the `[update-screenshots]` commit
  trigger once the branch merges to main, per the repo's CI convention. Worth
  confirming with engineering before opening the PR.
- **Found while** — checking whether the Alert story change would break a
  snapshot.
- **Status** — Open.

### Card stories log to the console instead of using `fn()`

- **What** — `Card.stories.tsx` wires four `onClick` handlers to `console.log`,
  where the rest of the library uses `fn()` from `storybook/test` (see
  `Accordion.stories.tsx`). Biome reports six `noConsole` warnings on the file.
- **Why it matters** — The handlers exist to make the card interactive, and
  `fn()` does that while also showing the call in the Actions panel. As written
  the demo's feedback is hidden in the browser console.
- **Suggested action** — Swap the four `console.log` calls for `args`-level
  `fn()`, as `Accordion` does.
- **Found while** — linting after writing Card's prose; the warnings predate this
  branch.
- **Status** — Open.

### CodeSnippet's `Sizes` story labelled the wrong default

- **What** — The annotation above the middle specimen read `md (default)`.
  `CodeSnippetRoot` defaults to `size = 'sm'` (`CodeSnippetRoot.tsx:94`), and the
  rendered `Default` story measures 12px against `md`'s 14px.
- **Why it matters** — It is the only place on the page that states a default, and
  it stated the wrong one; a reader sizing a block by it would land one step large.
- **Suggested action** — Corrected in this pass: the label now sits on `sm`. Kept
  as a record because it is the third inherited-claim error found this way.
- **Found while** — measuring the rendered font sizes before writing the `Sizes`
  sentence.
- **Status** — Closed — label moved to `sm`.

### FormatDateTime: an invalid date gets no tooltip, a null one does

- **What** — `value == null` renders the em dash inside a `Tooltip` reading "No
  data"; an unparseable value renders the same em dash with no tooltip at all
  (`FormatDateTime.tsx`, the two early returns).
- **Why it matters** — Both cases look identical on the page, so hovering is the
  only way to tell "nothing was recorded" from "something was recorded and we
  can't read it" — and in the second case hovering says nothing.
- **Suggested action** — Either give the invalid branch its own tooltip, or decide
  deliberately that both read as "No data" and share the branch. Not documented on
  the page, since no story renders an invalid value. `FormatNumber` treats
  `NaN`/`Infinity` exactly the same way, so this is a house pattern rather than a
  one-off slip — which makes it worth settling once, for both.
- **Found while** — writing the `NullValue` sentence.
- **Status** — Open.

### FormatNumber drops the unit from the cell as soon as the number abbreviates

- **What** — In the `WithUnit` story, `42` renders "42 requests" and `500`
  (standard) renders "500 requests", but `12,042` renders a bare "12k" and
  `59,614,283` a bare "59.6M". The unit survives in the tooltip and the accessible
  name only. The three branches in `FormatNumber.tsx` differ: abbreviated **with**
  a tooltip appends no unit, abbreviated **without** one does, unabbreviated does.
- **Why it matters** — In a column of mixed magnitudes the unit appears and
  disappears row by row, which reads as a bug rather than a rule, and the reader
  who most needs the unit — the one looking at the abbreviated figure — is the one
  who does not get it.
- **Suggested action** — Decide one rule: either the unit always shows beside the
  value, or never does and the label carries it. Documented as-shipped for now.
- **Found while** — checking the `WithUnit` story on the page against the three
  return branches.
- **Status** — Open.

### OverflowList's `MinVisibleItems` story does not exercise the floor

- **What** — The story sets `minVisibleItems={1}` in a 160px box and its own
  description says the floor is what keeps a tag visible. Measured on the page,
  the row needs 134px of the 136px available and shows **two** tags plus `+7`, so
  the engine's own measurement is doing the work and the floor never engages
  (`resolveVisibleItems` only applies when `visibleItems.length < minVisibleItems`).
- **Why it matters** — The story reads as a demonstration of a prop it does not
  demonstrate; anyone checking whether the floor works would conclude it does from
  a frame that never called it.
- **Suggested action** — Narrow the container until nothing fits (roughly 60–80px
  of content width), or use a longer item so a single tag cannot fit. Then the
  floor is visibly the reason one item survives.
- **Found while** — measuring the frame before writing its sentence; the prose now
  describes the prop without claiming this frame proves it.
- **Status** — Open.

### Selection's stories fire `alert()` — eleven of them

- **What** — Every bulk action in `Selection.stories.tsx` is wired to
  `window.alert` (`alert(\`Delete ${selected.length}\`)` and friends), so clicking
  Delete on the Overview page throws a blocking browser dialog.
- **Why it matters** — On a documentation page the reader is expected to click the
  bar; a modal dialog interrupts the page and has to be dismissed before anything
  else works. The house pattern elsewhere is `fn()` from `storybook/test`, which
  logs to the Actions panel instead. Same root cause as the `Card`
  `console.log` finding: story handlers were written ad hoc rather than to a
  convention.
- **Suggested action** — Replace all eleven with `fn()`, and consider making it a
  lint rule so it stops recurring.
- **Found while** — reading the bulk-bar stories for their sentences.
- **Status** — Open.

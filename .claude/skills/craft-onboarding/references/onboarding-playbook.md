# Onboarding playbook — the evidence behind the rules

The *why* (and the sourced numbers) behind SKILL.md's gate and rubric. Read this when
you need to justify a call to the user, or when a request pushes on a boundary. The
short version lives in SKILL.md; this is the depth.

**Contents:** §1 When NOT to use a tour · §2 The ladder · §3 Authoring (length, step
style, copy) · §4 Triggering & frequency · §4b Governance / segmentation / lifecycle ·
§5 Accessibility · §6 Measurement · §7 Sources.

## §1 · When NOT to use a tour (the most important section)

A guided tour is the *wrong* default. Reach for it only when a user faces a genuinely
unfamiliar, multi-step workflow — otherwise pick a lighter tool. The evidence:

- **Don't gate first-run with an upfront multi-step tour.** Tutorials "interrupt users,"
  "don't tend to be memorable," and "don't result in better task performance"; deck-of-
  cards tutorials make the interface "appear more complicated than it actually is."
  Reserve guidance for the first encounter with a *specific* feature. (NN/g)
- **Don't use a tour to paper over confusing UX.** ~70% of users skip linear tours. If a
  tour exists only to explain a confusing screen, fix the screen. (Chameleon)
- **Don't feature-dump.** Showing everything before the user has felt any value is "the
  most common onboarding anti-pattern" — overload, then drop-off. Orient to **one** goal.
  (Appcues, Chameleon)
- **Don't explain the obvious.** "Explanations of standard icons are useless and simply
  waste users' time." (NN/g)
- **Don't point at hidden or non-actionable elements.** Only coachmark something the user
  can see and act on now. (Primer)
- **Don't blanket-fire on load.** User-initiated / contextual tours outperform delayed or
  blanket triggers ~2–3×. (Chameleon, Appcues)
- **Don't run one highlight on top of another, or campaigns forever.** One spotlight on
  screen at a time; cap promo frequency. (Atlassian, Primer, Pendo)

**Announcement vs onboarding vs task-completion** — three different jobs: feature
*promotion* at launch is usually NOT a tour (use a Badge/Tooltip/Banner); first-run
*onboarding* should be brief, optional, ideally contextual; a genuinely complex
*workflow* is the legitimate home of an interactive walkthrough. (NN/g, Appcues)

## §2 · The onboarding / feature-guidance ladder

Pick the lightest tool that does the job (mirrors the gate table in SKILL.md):

`Badge "New"` / inline hint → `Tooltip` (one control, hover) → `Banner`/changelog
("what's new" roundup) → `EmptyState` (first-run, nothing yet) → **single-step Tour +
`beaconStepEffect`** (announce one feature in context) → **multi-step Tour** (unfamiliar
/ hands-on workflow). Escape hatch: a confusing screen → *fix the UI*, don't tour over it.

## §3 · Authoring a good tour

**Length / structure**
- **Cap at 3–5 steps.** Completion data across ~15M interactions: 3-step ≈ 72%, 4-step
  ≈ 45%, 7-step ≈ 16%; over 5 steps loses >50%. Atlassian: ideally 1, max 3–4.
  (Chameleon, Appcues, Atlassian)
- **One goal per tour.** Remove anything not serving that single activation moment.

**Step style — show-don't-tell wins**
- Interactive "do-it" steps (the user performs the action, not just clicks Next) show
  **~123% higher completion that correlates with activation**. Prefer `waitForStepEvent`
  on any action-bearing step. (Chameleon)
- Match the surface: passive `tooltip` for quick context, interactive for workflows,
  `dialog` for a high-impact intro. (Pendo)

**Microcopy** (full house rules in `Tour.llm.md` + `docs/ai-ready-ds-content-guidelines.md`)
- **Title:** 3–5 words (max 7), benefit-first, sentence case, no period.
- **Description:** ≤160 chars (~80–120 ideal); lead with what it does / why it matters;
  active voice, "you". No fluff, no superlatives, no empty adverbs.
- **Labels:** consistent across the tour; never "OK"; Skip always available.
- **Value-framing:** remind the user *why* (don't bury the payoff); be specific — vague
  copy breeds suspicion. A descriptive dismiss ("OK, got it") beats a bare X. (growth.design, Primer)

## §4 · Triggering & frequency (the component does none of this)

- **User-initiated or contextually triggered**, not blanket-on-load (~2–3× better).
- **Offer on-demand re-entry** (help menu) — users forget tutorials and can't re-find them.
- **Frequency-cap / don't re-show** once completed or dismissed (set the "seen" flag in
  both `onFinish` and `onDismiss`). (Chameleon, NN/g, Pendo)

## §4b · Governance, segmentation & lifecycle (the company-standard layer)
This is what turns "a good tour" into "a standard a whole department can run without
carpet-bombing users." It's the layer the component can't own — the skill's launch
contract (SKILL.md Step 5) captures it.

**Segment + target — don't show everyone everything.** Segment by role/permissions,
new-vs-returning, use-case/JTBD, and behavior; define **activation as a real-result
event** (first scan run, first rule saved), never a time proxy. Targeted onboarding
reports materially better activation/retention than one-size-fits-all. (Userpilot,
Chameleon)

**Anti-fatigue governance (across many teams) — the hardest part.** Concrete defaults
to adopt (treat as a sensible standard, not a proven optimum — they come from a single
Appcues framework):
- **Cap concurrent flows: 1–2 active per user; ≤3 tooltips visible at once; ≤1 modal/checklist per session.** Don't stack a prompt on a surface that already has one.
- **Intake before any flow ships:** it must declare a linked activation metric, get cross-functional sign-off, and carry a **sunset date (~30 days) if it doesn't hit its metric.**
- Tool-level mechanisms that exist for exactly this: throttling/rate-limiting, categories, role-based publishing, auto-pausing low-performers. (Appcues, Pendo)

**Lifecycle — flows are not permanent. Retire when:** feature adoption clears a bar
(~>60%), drop-off signals the flow itself adds friction, or an A/B test shows no
activation lift. Review metrics monthly; refresh a flow when its target UI changes.
(Appcues, Whatfix)

Sources: [Appcues onboarding guide](https://www.appcues.com/blog/the-ultimate-guide-to-product-onboarding),
[Pendo in-app guides/governance](https://www.pendo.io/product/in-app-guides/),
[Userpilot segmentation](https://userpilot.com/blog/user-segmentation/),
[Whatfix onboarding](https://whatfix.com/blog/user-onboarding/).

## §5 · Accessibility (tours are a top failing component in a11y audits)

The component handles keyboard nav + focus; in the generated experience, still verify:
- Focus moves **into** the card on open, follows the step on advance, and **returns to
  the trigger** on close. Esc closes and returns focus. Never trap (WCAG 2.1.2).
- The dim layer is `aria-hidden`; the card is announced (step + title + body).
- **Respect `prefers-reduced-motion`** (the pulsing beacon, transitions); never
  auto-advance on a timer (WCAG 2.2.2) — Tour advances on interaction by design.

## §6 · Measurement

Track **completion rate**, **step-level drop-off**, and **downstream activation** (the
gap between "completed the tour" and "actually used the feature" — interactive steps are
what close it). Wire via `onStepChange` / `onFinish` / `onSkip` + `data-analytics-*` on
the step `actions`. A/B test copy, sequence, and pattern. (Appcues, Chameleon)

## §7 · Sources

- **NN/g — Onboarding Tutorials vs. Contextual Help** — https://www.nngroup.com/articles/onboarding-tutorials/ — canonical "avoid upfront tutorials / fix the UI."
- **NN/g — Mobile-App Onboarding** — https://www.nngroup.com/articles/mobile-app-onboarding/ — promotion vs instructions vs customization; "avoid onboarding whenever possible."
- **GitHub Primer — Feature onboarding** — https://primer.style/product/ui-patterns/feature-onboarding/ — per-pattern when/when-not; ~160-char limit; one-at-a-time; descriptive dismiss.
- **Atlassian — Spotlight** — https://atlassian.design/patterns/spotlight/ — "1 ideal, 3–4 max, one on screen, always dismissible." (JS-rendered page; rules via indexed snippet.)
- **Chameleon — Effective Product Tour Metrics** — https://www.chameleon.io/blog/effective-product-tour-metrics — the hard numbers (3-step 72% → 7-step 16%, ~70% skip, contextual ~2–3×, interactive +123%, progress +12%).
- **Appcues — Product tours guide / UI patterns** — https://www.appcues.com/blog/product-tours-walkthroughs-ultimate-guide — feature-dump anti-pattern, contextual vs forced-linear, 3–5 steps, measurement.
- **Pendo — Guides overview** — https://support.pendo.io/hc/en-us/articles/27240321140763-Guides-overview — tooltip vs lightbox vs tour matrix; max 5 steps; throttling.
- **ExceedAbility — Product Tours accessibility** — https://exceedability.com/product-tours.html — focus in/return, Esc, reduced motion, WCAG 2.1.2 / 2.2.2.

> Stats are from vendor benchmarks (Chameleon/Appcues/Userpilot) — directionally strong
> and consistent, but cite as "industry data," not peer-reviewed. The boundary reasoning
> (NN/g, Primer, Atlassian) is the most defensible spine.

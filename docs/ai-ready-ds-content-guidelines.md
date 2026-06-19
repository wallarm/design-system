# UX Content / Microcopy Guidelines — seeds for the content-writing layer

> Cross-cutting **UX-writing / microcopy** rules caught while authoring per-component
> `.llm.md` files — wording guidance that generalizes **beyond one component** (case,
> brevity, tone, punctuation, button labels, empty-state copy). Sibling to the
> [design-judgment backlog](./ai-ready-ds-judgment-backlog.md): that file accumulates
> the system's *visual / interaction* taste, this one accumulates its *content* taste.
> Staging area for a future **content-guidelines skill** (and an always-on microcopy
> slice of the foundations layer) — component files state these rules locally; the
> general form lives here so docs inherit instead of repeat.
>
> **How it gets fed (don't rely on memory):** when a microcopy rule lands in a
> component's `.llm.md`, park its general form here (Toast was first). Same discipline
> as the design-judgment backlog's step-6 parking lot.
>
> **Source caveat:** Wallarm's toast wording is flagged "WIP — tbd with tw-folks"
> (a wordings spreadsheet is planned). Treat these as **current best-practice, not
> frozen**; reconcile with technical writers when the spreadsheet lands.
>
> **Harvest:** when the content-guidelines skill / always-on microcopy layer gets
> built, fold rows in and mark ✅.

**Status:** 🅿️ Parked · ✅ Folded · ❌ Won't generalize

## Backlog

| Date | Source | The rule (general form) | Evidence so far | Status |
|---|---|---|---|---|
| 2026-06-15 | Toast | **Sentence case for UI microcopy** — capitalize the first word + proper nouns only (e.g. "RFP", "RFQ"), never Title Case. | Toast content-rec frame; matches Nord verbatim. Also the `Tag` label row in the design-judgment backlog. | 🅿️ Parked |
| 2026-06-15 | Toast | **Be brief — cut articles and filler** — shortest clear phrase (toasts: ~3 words ideal); drop "the / a / an" and redundant words. | Toast; Nord ("max 3 words"), EUI ("rarely more than one line"). | 🅿️ Parked |
| 2026-06-15 | Toast | **No filler politeness or implied words** — avoid "please", "note", and "successfully" (a success state already says success). | Toast content-rec; EUI ("don't include 'successfully'"). | 🅿️ Parked |
| 2026-06-15 | Toast | **Short messages / labels never end in punctuation** — toasts, labels, chips; does NOT apply to multi-sentence body / description prose. | Toast ("never end in punctuation"); Nord. | 🅿️ Parked |
| 2026-06-15 | Toast | **Loading / progress copy = present-participle verb + noun + "…"** — "Uploading file…", "Exporting event…". | Toast content-rec frame. | 🅿️ Parked |
| 2026-06-15 | Toast | **Action labels echo the message they resolve** — button text is a specific response to the title, not a generic "OK / Submit" ("Event shared with you" → "Open event"). | Toast content-rec frame. | 🅿️ Parked |
| 2026-06-15 | Toast | **Error / warning copy states what's happening succinctly + offers an inline action when possible** — describe the problem, give the user a way to address it in place. | Toast content-rec frame; Nord/EUI ("summary + CTA, don't cram detail"). | 🅿️ Parked |
| 2026-06-15 | Banner | **Action labels use a specific verb, not "Click here" / "Learn more"** — name the action ("Contact sales", "Renew", "View plans"). | Banner content frame (explicit); generalizes Toast's "button echoes the message". | 🅿️ Parked |
| 2026-06-15 | Banner | **Lead with the fact, not a severity label** — drop "Warning:" / "Important:"; the component's color / variant already carries severity. | Banner content frame; applies to Alert too (semantic color = severity). | 🅿️ Parked |
| 2026-06-16 | Button | **Button / action labels follow `<verb> <object>` in sentence case** — "Add rule", "Delete API"; not a bare "Add", not Title Case. Never "Click here" / "Learn more" / "Read more" — those are navigation, so the right control is a link, not a button. | Button.llm.md; reinforces Banner's "specific verb, not 'Click here'" + Toast's "label echoes the message" + the sentence-case row — a 4th surface, strong foundations signal. | 🅿️ Parked |
| 2026-06-18 | Link | **Link text names its destination — front-load the meaningful words; never "Click here" / "Read more" / "Learn more" / a bare "here"** (these read as nothing in a screen-reader link list). If it leads to info, name the info; if it starts a task, lead with a verb. | Link.llm.md; grounded in GOV.UK links guidance + WCAG SC 2.4.4 / F84. The *link side* of Button's "no 'Click here' — that's navigation" row → strong multi-surface foundations signal. | 🅿️ Parked |

| 2026-06-19 | Select + Input | **Form-field placeholders name the choice with a verb / give an example — never as the label.** Action-oriented (`"Select a framework"`, `"Search endpoints"`), not a bare `"Choose…"` / `"Pick"` / generic stub; the code default (`"Choose..."`) is a fallback each use site overrides. **A placeholder is not a label and never carries required/critical instructions — it vanishes on input;** persistent guidance goes in `FieldDescription`. | Select.llm.md + Input.llm.md; Geist forbids `"Choose one…"`/`"Pick"`; placeholder-≠-label is unanimous across Nord/Carbon/Geist/Primer. The placeholder surface of Button's `<verb> <object>` + Link's "name the destination" — verb-led microcopy across a 4th surface. | 🅿️ Parked |
| 2026-06-19 | Field | **Validation / error messages name the field + the broken constraint, then how to fix** — sentence case, no "please", never a bare "Invalid" / "Error". "Username is already taken." / "Must be at least 8 characters", not "Invalid input". | Field.llm.md (`FieldError` microcopy); GOV.UK error-message guidance (be specific; say what went wrong + how to fix). Extends the system's sentence-case + specific-verb rules to the validation surface. | 🅿️ Parked |

## Notes
- **Register varies by surface** — toast copy is terse (~3 words); **Banner copy is institutional, factual, calm** (a full sentence within a 2-line budget, speaking for the platform). Don't flatten everything to ≤3 words — match the component's voice. (Toast/Alert share one content frame; **Banner ships its own**, distinct one.)
- **Alert** (2026-06-15) ships the *same* Figma "Content recommendation" frame as Toast — same headings, same rules — confirming these are **messaging-wide** (and likely UI-wide), not toast-specific. Second-component evidence for every row above.
- Rows are in **general** form; component files keep the specific phrasing.
- Three sibling parking lots: [`REFINEMENTS.md`](../.claude/skills/describe-component/REFINEMENTS.md) (authoring *process*), [design-judgment backlog](./ai-ready-ds-judgment-backlog.md) (*visual / interaction* taste), and this (*content / microcopy* taste).
- A row's third piece of evidence is a strong signal it's foundations material.

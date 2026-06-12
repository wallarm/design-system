# Design-Judgment Backlog — seeds for the foundations layer

> Cross-cutting design judgment caught while authoring per-component `.llm.md` files — rules that generalize **beyond one component**. This file is the staging area for the future **foundations layer / design-judgment skill** ([strategy: the two layers](./ai-ready-ds-strategy.md)); per-component files state these rules locally, but the *general* form belongs in one always-on place so component docs can inherit instead of repeat.
>
> **How it gets fed (don't rely on memory):** step 6 of the [`describe-component` skill](../.claude/skills/describe-component/SKILL.md) now has two parking lots — skill friction → `REFINEMENTS.md`; cross-cutting judgment → **this file**. Park a row the moment you write a rule into a *second* component's file, or whenever a rule is really about density / color / interaction-ownership / microcopy rather than the component itself.
>
> **Harvest:** when the foundations layer / design-judgment skill gets built (§13 team decision), fold rows in and mark ✅.

**Status:** 🅿️ Parked · ✅ Folded into foundations · ❌ Won't generalize

## Backlog

| Date | Source | The judgment (general form) | Evidence so far | Status |
|---|---|---|---|---|
| 2026-06-12 | HttpMethod → all chips | **Size follows surrounding density** — match neighbours, never pick a size in isolation; `medium` in tables/tight rows, `large` on spacious surfaces. | Every chip doc repeats it (HttpMethod, ResponseCode, Badge, Tag, NumericBadge); Country adds "match the host, not the page". | 🅿️ Parked |
| 2026-06-12 | Badge family | **Display components are never click targets** — interactivity belongs to the parent: row/cell affordance, menu item, `FilterInput` chips, a `Select` trigger. Built-in overflow affordances ("+N") are the sanctioned exception. | Badge, HttpMethod, ResponseCode, Country, Ip, NumericBadge all carry the rule; Tag/SelectButtonTag own the interactive cases. | 🅿️ Parked |
| 2026-06-12 | Tag sanity check | **Display-first tie-breaker** — when interactivity is unknown, default to the display component (Badge); promote to the interactive sibling only when the remove/act behavior is real. | Tag.llm.md; resolves the Badge-vs-Tag gate in ambiguous prompts. | 🅿️ Parked |
| 2026-06-12 | Badge interview | **Color follows meaning, never decoration** — use the semantic when one applies, follow the page's established mapping otherwise, stay on the neutral default (slate) when there's nothing to encode. Never pick a color "to stand out". | Badge.llm.md; HttpMethod/ResponseCode lock their maps; Tag locks all-slate. | 🅿️ Parked |
| 2026-06-12 | Badge / Figma notes | **Muted / grayscale = inactive, archived, de-emphasized** — gray treatment is a state, not a style choice. | Badge muted (5 neutral colors only); Ip source chips deliberately slate. | 🅿️ Parked |
| 2026-06-12 | ResponseCode interview | **Chips state the protocol/system fact; the surrounding UI tells the business story** — never re-map a value's locked color to a business outcome (a 403 that blocked an attack stays amber, never green; Tor stays slate, never red). | ResponseCode.llm.md, Ip.llm.md (source chips = "metadata, not a threat verdict"). | 🅿️ Parked |
| 2026-06-12 | chips + Ip | **Machine values render in mono/code style; human words in default type** — IDs, codes, technical strings → `textVariant='code'` / `Code`; labels → default. | HttpMethod, ResponseCode (pinned `code`), Badge rule, IpAddress on `Code`. | 🅿️ Parked |
| 2026-06-12 | HttpMethod + Country | **Canonical-case input contract** — lookups are case-sensitive by design; normalize at the data boundary (uppercase verbs, uppercase ISO codes) instead of expecting the component to guess. | HttpMethod (`get` ≠ `GET`), Country (`de` ≠ `DE`). | 🅿️ Parked |
| 2026-06-12 | domain chips | **Unknown values degrade safely, never error** — render verbatim in neutral; don't pre-validate, don't invent fallbacks. Degradation ≠ a sanctioned pattern (a fallback code-as-text is fine; choosing code-as-text is not). | HttpMethod, ResponseCode, Country. | 🅿️ Parked |
| 2026-06-12 | Country + Ip | **Compound slot order is strict, not stylistic** — flag → name; flag → address → :port → provider. Reordering for "scannability" is a system change, not a screen choice. | Country.llm.md, Ip.llm.md (both verified refusing reorders). | 🅿️ Parked |
| 2026-06-12 | Ip + Tag + Badge groups | **Overflow pattern: fit what the width allows, collapse the tail into a "+N" affordance opening a popover** — never hand-roll width math; `OverflowList` / built-in list modes are the homes. | IpList (both modes), Tag group spec (popover min 256×68), Badge group (Figma WIP). | 🅿️ Parked |
| 2026-06-12 | Badge + Tag specs | **Text overflow: cap (320px) + ellipsis + full-value tooltip** — the house pattern for long values in small surfaces (`OverflowTooltip`). If content hits the cap, it's usually the wrong content for the surface. | Badge spec, Tag spec, CountryName, IpAddress (implemented). | 🅿️ Parked |
| 2026-06-12 | Tag (Nord-borrowed) | **Label microcopy: sentence case, no leading articles, a few words.** | Tag.llm.md; candidate for every chip/label surface. | 🅿️ Parked |
| 2026-06-12 | NumericBadge interview | **Counts: show `0` by default (hiding is a product-case exception); cap long counts `99+`; formatting is the caller's job.** | NumericBadge.llm.md. | 🅿️ Parked |
| 2026-06-12 | Tag (Nord-borrowed) | **Chips in moderation** — walls of tags/badges are cognitive noise; prefer fewer, clearer signals. | Tag.llm.md; generalizes to badge rows, tag groups. | 🅿️ Parked |
| 2026-06-12 | Badge → whole family | **Dedicated component first** — when a dedicated component exists for a value type (verb, status code, IP, country, source type, count), never compose it from raw primitives; the router lives in the base component's doc. | Badge.llm.md is the router; every domain chip repeats the rule from its side. | 🅿️ Parked |
| 2026-06-12 | ResponseCode + HttpMethod | **Escape hatches go through exports, never copied values** — when a sanctioned look isn't expressible via props (text-only renditions), compose from the component's exported maps/helpers so the source of truth stays single. | ResponseCode (`getResponseCodeCategory` + `RESPONSE_CODE_COLOR`), HttpMethod (`HTTP_METHOD_COLOR` + fallback). | 🅿️ Parked |
| 2026-06-12 | Tag + NumericBadge | **Design-TBD patterns are explicitly "don't build yet"** — and unsanctioned code affordances (NumericBadge's clickable styles) don't make a pattern sanctioned. Code ships ≠ design approves. | Tag (Selectable TBD), NumericBadge (clickable machinery unsanctioned). | 🅿️ Parked |
| 2026-06-12 | FormatDateTime | **Times display in the user's profile timezone** — never hardcode UTC or re-zone in display code; "shared view" needs are solved in profile settings. | FormatDateTime.llm.md; applies to any future temporal display. | 🅿️ Parked |
| 2026-06-12 | FormatDateTime | **Missing data renders an em dash (—)** — don't pre-check values or invent "N/A"/"Never" strings; empty-state copy is not per-call-site improvisation. | FormatDateTime; same philosophy as chips' safe degradation. | 🅿️ Parked |
| 2026-06-12 | FormatDateTime sanity | **The fact type decides the presentation, not the container** — a recency fact stays relative even inside a table; an exact-moment fact stays absolute even in a feed. | FormatDateTime.llm.md (format ladder). | 🅿️ Parked |

## Notes
- Rows are deliberately phrased in their **general** form — the component files hold the specific phrasing.
- A row earning its third piece of evidence is a strong signal it's foundations material.
- This file and `REFINEMENTS.md` are siblings: that one improves the *authoring process*, this one accumulates the *design system's own taste*.

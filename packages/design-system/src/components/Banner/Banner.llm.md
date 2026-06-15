# Banner — usage

> A full-width message pinned at the very top of the page, above the header —
> for platform / system / account-wide conditions. Persists until dismissed or
> the condition resolves; composed from sub-components.

## Reach for it when
A message addressed to everyone using the console / the whole account, pinned
full-width above the header — system status, node / version requirements, quota &
billing state, maintenance windows, announcements & promos. **The test: would the
message still be relevant if the user navigated to a different page?** Yes →
Banner; if it's tied to one view → `Alert`. (e.g. "Credential Stuffing Detection
requires Wallarm node 4.10.3 or higher", "You've exceeded your monthly quota —
contact sales".)

## Don't use it for
- **A message scoped to one section / form / view** → `Alert` (inline, contextual).
  Same look-family, narrower reach — the page-relevance test above decides.
- **A transient confirmation** (Saved, Sent) → `Toast`. Banner persists, and there's
  **no success variant**: "it worked" is a Toast, not a banner.
- **A decision that must block the flow** → `Dialog`.

## Locked — don't override
- **Placement is the whole point**: full-width, edge-to-edge (no border, no radius),
  at the very top above the header. Never inline or boxed — that's `Alert`.
- **`variant` drives bg + text + icon, semantically**: primary (dark, neutral),
  secondary (light, neutral), destructive (red), info (blue), warning (amber).
  **No success.** destructive / info / warning auto-show an icon; primary / secondary
  show none unless you pass `icon`.
- **One action pattern only** — an inline `BannerLink` (in the title) **or** right-side
  buttons in `BannerControls`, never both.
- **Light-mode only** (tagged "No dark-ui") — don't add dark-theme handling; primary
  is already the dark bar.
- **Close + buttons are fixed recipes**: `BannerClose` = outline / neutral / small
  (legible on dark and light); action buttons = small, neutral, secondary or outline.
  Never primary / solid.
- **One line preferred, two max**, then truncate + tooltip (`lineClamp={2}`).

## Composition
- `Banner` (variant + optional `icon`) › `BannerContent` (`BannerTitle` + optional
  `BannerDescription`) › trailing `BannerControls` (buttons and/or `BannerClose`).
- Inline link: pass a `BannerLink` to `BannerTitle`'s `action` prop (color adapts to
  the variant).
- A `BannerDescription`, when used, **adds new info** (consequence / impact) — not a
  restatement of the title.

## Judgment calls
- **variant** — `primary` (dark) for a prominent, system-level neutral notice
  (status, new version, maintenance); `secondary` (light) for low-emphasis neutral —
  the default for **announcements & promo**. Semantic colors for status:
  `destructive` = critical account / billing (expired subscription), `warning` =
  caution (nearing quota), `info` = informational system notice.
- **icon** — auto for destructive / info / warning; primary / secondary have none, so
  add one for an announcement / promo (e.g. `Megaphone`).
- **dismissible?** — add `BannerClose` when the user can dismiss it; omit while the
  condition still holds.

## Writing the message
Banner voice is **institutional, factual, calm** — it speaks for the platform, not
the user, even when the situation is urgent (see the content guidelines).
- Lead with the fact, **not a label** ("Warning:", "Important:") — the color carries
  severity.
- Name specific systems, versions, dates, deadlines.
- Action label = a specific verb ("Contact sales", "Renew", "View plans"), never
  "Click here" / "Learn more".

## Pairs with
- `BannerLink` (inline) **or** `Button` in `BannerControls` (small / neutral) — one
  pattern, not both.
- `Alert` / `Toast` / `Dialog` — the messaging siblings; see "Don't use it for".
- `AppShell` / the page header — the Banner sits above it.

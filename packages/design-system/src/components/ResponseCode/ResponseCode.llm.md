# ResponseCode — usage

> Colored badge for an HTTP response status code (200, 404, 5XX…). Display-only.

## Reach for it when
An HTTP status code appears on screen — endpoint lists, request/attack logs,
API docs, rule conditions. If a status code is shown, it should be a
ResponseCode. **Never hand-roll a Badge or styled Text for a status code** —
the class→color mapping is a design decision, and rolling your own silently
breaks it.

Masks are first-class: "4XX" / "40X" (case-insensitive) color by their leading
digit exactly like exact codes. Use a mask wherever the UI talks about a class
of responses (filters, suggestions, aggregates) rather than a single response.

## Don't use it for
- **Non-HTTP codes** (process exit codes, gRPC codes, internal error enums) →
  `Badge` with `textVariant='code'`. This is only for HTTP response codes.
- **Counts of responses** ("12 × 5xx") — the count is a number → `NumericBadge`
  or plain text beside a ResponseCode.
- **Choosing a code** (form control) → `Select`. This is read-only.
- **A clickable thing** — per the Badge family rule, the code chip is never the
  click target. The interactivity belongs to its parent: the row or cell's
  click affordance, a menu item, or `FilterInput`'s own filter chips.

## Locked — don't override
- **Color encodes the response class, automatically** — by leading digit, masks
  included; it deliberately separates client-fault (4xx amber) from
  server-fault (5xx red). You don't pick it and must not override or re-map it
  to business outcomes: a 403 that blocked an attack stays amber — the chip
  states protocol fact; the surrounding UI tells the story.
- Out-of-range/unparseable values render verbatim in slate — safe, not an error.
- **Text-only rendition** (colored code text, no chip — Badge `type='text-color'`)
  is sanctioned where the chip background is too heavy, as a deliberate design
  call — not a default. Compose it from the exported `getResponseCodeCategory` +
  `RESPONSE_CODE_COLOR` — never hardcode the class colors.

## Sizing
Match the density around it: `medium` in tables and tight rows, `large` on
spacious pages. Size it together with its neighbours (especially the
`HttpMethod` beside it) — never pick in isolation.

## Pairs with
- `HttpMethod` — they travel together in endpoint rows and logs:
  `GET /api/users` · `200`. Keep their sizes in sync.
- Part of the domain-chip family on `Badge` (method, IP, country…) — when a
  dedicated chip exists for a value, use it instead of raw `Badge`.

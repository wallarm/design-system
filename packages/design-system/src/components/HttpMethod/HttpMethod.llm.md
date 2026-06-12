# HttpMethod — usage

> Colored badge for a standard HTTP verb (GET, POST, …). Display-only.

## Reach for it when
A standard HTTP verb appears on screen — endpoint lists, request logs, API
docs, rule conditions, attack details. There's no single "place": if a method
is shown, it should be an HttpMethod. **Never hand-roll a Badge or styled Text
for a verb** — the method→color mapping is a design decision, and rolling your
own silently breaks it.

## Don't use it for
- **Non-HTTP operations** (GraphQL, gRPC, internal job/operation types) → use
  `Badge`. HttpMethod is *only* for standard HTTP verbs.
- **Choosing a method** (a form control) → `Select` / `SegmentedControl`. This is read-only.
- **A clickable thing** (filter chip, link) — it isn't an interactive control.

## Locked — don't override
- **Color is automatic and semantic** — it encodes risk (safe GET → green,
  destructive DELETE → rose). You don't pick it and must not override it; one
  consistent color per method across the product is the whole point.
- Unknown/custom verbs render verbatim in slate — passing an unexpected string
  is safe, not an error.

## Sizing
Match the density around it: `medium` in tables, compact cards, and tight rows;
`large` on spacious pages where neighbouring components are larger. Size to
align with its neighbours — never pick in isolation.

## Pairs with
- `ResponseCode` — they travel together in endpoint rows and logs:
  `GET /api/users` · `200`.
- Part of the domain-chip family (status codes, IP, country, CVE…), all built on
  `Badge`. When a dedicated chip exists for a value, use it instead of raw `Badge`.

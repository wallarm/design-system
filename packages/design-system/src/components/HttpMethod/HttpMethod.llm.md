# HttpMethod — usage

> Colored badge for a standard HTTP verb (GET, POST, …). Display-only.

## Reach for it when
A standard HTTP verb appears on screen — endpoint lists, request logs, API
docs, rule conditions, attack details. There's no single "place": if a method
is shown, it should be an HttpMethod. **Never hand-roll a Badge or styled Text
for a verb** — every method has its own dedicated color, and rolling your own
silently breaks it.

## Don't use it for
- **Non-HTTP operations** (GraphQL, gRPC, internal job/operation types) → use
  `Badge` with `textVariant='code'`. HttpMethod is *only* for standard HTTP verbs.
- **Choosing a method** (a form control) → `Select` / `SegmentedControl`. This is read-only.
- **A clickable thing** — the chip is never the click target. Interactivity
  belongs to its parent: the row or cell's click affordance, a menu item, or
  `FilterInput`'s own filter chips.

## Locked — don't override
- **Every method has its own dedicated color, fixed product-wide** — assigned,
  not picked: the palette encodes intent and risk (safe GET → green,
  destructive DELETE → rose). Never override or re-map it; one consistent
  color per method across the product is the whole point.
- **Pass the canonical uppercase verb** — matching is case-sensitive, so
  `get` is not `GET`: it silently falls through to the slate "other" fallback,
  lowercase text and all.
- Unknown/custom verbs render verbatim in slate — passing an unexpected string
  is safe, not an error.
- **Text-only rendition** (colored verb text, no chip — Badge `type='text-color'`)
  is sanctioned where the chip background is too heavy, as a deliberate design
  call — not a default. Compose it from the exported `HTTP_METHOD_COLOR` map
  (with `OTHER_METHOD_COLOR` as the fallback) — never hardcode method colors.

## Sizing
Match the density around it: `medium` in tables, compact cards, and tight rows;
`large` on spacious pages where neighbouring components are larger. Size to
align with its neighbours — never pick in isolation.

## Pairs with
- `ResponseCode` — they travel together in endpoint rows and logs:
  `GET /api/users` · `200`. Keep their sizes in sync.
- Part of the domain-chip family (status codes, IP, country, CVE…), all built on
  `Badge`. When a dedicated chip exists for a value, use it instead of raw `Badge`.

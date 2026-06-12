# ParameterPath — usage

> The "where the parameter lives" row: HTTP method chip + dot-joined location
> segments + encoding. Display-only (copy & expand affordances are built in).

## Reach for it when
A request parameter's location appears — attack details, security events,
API-structure views: `POST · JSON.nginx_config · BASE64`,
`GET · header.X-Forwarded-For`. Pass the parts (`method`, `segments`,
`encoding`) — never assemble method chips, dots, and text by hand.

## Don't use it for
- **URL routes / endpoints** (`GET /api/users`) → `HttpMethod` + path text.
  Segments are the parameter's location *inside* the request (body structure,
  header, cookie) — not the URL path.
- **A single plain value** (one parameter name, no path) → `Badge` with
  `textVariant='code'`, or `Code`.
- **A click target** — family rule. Navigation belongs to the row/cell or a
  dedicated link beside it (a clickable row *hosting* the path is fine); the
  built-in expand/copy affordances are the component's own.

## Locked — don't override
- **Truncation is built in**: `first … last` plus a full-path tooltip. Don't
  re-implement overflow — no extra tooltips, popovers, or wrappers.
- **Copy is built in and smart**: Cmd/Ctrl+C yields a ready FilterInput
  expression (`method = "POST" AND parameter = "…"`). Don't add copy buttons;
  don't place the component inside a `user-select: none` ancestor — copy
  silently breaks.
- The method chip inside is a real `HttpMethod` — all its rules apply.

## Judgment calls
- **`attack`** — highlights the malicious part of the parameter (red Zap).
  On where the path appears in an attack context; off where it's neutral
  structure (API browser). The highlight states a fact, not decoration.
- **`expandable`** — rarely needed: the tooltip already shows the full path.
  Opt in only where in-place reading of every segment matters (spacious
  detail panes), never in dense tables.

## Pairs with
- `FilterInput` — the copy format is its filter syntax; paths and filters
  travel together in attack investigation.
- `HttpMethod` / `ResponseCode` family — same rows, same density rules.

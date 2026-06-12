# Ip — usage

> An IP address with optional flag, port, and source chips, composed from
> sub-components. Display-only.

## Reach for it when
An IP address appears on screen — attack sources, request origins, node and
host details, allow/deny lists. **Never render an IP as raw mono text** —
`IpAddress` brings truncation + a full-value tooltip (IPv6 survives narrow
cells), and the flag/source chips are locked recipes.

## Composition
- Everything sits inside the `Ip` row wrapper. `IpAddress` is the core; the
  flag (`IpCountry`), port, and provider are optional slots.
- **Order is strict: flag → address → :port → provider.**
- The port is passed with its colon: `<IpPort>:8080</IpPort>`.
- Source labels come from the exported `sourceLabels` map (datacenters: AWS,
  Azure…; proxy types: Tor, VPN, DC…) — canonical short labels, never invent
  your own.
- **Multiple IPs → always `IpList`, never a hand-rolled map()**. Entries are
  full `Ip` rows — flag/port/provider render on the visible rows and inside
  the overflow popover alike:
  - `vertical` (default, the documented pattern) — first address + a
    "+N addresses" link opening the rest in a popover. The table-cell form.
  - `horizontal` — fits what the width allows, collapses the tail into a "+N"
    badge popover. For wide single-row surfaces.

## Don't use it for
- **Entering an IP** (form) → `Input` / `FilterInput`. This is read-only.
- **Clickable chips** — family rule: rows/cells/menu items own clicks. The
  "+N" overflow affordances are the component's own — keep them.

## Locked — don't override
- **Source chips are uniformly neutral** (slate secondary) — source type is
  metadata, not a threat verdict: Tor and "Malicious IPs" are NOT red. Threat
  severity lives elsewhere in the row.
- Truncation + tooltip on the address is built-in — don't wrap addresses or
  re-implement overflow.
- Empty `IpList` renders nothing — no empty-state handling needed.

## Standalone source type
`IpProvider` is the dedicated chip for a datacenter / proxy-type value — like
`HttpMethod` is for verbs. When a source type appears outside an Ip row (a
"Source type" column), use it (with `sourceLabels`) rather than a raw Badge.

## Pairs with
- `Country` — `IpCountry` is its flag-only small form.
- `Table` cells (vertical IpList); detail panels and headers (horizontal).
- The domain-chip family — same "dedicated component first" rule.

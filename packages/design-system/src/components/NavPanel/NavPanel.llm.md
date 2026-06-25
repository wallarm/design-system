# NavPanel — usage

> The **inner sidebar** that `RemoteShell` renders for a product's second-level nav (an `<aside>`, resizable). You normally **don't build this by hand** — you author a `RemoteShell` `NavConfig` and it composes the panel for you. These exported parts are the **escape hatch** for a custom sidebar the config can't express.

## Reach for it when
You're composing a **custom** product sidebar that `RemoteShell`'s `NavConfig` can't model. **The default path is the config** — see [`RemoteShell`](../RemoteShell/RemoteShell.llm.md) for *how to form the inner nav* (link / section-header / divider / group / drill, the two separators, nesting depth). Reach for these parts directly only when you've genuinely outgrown the config.

## Don't use it for
- **Standard inner nav** → author a `RemoteShell` `NavConfig`; don't hand-assemble parts for the normal case.
- **The global product rail** (first level) → `NavRail`, in `AppShellRail`. NavPanel is the *second* level.
- **A free-floating sidebar outside a product** → it's the panel region of `RemoteShell`, not a standalone layout primitive.

## Composition — the parts (only when hand-building)
- **`NavPanelHeader`** — the product label at the top.
- **`NavPanelItem`** — a nav link (icon optional); active vs inactive states are automatic.
- **`NavPanelSectionHeader`** — a non-interactive **group heading** (the header-as-separator).
- **`NavPanelDivider`** — a plain **line separator**.
- **`NavPanelGroup`** (+ `NavPanelGroupLabel` / `NavPanelGroupContent` / `NavPanelGroupItem`) — a **collapsible** cluster; children indent with a connector line.
- **`NavPanelBack`** — the "← Back" drill-up affordance.
- **`NavPanelSkeleton`** — the loading placeholder.

The line-vs-header-vs-group/drill **decision** lives in `RemoteShell`'s "how to form the inner nav" — follow it, don't restate it.

## Locked — don't override
- **It's an `<aside>`** (the panel region of `RemoteShell`), **`resizable`** by dragging the right edge (default ~216px). Don't set arbitrary widths or re-place it.
- **The look + item states are fixed** — active / inactive, depth indentation, and the group connector line are all automatic; don't restyle them.

## Pairs with
- `RemoteShell` — the orchestrator that renders this from a `NavConfig` (the default path, and the home of the formation guide).
- `NavRail` — the first-level rail beside it; it hands keyboard focus into this panel (ArrowRight).

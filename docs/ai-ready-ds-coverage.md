# AI Usage Docs — Coverage Tracker

> Who's writing which `<Component>.llm.md`, and what's done. Tiering comes from the [strategy §8](./ai-ready-ds-strategy.md#8-which-components-and-in-what-order-tiering); the how-to is in the [authoring guide](./ai-ready-ds-authoring-guide.md).
>
> **Last updated:** 2026-06-12

## How to use this
1. Pick a **Deep**-tier row with no **Assignee** and put your name in it.
2. Start a fresh chat, run `/describe-component <Name>`, and work through the skill.
3. When the file is saved, set **Status** to ✅ and drop the **Doc** link in.

**Status:** ✅ Done · 🟡 Partial / in progress · ☐ To do · ➖ N/A (not a documentable component)

## Snapshot
- **Deep tier:** 2 done, 1 partial, 15 to do (+ 1 folded). ← the active batch
- **Light tier:** 40, parked pending the "short note vs. skip" decision ([§13.4](./ai-ready-ds-strategy.md#13-decisions-to-confirm-together)).
- **Skip:** 20 (providers, layout/leaf primitives, internal plumbing).

## Tracker

| Component | Tier | Status | Assignee | Doc | Notes |
|---|---|---|---|---|---|
| HttpMethod | Deep | ✅ Done | — | [.llm.md](../packages/design-system/src/components/HttpMethod/HttpMethod.llm.md) | Reference example |
| Selection | Deep | ✅ Done | — | [.llm.md](../packages/design-system/src/components/Selection/Selection.llm.md) | Covers the `SelectionBulkBar` pattern |
| Table | Deep | 🟡 Partial | — | [.llm.md](../packages/design-system/src/components/Table/Table.llm.md) | Action bar only; columns/sort/density/scroll still TODO. Added to deep tier (not in original §8) |
| BulkBar | Deep | ➖ Folded | — | — | Internal plumbing — guidance lives in **Selection** + **Table** |
| AppShell | Deep | ☐ To do | — | — | |
| Attribute | Deep | ☐ To do | — | — | |
| Banner | Deep | ☐ To do | — | — | |
| Country | Deep | ☐ To do | — | — | |
| FilterInput | Deep | ☐ To do | — | — | |
| Ip | Deep | ☐ To do | — | — | |
| NavPanel | Deep | ☐ To do | — | — | |
| NavRail | Deep | ☐ To do | — | — | |
| ParameterPath | Deep | ☐ To do | — | — | |
| RemoteShell | Deep | ☐ To do | — | — | |
| ResponseCode | Deep | ☐ To do | — | — | |
| SimpleCharts | Deep | ☐ To do | — | — | |
| SplitButton | Deep | ☐ To do | — | — | |
| TopHeader | Deep | ☐ To do | — | — | |
| Tour | Deep | ☐ To do | — | — | |
| Accordion | Light | ☐ To do | — | — | |
| Alert | Light | ☐ To do | — | — | |
| Badge | Light | ☐ To do | — | — | |
| Breadcrumbs | Light | ☐ To do | — | — | |
| Button | Light | ☐ To do | — | — | |
| Calendar | Light | ☐ To do | — | — | |
| Card | Light | ☐ To do | — | — | |
| Checkbox | Light | ☐ To do | — | — | |
| Code | Light | ☐ To do | — | — | |
| CodeSnippet | Light | ☐ To do | — | — | |
| DateInput | Light | ☐ To do | — | — | |
| DateRangeInput | Light | ☐ To do | — | — | |
| Dialog | Light | ☐ To do | — | — | |
| Drawer | Light | ☐ To do | — | — | |
| DropdownMenu | Light | ☐ To do | — | — | |
| Field | Light | ☐ To do | — | — | |
| Input | Light | ☐ To do | — | — | |
| InputGroup | Light | ☐ To do | — | — | |
| InputOTP | Light | ☐ To do | — | — | |
| Link | Light | ☐ To do | — | — | |
| NumberInput | Light | ☐ To do | — | — | |
| NumericBadge | Light | ☐ To do | — | — | |
| OverflowList | Light | ☐ To do | — | — | |
| OverflowTooltip | Light | ☐ To do | — | — | |
| Popover | Light | ☐ To do | — | — | |
| Progress | Light | ☐ To do | — | — | |
| Radio | Light | ☐ To do | — | — | |
| SegmentedControl | Light | ☐ To do | — | — | |
| SegmentedTabs | Light | ☐ To do | — | — | |
| Select | Light | ☐ To do | — | — | |
| Stack | Light | ☐ To do | — | — | Layout → defer to foundations |
| Flex | Light | ☐ To do | — | — | Layout → defer to foundations |
| Switch | Light | ☐ To do | — | — | |
| Tabs | Light | ☐ To do | — | — | |
| Tag | Light | ☐ To do | — | — | |
| Textarea | Light | ☐ To do | — | — | |
| TimeInput | Light | ☐ To do | — | — | |
| Toast | Light | ☐ To do | — | — | |
| ToggleButton | Light | ☐ To do | — | — | |
| Tooltip | Light | ☐ To do | — | — | |
| AnimatedBackground | Skip | ➖ N/A | — | — | Decorative |
| ButtonBase | Skip | ➖ N/A | — | — | Internal base for Button |
| Checkmark | Skip | ➖ N/A | — | — | Leaf primitive |
| DateFormatProvider | Skip | ➖ N/A | — | — | Provider |
| FormatDateTime | Skip | ➖ N/A | — | — | Display utility |
| Heading | Skip | ➖ N/A | — | — | Typography → foundations |
| Kbd | Skip | ➖ N/A | — | — | Leaf primitive |
| Loader | Skip | ➖ N/A | — | — | Leaf primitive |
| Logo | Skip | ➖ N/A | — | — | Leaf primitive |
| Overlay | Skip | ➖ N/A | — | — | Primitive behind modals/popovers |
| Page | Skip | ➖ N/A | — | — | Layout shell → foundations |
| Polymorphic | Skip | ➖ N/A | — | — | Render utility |
| ScrollArea | Skip | ➖ N/A | — | — | Utility primitive |
| Separator | Skip | ➖ N/A | — | — | Leaf primitive |
| Skeleton | Skip | ➖ N/A | — | — | Leaf primitive |
| SplashScreen | Skip | ➖ N/A | — | — | Full-screen state |
| TemporalCore | Skip | ➖ N/A | — | — | Date/time engine |
| Text | Skip | ➖ N/A | — | — | Typography → foundations |
| ThemeProvider | Skip | ➖ N/A | — | — | Provider |
| UtilityPage | Skip | ➖ N/A | — | — | Layout shell → foundations |

## Tiering notes
- **BulkBar isn't an importable component** — it's a shared surface + summary row composed by `SelectionBulkBar` (page/drawer) and `Table`'s action bar. Its `.llm.md` guidance therefore lives in **Selection** and **Table**, not a standalone file.
- **Table** wasn't in the original §8 deep list; it earned a (partial) sheet via the bulk-bar work and is worth a full pass later.
- **Light vs. Skip is provisional** — both depend on the §13.4 decision (write short notes for Light, or skip for now). Skip rows are providers, layout/typography primitives that defer to the foundations layer, and internal plumbing.

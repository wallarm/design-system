# AI Usage Docs — Coverage Tracker

> Who's writing which `<Component>.llm.md`, and what's done. Tiering comes from the [strategy §8](./ai-ready-ds-strategy.md#8-which-components-and-in-what-order-tiering); the how-to is in the [authoring guide](./ai-ready-ds-authoring-guide.md).
>
> **Last updated:** 2026-06-18

## How to use this
1. Pick a **Deep**-tier row with no **Assignee** and put your name in it.
2. Start a fresh chat, run `/describe-component <Name>`, and work through the skill.
3. When the file is saved, set **Status** to ✅ and drop the **Doc** link in.
4. Spotted a rule that generalizes beyond the component (density, color, interaction ownership…)? Park it in the [design-judgment backlog](./ai-ready-ds-judgment-backlog.md) — it seeds the foundations layer.

**Status:** ✅ Done · 🟡 Partial / in progress · ☐ To do · ➖ N/A (not a documentable component)

## Snapshot
- **Deep tier:** 9 done, 1 partial, 8 to do (+ 1 folded). ← the active batch
- **Light tier:** 10 done (Badge + Tag + NumericBadge chip-trio + Toast + Alert + Dialog + Button + ToggleButton + DropdownMenu + Link), 30 parked pending the "short note vs. skip" decision ([§13.4](./ai-ready-ds-strategy.md#13-decisions-to-confirm-together)). Button + ToggleButton + DropdownMenu + Link got the full router treatment as Actions-family members, not Light notes. **Actions family now complete** (Button / SplitButton / ToggleButton / Link + DropdownMenu; `Select`'s `SelectButton` lands with Select).
- **Skip:** 20 (providers, layout/leaf primitives, internal plumbing).

## Tracker

| Component | Tier | Status | Assignee | Doc | Notes |
|---|---|---|---|---|---|
| HttpMethod | Deep | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/HttpMethod/HttpMethod.llm.md) | Reference example · revised 2026-06-12 with family rules (casing trap, text-only rendition, click parents) |
| Selection | Deep | ✅ Done | — | [.llm.md](../packages/design-system/src/components/Selection/Selection.llm.md) | Covers the `SelectionBulkBar` pattern |
| Table | Deep | 🟡 Partial | — | [.llm.md](../packages/design-system/src/components/Table/Table.llm.md) | Action bar only; columns/sort/density/scroll still TODO. Added to deep tier (not in original §8) |
| BulkBar | Deep | ➖ Folded | — | — | Internal plumbing — guidance lives in **Selection** + **Table** |
| AppShell | Deep | ☐ To do | — | — | |
| Attribute | Deep | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/Attribute/Attribute.llm.md) | Object-metadata grid; read-only host for value-slot display components; `AttributeActions` for the click; flags Figma inline-edit + error state as not-yet-shipped |
| Banner | Deep | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/Banner/Banner.llm.md) | Page-top full-width system/account-wide notice; "still relevant on another page?" test splits Banner vs Alert; primary dark / secondary light, no success; one action pattern; institutional voice. Closes the messaging family (Toast/Alert/Banner; Dialog pending) |
| Country | Deep | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/Country/Country.llm.md) | First compound in the family; sanctions flag-only / name-only forms |
| FilterInput | Deep | ☐ To do | — | — | |
| Ip | Deep | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/Ip/Ip.llm.md) | Richest compound yet: slot order, IpList overflow, neutral source chips, standalone IpProvider |
| NavPanel | Deep | ☐ To do | — | — | |
| NavRail | Deep | ☐ To do | — | — | |
| ParameterPath | Deep | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/ParameterPath/ParameterPath.llm.md) | Not-for-URL-routes boundary; built-in copy→filter + truncation locks |
| RemoteShell | Deep | ☐ To do | — | — | |
| ResponseCode | Deep | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/ResponseCode/ResponseCode.llm.md) | Sibling of HttpMethod; adds mask + text-only-rendition guidance |
| SimpleCharts | Deep | ☐ To do | — | — | |
| SplitButton | Deep | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/SplitButton/SplitButton.llm.md) | Actions-family sibling of Button; thin grouping **wrapper with no styling props** — variant/color/size live on the two child Buttons, both on one matrix cell; fused look automatic; chevron = `DropdownMenuTrigger asChild`, menu **composed not owned**; left = common action + menu of *variations*. Figma node 8485:8977 (Notes frame empty). Seeded judgment-backlog "grouping-wrapper discipline" row |
| TopHeader | Deep | ☐ To do | — | — | |
| Tour | Deep | ☐ To do | — | — | |
| Accordion | Light | ☐ To do | — | — | |
| Alert | Light | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/Alert/Alert.llm.md) | Inline/in-context messaging (in Drawer/Dialog/under header); messaging-ladder boundary vs Toast/Banner/Dialog/Field; locked semantic color+icon, secondary/small button recipe; actions top/bottom by width; 3 TBDs (loading/stepper/promo) |
| Badge | Light | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/Badge/Badge.llm.md) | Base of the domain-chip family → got the full router treatment, not a Light note |
| Breadcrumbs | Light | ☐ To do | — | — | |
| Button | Light | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/Button/Button.llm.md) | Workhorse anchor of the Actions family → full router file (Button vs `Link`/`ToggleButton`/`SplitButton`/`Select`'s `SelectButton`). Locked **partial color×variant matrix**; two-axis **emphasis(`variant`)×intent(`color`)** model + one-primary-per-view; Save=`primary`/`brand`, Cancel=`ghost`/`neutral`; `neutral-alt` for dark surfaces (Toast). Figma node 36:2304 |
| Calendar | Light | ☐ To do | — | — | |
| Card | Light | ☐ To do | — | — | |
| Checkbox | Light | ☐ To do | — | — | |
| Code | Light | ☐ To do | — | — | |
| CodeSnippet | Light | ☐ To do | — | — | |
| DateInput | Light | ☐ To do | — | — | |
| DateRangeInput | Light | ☐ To do | — | — | |
| Dialog | Light | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/Dialog/Dialog.llm.md) | Reframed (Artem): a **layout** component, not messaging — centered modal twin of Drawer (wraps it, minus resize). Owns the overlay/layout ladder (Dialog→Drawer→page); destructive recipe; sizes 400/560/960. Export gotcha: not in root barrel, reachable via `/Dialog` subpath |
| Drawer | Light | ☐ To do | — | — | |
| DropdownMenu | Light | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/DropdownMenu/DropdownMenu.llm.md) | Actions-family; **trigger-agnostic** menu of commands (button / icon / right-click `DropdownMenuContextTrigger` / `anchorPoint`); boundary vs `Select` (form-field value) — but a menu *may* nest a value-pick (radio-group / submenu, e.g. Language); custom UI → `Popover`→`Dialog`/`Drawer`. Item intent = `variant` (destructive/brand), `onSelect` not onClick; portal/position/scroll automatic; **no size system (design-TBD)**; checkbox items stay open. 18 parts (Ark UI). Figma 267:5551 (Notes = design TODOs). Extended overlay-ladder backlog row |
| Field | Light | ☐ To do | — | — | |
| Input | Light | ☐ To do | — | — | |
| InputGroup | Light | ☐ To do | — | — | |
| InputOTP | Light | ☐ To do | — | — | |
| Link | Light | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/Link/Link.llm.md) | Actions-family **navigation** member (closes the family). Element-by-behavior boundary (navigates → Link; acts / no-`href` → Button; link-as-button → `Button asChild`); 4 semantic `type`s incl. niche `table` (master-cell title link, navigates to object); underline on hover only (color-only-at-rest = conscious WCAG 1.4.1 trade-off, parked); icons as children (trailing = affordance, leading = identifies destination); **no `newTab` prop** (native `target`+`rel`+icon+a11y name); size + weight match surrounding text. Workflow-assisted (enrich + draft + 5-lens verify). Figma 923:5271 |
| NumberInput | Light | ☐ To do | — | — | |
| NumericBadge | Light | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/NumericBadge/NumericBadge.llm.md) | Counts chip; type = surface-driven (taste), 99+ cap, show-0 default, never clickable |
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
| Tag | Light | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/Tag/Tag.llm.md) | The interactive chip; routes Tag vs SelectButtonTag vs FilterInput; Selectable = TBD |
| Textarea | Light | ☐ To do | — | — | |
| TimeInput | Light | ☐ To do | — | — | |
| Toast | Light | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/Toast/Toast.llm.md) | Imperative `useToast`/`toaster` + one `Toaster`; boundary vs Dialog/Banner/Field; locked type-color/stacking/auto-dismiss; carries house microcopy → seeded the new [content-guidelines doc](./ai-ready-ds-content-guidelines.md) |
| ToggleButton | Light | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/ToggleButton/ToggleButton.llm.md) | Actions-family **stateful** sibling of Button — on/off pressed state via `active`+`onToggle` (**not** onClick); smaller matrix `outline`/`ghost` × `brand`/`neutral`; designer default **ghost/neutral** (code defaults outline/brand — flagged as possible code change); a set of toggles = **row of ToggleButtons, not SegmentedControl**; Switch=setting vs ToggleButton=press-to-flip. Figma 295:5732 (Documentation prose; Notes = 2 design TODOs). Flagged **aria-pressed a11y gap** → spawned fix task |
| Tooltip | Light | ☐ To do | — | — | |
| AnimatedBackground | Skip | ➖ N/A | — | — | Decorative |
| ButtonBase | Skip | ➖ N/A | — | — | Internal base for Button |
| Checkmark | Skip | ➖ N/A | — | — | Leaf primitive |
| DateFormatProvider | Skip | ➖ N/A | — | — | Provider |
| FormatDateTime | Skip | ✅ Done | Artem | [.llm.md](../packages/design-system/src/components/FormatDateTime/FormatDateTime.llm.md) | Tier overridden by Artem — date hand-formatting is a top AI-invention zone |
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

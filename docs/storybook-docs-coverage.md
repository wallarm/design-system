# Storybook docs — coverage tracker

> Which component Overview pages have been written to the standard. The how-to is the
> [`storybook-docs` skill](../.claude/skills/storybook-docs/SKILL.md); problems found along
> the way go in [findings](./storybook-docs-findings.md).

> **Last updated:** 2026-08-24

## How to use this

1. Pick a row — 🟡 counts. **Every page goes through the skill**, including the
   ones that already have prose: existing wording gets read against the standard
   and rewritten where it doesn't hold. A 🟡 is not a page you can skip.
2. Start a fresh chat and run `/storybook-docs <Name>`.
3. When the prose is on the page, set **Status** to ✅.
4. Found a real problem in the component? Park it in [findings](./storybook-docs-findings.md) — never fix it here.

**Status:** ✅ Written to the standard · 🟡 Has prose, not yet levelled · ☐ Nothing yet

> ✅ means a person ran the skill on it and judged the result against the budget.
> Nothing else counts — inherited prose has turned out to be over budget, at the
> wrong altitude, and in at least one case simply wrong about what the component does.
> The 🟡 and ☐ split below was derived mechanically from what is in the files, so it
> measures whether prose *exists* — not whether it is any good.

## Snapshot

- **9 written to the standard · 54 with prose to level · 32 untouched**, across 95 story pages.
- Levelling a 🟡 is usually cutting, not filling. Slider reads as a dense developer paragraph about analytics attributes and ref forwarding; Heading runs four paragraphs of type theory. Both are good writing on the wrong page.
- The drift runs upside-down. Niche components arrived documented while the ones everyone opens daily — `Button`, `Input`, `Select`, `Switch`, `Radio`, `Tag`, `Badge`, `Tabs`, `Tooltip` — arrived bare. Prioritise by daily traffic, not by how interesting the component is.
- The **Stories** and **With a sentence** columns are the quickest way to spot a half-done page: equal numbers mean every example is covered.

## Pages

| Status | Page | Stories | With a sentence | Story file |
|---|---|---|---|---|
| ✅ | Actions/Button | 10 | 10 | `src/components/Button/Button.stories.tsx` |
| ✅ | Actions/DropdownMenu | 9 | 9 | `src/components/DropdownMenu/DropdownMenu.stories.tsx` |
| ✅ | Actions/SplitButton | 5 | 5 | `src/components/SplitButton/SplitButton.stories.tsx` |
| ✅ | Actions/ToggleButton | 8 | 8 | `src/components/ToggleButton/ToggleButton.stories.tsx` |
| 🟡 | Brand/Logo | 4 | 0 | `src/components/Logo/Logo.stories.tsx` |
| 🟡 | Brand/WallyIcon | 3 | 0 | `src/components/WallyIcon/WallyIcon.stories.tsx` |
| 🟡 | Data Display/Accordion | 8 | 0 | `src/components/Accordion/Accordion.stories.tsx` |
| 🟡 | Data Display/Attribute | 19 | 2 | `src/components/Attribute/Attribute.stories.tsx` |
| 🟡 | Data Display/Card | 3 | 0 | `src/components/Card/Card.stories.tsx` |
| 🟡 | Data Display/CodeSnippet/InlineCodeSnippet | 4 | 3 | `src/components/CodeSnippet/InlineCodeSnippet.stories.tsx` |
| ☐ | Data Display/Country | 5 | 0 | `src/components/Country/Country.stories.tsx` |
| ☐ | Data Display/FormatDateTime | 7 | 0 | `src/components/FormatDateTime/FormatDateTime.stories.tsx` |
| ☐ | Data Display/FormatNumber | 8 | 0 | `src/components/FormatNumber/FormatNumber.stories.tsx` |
| ☐ | Data Display/HttpMethod | 4 | 0 | `src/components/HttpMethod/HttpMethod.stories.tsx` |
| ☐ | Data Display/Ip | 3 | 0 | `src/components/Ip/Ip.stories.tsx` |
| 🟡 | Data Display/List | 5 | 0 | `src/components/List/List.stories.tsx` |
| 🟡 | Data Display/OverflowList | 5 | 6 | `src/components/OverflowList/OverflowList.stories.tsx` |
| ☐ | Data Display/ParameterPath | 11 | 0 | `src/components/ParameterPath/ParameterPath.stories.tsx` |
| 🟡 | Data Display/PasswordComplexity | 4 | 0 | `src/components/PasswordComplexity/PasswordComplexity.stories.tsx` |
| ☐ | Data Display/ResponseCode | 6 | 0 | `src/components/ResponseCode/ResponseCode.stories.tsx` |
| 🟡 | Data Display/Table | 33 | 3 | `src/components/Table/Table.stories.tsx` |
| 🟡 | Data Display/Timeline | 3 | 0 | `src/components/Timeline/Timeline.stories.tsx` |
| 🟡 | Data display/CodeSnippet/CodeSnippet | 25 | 26 | `src/components/CodeSnippet/CodeSnippet.stories.tsx` |
| 🟡 | Data display/SimpleCharts/BarList | 13 | 0 | `src/components/SimpleCharts/BarList/BarList.stories.tsx` |
| 🟡 | Data display/SimpleCharts/Chart | 6 | 0 | `src/components/SimpleCharts/Chart/Chart.stories.tsx` |
| 🟡 | Data display/SimpleCharts/HorizontalBarStack | 8 | 2 | `src/components/SimpleCharts/HorizontalBarStack/HorizontalBarStack.stories.tsx` |
| 🟡 | Data display/SimpleCharts/LineChart | 15 | 1 | `src/components/SimpleCharts/LineChart/LineChart.stories.tsx` |
| 🟡 | Data display/SimpleCharts/Metric | 2 | 3 | `src/components/SimpleCharts/Metric/Metric.stories.tsx` |
| 🟡 | Data display/SimpleCharts/Overview | 1 | 0 | `src/components/SimpleCharts/Overview/Overview.stories.tsx` |
| 🟡 | Data display/SimpleCharts/PieChart | 12 | 0 | `src/components/SimpleCharts/PieChart/PieChart.stories.tsx` |
| 🟡 | Inputs Date/Calendar | 16 | 7 | `src/components/Calendar/Calendar.stories.tsx` |
| 🟡 | Inputs Date/DateInput | 10 | 3 | `src/components/DateInput/DateInput.stories.tsx` |
| 🟡 | Inputs Date/DateRangeInput | 9 | 3 | `src/components/DateRangeInput/DateRangeInput.stories.tsx` |
| 🟡 | Inputs Date/TimeInput | 8 | 2 | `src/components/TimeInput/TimeInput.stories.tsx` |
| ✅ | Inputs/Checkbox | 8 | 8 | `src/components/Checkbox/Checkbox.stories.tsx` |
| ☐ | Inputs/Field | 9 | 0 | `src/components/Field/Field.stories.tsx` |
| 🟡 | Inputs/InlineEdit | 14 | 11 | `src/components/InlineEdit/InlineEdit.stories.tsx` |
| ✅ | Inputs/Input | 6 | 6 | `src/components/Input/Input.stories.tsx` |
| ☐ | Inputs/InputGroup | 8 | 0 | `src/components/InputGroup/InputGroup.stories.tsx` |
| ☐ | Inputs/NumberInput | 5 | 0 | `src/components/NumberInput/NumberInput.stories.tsx` |
| ☐ | Inputs/OTPInput | 6 | 0 | `src/components/InputOTP/OTPInput.stories.tsx` |
| ☐ | Inputs/PasswordInput | 6 | 0 | `src/components/PasswordInput/PasswordInput.stories.tsx` |
| ✅ | Inputs/Radio | 3 | 3 | `src/components/Radio/Radio.stories.tsx` |
| 🟡 | Inputs/SegmentedControl | 10 | 0 | `src/components/SegmentedControl/SegmentedControl.stories.tsx` |
| ☐ | Inputs/Select | 15 | 0 | `src/components/Select/Select.stories.tsx` |
| 🟡 | Inputs/Slider | 14 | 14 | `src/components/Slider/Slider.stories.tsx` |
| ✅ | Inputs/Switch | 6 | 6 | `src/components/Switch/Switch.stories.tsx` |
| ✅ | Inputs/Textarea | 8 | 8 | `src/components/Textarea/Textarea.stories.tsx` |
| 🟡 | Layout/AnimatedBackground | 4 | 0 | `src/components/AnimatedBackground/AnimatedBackground.stories.tsx` |
| ☐ | Layout/Flex | 5 | 0 | `src/components/Flex/Flex.stories.tsx` |
| 🟡 | Layout/Page | 2 | 0 | `src/components/Page/Page.stories.tsx` |
| ☐ | Layout/ScrollArea | 2 | 0 | `src/components/ScrollArea/ScrollArea.stories.tsx` |
| ☐ | Layout/Stack | 6 | 0 | `src/components/Stack/Stack.stories.tsx` |
| ☐ | Loading/Loader | 5 | 0 | `src/components/Loader/Loader.stories.tsx` |
| ☐ | Loading/Progress | 5 | 0 | `src/components/Progress/Progress.stories.tsx` |
| 🟡 | Loading/Skeleton | 4 | 0 | `src/components/Skeleton/Skeleton.stories.tsx` |
| ☐ | Loading/SplashScreen | 3 | 0 | `src/components/SplashScreen/SplashScreen.stories.tsx` |
| 🟡 | Messaging/Alert | 8 | 0 | `src/components/Alert/Alert.stories.tsx` |
| 🟡 | Messaging/Banner | 8 | 4 | `src/components/Banner/Banner.stories.tsx` |
| 🟡 | Messaging/Toast | 8 | 1 | `src/components/Toast/Toast.stories.tsx` |
| 🟡 | Navigation/AppShell | 3 | 0 | `src/components/AppShell/AppShell.stories.tsx` |
| 🟡 | Navigation/Breadcrumbs | 7 | 0 | `src/components/Breadcrumbs/Breadcrumbs.stories.tsx` |
| ☐ | Navigation/Link | 5 | 0 | `src/components/Link/Link.stories.tsx` |
| ☐ | Navigation/Pagination | 9 | 0 | `src/components/Pagination/Pagination.stories.tsx` |
| 🟡 | Navigation/SegmentedTabs | 9 | 0 | `src/components/SegmentedTabs/SegmentedTabs.stories.tsx` |
| ☐ | Navigation/Tabs | 11 | 0 | `src/components/Tabs/Tabs.stories.tsx` |
| 🟡 | Navigation/Tree | 6 | 0 | `src/components/Tree/Tree.stories.tsx` |
| 🟡 | Navigation/TreeView | 8 | 3 | `src/components/TreeView/TreeView.stories.tsx` |
| 🟡 | Overlay/Dialog | 17 | 18 | `src/components/Dialog/Dialog.stories.tsx` |
| 🟡 | Overlay/Drawer | 16 | 17 | `src/components/Drawer/Drawer.stories.tsx` |
| ☐ | Overlay/FeedbackPulse | 2 | 0 | `src/components/FeedbackPulse/FeedbackPulse.stories.tsx` |
| 🟡 | Overlay/OverflowTooltip | 7 | 0 | `src/components/OverflowTooltip/OverflowTooltip.stories.tsx` |
| ☐ | Overlay/Popover | 4 | 0 | `src/components/Popover/Popover.stories.tsx` |
| ☐ | Overlay/Tooltip | 4 | 0 | `src/components/Tooltip/Tooltip.stories.tsx` |
| 🟡 | Overlay/Tour | 5 | 0 | `src/components/Tour/Tour.stories.tsx` |
| 🟡 | Pages/EmptyState | 4 | 0 | `src/components/EmptyState/EmptyState.stories.tsx` |
| 🟡 | Pages/UtilityPage | 4 | 0 | `src/components/UtilityPage/UtilityPage.stories.tsx` |
| 🟡 | Patterns/FilterInput/Composition | 4 | 4 | `src/components/FilterInput/stories/FilterInputComposition.stories.tsx` |
| 🟡 | Patterns/FilterInput/FilterInput | 17 | 17 | `src/components/FilterInput/stories/FilterInput.stories.tsx` |
| 🟡 | Patterns/FilterInput/FilterInputChip | 21 | 21 | `src/components/FilterInput/stories/FilterInputChip.stories.tsx` |
| 🟡 | Patterns/FilterInput/FilterInputFieldMenu | 11 | 11 | `src/components/FilterInput/stories/FilterInputFieldMenu.stories.tsx` |
| 🟡 | Patterns/FilterInput/FilterInputOperatorMenu | 8 | 8 | `src/components/FilterInput/stories/FilterInputOperatorMenu.stories.tsx` |
| 🟡 | Primitives/Icons | 3 | 1 | `src/icons/module/Icons.stories.tsx` |
| ☐ | Primitives/Kbd | 4 | 0 | `src/components/Kbd/Kbd.stories.tsx` |
| ☐ | Primitives/Overlay | 1 | 0 | `src/components/Overlay/Overlay.stories.tsx` |
| ☐ | Primitives/Separator | 1 | 0 | `src/components/Separator/Separator.stories.tsx` |
| 🟡 | Production cluster | 10 | 0 | `src/components/Selection/Selection.stories.tsx` |
| ☐ | Status Indication/Badge | 11 | 0 | `src/components/Badge/Badge.stories.tsx` |
| ☐ | Status Indication/Indicator | 2 | 0 | `src/components/Indicator/Indicator.stories.tsx` |
| ☐ | Status Indication/NumericBadge | 3 | 0 | `src/components/NumericBadge/NumericBadge.stories.tsx` |
| ☐ | Status Indication/Tag | 7 | 0 | `src/components/Tag/Tag.stories.tsx` |
| 🟡 | Typography/Code | 7 | 1 | `src/components/Code/Code.stories.tsx` |
| 🟡 | Typography/Heading | 7 | 1 | `src/components/Heading/Heading.stories.tsx` |
| 🟡 | Typography/Pixel | 2 | 0 | `src/theme/Pixel.stories.tsx` |
| 🟡 | Typography/Text | 5 | 1 | `src/components/Text/Text.stories.tsx` |

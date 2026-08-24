# Storybook docs — coverage tracker

> Which component Overview pages have been written to the standard. The how-to is the
> [`storybook-docs` skill](../.claude/skills/storybook-docs/SKILL.md); problems found along
> the way go in [findings](./storybook-docs-findings.md).

> **Last updated:** 2026-08-24, against main at v1.5.0.

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
> The counts are regenerated from the files, so they follow main rather than drifting, and
> they count only a sentence sitting directly above a story.

## Snapshot

- **37 written to the standard · 39 with prose to level · 19 untouched**, across 95 story pages.
- **Complete folders:** Actions, Inputs, Inputs Date, Typography, Overlay, Status Indication.
- Levelling a 🟡 is usually cutting, not filling — and sometimes correcting: `Slider` claimed behaviour its own code contradicted, and `Dialog` claimed a position it does not have.
- On a ✅ row the two count columns match. Where they do not, the page is not finished.

## Pages
| Status | Page | Stories | With a sentence | Story file |
|---|---|---|---|---|
| ✅ | Actions/Button | 10 | 10 | `components/Button/Button.stories.tsx` |
| ✅ | Actions/DropdownMenu | 9 | 9 | `components/DropdownMenu/DropdownMenu.stories.tsx` |
| ✅ | Actions/SplitButton | 5 | 5 | `components/SplitButton/SplitButton.stories.tsx` |
| ✅ | Actions/ToggleButton | 8 | 8 | `components/ToggleButton/ToggleButton.stories.tsx` |
| 🟡 | Brand/Logo | 4 | 0 | `components/Logo/Logo.stories.tsx` |
| 🟡 | Brand/WallyIcon | 3 | 0 | `components/WallyIcon/WallyIcon.stories.tsx` |
| 🟡 | Data Display/Accordion | 8 | 0 | `components/Accordion/Accordion.stories.tsx` |
| 🟡 | Data Display/Attribute | 19 | 2 | `components/Attribute/Attribute.stories.tsx` |
| 🟡 | Data Display/Card | 3 | 0 | `components/Card/Card.stories.tsx` |
| 🟡 | Data Display/CodeSnippet/InlineCodeSnippet | 4 | 3 | `components/CodeSnippet/InlineCodeSnippet.stories.tsx` |
| ☐ | Data Display/Country | 5 | 0 | `components/Country/Country.stories.tsx` |
| ☐ | Data Display/FormatDateTime | 7 | 0 | `components/FormatDateTime/FormatDateTime.stories.tsx` |
| ☐ | Data Display/FormatNumber | 9 | 0 | `components/FormatNumber/FormatNumber.stories.tsx` |
| ☐ | Data Display/HttpMethod | 4 | 0 | `components/HttpMethod/HttpMethod.stories.tsx` |
| ☐ | Data Display/Ip | 3 | 0 | `components/Ip/Ip.stories.tsx` |
| 🟡 | Data Display/List | 5 | 0 | `components/List/List.stories.tsx` |
| 🟡 | Data Display/OverflowList | 5 | 5 | `components/OverflowList/OverflowList.stories.tsx` |
| ☐ | Data Display/ParameterPath | 11 | 0 | `components/ParameterPath/ParameterPath.stories.tsx` |
| 🟡 | Data Display/PasswordComplexity | 4 | 0 | `components/PasswordComplexity/PasswordComplexity.stories.tsx` |
| ☐ | Data Display/ResponseCode | 6 | 0 | `components/ResponseCode/ResponseCode.stories.tsx` |
| 🟡 | Data Display/Table | 33 | 3 | `components/Table/Table.stories.tsx` |
| 🟡 | Data Display/Timeline | 3 | 0 | `components/Timeline/Timeline.stories.tsx` |
| 🟡 | Data display/CodeSnippet/CodeSnippet | 25 | 25 | `components/CodeSnippet/CodeSnippet.stories.tsx` |
| 🟡 | Data display/SimpleCharts/BarList | 13 | 0 | `components/SimpleCharts/BarList/BarList.stories.tsx` |
| 🟡 | Data display/SimpleCharts/Chart | 6 | 0 | `components/SimpleCharts/Chart/Chart.stories.tsx` |
| 🟡 | Data display/SimpleCharts/HorizontalBarStack | 8 | 2 | `components/SimpleCharts/HorizontalBarStack/HorizontalBarStack.stories.tsx` |
| 🟡 | Data display/SimpleCharts/LineChart | 15 | 1 | `components/SimpleCharts/LineChart/LineChart.stories.tsx` |
| 🟡 | Data display/SimpleCharts/Metric | 2 | 2 | `components/SimpleCharts/Metric/Metric.stories.tsx` |
| 🟡 | Data display/SimpleCharts/Overview | 1 | 0 | `components/SimpleCharts/Overview/Overview.stories.tsx` |
| 🟡 | Data display/SimpleCharts/PieChart | 12 | 0 | `components/SimpleCharts/PieChart/PieChart.stories.tsx` |
| ✅ | Inputs Date/Calendar | 16 | 16 | `components/Calendar/Calendar.stories.tsx` |
| ✅ | Inputs Date/DateInput | 10 | 10 | `components/DateInput/DateInput.stories.tsx` |
| ✅ | Inputs Date/DateRangeInput | 9 | 9 | `components/DateRangeInput/DateRangeInput.stories.tsx` |
| ✅ | Inputs Date/TimeInput | 8 | 8 | `components/TimeInput/TimeInput.stories.tsx` |
| ✅ | Inputs/Checkbox | 8 | 8 | `components/Checkbox/Checkbox.stories.tsx` |
| ✅ | Inputs/Field | 9 | 9 | `components/Field/Field.stories.tsx` |
| ✅ | Inputs/InlineEdit | 14 | 14 | `components/InlineEdit/InlineEdit.stories.tsx` |
| ✅ | Inputs/Input | 6 | 6 | `components/Input/Input.stories.tsx` |
| ✅ | Inputs/InputGroup | 8 | 8 | `components/InputGroup/InputGroup.stories.tsx` |
| ✅ | Inputs/NumberInput | 5 | 5 | `components/NumberInput/NumberInput.stories.tsx` |
| ✅ | Inputs/OTPInput | 6 | 6 | `components/InputOTP/OTPInput.stories.tsx` |
| ✅ | Inputs/PasswordInput | 6 | 6 | `components/PasswordInput/PasswordInput.stories.tsx` |
| ✅ | Inputs/Radio | 3 | 3 | `components/Radio/Radio.stories.tsx` |
| ✅ | Inputs/SegmentedControl | 10 | 10 | `components/SegmentedControl/SegmentedControl.stories.tsx` |
| ✅ | Inputs/Select | 15 | 15 | `components/Select/Select.stories.tsx` |
| ✅ | Inputs/Slider | 14 | 14 | `components/Slider/Slider.stories.tsx` |
| ✅ | Inputs/Switch | 6 | 6 | `components/Switch/Switch.stories.tsx` |
| ✅ | Inputs/Textarea | 8 | 8 | `components/Textarea/Textarea.stories.tsx` |
| 🟡 | Layout/AnimatedBackground | 4 | 0 | `components/AnimatedBackground/AnimatedBackground.stories.tsx` |
| ☐ | Layout/Flex | 5 | 0 | `components/Flex/Flex.stories.tsx` |
| 🟡 | Layout/Page | 2 | 0 | `components/Page/Page.stories.tsx` |
| ☐ | Layout/ScrollArea | 2 | 0 | `components/ScrollArea/ScrollArea.stories.tsx` |
| ☐ | Layout/Stack | 6 | 0 | `components/Stack/Stack.stories.tsx` |
| ☐ | Loading/Loader | 5 | 0 | `components/Loader/Loader.stories.tsx` |
| ☐ | Loading/Progress | 5 | 0 | `components/Progress/Progress.stories.tsx` |
| 🟡 | Loading/Skeleton | 4 | 0 | `components/Skeleton/Skeleton.stories.tsx` |
| ☐ | Loading/SplashScreen | 3 | 0 | `components/SplashScreen/SplashScreen.stories.tsx` |
| 🟡 | Messaging/Alert | 8 | 0 | `components/Alert/Alert.stories.tsx` |
| 🟡 | Messaging/Banner | 8 | 4 | `components/Banner/Banner.stories.tsx` |
| 🟡 | Messaging/Toast | 8 | 0 | `components/Toast/Toast.stories.tsx` |
| 🟡 | Navigation/AppShell | 3 | 0 | `components/AppShell/AppShell.stories.tsx` |
| 🟡 | Navigation/Breadcrumbs | 7 | 0 | `components/Breadcrumbs/Breadcrumbs.stories.tsx` |
| ☐ | Navigation/Link | 5 | 0 | `components/Link/Link.stories.tsx` |
| ☐ | Navigation/Pagination | 9 | 0 | `components/Pagination/Pagination.stories.tsx` |
| 🟡 | Navigation/SegmentedTabs | 9 | 0 | `components/SegmentedTabs/SegmentedTabs.stories.tsx` |
| ☐ | Navigation/Tabs | 11 | 0 | `components/Tabs/Tabs.stories.tsx` |
| 🟡 | Navigation/Tree | 6 | 0 | `components/Tree/Tree.stories.tsx` |
| 🟡 | Navigation/TreeView | 8 | 3 | `components/TreeView/TreeView.stories.tsx` |
| ✅ | Overlay/Dialog | 17 | 17 | `components/Dialog/Dialog.stories.tsx` |
| ✅ | Overlay/Drawer | 16 | 16 | `components/Drawer/Drawer.stories.tsx` |
| ✅ | Overlay/FeedbackPulse | 2 | 2 | `components/FeedbackPulse/FeedbackPulse.stories.tsx` |
| ✅ | Overlay/OverflowTooltip | 7 | 7 | `components/OverflowTooltip/OverflowTooltip.stories.tsx` |
| ✅ | Overlay/Popover | 4 | 4 | `components/Popover/Popover.stories.tsx` |
| ✅ | Overlay/Tooltip | 4 | 4 | `components/Tooltip/Tooltip.stories.tsx` |
| ✅ | Overlay/Tour | 5 | 5 | `components/Tour/Tour.stories.tsx` |
| ✅ | Pages/EmptyState | 4 | 4 | `components/EmptyState/EmptyState.stories.tsx` |
| ✅ | Pages/UtilityPage | 4 | 4 | `components/UtilityPage/UtilityPage.stories.tsx` |
| ✅ | Patterns/FilterInput/Composition | 4 | 4 | `components/FilterInput/stories/FilterInputComposition.stories.tsx` |
| ✅ | Patterns/FilterInput/FilterInput | 17 | 17 | `components/FilterInput/stories/FilterInput.stories.tsx` |
| ✅ | Patterns/FilterInput/FilterInputChip | 21 | 21 | `components/FilterInput/stories/FilterInputChip.stories.tsx` |
| ✅ | Patterns/FilterInput/FilterInputFieldMenu | 11 | 11 | `components/FilterInput/stories/FilterInputFieldMenu.stories.tsx` |
| ✅ | Patterns/FilterInput/FilterInputOperatorMenu | 8 | 8 | `components/FilterInput/stories/FilterInputOperatorMenu.stories.tsx` |
| ✅ | Primitives/Icons | 3 | 3 | `icons/module/Icons.stories.tsx` |
| ✅ | Primitives/Kbd | 4 | 4 | `components/Kbd/Kbd.stories.tsx` |
| ✅ | Primitives/Overlay | 1 | 1 | `components/Overlay/Overlay.stories.tsx` |
| ✅ | Primitives/Separator | 1 | 1 | `components/Separator/Separator.stories.tsx` |
| 🟡 | Production cluster | 10 | 0 | `components/Selection/Selection.stories.tsx` |
| ✅ | Status Indication/Badge | 11 | 11 | `components/Badge/Badge.stories.tsx` |
| ✅ | Status Indication/Indicator | 2 | 2 | `components/Indicator/Indicator.stories.tsx` |
| ✅ | Status Indication/NumericBadge | 3 | 3 | `components/NumericBadge/NumericBadge.stories.tsx` |
| ✅ | Status Indication/Tag | 7 | 7 | `components/Tag/Tag.stories.tsx` |
| ✅ | Typography/Code | 7 | 7 | `components/Code/Code.stories.tsx` |
| ✅ | Typography/Heading | 7 | 7 | `components/Heading/Heading.stories.tsx` |
| ✅ | Typography/Pixel | 2 | 2 | `theme/Pixel.stories.tsx` |
| ✅ | Typography/Text | 5 | 5 | `components/Text/Text.stories.tsx` |

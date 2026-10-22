# Storybook docs — coverage tracker

> Which component Overview pages have been written to the standard. The how-to is the
> [`storybook-docs` skill](../.claude/skills/storybook-docs/SKILL.md); problems found along
> the way go in [findings](./storybook-docs-findings.md).

> **Last updated:** 2026-10-22, against main at v3.3.0. **98 of 117 pages are written**; 19 are left (see the ☐ rows).

## How to use this

The first pass is done; the ☐ rows are components that arrived after it. The table is a
**regression check** as much as a queue:

1. A new component arrives with a ☐ row. Run `/storybook-docs <Name>` on it in a
   fresh chat, then set it to ✅.
2. A page whose stories change may need its prose re-read; the two count columns
   drifting apart is the signal.
3. Found a real problem in a component? Park it in [findings](./storybook-docs-findings.md) — never fix it here.

**Status:** ✅ Written to the standard · 🟡 Has prose, not yet levelled · ☐ Nothing yet

> **Story-description shadow — swept 2026-08-24.** A story-level
> `parameters.docs.description.story` silently overrides the JSDoc sentence above
> the story, and the counts below cannot see it. The sweep found twelve shadowed
> sentences (`FilterInputFieldMenu` 6, `Dialog` 2, `Drawer` 2, `InlineEdit` 2);
> all are fixed. The five remaining `story:` params, on the SimpleCharts pages,
> were the only description there rather than a shadow — they are now JSDoc too, so
> **no story file uses the param form any more** and the trap cannot reappear
> silently.
> One story is hidden from its own page on purpose:
> `FeedbackPulse`'s `Rating` carries `tags: ['!autodocs']`, so its sentence is
> written but never rendered on the Overview.

> ✅ means a person ran the skill on it and judged the result against the budget.
> Nothing else counts — inherited prose has turned out to be over budget, at the
> wrong altitude, and in at least one case simply wrong about what the component does.
> The counts are regenerated from the files, so they follow main rather than drifting, and
> they count only a sentence sitting directly above a story.

## Snapshot

- **98 written to the standard · 19 left**, across 117 story pages. `Table` has grown a story without a sentence (`InlineCellEditing`) since it was levelled.
- Levelling was usually cutting, not filling — and often correcting. Five pages
  claimed behaviour their own code contradicted: `Slider`, `Dialog`,
  `CodeSnippet` (its `Sizes` story labelled the wrong default), `BarList`
  (`selected` does not fill the bar) and `Table`'s `LoadingWithData` (it appends
  skeletons, it does not overlay).
- On a ✅ row the two count columns match. Where they do not, the page is not finished.

## Pages
| Status | Page | Stories | With a sentence | Story file |
|---|---|---|---|---|
| ☐ | AI/ApprovalCard | 8 | 8 | `components/ApprovalCard/ApprovalCard.stories.tsx` |
| ☐ | AI/AssistantMessage | 14 | 14 | `components/AssistantMessage/AssistantMessage.stories.tsx` |
| ☐ | AI/ChainOfThought | 12 | 12 | `components/ChainOfThought/ChainOfThought.stories.tsx` |
| ☐ | AI/Chat | 15 | 15 | `components/Chat/Chat.stories.tsx` |
| ☐ | AI/ChatInput | 8 | 8 | `components/ChatInput/ChatInput.stories.tsx` |
| ☐ | AI/WallyAssistant | 8 | 8 | `components/WallyAssistant/WallyAssistant.stories.tsx` |
| ☐ | AI/ChatPermissions | 3 | 3 | `components/ChatPermissions/ChatPermissions.stories.tsx` |
| ☐ | AI/Conversation | 4 | 4 | `components/Conversation/Conversation.stories.tsx` |
| ☐ | AI/MessageActions | 5 | 5 | `components/MessageActions/MessageActions.stories.tsx` |
| ☐ | AI/UserMessage | 5 | 5 | `components/UserMessage/UserMessage.stories.tsx` |
| ✅ | Actions/Button | 10 | 10 | `components/Button/Button.stories.tsx` |
| ✅ | Actions/DropdownMenu | 9 | 9 | `components/DropdownMenu/DropdownMenu.stories.tsx` |
| ✅ | Actions/SplitButton | 5 | 5 | `components/SplitButton/SplitButton.stories.tsx` |
| ✅ | Actions/ToggleButton | 8 | 8 | `components/ToggleButton/ToggleButton.stories.tsx` |
| ✅ | Brand/Logo | 4 | 4 | `components/Logo/Logo.stories.tsx` |
| ✅ | Brand/WallyIcon | 3 | 3 | `components/WallyIcon/WallyIcon.stories.tsx` |
| ✅ | Data Display/Accordion | 8 | 8 | `components/Accordion/Accordion.stories.tsx` |
| ✅ | Data Display/Attribute | 19 | 19 | `components/Attribute/Attribute.stories.tsx` |
| ✅ | Data Display/Avatar | 10 | 10 | `components/Avatar/Avatar.stories.tsx` |
| ✅ | Data Display/Card | 3 | 3 | `components/Card/Card.stories.tsx` |
| ✅ | Data Display/CodeSnippet/InlineCodeSnippet | 4 | 4 | `components/CodeSnippet/InlineCodeSnippet.stories.tsx` |
| ✅ | Data Display/Country | 5 | 5 | `components/Country/Country.stories.tsx` |
| ✅ | Data Display/FormatDateTime | 8 | 8 | `components/FormatDateTime/FormatDateTime.stories.tsx` |
| ✅ | Data Display/FormatNumber | 9 | 9 | `components/FormatNumber/FormatNumber.stories.tsx` |
| ✅ | Data Display/HttpMethod | 4 | 4 | `components/HttpMethod/HttpMethod.stories.tsx` |
| ✅ | Data Display/Ip | 3 | 3 | `components/Ip/Ip.stories.tsx` |
| ✅ | Data Display/List | 5 | 5 | `components/List/List.stories.tsx` |
| ✅ | Data Display/OverflowList | 10 | 10 | `components/OverflowList/OverflowList.stories.tsx` |
| ✅ | Data Display/ParameterPath | 11 | 11 | `components/ParameterPath/ParameterPath.stories.tsx` |
| ✅ | Data Display/PasswordComplexity | 4 | 4 | `components/PasswordComplexity/PasswordComplexity.stories.tsx` |
| ✅ | Data Display/ResponseCode | 6 | 6 | `components/ResponseCode/ResponseCode.stories.tsx` |
| ✅ | Data Display/Selection | 10 | 10 | `components/Selection/Selection.stories.tsx` |
| ✅ | Data Display/Table | 52 | 51 | `components/Table/Table.stories.tsx` |
| ✅ | Data Display/Timeline | 3 | 3 | `components/Timeline/Timeline.stories.tsx` |
| ✅ | Data display/CodeEditor | 32 | 32 | `components/CodeEditor/CodeEditor.stories.tsx` |
| ✅ | Data display/CodeSnippet/CodeSnippet | 26 | 26 | `components/CodeSnippet/CodeSnippet.stories.tsx` |
| ☐ | Data display/SimpleCharts/AreaChart | 7 | 7 | `components/SimpleCharts/AreaChart/AreaChart.stories.tsx` |
| ✅ | Data display/SimpleCharts/BarList | 13 | 13 | `components/SimpleCharts/BarList/BarList.stories.tsx` |
| ✅ | Data display/SimpleCharts/Chart | 6 | 6 | `components/SimpleCharts/Chart/Chart.stories.tsx` |
| ✅ | Data display/SimpleCharts/HorizontalBarStack | 8 | 8 | `components/SimpleCharts/HorizontalBarStack/HorizontalBarStack.stories.tsx` |
| ✅ | Data display/SimpleCharts/LineChart | 15 | 15 | `components/SimpleCharts/LineChart/LineChart.stories.tsx` |
| ✅ | Data display/SimpleCharts/Metric | 2 | 2 | `components/SimpleCharts/Metric/Metric.stories.tsx` |
| ✅ | Data display/SimpleCharts/Overview | 1 | 1 | `components/SimpleCharts/Overview/Overview.stories.tsx` |
| ✅ | Data display/SimpleCharts/PieChart | 12 | 12 | `components/SimpleCharts/PieChart/PieChart.stories.tsx` |
| ✅ | Inputs Date/Calendar | 16 | 16 | `components/Calendar/Calendar.stories.tsx` |
| ✅ | Inputs Date/DateInput | 10 | 10 | `components/DateInput/DateInput.stories.tsx` |
| ✅ | Inputs Date/DateRangeInput | 9 | 9 | `components/DateRangeInput/DateRangeInput.stories.tsx` |
| ✅ | Inputs Date/TimeInput | 8 | 8 | `components/TimeInput/TimeInput.stories.tsx` |
| ✅ | Inputs/Checkbox | 8 | 8 | `components/Checkbox/Checkbox.stories.tsx` |
| ✅ | Inputs/Field | 9 | 9 | `components/Field/Field.stories.tsx` |
| ✅ | Inputs/FileUpload | 13 | 13 | `components/FileUpload/FileUpload.stories.tsx` |
| ✅ | Inputs/InlineEdit | 14 | 14 | `components/InlineEdit/InlineEdit.stories.tsx` |
| ✅ | Inputs/Input | 6 | 6 | `components/Input/Input.stories.tsx` |
| ✅ | Inputs/InputGroup | 8 | 8 | `components/InputGroup/InputGroup.stories.tsx` |
| ✅ | Inputs/NumberInput | 5 | 5 | `components/NumberInput/NumberInput.stories.tsx` |
| ✅ | Inputs/OTPInput | 6 | 6 | `components/InputOTP/OTPInput.stories.tsx` |
| ✅ | Inputs/PasswordInput | 6 | 6 | `components/PasswordInput/PasswordInput.stories.tsx` |
| ✅ | Inputs/Radio | 3 | 3 | `components/Radio/Radio.stories.tsx` |
| ☐ | Inputs/SearchInput | 5 | 5 | `components/SearchInput/SearchInput.stories.tsx` |
| ✅ | Inputs/SegmentedControl | 10 | 10 | `components/SegmentedControl/SegmentedControl.stories.tsx` |
| ✅ | Inputs/Select | 15 | 15 | `components/Select/Select.stories.tsx` |
| ✅ | Inputs/Slider | 14 | 14 | `components/Slider/Slider.stories.tsx` |
| ✅ | Inputs/Switch | 6 | 6 | `components/Switch/Switch.stories.tsx` |
| ✅ | Inputs/Textarea | 8 | 8 | `components/Textarea/Textarea.stories.tsx` |
| ✅ | Layout/AnimatedBackground | 4 | 4 | `components/AnimatedBackground/AnimatedBackground.stories.tsx` |
| ✅ | Layout/Flex | 5 | 5 | `components/Flex/Flex.stories.tsx` |
| ✅ | Layout/Page | 3 | 3 | `components/Page/Page.stories.tsx` |
| ☐ | Layout/Resizable | 8 | 8 | `components/Resizable/Resizable.stories.tsx` |
| ✅ | Layout/ScrollArea | 3 | 3 | `components/ScrollArea/ScrollArea.stories.tsx` |
| ✅ | Layout/Stack | 6 | 6 | `components/Stack/Stack.stories.tsx` |
| ✅ | Loading/Loader | 5 | 5 | `components/Loader/Loader.stories.tsx` |
| ✅ | Loading/Progress | 5 | 5 | `components/Progress/Progress.stories.tsx` |
| ✅ | Loading/Skeleton | 4 | 4 | `components/Skeleton/Skeleton.stories.tsx` |
| ✅ | Loading/SplashScreen | 4 | 4 | `components/SplashScreen/SplashScreen.stories.tsx` |
| ✅ | Messaging/Alert | 8 | 8 | `components/Alert/Alert.stories.tsx` |
| ✅ | Messaging/Banner | 8 | 8 | `components/Banner/Banner.stories.tsx` |
| ✅ | Messaging/Toast | 9 | 9 | `components/Toast/Toast.stories.tsx` |
| ✅ | Navigation/AppShell | 6 | 6 | `components/AppShell/AppShell.stories.tsx` |
| ✅ | Navigation/Breadcrumbs | 7 | 7 | `components/Breadcrumbs/Breadcrumbs.stories.tsx` |
| ✅ | Navigation/Link | 5 | 5 | `components/Link/Link.stories.tsx` |
| ✅ | Navigation/Pagination | 9 | 9 | `components/Pagination/Pagination.stories.tsx` |
| ☐ | Navigation/RemoteShell | 1 | 1 | `components/RemoteShell/RemoteShell.stories.tsx` |
| ☐ | Navigation/SearchModal | 8 | 8 | `components/SearchModal/SearchModal.stories.tsx` |
| ✅ | Navigation/SegmentedTabs | 9 | 9 | `components/SegmentedTabs/SegmentedTabs.stories.tsx` |
| ☐ | Navigation/Stepper | 10 | 10 | `components/Stepper/Stepper.stories.tsx` |
| ✅ | Navigation/Tabs | 11 | 11 | `components/Tabs/Tabs.stories.tsx` |
| ✅ | Navigation/Tree | 6 | 6 | `components/Tree/Tree.stories.tsx` |
| ✅ | Navigation/TreeView | 8 | 8 | `components/TreeView/TreeView.stories.tsx` |
| ✅ | Overlay/Dialog | 17 | 17 | `components/Dialog/Dialog.stories.tsx` |
| ✅ | Overlay/Drawer | 16 | 16 | `components/Drawer/Drawer.stories.tsx` |
| ✅ | Overlay/FeedbackPulse | 2 | 2 | `components/FeedbackPulse/FeedbackPulse.stories.tsx` |
| ✅ | Overlay/OverflowTooltip | 7 | 7 | `components/OverflowTooltip/OverflowTooltip.stories.tsx` |
| ✅ | Overlay/Popover | 4 | 4 | `components/Popover/Popover.stories.tsx` |
| ✅ | Overlay/Tooltip | 4 | 4 | `components/Tooltip/Tooltip.stories.tsx` |
| ✅ | Overlay/Tour | 5 | 5 | `components/Tour/Tour.stories.tsx` |
| ✅ | Pages/EmptyState | 5 | 5 | `components/EmptyState/EmptyState.stories.tsx` |
| ✅ | Pages/UtilityPage | 4 | 4 | `components/UtilityPage/UtilityPage.stories.tsx` |
| ☐ | Patterns/Click to Copy | 8 | 8 | `components/Copyable/stories/ClickToCopy.stories.tsx` |
| ☐ | Patterns/FilterCascade | 6 | 5 | `components/FilterCascade/FilterCascade.stories.tsx` |
| ☐ | Patterns/FilterDropdown | 10 | 10 | `components/FilterDropdown/FilterDropdown.stories.tsx` |
| ✅ | Patterns/FilterInput/Composition | 4 | 4 | `components/FilterInput/stories/FilterInputComposition.stories.tsx` |
| ✅ | Patterns/FilterInput/FilterInput | 17 | 17 | `components/FilterInput/stories/FilterInput.stories.tsx` |
| ✅ | Patterns/FilterInput/FilterInputChip | 22 | 22 | `components/FilterInput/stories/FilterInputChip.stories.tsx` |
| ✅ | Patterns/FilterInput/FilterInputFieldMenu | 11 | 11 | `components/FilterInput/stories/FilterInputFieldMenu.stories.tsx` |
| ✅ | Patterns/FilterInput/FilterInputOperatorMenu | 8 | 8 | `components/FilterInput/stories/FilterInputOperatorMenu.stories.tsx` |
| ✅ | Primitives/Icons | 3 | 3 | `icons/module/Icons.stories.tsx` |
| ✅ | Primitives/Kbd | 4 | 4 | `components/Kbd/Kbd.stories.tsx` |
| ✅ | Primitives/Overlay | 1 | 1 | `components/Overlay/Overlay.stories.tsx` |
| ✅ | Primitives/Separator | 1 | 1 | `components/Separator/Separator.stories.tsx` |
| ✅ | Status Indication/Badge | 11 | 11 | `components/Badge/Badge.stories.tsx` |
| ✅ | Status Indication/Indicator | 2 | 2 | `components/Indicator/Indicator.stories.tsx` |
| ✅ | Status Indication/NumericBadge | 5 | 5 | `components/NumericBadge/NumericBadge.stories.tsx` |
| ✅ | Status Indication/Tag | 7 | 7 | `components/Tag/Tag.stories.tsx` |
| ✅ | Typography/Code | 7 | 7 | `components/Code/Code.stories.tsx` |
| ✅ | Typography/Heading | 7 | 7 | `components/Heading/Heading.stories.tsx` |
| ✅ | Typography/Pixel | 2 | 2 | `theme/Pixel.stories.tsx` |
| ✅ | Typography/Text | 5 | 5 | `components/Text/Text.stories.tsx` |

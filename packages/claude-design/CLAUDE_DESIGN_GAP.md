# Storybook gaps for Claude Design

The Claude Design export is built from Storybook alone, so anything Storybook does not show is
something the Claude Design agent cannot learn. This file lists those gaps, each with the source
reference a story author needs. A gap is closed by adding or fixing a story, never by the export
(which does not fill it with hand-written content) and never as part of the export work. The
component-level "Not synced" list lives in the built project's `README.md`
(`packages/claude-design/.claude-design/project/README.md`); this file is consistent with it. Hand-maintained; counts
were derived from the code on 2026-11-01. Paths are relative to `packages/design-system`.

## Components with no story of their own

No `*.stories.tsx` exists in the component folder for any of these.

| Component | Kind | What Storybook should show |
|---|---|---|
| `src/components/BulkBar` | public | A selection bar with `BulkBarSummary*` parts (count, clear, select-all, separator). |
| `src/components/NavRail` | public | Rail with body, items, separator, footer, skeleton. Appears only inside AppShell stories (`AppShell.stories.tsx:21`). |
| `src/components/TopHeader` | public | Header with logo, actions, separator. Appears only inside AppShell stories (`AppShell.stories.tsx:160`). |
| `src/components/ThemeProvider` | public provider | `ThemeProvider` / `useTheme` (theme, frame style). `useTheme` is used only in `AppShell.stories.tsx:33`. Listed in the README as "provider; use WallarmDS.Root on the canvas". |
| `src/components/DateFormatProvider` | public provider | Imported by the date stories (e.g. `DateInput.stories.tsx:4`). Listed in the README as "provider; use WallarmDS.Root on the canvas". |
| `src/components/ButtonBase` | internal | Internal primitive (`ButtonBase.tsx`); shown through Button. |
| `src/components/Checkmark` | internal | Internal primitive (`Checkmark.tsx`); shown through Checkbox. |
| `src/components/Polymorphic` | internal | Internal primitive (`Polymorphic.tsx`). |
| `src/components/TemporalCore` | internal | Internal segments for DateInput / TimeInput. |
| `src/components/NavPanel` | internal | Rendered by `RemoteShellPanel`; consumers configure it only through `RemoteShell`'s `NavConfig`, shown in the RemoteShell stories and Patterns/Application layout. |

## Table props and features with no story

All in `src/components/Table/types.ts`. Grep over `Table.stories.tsx` (the only Table story file)
finds no use of any of these.

| Item | Source | What Storybook should show |
|---|---|---|
| `grouping` / `onGroupingChange` (column-value grouping) | `types.ts:271-272` | Rows grouped by a column value, controlled state. Existing "grouping" stories (`Table.stories.tsx:2101`, `:2237`) cover only `getSubRows` sub-row grouping. |
| `skeletonCount` | `types.ts:209` | Loading state with a non-default number of skeleton rows. |
| `onSettingsOpenChange` | `types.ts:334` | Settings menu open/close callback. |
| `overscan` | `types.ts:358` | Virtualised table with a tuned overscan. |
| Column def `minSize`, `maxSize` | `types.ts:162-163` | Resizing that stops at the limits. |
| Column def `enableResizing`, `enableColumnPinning`, `enableHiding` | `types.ts:165-167` | A column that opts out of each. |
| Column meta `headerClassName`, `cellClassName` | `types.ts:131-132` | Per-column header and cell styling. |
| `TableSettingsMenu*` composed directly | `Table/index.ts:53-55` | The settings menu built from its exported parts instead of through the Table prop. |
| `InlineCellEditing` has no description | `Table.stories.tsx:2347` | A JSDoc description (listed again below). |

`onStartReachedThreshold` / `onEndReachedThreshold` (`types.ts:364`, `:368`) are used in the
infinite-scroll stories (`Table.stories.tsx:1334` onward) with values 200 and 300, so they are not a
gap.

## SimpleCharts

- `LineChartZoomPopover`, `LineChartZoomPopoverConfirm`, `LineChartZoomPopoverRange`
  (`src/components/SimpleCharts/LineChart/index.ts:50-60`) are exported but have no story. They
  render only inside `LineChartZoomBrush.tsx:213-218`. Show them composed by hand (custom confirm
  label, custom range text) next to the brush story.
- `SimpleCharts/Metric` uses a local `Card` wrapper (`Metric.stories.tsx:40`, used from `:58`);
  `SimpleCharts/Overview` builds its page from local `*Card` components
  (`Overview.stories.tsx:93-182`) and has no `component:` field on meta. Each should render the real
  components directly.

## Stories built on a local wrapper component

Definition used: the story's outermost JSX element is a component defined in the same story
file. Count: 33 of 971 stories in 120 story files. The wrapper hides the real usage from a reader
of the story source, so the agent sees `<Example />` instead of the design-system API. What
Storybook should show for each: the design-system components composed in the story body.

| Wrapper (definition) | Stories (file:line) |
|---|---|
| `FieldMenuHarness` (`FilterInput/stories/FilterInputFieldMenu.stories.tsx:56`) | `:187 :192 :209 :214 :229 :236 :250 :296 :319 :328` (10) |
| `OperatorMenuHarness` (`FilterInput/stories/FilterInputOperatorMenu.stories.tsx:46`) | `:91 :94 :97 :100 :103 :106 :109` (7) |
| `ParityPair` (`CodeEditor/CodeEditor.stories.tsx:796`) | `:879 :887 :900 :922 :930 :963` (6) |
| `AttributeInlineEditExample` (`Attribute/Attribute.stories.tsx:892`) | `:921 :927` |
| `AttributeMixedExample` (`Attribute/Attribute.stories.tsx:937`) | `:987 :994` |
| `Example` (`ImageCropper/ImageCropper.stories.tsx:75`) | `:201 :204 :209 :237` |
| `Card` (`SimpleCharts/Metric/Metric.stories.tsx:40`) | `:150` |
| `ToastDemo` (`Toast/Toast.stories.tsx:57`) | `:152` |

All paths are under `src/components/`. A wider count (any story using a file-local component
anywhere in its body, such as helper panels inside Dialog, Drawer or Selection stories) is 151;
those are usually layout helpers, not wrappers around the documented component, and are not
listed.

## Stories without a description

A story has no JSDoc and no `parameters.docs.description.story`:

- `src/components/FilterCascade/FilterCascade.stories.tsx:247` `Disabled`
- `src/components/Table/Table.stories.tsx:2347` `InlineCellEditing`
- `src/components/WallySkeleton/WallySkeleton.stories.tsx:22` `Default`
- `src/components/WallySkeleton/WallySkeleton.stories.tsx:28` `Narrow`

Each needs a one-line JSDoc saying what the story shows.

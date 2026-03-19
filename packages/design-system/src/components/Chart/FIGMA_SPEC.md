# Chart Components — Figma Design Specification

> Source: [WADS-Components / Documentation](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-118203&m=dev)

> **Note!** The examples presented in this documentation reflect the general Simple Charts pattern and are not tied to any specific product section or use case. Chart types, data values and configurations are illustrative — actual implementation will vary depending on the context.

---

## 1. Chart types overview

The current set includes three chart types: **bar chart** for ranked value breakdowns, **pie chart** for proportional distribution (initially used for response codes) and **line chart** for time-based trends (initially used for request volume). All three are general-purpose and not tied to a specific data type. More chart types are planned and will be introduced in future updates.

---

## 2. Card anatomy

Each chart card consists of a **header** (containing the chart title and action icons) and a **content area** that varies by chart type. The card has a fixed height, **defaulting to 196px** — this may be adjusted per product context. Action icons (filter and settings) are **visible only on card hover**.

### Annotations from Figma:
- Actions are **visible on-hover (card-hover)**
- Default card height is **196px**, may vary per product case

### Structure:
- `_chart-card`: `bg-bg-surface-1`, `border-1 border-border-primary-light`, `rounded-8`, `overflow-clip`
- `_chart-header`: `h-32`, title at `left-12 top-8`, `text-xs font-medium font-sans text-text-primary`
- Actions slot: `opacity-0` by default, visible on card hover, contains ghost Button(s)

---

## 3. Swap data source

Each chart card acts as a configurable slot — hovering reveals a gear icon in the header, which opens a dropdown to switch the card's data source. The **visualization type is predefined per data source** — users only select *what* data to display, not *how* it's rendered. This gives users lightweight control over the charts without exposing full dashboard-style configuration.

### Annotation:
- viz-type is predefined for all data sources

---

## 4. Bar chart — States

The bar chart displays **up to 5 rows**, which defines its fixed max height. Hovering a row reveals a highlight state and a **"Click to filter" tooltip** — clicking applies that value as a filter to the page. Once filtered, the card **collapses to show only the matching item** with its bar at 100% and a **"Remove filter" button** appears in the header to clear it and restore the full list.

### Layout per row (`_chart-item`):
- Row height: **32px**, relative positioned
- Label: `left-12 top-8`, `font-mono regular`, `text-xs`, `text-text-primary`
- Bar (`_bar-atom`): `left-8`, vertically centered, `h-24`, `rounded-6`, `bg-states-primary-pressed`
- Bar width: proportional to max value
- Value: right-aligned with `pr-12`, `font-mono medium`, `text-xs`
  - Format: `value` (text-primary) + `%` (text-secondary)

### States:
1. **Default** — all 5 rows visible
2. **Hovered** — row highlight + "Click to filter" tooltip
3. **Filtered** — single row, bar at 100%, "Remove filter" button in header

---

## 5. Pie chart (Response Codes) — States

The pie chart uses **color-coded response code badges** in the legend, with the center displaying the total request count and percentage — though the exact metrics shown may vary per product context. Hovering a legend row **highlights the corresponding segment** in the pie and fades out the rest. Clicking applies a filter to the page: the chart **collapses to the selected segment only**, the donut reflects the filtered state, and a **"Remove filter" button** appears in the header to reset it.

### Donut layout:
- Donut container: `w-168 h-136`
- Actual donut: `left-24 top-8 size-120` (fixed, does not scale)
- Center text container: `w-58`, centered
  - Value: `font-mono medium`, `text-base` (16px), `line-height-sm` (20px), `text-text-primary`
  - Label: `font-mono regular`, `text-xs`, `text-text-secondary`

### Legend item (`_chart-item` for pie):
- Height: **32px**, `rounded-8`, `overflow-clip`
- Badge: `left-8`, vertically centered, `w-34`, response code badge (e.g. "4XX", "2XX")
- Value section: right-aligned with `pr-8`, `font-mono medium`, `text-xs`
  - Format: `value` (text-primary) + `bullet` (text-tertiary) + `value%` (text-primary + text-secondary)
  - Dot separator: `font-mono regular`, `text-text-tertiary`
  - Gap between items: `gap-2`

### States:
1. **Default** — all segments and legend rows visible
2. **Hovered** — hovered segment highlighted, others faded
3. **Filtered** — single segment, "Remove filter" button in header

---

## 6. Pie Chart — Layout

The card width adapts to screen size, but the **donut area is fixed and snapped** — it doesn't scale. The legend section (badges + values) **fills the remaining horizontal space**, stretching to accommodate wider containers.

---

## 7. Line chart — single

Shows three states of a single-line chart. Default state renders the line with x and y axis labels — exact granularity for both axes is TBD and will vary per product context. On hover, a **popover appears at a fixed y-axis position** showing the timestamp and value for the hovered point. The chart also supports **range selection** — click and drag to highlight a time range, which triggers a popover with the selected period and a **"Zoom in" action** — confirmed via button click or Enter, cancelled with Escape.

### States:
1. **Default** — line with axes
2. **Hovered** — popover with timestamp + value
3. **Range selected** — highlighted range + "Zoom in" popover

---

## 8. Line chart — Anatomy

The line chart is composed of a **header** and a **grid area**. For single-line charts, the grid follows directly below the header. For multi-line charts, a **legend row is inserted between the header and the grid** — legend item count and width may vary.

> **Note!** The top x-axis border line is intentionally removed to reduce visual noise and keep the chart clean.

### Grid structure:
- Y-axis labels: `w-38`, `pl-6 pr-4`, `text-2xs` (10px), `font-sans regular`, `text-text-secondary`, `text-right`
- X-axis labels: bottom, `pb-4`, `text-2xs` (10px), `font-sans regular`, `text-text-secondary`, `text-center`
- Grid lines: horizontal dashed, `stroke: border-primary-light`
- Line: `stroke-width: 2`, color from CHART_COLORS

---

## 9. Line Chart (multi) — States

Same interaction behavior as the single-line variant — hover shows a popover with a timestamp and values and click-and-drag enables range selection with a "Zoom in" action. The key difference is the **legend row between the header and grid** and the popover **listing values for all lines simultaneously** at the hovered point.

---

## 10. Line chart — filtering by attribute

Hovering a legend item **fades out all other lines**, keeping the hovered one fully visible for focus. Clicking the legend item **applies it as a filter** — the chart collapses to that single line, the other attributes are visually dimmed in the legend and a **"Remove filter" button** appears in the header. The filter can be cleared either from the header button or by clicking the active legend item again.

---

## 11. Line chart — popovers

Two popover types are used in the line chart:

### Hover popover (`line-popover`):
- Container: `bg-bg-surface-2`, `border-1 border-border-primary-light`, `rounded-12`, `shadow-md`
- Padding: `px-12 py-8`
- Header: date in `text-xs font-sans font-medium text-text-primary`
- Items (`_item`): `h-16`, `w-140`
  - Color dot: `size-8`, `rounded-[3px]` (NOT rounded-full!), `bg-{color}`
  - Name: `left-12`, `font-mono regular`, `text-xs`, `text-text-primary`
  - Value: `right-0`, `font-mono medium`, `text-xs`, `text-text-primary`, `text-right`

### Range selection popover:
- Shows selected time range and "Zoom in" action button
- Date format, range format and value representation may all vary per product context

### Cursor:
- Vertical dashed line at hover position
- `stroke-dasharray: 3 3`

---

## 12. Chart cards — loading states

Each chart type has a **skeleton loading state**:
- **Bar charts**: placeholder blocks for rows, bars
- **Pie charts**: placeholder blocks for donut and legend rows
- **Line charts (single)**: show only grid lines during loading — x-axis and y-axis labels are **not rendered until data is fully loaded**
- **Line charts (multi)**: additionally skeleton the legend row above the grid

---

## Design Tokens Reference

### Typography:
| Usage | Font | Weight | Size | Line Height |
|-------|------|--------|------|-------------|
| Card title | `font-sans` | medium (500) | `text-xs` (12px) | 16px |
| Bar label | `font-mono` | regular (400) | `text-xs` (12px) | 16px |
| Bar/Legend value | `font-mono` | medium (500) | `text-xs` (12px) | 16px |
| Donut center value | `font-mono` | medium (500) | `text-base` (16px) | 20px |
| Donut center label | `font-mono` | regular (400) | `text-xs` (12px) | 16px |
| Axis labels | `font-sans` | regular (400) | `text-2xs` (10px) | 12px |
| Tooltip header | `font-sans` | medium (500) | `text-xs` (12px) | 16px |
| Tooltip item name | `font-mono` | regular (400) | `text-xs` (12px) | 16px |
| Tooltip item value | `font-mono` | medium (500) | `text-xs` (12px) | 16px |

### Colors:
| Usage | Token |
|-------|-------|
| Card bg | `bg-bg-surface-1` |
| Card border | `border-border-primary-light` |
| Bar default | `bg-states-primary-pressed` |
| Title text | `text-text-primary` |
| Secondary text | `text-text-secondary` |
| Tertiary text (separators) | `text-text-tertiary` |
| Tooltip bg | `bg-bg-surface-2` |
| Grid lines | `border-primary-light` |

### Spacing:
| Usage | Value |
|-------|-------|
| Card border-radius | `rounded-8` |
| Bar border-radius | `rounded-6` |
| Tooltip border-radius | `rounded-12` |
| Legend item border-radius | `rounded-8` |
| Card header height | `32px` |
| Bar row height | `32px` |
| Legend row height | `32px` |
| Bar height | `24px` |
| Card default height | `196px` |
| Donut size | `120px` |
| Tooltip dot size | `8px`, `rounded-[3px]` |
| Header padding-x | `12px` |
| Legend value padding-right | `8px` (pie) / `12px` (bar) |

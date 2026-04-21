/**
 * Built-in palette keys used by bar/pie/line fills across the SimpleCharts family.
 * Each key maps to a `/16` alpha overlay of its `500` palette hue in the consuming
 * component's CVA (see `BarList/classes.ts`).
 *
 * `slate` is the neutral default and intentionally uses `bg-states-primary-pressed`
 * instead of a raw palette class so it inherits the row's interactive tinting.
 */
export type ChartColor =
  | 'brand'
  | 'blue'
  | 'green'
  | 'red'
  | 'amber'
  | 'purple'
  | 'slate'
  | 'teal'
  | 'cyan'
  | 'indigo'
  | 'pink'
  | 'rose';

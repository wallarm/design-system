import type { BadgeColor } from '../Badge/types';

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

export interface ChartBarListDataItem {
  name: string;
  value: number;
  color?: ChartColor;
  href?: string;
}

export interface ChartPieDataItem {
  name: string;
  value: number;
  color: ChartColor;
}

export interface ChartLineSeriesConfig {
  dataKey: string;
  name: string;
  color?: ChartColor;
}

export type ChartBadgeColor = BadgeColor;

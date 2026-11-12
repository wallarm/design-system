import type { GenUiComponent } from '../core/define';
import { AlertComponent } from './Alert';
import { AreaChartComponent } from './AreaChart';
import { BadgeComponent } from './Badge';
import { BarListComponent } from './BarList';
import { ButtonComponent } from './Button';
import { CardComponent } from './Card';
import { ColumnChartComponent } from './ColumnChart';
import { GridComponent, GridItemComponent } from './Grid';
import { HeadingComponent } from './Heading';
import { HorizontalBarStackComponent } from './HorizontalBarStack';
import { LineChartComponent } from './LineChart';
import { MetricComponent } from './Metric';
import { PieChartComponent } from './PieChart';
import { SectionComponent } from './Section';
import { StackComponent } from './Stack';
import { TableComponent } from './Table';
import { TextComponent } from './Text';

export * from './Alert';
export * from './AreaChart';
export * from './Badge';
export * from './BarList';
export * from './Button';
export * from './Card';
export * from './ColumnChart';
export * from './Grid';
export * from './Heading';
export * from './HorizontalBarStack';
export * from './LineChart';
export * from './Metric';
export * from './PieChart';
export * from './Section';
export * from './Stack';
export * from './Table';
export * from './Text';

/** The catalog: layout (Section, Grid, Stack, Card), text, status, actions, charts and Table. */
export const wallarmComponents: readonly GenUiComponent[] = [
  SectionComponent,
  GridComponent,
  GridItemComponent,
  StackComponent,
  CardComponent,
  HeadingComponent,
  TextComponent,
  BadgeComponent,
  AlertComponent,
  ButtonComponent,
  MetricComponent,
  BarListComponent,
  HorizontalBarStackComponent,
  PieChartComponent,
  LineChartComponent,
  AreaChartComponent,
  ColumnChartComponent,
  TableComponent,
];

import type { GenUiComponent } from '../core/define';
import { AccordionComponent } from './Accordion';
import { AlertComponent } from './Alert';
import { AreaChartComponent } from './AreaChart';
import { BadgeComponent } from './Badge';
import { BarChartComponent } from './BarChart';
import { BarListComponent } from './BarList';
import { ButtonComponent } from './Button';
import { CardComponent } from './Card';
import { CheckboxComponent } from './Checkbox';
import { CodeSnippetComponent } from './CodeSnippet';
import { ColumnChartComponent } from './ColumnChart';
import { DateInputComponent } from './DateInput';
import { DateRangeInputComponent } from './DateRangeInput';
import { DialogComponent } from './Dialog';
import { DrawerComponent } from './Drawer';
import { EmptyStateComponent } from './EmptyState';
import { GridComponent, GridItemComponent } from './Grid';
import { HeadingComponent } from './Heading';
import { HorizontalBarStackComponent } from './HorizontalBarStack';
import { InputComponent } from './Input';
import { KeyValueListComponent } from './KeyValueList';
import { LineChartComponent } from './LineChart';
import { LinkComponent } from './Link';
import { ListComponent } from './List';
import { MetricComponent } from './Metric';
import { NumberInputComponent } from './NumberInput';
import { PieChartComponent } from './PieChart';
import { ProgressComponent } from './Progress';
import { RadioGroupComponent } from './RadioGroup';
import { SearchInputComponent } from './SearchInput';
import { SectionComponent } from './Section';
import { SegmentedControlComponent } from './SegmentedControl';
import { SelectComponent } from './Select';
import { SeparatorComponent } from './Separator';
import { SliderComponent } from './Slider';
import { StackComponent } from './Stack';
import { SwitchComponent } from './Switch';
import { TableComponent } from './Table';
import { TabsComponent } from './Tabs';
import { TextComponent } from './Text';
import { TextareaComponent } from './Textarea';
import { TimeInputComponent } from './TimeInput';
import { TimelineComponent } from './Timeline';
import { ToggleButtonComponent } from './ToggleButton';
import { TreeComponent } from './Tree';

export * from './Accordion';
export * from './Alert';
export * from './AreaChart';
export * from './Badge';
export * from './BarChart';
export * from './BarList';
export * from './Button';
export * from './Card';
export * from './Checkbox';
export * from './CodeSnippet';
export * from './ColumnChart';
export * from './DateInput';
export * from './DateRangeInput';
export * from './Dialog';
export * from './Drawer';
export * from './EmptyState';
export * from './Grid';
export * from './Heading';
export * from './HorizontalBarStack';
export * from './Input';
export * from './KeyValueList';
export * from './LineChart';
export * from './Link';
export * from './List';
export * from './Metric';
export * from './NumberInput';
export * from './PieChart';
export * from './Progress';
export * from './RadioGroup';
export * from './SearchInput';
export * from './Section';
export * from './SegmentedControl';
export * from './Select';
export * from './Separator';
export * from './Slider';
export * from './Stack';
export * from './Switch';
export * from './Table';
export * from './Tabs';
export * from './Text';
export * from './Textarea';
export * from './TimeInput';
export * from './Timeline';
export * from './ToggleButton';
export * from './Tree';

/**
 * The catalog: layout (Section, Grid, Stack, Card, Tabs, Accordion), content on demand (Drawer,
 * Dialog), text, status, actions, form fields, charts and records (Table, KeyValueList, Timeline, Tree).
 */
export const wallarmComponents: readonly GenUiComponent[] = [
  SectionComponent,
  GridComponent,
  GridItemComponent,
  StackComponent,
  CardComponent,
  TabsComponent,
  AccordionComponent,
  SeparatorComponent,
  DrawerComponent,
  DialogComponent,
  HeadingComponent,
  TextComponent,
  ListComponent,
  LinkComponent,
  CodeSnippetComponent,
  BadgeComponent,
  AlertComponent,
  EmptyStateComponent,
  ProgressComponent,
  ButtonComponent,
  InputComponent,
  SelectComponent,
  CheckboxComponent,
  SwitchComponent,
  TextareaComponent,
  SearchInputComponent,
  NumberInputComponent,
  SliderComponent,
  RadioGroupComponent,
  SegmentedControlComponent,
  ToggleButtonComponent,
  DateInputComponent,
  DateRangeInputComponent,
  TimeInputComponent,
  MetricComponent,
  BarListComponent,
  HorizontalBarStackComponent,
  PieChartComponent,
  LineChartComponent,
  AreaChartComponent,
  ColumnChartComponent,
  BarChartComponent,
  TableComponent,
  KeyValueListComponent,
  TimelineComponent,
  TreeComponent,
];

import { z } from 'zod';
import { cn } from '@wallarm-org/design-system/utils/cn';
import { defineComponent } from '../define';
import { GAPS } from './Stack';

const COLUMNS = ['1', '2', '3', '4', '6', '12'] as const;
const SPANS = ['1', '2', '3', '4', '6', '12', 'full'] as const;

// Whole class names, so Tailwind sees them.
const COLUMN_CLASS: Record<(typeof COLUMNS)[number], string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
  '4': 'grid-cols-4',
  '6': 'grid-cols-6',
  '12': 'grid-cols-12',
};
const GAP_CLASS: Record<(typeof GAPS)[number], string> = {
  '4': 'gap-4',
  '8': 'gap-8',
  '12': 'gap-12',
  '16': 'gap-16',
  '24': 'gap-24',
};
const SPAN_CLASS: Record<(typeof SPANS)[number], string> = {
  '1': 'col-span-1',
  '2': 'col-span-2',
  '3': 'col-span-3',
  '4': 'col-span-4',
  '6': 'col-span-6',
  '12': 'col-span-12',
  full: 'col-span-full',
};

export const GridComponent = defineComponent({
  name: 'Grid',
  description:
    'A dashboard grid: equal columns, children fill them left to right. Use 4 columns for KPI tiles, 2 for charts side by side; wrap a child in GridItem to span several columns.',
  props: z.object({
    columns: z.enum(COLUMNS).optional().describe('Default 2'),
    gap: z.enum(GAPS).optional().describe('Space between cells, px. Default 12'),
  }),
  hasChildren: true,
  View: ({ props, children }) => (
    <div
      className={cn(
        'grid w-full',
        COLUMN_CLASS[props.columns ?? '2'],
        GAP_CLASS[props.gap ?? '12'],
      )}
    >
      {children}
    </div>
  ),
});

export const GridItemComponent = defineComponent({
  name: 'GridItem',
  description: 'One Grid cell that spans several columns, e.g. a wide chart or table.',
  props: z.object({
    span: z.enum(SPANS).describe('Columns to span; full spans the row'),
  }),
  hasChildren: true,
  View: ({ props, children }) => (
    <div className={cn('min-w-0', SPAN_CLASS[props.span])}>{children}</div>
  ),
});

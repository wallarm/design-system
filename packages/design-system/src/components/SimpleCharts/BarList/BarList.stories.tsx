import { type ReactNode, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Check, FilterX, Settings } from '../../../icons';
import { cn } from '../../../utils/cn';
import { Button } from '../../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../DropdownMenu';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../../OverflowTooltip';
import { Chart } from '../Chart/Chart';
import { ChartActions } from '../Chart/ChartActions';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import type { ChartColor } from '../types';
import { BarList } from './BarList';
import { BarListBar } from './BarListBar';
import { BarListItem } from './BarListItem';
import { BarListLabel } from './BarListLabel';
import { BarListPercent } from './BarListPercent';
import { BarListSkeleton } from './BarListSkeleton';
import { BarListValue } from './BarListValue';

interface Row {
  name: string;
  value: number;
  color?: ChartColor;
}

const baseRows: Row[] = [
  { name: '/api/v1/users', value: 1240, color: 'brand' },
  { name: '/api/v1/auth/login', value: 890, color: 'green' },
  { name: '/api/v1/orders', value: 612, color: 'blue' },
  { name: '/api/v1/products', value: 358, color: 'amber' },
  { name: '/api/v1/search', value: 174, color: 'red' },
];

const longLabelRows: Row[] = [
  { name: '/api/v1/observability/events/ingestion/batch', value: 1240 },
  { name: '/api/v1/identity/authentication/sessions/refresh', value: 890 },
  { name: '/api/v1/billing/invoices/line-items/detail', value: 612 },
  { name: '/api/v1/catalog/products/variants/inventory', value: 358 },
  { name: '/api/v1/search/federated/suggestions/autocomplete', value: 174 },
  { name: '/api/v1/analytics/dashboards/widgets/timeseries', value: 162 },
  { name: '/api/v1/notifications/subscriptions/channels/email', value: 148 },
  { name: '/api/v1/reports/export/scheduled/weekly', value: 121 },
  { name: '/api/v1/integrations/webhooks/deliveries/retry', value: 97 },
  { name: '/api/v1/audit-logs/events/security/login-attempts', value: 42 },
];

const percentageRows: Row[] = [
  { name: 'Success', value: 78 },
  { name: 'Client error', value: 18 },
  { name: 'Server error', value: 4 },
];

const formatValue = (n: number) => n.toLocaleString('en-US');
const formatPercent = (n: number) => `${n}%`;

const meta = {
  title: 'Data display/SimpleCharts/BarList',
  component: BarList,
  subcomponents: {
    BarListItem,
    BarListBar,
    BarListLabel,
    BarListValue,
    BarListPercent,
    BarListSkeleton,
  },
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-121720&m=dev',
    },
    docs: {
      description: {
        component:
          'BarList is a composable, JSX-driven horizontal bar list. Callers render one `BarListItem` per data point ' +
          'and pick which slots to compose inside it (bar, label, value, percent). The parent supplies `max` — the ' +
          'value at which a bar fills 100%. Use `selected` on an item to force its bar to 100% while keeping the ' +
          'real `value / max` in the percent label. For the loading state use `BarListSkeleton`.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BarList>;

export default meta;

const chartSum = (rows: Row[]) => rows.reduce((sum, r) => sum + r.value, 0);
const chartMax = (rows: Row[]) => Math.max(...rows.map(r => r.value));

export const Default: StoryFn<typeof meta> = () => {
  const [filtered, setFiltered] = useState<string | null>(null);
  const rows = filtered ? baseRows.filter(r => r.name === filtered) : baseRows;

  return (
    <div className='w-400'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Top 5 Endpoints</ChartTitle>
          <ChartActions alwaysVisible={filtered !== null}>
            {filtered !== null && (
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Clear filter'
                onClick={() => setFiltered(null)}
              >
                <FilterX />
              </Button>
            )}
            <Button variant='ghost' color='neutral' size='small' aria-label='Settings'>
              <Settings />
            </Button>
          </ChartActions>
        </ChartHeader>
        <BarList max={chartSum(baseRows)}>
          {rows.map(row => (
            <BarListItem
              key={row.name}
              value={row.value}
              selected={filtered === row.name}
              onClick={() => setFiltered(filtered === row.name ? null : row.name)}
            >
              <BarListBar />
              <BarListLabel>{row.name}</BarListLabel>
              <BarListValue>
                {formatValue(row.value)}
                <BarListPercent />
              </BarListValue>
            </BarListItem>
          ))}
        </BarList>
      </Chart>
    </div>
  );
};

export const Colored: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Top 5 Endpoints</ChartTitle>
      </ChartHeader>
      <BarList max={chartMax(baseRows)}>
        {baseRows.map(row => (
          <BarListItem key={row.name} value={row.value}>
            <BarListBar color={row.color} />
            <BarListLabel>{row.name}</BarListLabel>
            <BarListValue>
              {formatValue(row.value)}
              <BarListPercent />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

const customColorClassNames = [
  'bg-violet-500/16',
  'bg-emerald-500/16',
  'bg-sky-500/16',
  'bg-yellow-500/16',
  'bg-fuchsia-500/16',
];

export const CustomColors: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Top 5 Endpoints</ChartTitle>
      </ChartHeader>
      <BarList max={chartMax(baseRows)}>
        {baseRows.map((row, i) => (
          <BarListItem key={row.name} value={row.value}>
            <BarListBar className={customColorClassNames[i]} />
            <BarListLabel>{row.name}</BarListLabel>
            <BarListValue>
              {formatValue(row.value)}
              <BarListPercent />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

export const Percentage: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Response status</ChartTitle>
      </ChartHeader>
      <BarList max={100}>
        {percentageRows.map(row => (
          <BarListItem key={row.name} value={row.value}>
            <BarListBar />
            <BarListLabel>{row.name}</BarListLabel>
            <BarListValue>{formatPercent(row.value)}</BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

export const Selectable: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className='w-400'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Top 5 Endpoints</ChartTitle>
          <ChartActions alwaysVisible={selected !== null}>
            {selected !== null && (
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Clear selection'
                onClick={() => setSelected(null)}
              >
                <FilterX />
              </Button>
            )}
          </ChartActions>
        </ChartHeader>
        <BarList max={chartSum(baseRows)}>
          {baseRows.map(row => (
            <BarListItem
              key={row.name}
              value={row.value}
              selected={selected === row.name}
              onClick={() => setSelected(selected === row.name ? null : row.name)}
            >
              <BarListBar />
              <BarListLabel>{row.name}</BarListLabel>
              <BarListValue>
                {formatValue(row.value)}
                <BarListPercent />
              </BarListValue>
            </BarListItem>
          ))}
        </BarList>
      </Chart>
    </div>
  );
};

export const TruncatedLabels: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Top 5 Endpoints</ChartTitle>
      </ChartHeader>
      <BarList max={chartMax(longLabelRows)}>
        {longLabelRows.map(row => (
          <BarListItem key={row.name} value={row.value}>
            <BarListBar />
            <BarListLabel>{row.name}</BarListLabel>
            <BarListValue>
              {formatValue(row.value)}
              <BarListPercent />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

export const TruncatedLabelsWithTooltip: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Top 5 Endpoints</ChartTitle>
      </ChartHeader>
      <BarList max={chartMax(longLabelRows)}>
        {longLabelRows.map(row => (
          <BarListItem key={row.name} value={row.value}>
            <BarListBar />
            <OverflowTooltip>
              <OverflowTooltipTrigger>
                <BarListLabel className='pointer-events-auto'>{row.name}</BarListLabel>
              </OverflowTooltipTrigger>
              <OverflowTooltipContent>{row.name}</OverflowTooltipContent>
            </OverflowTooltip>
            <BarListValue>
              {formatValue(row.value)}
              <BarListPercent />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

type DatasetKey = 'values' | 'labeled' | 'percent';

interface Dataset {
  title: string;
  rows: Row[];
  max: number;
  renderValue: (row: Row) => ReactNode;
}

const datasets: Record<DatasetKey, Dataset> = {
  values: {
    title: 'Requests — values only',
    rows: baseRows,
    max: chartMax(baseRows),
    renderValue: row => <BarListValue>{formatValue(row.value)}</BarListValue>,
  },
  labeled: {
    title: 'Top 5 Endpoints — value + %',
    rows: longLabelRows,
    max: chartMax(longLabelRows),
    renderValue: row => (
      <BarListValue>
        {formatValue(row.value)}
        <BarListPercent />
      </BarListValue>
    ),
  },
  percent: {
    title: 'Response status — percentage input',
    rows: percentageRows,
    max: 100,
    renderValue: row => <BarListValue>{formatPercent(row.value)}</BarListValue>,
  },
};

export const DataVariants: StoryFn<typeof meta> = () => {
  const [key, setKey] = useState<DatasetKey>('values');
  const current = datasets[key];

  return (
    <div className='w-400'>
      <Chart>
        <ChartHeader>
          <ChartTitle>{current.title}</ChartTitle>
          <ChartActions>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='Settings'>
                  <Settings />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Data source</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {(Object.keys(datasets) as DatasetKey[]).map(k => (
                    <DropdownMenuItem key={k} onSelect={() => setKey(k)}>
                      <DropdownMenuItemIcon>
                        <Check className={cn(key !== k && 'opacity-0')} />
                      </DropdownMenuItemIcon>
                      {datasets[k].title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ChartActions>
        </ChartHeader>
        <BarList max={current.max}>
          {current.rows.map(row => (
            <BarListItem key={row.name} value={row.value}>
              <BarListBar color={row.color} />
              <BarListLabel>{row.name}</BarListLabel>
              {current.renderValue(row)}
            </BarListItem>
          ))}
        </BarList>
      </Chart>
    </div>
  );
};

export const Loading: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Top 5 Endpoints</ChartTitle>
      </ChartHeader>
      <BarListSkeleton rows={5} />
    </Chart>
  </div>
);

const overflowRows: Row[] = [
  { name: 'Over capacity', value: 150 },
  { name: 'Half', value: 50 },
  { name: 'Zero', value: 0 },
];

export const Overflow: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Overflow & zero</ChartTitle>
      </ChartHeader>
      <BarList max={100}>
        {overflowRows.map(row => (
          <BarListItem key={row.name} value={row.value}>
            <BarListBar />
            <BarListLabel>{row.name}</BarListLabel>
            <BarListValue>
              {formatValue(row.value)}
              <BarListPercent />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

export const InvalidMax: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Invalid max</ChartTitle>
      </ChartHeader>
      <BarList max={0}>
        {baseRows.map(row => (
          <BarListItem key={row.name} value={row.value}>
            <BarListBar />
            <BarListLabel>{row.name}</BarListLabel>
            <BarListValue>
              {formatValue(row.value)}
              <BarListPercent />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

export const PercentDigits: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Decimal precision</ChartTitle>
      </ChartHeader>
      <BarList max={chartSum(baseRows)}>
        {baseRows.map(row => (
          <BarListItem key={row.name} value={row.value}>
            <BarListBar />
            <BarListLabel>{row.name}</BarListLabel>
            <BarListValue>
              {formatValue(row.value)}
              <BarListPercent digits={1} />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

export const PercentOverride: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Custom percent content</ChartTitle>
      </ChartHeader>
      <BarList max={chartSum(baseRows)}>
        {baseRows.map(row => (
          <BarListItem key={row.name} value={row.value}>
            <BarListBar />
            <BarListLabel>{row.name}</BarListLabel>
            <BarListValue>
              {formatValue(row.value)}
              <BarListPercent>Custom</BarListPercent>
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

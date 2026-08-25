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
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
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

const DESCRIPTION = [
  'A compact top-N breakdown for a dashboard card — endpoints, status codes, regions — where the rows are read as a ranking rather than plotted against an axis.',
  'You render a `BarListItem` per data point and choose which slots go in it; the root supplies `max`, the value at which a bar is full, and nothing is sorted, sliced or aggregated for you. `BarListSkeleton` covers the loading state.',
].join(' ');

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
    docs: { description: { component: DESCRIPTION } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BarList>;

export default meta;

const chartSum = (rows: Row[]) => rows.reduce((sum, r) => sum + r.value, 0);
const chartMax = (rows: Row[]) => Math.max(...rows.map(r => r.value));

/**
 * The interactive shape: click a row to filter down to it, and the header's clear button
 * appears while that filter holds. Filtering recomputes `max` from what is left, which is why
 * a lone row reads 100%.
 */
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    color='neutral'
                    size='small'
                    aria-label='Clear filter'
                    onClick={() => setFiltered(null)}
                  >
                    <FilterX />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove filter</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='Settings'>
                  <Settings />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Change data source</TooltipContent>
            </Tooltip>
          </ChartActions>
        </ChartHeader>
        <BarList max={chartSum(rows)}>
          {rows.map(row => (
            <Tooltip key={row.name}>
              <TooltipTrigger asChild>
                <BarListItem
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
              </TooltipTrigger>
              <TooltipContent>Click to filter</TooltipContent>
            </Tooltip>
          ))}
        </BarList>
      </Chart>
    </div>
  );
};

/**
 * `color` tints the bar with a palette hue at 16% — enough to distinguish the rows while still
 * letting the row's own hover state show through it.
 */
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
              <BarListPercent variant='muted' />
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

/**
 * For a hue the palette does not carry, pass a `bg-*` utility on the bar instead — the
 * explicit class wins the merge against the variant's own fill.
 */
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
              <BarListPercent variant='muted' />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

/**
 * Values that are already percentages: `max={100}`, and the value slot prints the number
 * itself rather than a share derived from it.
 */
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

/**
 * `selected` marks the active row — the hover tint and `aria-current` — and never touches the
 * bar, whose width stays `value / max` whatever is selected.
 */
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
            <Tooltip key={row.name}>
              <TooltipTrigger asChild>
                <BarListItem
                  value={row.value}
                  selected={selected === row.name}
                  onClick={() => setSelected(selected === row.name ? null : row.name)}
                >
                  <BarListBar />
                  <BarListLabel>{row.name}</BarListLabel>
                  <BarListValue>
                    {formatValue(row.value)}
                    <BarListPercent variant='muted' />
                  </BarListValue>
                </BarListItem>
              </TooltipTrigger>
              <TooltipContent>Click to filter</TooltipContent>
            </Tooltip>
          ))}
        </BarList>
      </Chart>
    </div>
  );
};

/**
 * Long labels truncate at the row width. A tooltip on the label needs `pointer-events-auto`,
 * since the row's slots are transparent to the pointer by default.
 */
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
            <Tooltip>
              <TooltipTrigger asChild>
                <BarListLabel className='pointer-events-auto'>{row.name}</BarListLabel>
              </TooltipTrigger>
              <TooltipContent>Example of custom description</TooltipContent>
            </Tooltip>
            <BarListValue>
              {formatValue(row.value)}
              <BarListPercent variant='muted' />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

/**
 * The same labels under `OverflowTooltip`, which shows the full text only when it is actually
 * cut off — the right choice when most labels fit.
 */
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
              <BarListPercent variant='muted' />
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
        <BarListPercent variant='muted' />
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

/**
 * One card, three datasets behind a settings menu: raw counts, percentages and fractions each
 * need their own `max`, so switching the source switches that too.
 */
export const DataVariants: StoryFn<typeof meta> = () => {
  const [key, setKey] = useState<DatasetKey>('values');
  const [menuOpen, setMenuOpen] = useState(false);
  const current = datasets[key];

  return (
    <div className='w-400'>
      <Chart>
        <ChartHeader>
          <ChartTitle>{current.title}</ChartTitle>
          <ChartActions alwaysVisible={menuOpen}>
            <Tooltip disabled={menuOpen}>
              <TooltipTrigger asChild>
                <span className='inline-flex'>
                  <DropdownMenu onOpenChange={setMenuOpen}>
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
                            <span className='flex-1'>{datasets[k].title}</span>
                            <DropdownMenuItemIcon>
                              <Check className={cn(key !== k && 'opacity-0')} />
                            </DropdownMenuItemIcon>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
              </TooltipTrigger>
              <TooltipContent>Change data source</TooltipContent>
            </Tooltip>
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

/**
 * `BarListSkeleton` stands in for the list while data loads, taking a row count so the card
 * holds the height it will end up at.
 */
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

/**
 * A value above `max` caps the bar at full width and the label at 100%, rather than
 * overrunning the row.
 */
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
              <BarListPercent variant='muted' />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

/**
 * `max={0}` is not a division the component will guess at: every row renders empty at 0%, with
 * a single warning in development.
 */
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
              <BarListPercent variant='muted' />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

/**
 * `digits` adds decimal places, for a set of shares too close together to tell apart as whole
 * numbers.
 */
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
              <BarListPercent digits={1} variant='muted' />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

/**
 * The three percent treatments — `split` colours the number and the `%` differently and is the
 * Figma default, `muted` sets both back, `inherit` leaves them to the row.
 */
export const PercentVariants: StoryFn<typeof meta> = () => (
  <div className='flex flex-col gap-16 w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Split — value primary, % secondary (default)</ChartTitle>
      </ChartHeader>
      <BarList max={chartSum(baseRows)}>
        {baseRows.map(row => (
          <BarListItem key={row.name} value={row.value}>
            <BarListBar />
            <BarListLabel>{row.name}</BarListLabel>
            <BarListValue>
              {formatValue(row.value)}
              <BarListPercent variant='split' />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>

    <Chart>
      <ChartHeader>
        <ChartTitle>Muted — both tokens secondary</ChartTitle>
      </ChartHeader>
      <BarList max={chartSum(baseRows)}>
        {baseRows.map(row => (
          <BarListItem key={row.name} value={row.value}>
            <BarListBar />
            <BarListLabel>{row.name}</BarListLabel>
            <BarListValue>
              {formatValue(row.value)}
              <BarListPercent variant='muted' />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>

    <Chart>
      <ChartHeader>
        <ChartTitle>Inherit — follows BarListValue color</ChartTitle>
      </ChartHeader>
      <BarList max={chartSum(baseRows)}>
        {baseRows.map(row => (
          <BarListItem key={row.name} value={row.value}>
            <BarListBar />
            <BarListLabel>{row.name}</BarListLabel>
            <BarListValue>
              {formatValue(row.value)}
              <BarListPercent variant='inherit' />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  </div>
);

import { useMemo, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Check, FilterX, Settings } from '../../../icons';
import { cn } from '../../../utils/cn';
import { Badge, type BadgeColor } from '../../Badge';
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
import { LegendDot } from './LegendDot';
import { PieChart } from './PieChart';
import { PieChartCenter, PieChartCenterLabel, PieChartCenterValue } from './PieChartCenter';
import type { PieChartDatum } from './PieChartContext';
import { PieChartDonut } from './PieChartDonut';
import { PieChartLegend } from './PieChartLegend';
import { PieChartLegendItem } from './PieChartLegendItem';
import { PieChartLegendPercent } from './PieChartLegendPercent';
import { PieChartLegendValue } from './PieChartLegendValue';
import { PieChartSkeleton } from './PieChartSkeleton';

interface Row extends PieChartDatum {
  badgeColor: BadgeColor;
}

const baseRows: Row[] = [
  { name: '4XX', value: 35, color: 'amber', badgeColor: 'amber' },
  { name: '2XX', value: 31, color: 'green', badgeColor: 'green' },
  { name: '5XX', value: 15, color: 'red', badgeColor: 'red' },
  { name: '3XX', value: 18, color: 'blue', badgeColor: 'blue' },
  { name: '1XX', value: 1, color: 'slate', badgeColor: 'slate' },
];

const longLabelRows: Row[] = [
  {
    name: '/api/v1/observability/events/ingestion/batch',
    value: 1240,
    color: 'amber',
    badgeColor: 'amber',
  },
  {
    name: '/api/v1/identity/authentication/sessions/refresh',
    value: 890,
    color: 'green',
    badgeColor: 'green',
  },
  {
    name: '/api/v1/billing/invoices/line-items/detail',
    value: 612,
    color: 'red',
    badgeColor: 'red',
  },
  {
    name: '/api/v1/catalog/products/variants/inventory',
    value: 358,
    color: 'blue',
    badgeColor: 'blue',
  },
  {
    name: '/api/v1/search/federated/suggestions/autocomplete',
    value: 174,
    color: 'slate',
    badgeColor: 'slate',
  },
];

const formatValue = (n: number) => n.toLocaleString('en-US');

const meta = {
  title: 'Data display/SimpleCharts/PieChart',
  component: PieChart,
  subcomponents: {
    PieChartDonut,
    PieChartCenter,
    PieChartCenterValue,
    PieChartCenterLabel,
    PieChartLegend,
    PieChartLegendItem,
    PieChartLegendValue,
    PieChartLegendPercent,
    LegendDot,
    PieChartSkeleton,
  },
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-122167&m=dev',
    },
    docs: {
      description: {
        component:
          'PieChart is a composable donut + legend pair. The root accepts `data` (the single source of truth) and provides ' +
          'context to a recharts-driven `PieChartDonut` and a JSX-composed `PieChartLegend`. Hovering a slice highlights ' +
          'its legend row and vice versa. Click-to-filter and selection are caller-owned — pass `selected` on a legend ' +
          'item and re-render with the filtered data set. For loading, use `PieChartSkeleton`.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PieChart>;

export default meta;

export const Default: StoryFn<typeof meta> = () => {
  const [filtered, setFiltered] = useState<string | null>(null);
  const visibleRows = useMemo(
    () => (filtered ? baseRows.filter(r => r.name === filtered) : baseRows),
    [filtered],
  );
  const total = baseRows.reduce((sum, r) => sum + r.value, 0);
  const visibleTotal = visibleRows.reduce((sum, r) => sum + r.value, 0);

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
        <PieChart data={visibleRows} total={visibleTotal}>
          <PieChartDonut>
            <PieChartCenter>
              <PieChartCenterValue formatHoveredValue={d => formatValue(d.value)}>
                {formatValue(filtered ? visibleTotal : total)}
              </PieChartCenterValue>
              <PieChartCenterLabel
                className='whitespace-nowrap'
                pluralize={{ one: 'request', other: 'requests' }}
              />
            </PieChartCenter>
          </PieChartDonut>
          <PieChartLegend>
            {visibleRows.map(row => (
              <Tooltip key={row.name}>
                <TooltipTrigger asChild>
                  <PieChartLegendItem
                    name={row.name}
                    selected={filtered === row.name}
                    onClick={() => setFiltered(filtered === row.name ? null : row.name)}
                  >
                    <Badge color={row.badgeColor} type='secondary' textVariant='code'>
                      {row.name}
                    </Badge>
                    <PieChartLegendValue>
                      {formatValue(row.value)}
                      <LegendDot />
                      <PieChartLegendPercent />
                    </PieChartLegendValue>
                  </PieChartLegendItem>
                </TooltipTrigger>
                <TooltipContent>
                  {filtered === row.name ? 'Click to remove filter' : 'Click to filter'}
                </TooltipContent>
              </Tooltip>
            ))}
          </PieChartLegend>
        </PieChart>
      </Chart>
    </div>
  );
};

export const Selectable: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(['4XX']));
  const total = baseRows.reduce((sum, r) => sum + r.value, 0);
  const selectedNames = useMemo(() => Array.from(selected), [selected]);

  const toggle = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className='w-400'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Top 5 Endpoints</ChartTitle>
          <ChartActions alwaysVisible={selected.size > 0}>
            {selected.size > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    color='neutral'
                    size='small'
                    aria-label='Clear selection'
                    onClick={() => setSelected(new Set())}
                  >
                    <FilterX />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear selection</TooltipContent>
              </Tooltip>
            )}
          </ChartActions>
        </ChartHeader>
        <PieChart data={baseRows} total={total} selectedNames={selectedNames}>
          <PieChartDonut>
            <PieChartCenter>
              <PieChartCenterValue>{formatValue(total)}</PieChartCenterValue>
              <PieChartCenterLabel className='whitespace-nowrap'>requests</PieChartCenterLabel>
            </PieChartCenter>
          </PieChartDonut>
          <PieChartLegend>
            {baseRows.map(row => (
              <Tooltip key={row.name}>
                <TooltipTrigger asChild>
                  <PieChartLegendItem name={row.name} onClick={() => toggle(row.name)}>
                    <Badge color={row.badgeColor} type='secondary' textVariant='code'>
                      {row.name}
                    </Badge>
                    <PieChartLegendValue>
                      {formatValue(row.value)}
                      <LegendDot />
                      <PieChartLegendPercent />
                    </PieChartLegendValue>
                  </PieChartLegendItem>
                </TooltipTrigger>
                <TooltipContent>
                  {selected.has(row.name) ? 'Click to deselect' : 'Click to select'}
                </TooltipContent>
              </Tooltip>
            ))}
          </PieChartLegend>
        </PieChart>
      </Chart>
    </div>
  );
};

export const TruncatedLabels: StoryFn<typeof meta> = () => {
  const total = longLabelRows.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className='w-400'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Top 5 Endpoints</ChartTitle>
        </ChartHeader>
        <PieChart data={longLabelRows} total={total}>
          <PieChartDonut>
            <PieChartCenter>
              <PieChartCenterValue>{formatValue(total)}</PieChartCenterValue>
              <PieChartCenterLabel className='whitespace-nowrap'>requests</PieChartCenterLabel>
            </PieChartCenter>
          </PieChartDonut>
          <PieChartLegend>
            {longLabelRows.map(row => (
              <PieChartLegendItem key={row.name} name={row.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='min-w-0 flex-1 truncate text-xs font-mono text-text-primary pointer-events-auto'>
                      {row.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{row.name}</TooltipContent>
                </Tooltip>
                <PieChartLegendValue>
                  {formatValue(row.value)}
                  <LegendDot />
                  <PieChartLegendPercent />
                </PieChartLegendValue>
              </PieChartLegendItem>
            ))}
          </PieChartLegend>
        </PieChart>
      </Chart>
    </div>
  );
};

export const TruncatedLabelsWithTooltip: StoryFn<typeof meta> = () => {
  const total = longLabelRows.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className='w-400'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Top 5 Endpoints</ChartTitle>
        </ChartHeader>
        <PieChart data={longLabelRows} total={total}>
          <PieChartDonut>
            <PieChartCenter>
              <PieChartCenterValue>{formatValue(total)}</PieChartCenterValue>
              <PieChartCenterLabel className='whitespace-nowrap'>requests</PieChartCenterLabel>
            </PieChartCenter>
          </PieChartDonut>
          <PieChartLegend>
            {longLabelRows.map(row => (
              <PieChartLegendItem key={row.name} name={row.name}>
                <OverflowTooltip>
                  <OverflowTooltipTrigger>
                    <span className='min-w-0 flex-1 truncate text-xs font-mono text-text-primary pointer-events-auto'>
                      {row.name}
                    </span>
                  </OverflowTooltipTrigger>
                  <OverflowTooltipContent>{row.name}</OverflowTooltipContent>
                </OverflowTooltip>
                <PieChartLegendValue>
                  {formatValue(row.value)}
                  <LegendDot />
                  <PieChartLegendPercent />
                </PieChartLegendValue>
              </PieChartLegendItem>
            ))}
          </PieChartLegend>
        </PieChart>
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
      <PieChartSkeleton rows={5} />
    </Chart>
  </div>
);

export const SingleSlice: StoryFn<typeof meta> = () => {
  const data: Row[] = [{ name: '5XX', value: 23, color: 'red', badgeColor: 'red' }];
  return (
    <div className='w-400'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Top 5 Endpoints</ChartTitle>
        </ChartHeader>
        <PieChart data={data}>
          <PieChartDonut>
            <PieChartCenter>
              <PieChartCenterValue>23</PieChartCenterValue>
              <PieChartCenterLabel className='whitespace-nowrap'>requests</PieChartCenterLabel>
            </PieChartCenter>
          </PieChartDonut>
          <PieChartLegend>
            {data.map(row => (
              <PieChartLegendItem key={row.name} name={row.name} selected>
                <Badge color={row.badgeColor} type='secondary' textVariant='code'>
                  {row.name}
                </Badge>
                <PieChartLegendValue>
                  {formatValue(row.value)}
                  <LegendDot />
                  <PieChartLegendPercent />
                </PieChartLegendValue>
              </PieChartLegendItem>
            ))}
          </PieChartLegend>
        </PieChart>
      </Chart>
    </div>
  );
};

export const TwoSlices: StoryFn<typeof meta> = () => {
  const data: Row[] = [
    { name: 'Success', value: 78, color: 'green', badgeColor: 'green' },
    { name: 'Errors', value: 22, color: 'red', badgeColor: 'red' },
  ];
  return (
    <div className='w-400'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Response status — values only</ChartTitle>
        </ChartHeader>
        <PieChart data={data} total={100}>
          <PieChartDonut>
            <PieChartCenter>
              <PieChartCenterValue>100</PieChartCenterValue>
              <PieChartCenterLabel className='whitespace-nowrap'>requests</PieChartCenterLabel>
            </PieChartCenter>
          </PieChartDonut>
          <PieChartLegend>
            {data.map(row => (
              <PieChartLegendItem key={row.name} name={row.name}>
                <Badge color={row.badgeColor} type='secondary' textVariant='code'>
                  {row.name}
                </Badge>
                <PieChartLegendValue>{formatValue(row.value)}</PieChartLegendValue>
              </PieChartLegendItem>
            ))}
          </PieChartLegend>
        </PieChart>
      </Chart>
    </div>
  );
};

interface CustomRow {
  name: string;
  value: number;
  fillClass: string;
  badgeColor: BadgeColor;
}

const customRows: CustomRow[] = [
  { name: '4XX', value: 35, fillClass: 'fill-violet-500', badgeColor: 'violet' },
  { name: '2XX', value: 30, fillClass: 'fill-emerald-500', badgeColor: 'emerald' },
  { name: '5XX', value: 15, fillClass: 'fill-sky-500', badgeColor: 'sky' },
  { name: '3XX', value: 12, fillClass: 'fill-yellow-500', badgeColor: 'yellow' },
  { name: '1XX', value: 8, fillClass: 'fill-fuchsia-500', badgeColor: 'fuchsia' },
];

export const CustomColors: StoryFn<typeof meta> = () => {
  const data: PieChartDatum[] = customRows.map(r => ({
    name: r.name,
    value: r.value,
    className: r.fillClass,
  }));
  const total = customRows.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className='w-400'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Top 5 Endpoints (custom palette)</ChartTitle>
        </ChartHeader>
        <PieChart data={data} total={total}>
          <PieChartDonut>
            <PieChartCenter>
              <PieChartCenterValue>{formatValue(total)}</PieChartCenterValue>
              <PieChartCenterLabel className='whitespace-nowrap'>requests</PieChartCenterLabel>
            </PieChartCenter>
          </PieChartDonut>
          <PieChartLegend>
            {customRows.map(row => (
              <PieChartLegendItem key={row.name} name={row.name}>
                <Badge color={row.badgeColor} type='secondary' textVariant='code'>
                  {row.name}
                </Badge>
                <PieChartLegendValue>
                  {formatValue(row.value)}
                  <LegendDot />
                  <PieChartLegendPercent />
                </PieChartLegendValue>
              </PieChartLegendItem>
            ))}
          </PieChartLegend>
        </PieChart>
      </Chart>
    </div>
  );
};

export const ZeroTotal: StoryFn<typeof meta> = () => {
  const data: Row[] = baseRows.map(r => ({ ...r, value: 0 }));
  return (
    <div className='w-400'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Top 5 Endpoints (no traffic)</ChartTitle>
        </ChartHeader>
        <PieChart data={data}>
          <PieChartDonut>
            <PieChartCenter>
              <PieChartCenterValue>0</PieChartCenterValue>
              <PieChartCenterLabel className='whitespace-nowrap'>requests</PieChartCenterLabel>
            </PieChartCenter>
          </PieChartDonut>
          <PieChartLegend>
            {data.map(row => (
              <PieChartLegendItem key={row.name} name={row.name}>
                <Badge color={row.badgeColor} type='secondary' textVariant='code'>
                  {row.name}
                </Badge>
                <PieChartLegendValue>
                  {formatValue(row.value)}
                  <LegendDot />
                  <PieChartLegendPercent />
                </PieChartLegendValue>
              </PieChartLegendItem>
            ))}
          </PieChartLegend>
        </PieChart>
      </Chart>
    </div>
  );
};

type WidthKey = 'narrow' | 'default' | 'wide';

const widthOptions: Record<WidthKey, { title: string; className: string }> = {
  narrow: { title: 'Narrow — 280px', className: 'w-280' },
  default: { title: 'Default — 400px', className: 'w-400' },
  wide: { title: 'Wide — 560px', className: 'w-560' },
};

export const WidthVariants: StoryFn<typeof meta> = () => {
  const [key, setKey] = useState<WidthKey>('wide');
  const [menuOpen, setMenuOpen] = useState(false);
  const current = widthOptions[key];
  const total = baseRows.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className={current.className}>
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
                      <DropdownMenuLabel>Container width</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        {(Object.keys(widthOptions) as WidthKey[]).map(k => (
                          <DropdownMenuItem key={k} onSelect={() => setKey(k)}>
                            <span className='flex-1'>{widthOptions[k].title}</span>
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
              <TooltipContent>Change container width</TooltipContent>
            </Tooltip>
          </ChartActions>
        </ChartHeader>
        <PieChart data={baseRows} total={total}>
          <PieChartDonut>
            <PieChartCenter>
              <PieChartCenterValue>{formatValue(total)}</PieChartCenterValue>
              <PieChartCenterLabel className='whitespace-nowrap'>requests</PieChartCenterLabel>
            </PieChartCenter>
          </PieChartDonut>
          <PieChartLegend>
            {baseRows.map(row => (
              <PieChartLegendItem key={row.name} name={row.name}>
                <Badge color={row.badgeColor} type='secondary' textVariant='code'>
                  {row.name}
                </Badge>
                <PieChartLegendValue>
                  {formatValue(row.value)}
                  <LegendDot />
                  <PieChartLegendPercent />
                </PieChartLegendValue>
              </PieChartLegendItem>
            ))}
          </PieChartLegend>
        </PieChart>
      </Chart>
    </div>
  );
};

export const PercentVariants: StoryFn<typeof meta> = () => {
  const total = baseRows.reduce((sum, r) => sum + r.value, 0);

  const renderChart = (variant: 'split' | 'muted' | 'inherit', title: string) => (
    <Chart>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
      </ChartHeader>
      <PieChart data={baseRows} total={total}>
        <PieChartDonut>
          <PieChartCenter>
            <PieChartCenterValue>{formatValue(total)}</PieChartCenterValue>
            <PieChartCenterLabel className='whitespace-nowrap'>requests</PieChartCenterLabel>
          </PieChartCenter>
        </PieChartDonut>
        <PieChartLegend>
          {baseRows.map(row => (
            <PieChartLegendItem key={row.name} name={row.name}>
              <Badge color={row.badgeColor} type='secondary' textVariant='code'>
                {row.name}
              </Badge>
              <PieChartLegendValue>
                {formatValue(row.value)}
                <LegendDot />
                <PieChartLegendPercent variant={variant} />
              </PieChartLegendValue>
            </PieChartLegendItem>
          ))}
        </PieChartLegend>
      </PieChart>
    </Chart>
  );

  return (
    <div className='flex flex-col gap-16 w-400'>
      {renderChart('split', 'Split — value primary, % secondary (default)')}
      {renderChart('muted', 'Muted — both tokens secondary')}
      {renderChart('inherit', 'Inherit — follows PieChartLegendValue color')}
    </div>
  );
};

const PALETTE: ChartColor[] = [
  'brand',
  'blue',
  'green',
  'red',
  'amber',
  'purple',
  'slate',
  'teal',
  'cyan',
  'indigo',
  'pink',
  'rose',
];

export const Palette: StoryFn<typeof meta> = () => {
  const data: PieChartDatum[] = PALETTE.slice(0, 6).map((color, i) => ({
    name: color,
    value: 10 + i,
    color,
  }));
  const total = data.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className='w-400'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Built-in palette — percents only</ChartTitle>
        </ChartHeader>
        <PieChart data={data} total={total}>
          <PieChartDonut>
            <PieChartCenter>
              <PieChartCenterValue>{formatValue(total)}</PieChartCenterValue>
              <PieChartCenterLabel>total</PieChartCenterLabel>
            </PieChartCenter>
          </PieChartDonut>
          <PieChartLegend>
            {data.map(row => (
              <PieChartLegendItem key={row.name} name={row.name}>
                <span className='inline-flex items-center gap-6 text-xs font-mono text-text-primary capitalize'>
                  <span
                    aria-hidden
                    className='inline-block size-8 rounded-2'
                    style={{
                      backgroundColor: `var(--color-${row.color === 'slate' ? 'badge-slate-dark-alt' : row.color === 'brand' ? 'w-orange-500' : `${row.color}-500`})`,
                    }}
                  />
                  {row.name}
                </span>
                <PieChartLegendValue>
                  <PieChartLegendPercent />
                </PieChartLegendValue>
              </PieChartLegendItem>
            ))}
          </PieChartLegend>
        </PieChart>
      </Chart>
    </div>
  );
};

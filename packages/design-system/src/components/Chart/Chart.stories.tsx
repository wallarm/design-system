import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ChartBarList, ChartBarListSkeleton } from './BarList';
import { Chart } from './Chart';
import { ChartHeader } from './ChartHeader';
import { ChartLine, ChartLineSkeleton } from './Line';
import { ChartPie, ChartPieSkeleton } from './Pie';
import type { ChartBarListDataItem, ChartPieDataItem } from './types';

const meta = {
  title: 'Data Display/Chart',
  component: Chart,
  subcomponents: {
    ChartHeader,
    ChartBarList,
    ChartPie,
    ChartLine,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Chart compound component for visualizing data. ' +
          'Supports bar charts, pie charts, and line charts. ' +
          'Use compound components: Chart, ChartHeader, ChartBarList, ChartPie, ChartLine.',
      },
    },
  },
} satisfies Meta<typeof Chart>;

export default meta;

// ── Bar Chart ─────────────────────────────────────────────

const barChartData: ChartBarListDataItem[] = [
  { name: '/api/v1/users', value: 12543 },
  { name: '/api/v1/attacks', value: 8721 },
  { name: '/api/v1/nodes', value: 5432 },
  { name: '/api/v1/events', value: 3210 },
  { name: '/api/v1/rules', value: 1876 },
];

export const BarChart_Default: StoryFn<typeof Chart> = () => (
  <Chart className='w-[400px] h-[196px]'>
    <ChartHeader title='Top Endpoints' />
    <ChartBarList data={barChartData} valueFormatter={v => v.toLocaleString()} />
  </Chart>
);

export const BarChart_Interactive: StoryFn<typeof Chart> = () => {
  const [filtered, setFiltered] = useState<string | undefined>();

  return (
    <Chart className='w-[400px] h-[196px]'>
      <ChartHeader
        title='Top Endpoints'
        filterLabel={filtered ? 'Remove filter' : undefined}
        onRemoveFilter={() => setFiltered(undefined)}
      />
      <ChartBarList
        data={barChartData}
        valueFormatter={v => v.toLocaleString()}
        onItemClick={item => setFiltered(item.name)}
        filteredItem={filtered}
      />
    </Chart>
  );
};

const barChartColoredData: ChartBarListDataItem[] = [
  { name: 'SQLi', value: 4521, color: 'red' },
  { name: 'XSS', value: 3287, color: 'amber' },
  { name: 'RCE', value: 1543, color: 'purple' },
  { name: 'Path Traversal', value: 987, color: 'blue' },
  { name: 'SSRF', value: 432, color: 'teal' },
];

export const BarChart_Colored: StoryFn<typeof Chart> = () => (
  <Chart className='w-[400px] h-[196px]'>
    <ChartHeader title='Attack Types' />
    <ChartBarList data={barChartColoredData} valueFormatter={v => v.toLocaleString()} />
  </Chart>
);

export const BarChart_Loading: StoryFn<typeof Chart> = () => (
  <Chart className='w-[400px] h-[196px]'>
    <ChartHeader title='Top Endpoints' />
    <ChartBarListSkeleton />
  </Chart>
);

// ── Pie Chart ─────────────────────────────────────────────

const pieChartData: ChartPieDataItem[] = [
  { name: '2XX', value: 45231, color: 'green' },
  { name: '3XX', value: 12083, color: 'blue' },
  { name: '4XX', value: 8721, color: 'amber' },
  { name: '5XX', value: 2341, color: 'red' },
];

export const PieChart_Default: StoryFn<typeof Chart> = () => (
  <Chart className='w-[400px] h-[196px]'>
    <ChartHeader title='Response Codes' />
    <ChartPie
      data={pieChartData}
      centerValue='68K'
      centerLabel='Total'
      valueFormatter={v => v.toLocaleString()}
    />
  </Chart>
);

export const PieChart_Interactive: StoryFn<typeof Chart> = () => {
  const [filtered, setFiltered] = useState<string | undefined>();

  return (
    <Chart className='w-[400px] h-[196px]'>
      <ChartHeader
        title='Response Codes'
        filterLabel={filtered ? 'Remove filter' : undefined}
        onRemoveFilter={() => setFiltered(undefined)}
      />
      <ChartPie
        data={pieChartData}
        centerValue='68K'
        centerLabel='Total'
        valueFormatter={v => v.toLocaleString()}
        onItemClick={item => setFiltered(item.name)}
        filteredItem={filtered}
      />
    </Chart>
  );
};

export const PieChart_Loading: StoryFn<typeof Chart> = () => (
  <Chart className='w-[400px] h-[196px]'>
    <ChartHeader title='Response Codes' />
    <ChartPieSkeleton />
  </Chart>
);

// ── Line Chart ────────────────────────────────────────────

const lineChartData = [
  { date: 'Jan 01', requests: 4200 },
  { date: 'Jan 02', requests: 3800 },
  { date: 'Jan 03', requests: 5100 },
  { date: 'Jan 04', requests: 4700 },
  { date: 'Jan 05', requests: 6200 },
  { date: 'Jan 06', requests: 5800 },
  { date: 'Jan 07', requests: 7100 },
  { date: 'Jan 08', requests: 6500 },
  { date: 'Jan 09', requests: 7800 },
  { date: 'Jan 10', requests: 7200 },
  { date: 'Jan 11', requests: 8100 },
  { date: 'Jan 12', requests: 7500 },
];

export const LineChart_Single: StoryFn<typeof Chart> = () => (
  <Chart className='w-[560px]'>
    <ChartHeader title='Request Volume' />
    <ChartLine
      data={lineChartData}
      series={[{ dataKey: 'requests', name: 'Requests', color: 'brand' }]}
      xAxisDataKey='date'
      yAxisFormatter={v => `${(v / 1000).toFixed(0)}K`}
      height={240}
    />
  </Chart>
);

const lineChartMultiData = [
  { date: 'Jan 01', attacks: 120, blocked: 118, passed: 25 },
  { date: 'Jan 02', attacks: 95, blocked: 93, passed: 125 },
  { date: 'Jan 03', attacks: 210, blocked: 280, passed: 12 },
  { date: 'Jan 04', attacks: 180, blocked: 178, passed: 2 },
  { date: 'Jan 05', attacks: 340, blocked: 124, passed: 52 },
  { date: 'Jan 06', attacks: 280, blocked: 195, passed: 451 },
  { date: 'Jan 07', attacks: 150, blocked: 148, passed: 224 },
  { date: 'Jan 08', attacks: 420, blocked: 214, passed: 54 },
  { date: 'Jan 09', attacks: 380, blocked: 374, passed: 61 },
  { date: 'Jan 10', attacks: 290, blocked: 287, passed: 3 },
  { date: 'Jan 11', attacks: 350, blocked: 632, passed: 4 },
  { date: 'Jan 12', attacks: 310, blocked: 124, passed: 4 },
];

export const LineChart_Multi: StoryFn<typeof Chart> = () => (
  <Chart className='w-[560px]'>
    <ChartHeader title='Attack Detection' />
    <ChartLine
      data={lineChartMultiData}
      series={[
        { dataKey: 'attacks', name: 'Total Attacks', color: 'red' },
        { dataKey: 'blocked', name: 'Blocked', color: 'green' },
        { dataKey: 'passed', name: 'Passed', color: 'amber' },
      ]}
      xAxisDataKey='date'
      height={240}
    />
  </Chart>
);

export const LineChart_Zoom: StoryFn<typeof Chart> = () => {
  const [zoomRange, setZoomRange] = useState<{ start: string; end: string } | null>(null);

  const filteredData = zoomRange
    ? lineChartData.filter(d => {
        const keys = lineChartData.map(item => item.date);
        const startIdx = keys.indexOf(zoomRange.start);
        const endIdx = keys.indexOf(zoomRange.end);
        const idx = keys.indexOf(d.date);
        return idx >= Math.min(startIdx, endIdx) && idx <= Math.max(startIdx, endIdx);
      })
    : lineChartData;

  return (
    <Chart className='w-[560px]'>
      <ChartHeader
        title='Request Volume (drag to zoom)'
        filterLabel={zoomRange ? 'Reset zoom' : undefined}
        onRemoveFilter={() => setZoomRange(null)}
      />
      <ChartLine
        data={filteredData}
        series={[{ dataKey: 'requests', name: 'Requests', color: 'brand' }]}
        xAxisDataKey='date'
        yAxisFormatter={v => `${(v / 1000).toFixed(0)}K`}
        height={240}
        onZoomIn={setZoomRange}
      />
    </Chart>
  );
};

export const LineChart_Loading: StoryFn<typeof Chart> = () => (
  <Chart className='w-[560px]'>
    <ChartHeader title='Request Volume' />
    <ChartLineSkeleton height={200} />
  </Chart>
);

export const LineChart_LoadingMulti: StoryFn<typeof Chart> = () => (
  <Chart className='w-[560px]'>
    <ChartHeader title='Attack Detection' />
    <ChartLineSkeleton height={200} showLegend />
  </Chart>
);

// ── Composition (Dashboard) ──────────────────────────────

export const Composition: StoryFn<typeof Chart> = () => (
  <div className='grid w-[860px] grid-cols-2 gap-16'>
    <Chart>
      <ChartHeader title='Top Endpoints' />
      <ChartBarList data={barChartData.slice(0, 4)} valueFormatter={v => v.toLocaleString()} />
    </Chart>
    <Chart>
      <ChartHeader title='Response Codes' />
      <ChartPie
        data={pieChartData}
        centerValue='68K'
        centerLabel='Total'
        valueFormatter={v => v.toLocaleString()}
      />
    </Chart>
    <Chart className='col-span-2'>
      <ChartHeader title='Request Volume' />
      <ChartLine
        data={lineChartData}
        series={[{ dataKey: 'requests', name: 'Requests', color: 'brand' }]}
        xAxisDataKey='date'
        yAxisFormatter={v => `${(v / 1000).toFixed(0)}K`}
        height={200}
      />
    </Chart>
  </div>
);

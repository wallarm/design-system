import { cloneElement, isValidElement, type ReactNode } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import * as actualRecharts from 'recharts' with { rstest: 'importActual' };
import { resolveChartColor } from '../lib/chartPalette';
import { LineChart } from './LineChart';
import { LineChartBody } from './LineChartBody';
import { LineChartHoverPopoverRow } from './LineChartHoverPopoverRow';
import { LineChartLine } from './LineChartLine';
import { LineChartRange } from './LineChartRange';
import { LineChartXAxis } from './LineChartXAxis';
import { buildTooltipRows } from './lib/buildTooltipRows';

// jsdom has no layout, so recharts' ResponsiveContainer measures 0 and renders nothing.
// Swap it for a fixed-size passthrough so the chart (and its scale/plot area) mounts.
rs.mock('recharts', () => ({
  ...actualRecharts,
  ResponsiveContainer: ({ children }: { children?: ReactNode }) =>
    isValidElement<{ width?: number; height?: number }>(children)
      ? cloneElement(children, { width: 800, height: 160 })
      : null,
}));

const data = [0, 5, 10, 15, 20, 25, 30].map(t => ({ t, attacks: t * 2, usual: 10 }));
const series = [
  { key: 'attacks', label: 'Attacks' },
  { key: 'usual', label: 'Usual', variant: 'dashed' as const },
];

const Chart = ({ testId, filteredKeys }: { testId: string; filteredKeys?: string[] }) => (
  <LineChart data-testid={testId} data={data} series={series} xKey='t' filteredKeys={filteredKeys}>
    <LineChartBody>
      <LineChartXAxis />
      <LineChartRange from={10} to={20} seriesKey='attacks' />
      <LineChartLine seriesKey='attacks' disableAnimation />
      <LineChartLine seriesKey='usual' disableAnimation />
    </LineChartBody>
  </LineChart>
);

const clipIdOf = (element: Element): string | undefined =>
  element.getAttribute('clip-path')?.match(/^url\(#(.+)\)$/)?.[1];

describe('LineChartLine — in-range copy', () => {
  it('renders a danger copy of the targeted series clipped to the range', () => {
    const { container } = render(<Chart testId='lc' />);
    const copy = screen.getByTestId('lc--line-in-range');
    expect(copy).toHaveAttribute('data-key', 'attacks');
    expect(copy).toHaveAttribute('stroke', 'var(--color-bg-fill-danger)');
    const clipId = clipIdOf(copy);
    expect(clipId).toBeTruthy();
    expect(container.querySelector(`clipPath[id="${clipId}"] rect`)).not.toBeNull();
    expect(screen.getAllByTestId('lc--line-in-range')).toHaveLength(1);
  });

  it('draws no copy for a filtered-out series but keeps the range', () => {
    render(<Chart testId='lc' filteredKeys={['attacks']} />);
    expect(screen.queryByTestId('lc--line-in-range')).toBeNull();
    expect(screen.getByTestId('lc--range')).toBeInTheDocument();
  });

  it('gives each chart its own clipPath id', () => {
    render(
      <>
        <Chart testId='a' />
        <Chart testId='b' />
      </>,
    );
    const a = clipIdOf(screen.getByTestId('a--line-in-range'));
    const b = clipIdOf(screen.getByTestId('b--line-in-range'));
    expect(a).toBeTruthy();
    expect(a).not.toBe(b);
  });
});

describe('buildTooltipRows', () => {
  const ranges = [{ key: 'r', from: 10, to: 20, seriesKey: 'attacks' }];
  const xs = data.map(d => d.t);

  it('marks only the targeted series row inside a range', () => {
    const rows = buildTooltipRows({ datum: data[3]!, series, ranges, xKey: 't', xs });
    expect(rows.map(r => [r.series.key, r.value, r.inRange])).toEqual([
      ['attacks', 30, true],
      ['usual', 10, false],
    ]);
  });

  it('marks nothing outside every range or for ranges without seriesKey', () => {
    expect(
      buildTooltipRows({ datum: data[5]!, series, ranges, xKey: 't', xs }).map(r => r.inRange),
    ).toEqual([false, false]);
    expect(
      buildTooltipRows({
        datum: data[3]!,
        series,
        ranges: [{ key: 'r', from: 10, to: 20 }],
        xKey: 't',
        xs,
      }).map(r => r.inRange),
    ).toEqual([false, false]);
  });
});

describe('LineChartHoverPopoverRow — color override', () => {
  it('paints the dot with the override instead of the series colour', () => {
    const { container } = render(
      <LineChartHoverPopoverRow series={series[0]!} value={1} color='red' />,
    );
    const dot = container.querySelector<HTMLElement>('[data-slot="chart-hover-card-dot"]');
    expect(dot?.style.backgroundColor).toBe(resolveChartColor('red'));
  });
});

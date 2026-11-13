import { cloneElement, isValidElement, type ReactNode } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import * as actualRecharts from 'recharts' with { rstest: 'importActual' };
import { resolveChartColor } from '../lib/chartPalette';
import { LINE_STROKE_WIDTH } from './constants';
import { LineChart } from './LineChart';
import { LineChartBody } from './LineChartBody';
import { LineChartHoverPopoverRow } from './LineChartHoverPopoverRow';
import { LineChartLine } from './LineChartLine';
import { LineChartRange } from './LineChartRange';
import { LineChartTooltip } from './LineChartTooltip';
import { LineChartXAxis } from './LineChartXAxis';
import { buildTooltipRows } from './lib/buildTooltipRows';

// Datum the mocked recharts Tooltip treats as hovered.
let hoveredDatum: Record<string, unknown> | undefined;

// jsdom has no layout, so recharts' ResponsiveContainer measures 0 and renders nothing.
// Swap it for a fixed-size passthrough so the chart (and its scale/plot area) mounts.
// jsdom also has no pointer, so Tooltip renders its content as if `hoveredDatum` were hovered.
rs.mock('recharts', () => ({
  ...actualRecharts,
  Tooltip: ({
    content,
  }: {
    content: (props: { active: boolean; payload: unknown[] }) => ReactNode;
  }) => (hoveredDatum ? content({ active: true, payload: [{ payload: hoveredDatum }] }) : null),
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

const Chart = ({
  testId,
  filteredKeys,
  ranges = <LineChartRange from={10} to={20} seriesKey='attacks' />,
  onLineClick,
}: {
  testId: string;
  filteredKeys?: string[];
  ranges?: ReactNode;
  onLineClick?: () => void;
}) => (
  <LineChart data-testid={testId} data={data} series={series} xKey='t' filteredKeys={filteredKeys}>
    <LineChartBody>
      <LineChartXAxis />
      {ranges}
      <LineChartLine seriesKey='attacks' disableAnimation onClick={onLineClick} />
      <LineChartLine seriesKey='usual' disableAnimation />
      <LineChartTooltip />
    </LineChartBody>
  </LineChart>
);

const clipIdOf = (element: Element): string | undefined =>
  element.getAttribute('clip-path')?.match(/^url\(#(.+)\)$/)?.[1];

// [x1, x2] of every rect in the clipPath an element points at.
const clipRectsOf = (container: Element, element: Element) =>
  [...container.querySelectorAll(`clipPath[id="${clipIdOf(element)}"] rect`)].map(r => [
    Number(r.getAttribute('x')),
    Number(r.getAttribute('x')) + Number(r.getAttribute('width')),
  ]);

const attacksBase = () =>
  screen.getAllByTestId('lc--line').find(el => el.getAttribute('data-key') === 'attacks')!;

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

  it('clips the base line to the outside of the range', () => {
    const { container } = render(<Chart testId='lc' />);
    const [base] = screen
      .getAllByTestId('lc--line')
      .filter(el => el.getAttribute('data-key') === 'attacks');
    const baseClip = clipIdOf(base!);
    const copyClip = clipIdOf(screen.getByTestId('lc--line-in-range'));
    expect(baseClip).toBeTruthy();
    expect(baseClip).not.toBe(copyClip);
    const xsOf = (id: string | undefined) =>
      [...container.querySelectorAll(`clipPath[id="${id}"] rect`)].map(r => [
        Number(r.getAttribute('x')),
        Number(r.getAttribute('x')) + Number(r.getAttribute('width')),
      ]);
    const [[inX1, inX2]] = xsOf(copyClip) as [[number, number]];
    const outside = xsOf(baseClip);
    // The outside rects end and resume exactly at the range edges.
    const near = (a: number | undefined, b: number) => Math.abs((a ?? Number.NaN) - b) < 1e-6;
    expect(outside.some(([, x2]) => near(x2, inX1))).toBe(true);
    expect(outside.some(([x1]) => near(x1, inX2))).toBe(true);
    // The other series is not clipped at all.
    const [usual] = screen
      .getAllByTestId('lc--line')
      .filter(el => el.getAttribute('data-key') === 'usual');
    expect(usual).not.toHaveAttribute('clip-path', expect.stringContaining('url(#'));
  });

  it('fires the consumer onClick from the in-range copy', () => {
    const onLineClick = rs.fn();
    render(<Chart testId='lc' onLineClick={onLineClick} />);
    fireEvent.click(screen.getByTestId('lc--line-in-range'));
    expect(onLineClick).toHaveBeenCalledTimes(1);
  });

  it('merges overlapping ranges into one gap in the base clip', () => {
    const { container } = render(
      <Chart
        testId='lc'
        ranges={
          <>
            <LineChartRange from={5} to={15} seriesKey='attacks' />
            <LineChartRange from={10} to={25} seriesKey='attacks' />
          </>
        }
      />,
    );
    const inside = clipRectsOf(container, screen.getByTestId('lc--line-in-range'));
    expect(inside).toHaveLength(2);
    const start = Math.min(...inside.map(([x1]) => x1!));
    const end = Math.max(...inside.map(([, x2]) => x2!));
    const outside = clipRectsOf(container, attacksBase());
    expect(outside).toHaveLength(2);
    expect(outside[0]![1]).toBeCloseTo(start);
    expect(outside[1]![0]).toBeCloseTo(end);
  });

  it('pushes clamped edges past the plot by the stroke width', () => {
    const { container } = render(
      <Chart testId='lc' ranges={<LineChartRange from={0} seriesKey='attacks' />} />,
    );
    const fill = screen.getByTestId('lc--range').querySelector('rect')!;
    const plotLeft = Number(fill.getAttribute('x'));
    const plotRight = plotLeft + Number(fill.getAttribute('width'));
    const [[x1, x2]] = clipRectsOf(container, screen.getByTestId('lc--line-in-range')) as [
      [number, number],
    ];
    expect(x1).toBeCloseTo(plotLeft - LINE_STROKE_WIDTH);
    expect(x2).toBeCloseTo(plotRight + LINE_STROKE_WIDTH);
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
    render(
      <LineChartHoverPopoverRow data-testid='row' series={series[0]!} value={1} color='red' />,
    );
    expect(screen.getByTestId('row--dot').style.backgroundColor).toBe(resolveChartColor('red'));
  });
});

describe('LineChartTooltip — in-range rows', () => {
  const dotColorOf = (key: string) => {
    const row = screen
      .getAllByTestId('lc--hover-popover-row')
      .find(el => el.getAttribute('data-key') === key);
    return screen.getAllByTestId('lc--hover-popover-row--dot').find(dot => row?.contains(dot))
      ?.style.backgroundColor;
  };

  it('paints only the in-range series dot red in the default popover', () => {
    hoveredDatum = data[3];
    try {
      render(<Chart testId='lc' />);
      expect(dotColorOf('attacks')).toBe(resolveChartColor('red'));
      expect(dotColorOf('usual')).not.toBe(resolveChartColor('red'));
    } finally {
      hoveredDatum = undefined;
    }
  });

  it('keeps the series colour outside the range', () => {
    hoveredDatum = data[5];
    try {
      render(<Chart testId='lc' />);
      expect(dotColorOf('attacks')).toBe(resolveChartColor('slate'));
    } finally {
      hoveredDatum = undefined;
    }
  });
});

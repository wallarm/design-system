import { cloneElement, isValidElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import * as actualRecharts from 'recharts' with { rstest: 'importActual' };
import { LineChart } from './LineChart';
import { LineChartBody } from './LineChartBody';
import { LineChartLine } from './LineChartLine';
import { LineChartRange, type LineChartRangeProps } from './LineChartRange';
import { LineChartXAxis } from './LineChartXAxis';
import * as actualWarn from './lib/warn' with { rstest: 'importActual' };
import { warnLineChartRange } from './lib/warn';

// `lib/warn` binds `console.warn` at import time (keeps the caller's stack frame), so a
// `console.warn` spy cannot see it — mock the helper instead.
rs.mock('./lib/warn', () => ({ ...actualWarn, warnLineChartRange: rs.fn() }));

// jsdom has no layout, so recharts' ResponsiveContainer measures 0 and renders nothing.
// Swap it for a fixed-size passthrough so the chart (and its scale/plot area) mounts.
rs.mock('recharts', () => ({
  ...actualRecharts,
  ResponsiveContainer: ({ children }: { children?: ReactNode }) =>
    isValidElement<{ width?: number; height?: number }>(children)
      ? cloneElement(children, { width: 800, height: 160 })
      : null,
}));

const data = [0, 5, 10, 15, 20, 25, 30].map(t => ({ t, attacks: t * 2 }));
const series = [{ key: 'attacks', label: 'Attacks' }];

const renderChart = (ranges: LineChartRangeProps[]) =>
  render(
    <LineChart data-testid='lc' data={data} series={series} xKey='t'>
      <LineChartBody>
        <LineChartXAxis />
        {ranges.map(range => (
          <LineChartRange key={String(range.from)} {...range} />
        ))}
        <LineChartLine seriesKey='attacks' disableAnimation />
      </LineChartBody>
    </LineChart>,
  );

afterEach(() => {
  rs.mocked(warnLineChartRange).mockClear();
});

describe('LineChartRange — screen-reader list', () => {
  it('renders one <li> per range with a description', () => {
    renderChart([
      { from: 5, to: 10, description: 'First spike' },
      { from: 20, to: 25, description: 'Second spike' },
      { from: 28 },
    ]);
    const list = screen.getByTestId('lc--range-descriptions');
    expect(list.tagName).toBe('UL');
    expect([...list.querySelectorAll('li')].map(li => li.textContent)).toEqual([
      'First spike',
      'Second spike',
    ]);
  });

  it('renders no list when no range has a description', () => {
    renderChart([{ from: 5, to: 10 }]);
    expect(screen.queryByTestId('lc--range-descriptions')).toBeNull();
  });

  it('removes the <li> when its range unmounts', () => {
    const { rerender } = renderChart([
      { from: 5, to: 10, description: 'First spike' },
      { from: 20, to: 25, description: 'Second spike' },
    ]);
    rerender(
      <LineChart data-testid='lc' data={data} series={series} xKey='t'>
        <LineChartBody>
          <LineChartXAxis />
          <LineChartRange from={5} to={10} description='First spike' />
          <LineChartLine seriesKey='attacks' disableAnimation />
        </LineChartBody>
      </LineChart>,
    );
    const items = screen.getByTestId('lc--range-descriptions').querySelectorAll('li');
    expect([...items].map(li => li.textContent)).toEqual(['First spike']);
  });

  it('is visually hidden and sits outside the aria-hidden body', () => {
    renderChart([{ from: 5, to: 10, description: 'First spike' }]);
    const list = screen.getByTestId('lc--range-descriptions');
    expect(list).toHaveClass('sr-only');
    expect(list.closest('[aria-hidden="true"]')).toBeNull();
  });
});

describe('LineChartRange — overlap warning', () => {
  it('warns once (via the [LineChartRange] helper) when two ranges overlap', () => {
    renderChart([
      { from: 5, to: 15 },
      { from: 10, to: 20 },
    ]);
    expect(warnLineChartRange).toHaveBeenCalledTimes(1);
    expect(String(rs.mocked(warnLineChartRange).mock.calls[0]?.[0])).toContain('overlap');
  });
});

describe('LineChartRange — undrawable range warning', () => {
  it('warns when an edge does not fit the X data and draws nothing', () => {
    renderChart([{ from: 'Monday', to: 'Wed' }]);
    expect(warnLineChartRange).toHaveBeenCalledTimes(1);
    expect(String(rs.mocked(warnLineChartRange).mock.calls[0]?.[0])).toContain('not drawn');
    expect(screen.queryByTestId('lc--range')).toBeNull();
  });

  it('does not warn for a range outside the data window', () => {
    renderChart([{ from: 100, to: 200 }]);
    expect(warnLineChartRange).not.toHaveBeenCalled();
  });
});

describe('LineChartRange — drawing', () => {
  it('renders the range group with both labels for a single range', () => {
    renderChart([{ from: 10, to: 15, startLabel: '11:20', endLabel: '11:52' }]);
    expect(screen.getByTestId('lc--range')).toBeInTheDocument();
    expect(screen.getByTestId('lc--range-start-label')).toHaveTextContent('11:20');
    expect(screen.getByTestId('lc--range-end-label')).toHaveTextContent('11:52');
  });

  it('renders no labels when two ranges are visible', () => {
    renderChart([
      { from: 5, to: 10, startLabel: 'a', endLabel: 'b' },
      { from: 20, to: 25, startLabel: 'c', endLabel: 'd' },
    ]);
    expect(screen.getAllByTestId('lc--range')).toHaveLength(2);
    expect(screen.queryByTestId('lc--range-start-label')).toBeNull();
    expect(screen.queryByTestId('lc--range-end-label')).toBeNull();
  });

  it('labels an ongoing range "Ongoing" by default', () => {
    renderChart([{ from: 10, startLabel: '11:20' }]);
    expect(screen.getByTestId('lc--range-end-label')).toHaveTextContent('Ongoing');
  });

  it('lets endLabel override the ongoing default', () => {
    renderChart([{ from: 10, endLabel: 'Still going' }]);
    expect(screen.getByTestId('lc--range-end-label')).toHaveTextContent('Still going');
  });
});

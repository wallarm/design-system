import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';

import { Chart } from '../Chart';
import { Metric } from './Metric';
import { MetricCaption } from './MetricCaption';
import { MetricDelta } from './MetricDelta';
import { MetricHeader } from './MetricHeader';
import { MetricSkeleton } from './MetricSkeleton';
import { MetricSparkline } from './MetricSparkline';
import { MetricTotal } from './MetricTotal';
import { MetricValue } from './MetricValue';

describe('Metric — root', () => {
  it('renders the root with data-slot and forwards data-testid + extra props', () => {
    render(
      <Metric data-testid='m' aria-label='stat' className='custom'>
        <MetricHeader>
          <MetricValue>91</MetricValue>
        </MetricHeader>
      </Metric>,
    );
    const root = screen.getByTestId('m');
    expect(root).toHaveAttribute('data-slot', 'metric');
    expect(root).toHaveAttribute('aria-label', 'stat');
    expect(root).toHaveClass('custom');
  });

  it('keeps the DOM clean when no data-testid is passed', () => {
    const { container } = render(
      <Metric>
        <MetricHeader>
          <MetricValue>91</MetricValue>
        </MetricHeader>
      </Metric>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});

describe('Metric — testid cascade', () => {
  it('derives slot testids ({base}--{slot}) from the root data-testid', () => {
    render(
      <Metric data-testid='m'>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricTotal connector='of'>120</MetricTotal>
          <MetricDelta value={10} trend='up' sentiment='negative' />
        </MetricHeader>
        <MetricCaption>blocked today</MetricCaption>
      </Metric>,
    );
    expect(screen.getByTestId('m--header')).toBeInTheDocument();
    expect(screen.getByTestId('m--value')).toBeInTheDocument();
    expect(screen.getByTestId('m--total')).toBeInTheDocument();
    expect(screen.getByTestId('m--delta')).toBeInTheDocument();
    expect(screen.getByTestId('m--caption')).toBeInTheDocument();
  });

  it('does not leak a parent provider base to a bare Metric', () => {
    render(
      <Chart data-testid='card'>
        <Metric>
          <MetricHeader>
            <MetricValue>91</MetricValue>
          </MetricHeader>
        </Metric>
      </Chart>,
    );
    expect(screen.queryByTestId('card--value')).toBeNull();
  });
});

describe('Metric — value', () => {
  it('locale-formats a numeric child', () => {
    render(
      <Metric data-testid='m'>
        <MetricHeader>
          <MetricValue>{12345}</MetricValue>
        </MetricHeader>
      </Metric>,
    );
    expect(screen.getByTestId('m--value')).toHaveTextContent('12,345');
  });

  it('renders a non-numeric child as-is', () => {
    render(
      <Metric data-testid='m'>
        <MetricHeader>
          <MetricValue>N/A</MetricValue>
        </MetricHeader>
      </Metric>,
    );
    expect(screen.getByTestId('m--value')).toHaveTextContent('N/A');
  });
});

describe('Metric — total connectors', () => {
  const renderTotal = (connector: 'slash' | 'of' | 'total') =>
    render(
      <Metric data-testid='m'>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricTotal connector={connector}>120</MetricTotal>
        </MetricHeader>
      </Metric>,
    );

  it('slash → /120', () => {
    renderTotal('slash');
    expect(screen.getByTestId('m--total')).toHaveTextContent('/120');
  });

  it('of → of 120', () => {
    renderTotal('of');
    expect(screen.getByTestId('m--total')).toHaveTextContent(/of\s*120/);
  });

  it('total → 120 total', () => {
    renderTotal('total');
    expect(screen.getByTestId('m--total')).toHaveTextContent(/120\s*total/);
  });

  it('locale-formats the denominator', () => {
    render(
      <Metric data-testid='m'>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricTotal connector='of'>{12345}</MetricTotal>
        </MetricHeader>
      </Metric>,
    );
    expect(screen.getByTestId('m--total')).toHaveTextContent('12,345');
  });
});

describe('MetricSkeleton', () => {
  it('announces loading and renders the value block + caption line placeholders', () => {
    render(<MetricSkeleton data-testid='ms' />);
    const root = screen.getByTestId('ms');
    expect(root).toHaveAttribute('data-slot', 'metric-skeleton');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root).toHaveAttribute('aria-live', 'polite');
    expect(root.querySelectorAll('[data-slot=skeleton]')).toHaveLength(2);
  });

  it('keeps the DOM clean when no data-testid is passed', () => {
    const { container } = render(<MetricSkeleton />);
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});

describe('Metric — delta', () => {
  it('renders a named image announcing direction and absolute value', () => {
    render(<MetricDelta value={10} trend='up' />);
    expect(screen.getByRole('img', { name: 'up 10' })).toBeInTheDocument();
  });

  it('maps negative sentiment to the red badge', () => {
    render(<MetricDelta value={10} sentiment='negative' />);
    expect(screen.getByRole('img', { name: 'up 10' }).className).toMatch(/red/);
  });

  it('maps positive sentiment to the green badge', () => {
    render(<MetricDelta value={8} trend='down' sentiment='positive' />);
    expect(screen.getByRole('img', { name: 'down 8' }).className).toMatch(/green/);
  });

  it('defaults the arrow direction to the sign of value when trend is omitted', () => {
    render(<MetricDelta value={-5} />);
    expect(screen.getByRole('img', { name: 'down 5' })).toBeInTheDocument();
  });

  it('locale-formats the accessible name and visible text to match', () => {
    render(<MetricDelta value={1234} />);
    const badge = screen.getByRole('img', { name: 'up 1,234' });
    expect(badge).toHaveTextContent('1,234');
  });
});

describe('MetricSparkline', () => {
  const data = [
    { x: new Date(2026, 0, 1), value: 10 },
    { x: new Date(2026, 0, 2), value: 30 },
    { x: new Date(2026, 0, 3), value: 20 },
  ];

  afterEach(() => rs.restoreAllMocks());

  // jsdom has no layout: give the plot a 200px-wide box at x=100.
  const mockPlotRect = () =>
    rs.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 100,
      y: 50,
      left: 100,
      top: 50,
      right: 300,
      bottom: 98,
      width: 200,
      height: 48,
      toJSON: () => ({}),
    });

  it('derives its testid from the surrounding provider and maps min..max onto the plot', () => {
    render(
      <Metric data-testid='m'>
        <MetricSparkline data={data} />
      </Metric>,
    );
    const root = screen.getByTestId('m--sparkline');
    expect(root).toHaveAttribute('data-slot', 'metric-sparkline');
    expect(root).toHaveAttribute('data-color', 'brand');
    const line = root.querySelectorAll('path')[1];
    // One X unit per step; the max sits PAD_TOP (4) from the top, the min PAD_BOTTOM (8) from 48.
    expect(line).toHaveAttribute('d', 'M0,40 L1,4 L2,22');
    expect(root.querySelector('svg')).toHaveAttribute('viewBox', '0 0 2 48');
  });

  it('draws a flat midline for a single point or a constant series', () => {
    const { rerender } = render(<MetricSparkline data-testid='s' data={[{ x: 1, value: 5 }]} />);
    const line = () => screen.getByTestId('s--plot').querySelectorAll('path')[1];
    expect(line()).toHaveAttribute('d', 'M0,22 L1,22');
    rerender(
      <MetricSparkline
        data-testid='s'
        data={[
          { x: 1, value: 5 },
          { x: 2, value: 5 },
          { x: 3, value: 5 },
        ]}
      />,
    );
    expect(line()).toHaveAttribute('d', 'M0,22 L1,22 L2,22');
  });

  it('leaves a gap at a non-finite value instead of blanking the line', () => {
    render(
      <MetricSparkline
        data-testid='s'
        data={[
          { x: 1, value: 10 },
          { x: 2, value: 30 },
          { x: 3, value: Number.NaN },
          { x: 4, value: 20 },
        ]}
      />,
    );
    const [area, line] = screen.getByTestId('s--plot').querySelectorAll('path');
    expect(line).toHaveAttribute('d', 'M0,40 L1,4 M3,22');
    expect(area).toHaveAttribute('d', 'M0,48 L0,40 L1,4 L1,48 Z M3,48 L3,22 L3,48 Z');
  });

  it('renders an empty plot (no svg) for empty data', () => {
    render(<MetricSparkline data-testid='s' data={[]} />);
    expect(screen.getByTestId('s--plot').querySelector('svg')).toBeNull();
  });

  it('shows the ruler and a date/value popover for the nearest point on hover', () => {
    mockPlotRect();
    render(
      <Metric data-testid='m'>
        <MetricSparkline data={data} label='Attacks' />
      </Metric>,
    );
    const plot = screen.getByTestId('m--sparkline--plot');
    // 45% of the width → nearest of 3 points is index 1.
    fireEvent.pointerMove(plot, { clientX: 190 });

    const popover = screen.getByTestId('m--sparkline--popover');
    expect(popover).toHaveAttribute('role', 'tooltip');
    expect(popover).toHaveTextContent('2 Jan, 2026');
    expect(popover).toHaveTextContent('Attacks');
    expect(popover).toHaveTextContent('30');
    expect(screen.getByTestId('m--sparkline--ruler')).toHaveStyle({ left: '50%' });

    fireEvent.pointerLeave(plot);
    expect(screen.queryByTestId('m--sparkline--popover')).toBeNull();
    expect(screen.queryByTestId('m--sparkline--ruler')).toBeNull();
  });

  it('uses formatX / formatValue when given', () => {
    mockPlotRect();
    render(
      <MetricSparkline
        data-testid='s'
        data={data}
        formatX={() => 'Day 3'}
        formatValue={(v: number) => `${v.toFixed(1)} rps`}
      />,
    );
    fireEvent.pointerMove(screen.getByTestId('s--plot'), { clientX: 300 });
    expect(screen.getByRole('tooltip')).toHaveTextContent('Day 3');
    expect(screen.getByRole('tooltip')).toHaveTextContent('20.0 rps');
  });

  it('shows a non-ISO string x as written and a date-only ISO x as that local day', () => {
    mockPlotRect();
    const { rerender } = render(
      <MetricSparkline
        data-testid='s'
        data={[
          { x: 'Week 1', value: 1 },
          { x: '2026-01-05', value: 2 },
        ]}
      />,
    );
    const plot = screen.getByTestId('s--plot');
    fireEvent.pointerMove(plot, { clientX: 100 });
    // V8's Date.parse would read "Week 1" as 1 Jan 2001.
    expect(screen.getByRole('tooltip')).toHaveTextContent('Week 1');
    fireEvent.pointerMove(plot, { clientX: 300 });
    expect(screen.getByRole('tooltip')).toHaveTextContent('5 Jan, 2026');
    rerender(<MetricSparkline data-testid='s' data={[{ x: 'Week 1', value: 1 }]} />);
    // The held index (1) no longer exists — no ruler outside the plot, no popover.
    expect(screen.queryByTestId('s--ruler')).toBeNull();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('ends the hover on scroll, since the fixed popover cannot follow it', () => {
    mockPlotRect();
    render(<MetricSparkline data-testid='s' data={data} />);
    fireEvent.pointerMove(screen.getByTestId('s--plot'), { clientX: 200 });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.scroll(window);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('forwards consumer attributes to the root', () => {
    render(<MetricSparkline data={data} data-testid='s' data-analytics-id='trend' />);
    expect(screen.getByTestId('s')).toHaveAttribute('data-analytics-id', 'trend');
  });
});

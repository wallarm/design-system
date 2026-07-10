import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../Chart';
import { Metric } from './Metric';
import { MetricCaption } from './MetricCaption';
import { MetricDelta } from './MetricDelta';
import { MetricHeader } from './MetricHeader';
import { MetricSkeleton } from './MetricSkeleton';
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

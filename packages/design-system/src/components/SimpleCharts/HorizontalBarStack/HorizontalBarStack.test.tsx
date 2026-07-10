import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Chart } from '../Chart';
import { MetricDelta, MetricHeader, MetricValue } from '../Metric';
import { HorizontalBarStack } from './HorizontalBarStack';
import { HorizontalBarStackSkeleton } from './HorizontalBarStackSkeleton';
import { resolveSegments } from './lib/resolveSegments';

describe('HorizontalBarStack — root', () => {
  it('renders the root with data-slot and forwards data-testid + extra props', () => {
    render(
      <HorizontalBarStack
        data-testid='hb'
        data={[{ name: 'A', value: 1 }]}
        aria-label='distribution'
        className='custom-class'
      />,
    );
    const root = screen.getByTestId('hb');
    expect(root).toHaveAttribute('data-slot', 'horizontal-bar-stack');
    expect(root).toHaveAttribute('aria-label', 'distribution');
    expect(root).toHaveClass('custom-class');
  });

  it('keeps the DOM clean when no data-testid is passed', () => {
    const { container } = render(<HorizontalBarStack data={[{ name: 'A', value: 1 }]} />);
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});

describe('HorizontalBarStack — testid cascade', () => {
  it('derives slot testids ({base}--{slot}) from its own data-testid', () => {
    render(
      <HorizontalBarStack
        data-testid='hb'
        data={[
          { name: 'A', value: 1 },
          { name: 'B', value: 2 },
        ]}
      >
        <MetricHeader>
          <MetricValue>3</MetricValue>
        </MetricHeader>
      </HorizontalBarStack>,
    );
    expect(screen.getByTestId('hb--header')).toBeInTheDocument();
    expect(screen.getByTestId('hb--value')).toBeInTheDocument();
    expect(screen.getByTestId('hb--bar')).toBeInTheDocument();
    expect(screen.getAllByTestId('hb--segment')).toHaveLength(2);
    expect(screen.getByTestId('hb--legend')).toBeInTheDocument();
    expect(screen.getAllByTestId('hb--legend-item')).toHaveLength(2);
    expect(screen.getAllByTestId('hb--legend-dot')).toHaveLength(2);
  });

  it('does not adopt a parent TestIdProvider base for its own slots', () => {
    render(
      <Chart data-testid='card'>
        <HorizontalBarStack data-testid='hb' data={[{ name: 'A', value: 1 }]}>
          <MetricHeader>
            <MetricValue>5</MetricValue>
          </MetricHeader>
        </HorizontalBarStack>
      </Chart>,
    );
    expect(screen.queryByTestId('card--bar')).toBeNull();
    expect(screen.queryByTestId('card--value')).toBeNull();
    expect(screen.getByTestId('hb--bar')).toBeInTheDocument();
    expect(screen.getByTestId('hb--value')).toBeInTheDocument();
  });

  it('renders no slot testids inside a parent provider when it has no data-testid itself', () => {
    render(
      <Chart data-testid='card'>
        <HorizontalBarStack data={[{ name: 'A', value: 1 }]}>
          <MetricHeader>
            <MetricValue>5</MetricValue>
          </MetricHeader>
        </HorizontalBarStack>
      </Chart>,
    );
    expect(screen.queryByTestId('card--bar')).toBeNull();
    expect(screen.queryByTestId('card--segment')).toBeNull();
  });
});

describe('resolveSegments', () => {
  it('preserves order, auto-assigns colors by index when omitted, keeps explicit colors', () => {
    const out = resolveSegments([
      { name: 'A', value: 3, color: 'blue' },
      { name: 'B', value: 2 },
    ]);
    expect(out.map(s => s.key)).toEqual(['A', 'B']);
    expect(out[0].color).toBe('blue');
    expect(out[1].color).toBeDefined(); // auto-assigned, not undefined
    expect(out.every(s => !s.isRemainder)).toBe(true);
  });

  it('coerces negative and non-finite values to 0', () => {
    const out = resolveSegments([
      { name: 'A', value: -5 },
      { name: 'B', value: Number.NaN },
      { name: 'C', value: Number.POSITIVE_INFINITY },
    ]);
    expect(out.map(s => s.value)).toEqual([0, 0, 0]);
  });

  it('appends a remainder segment when total exceeds the sum', () => {
    const out = resolveSegments([{ name: 'A', value: 3 }], 10);
    expect(out).toHaveLength(2);
    expect(out[1]).toMatchObject({ isRemainder: true, value: 7 });
  });

  it('adds no remainder when total is omitted, <= sum, or non-finite', () => {
    expect(resolveSegments([{ name: 'A', value: 3 }])).toHaveLength(1);
    expect(resolveSegments([{ name: 'A', value: 3 }], 2)).toHaveLength(1);
    expect(resolveSegments([{ name: 'A', value: 3 }], Number.NaN)).toHaveLength(1);
  });
});

describe('HorizontalBarStack — header slot', () => {
  it('renders composed children in the header slot with resolved slot testids', () => {
    render(
      <HorizontalBarStack data-testid='hb' data={[{ name: 'A', value: 1 }]}>
        <MetricHeader>
          <MetricValue>{12345}</MetricValue>
          <MetricDelta value={10} trend='up' sentiment='negative' />
        </MetricHeader>
      </HorizontalBarStack>,
    );
    // The composed Metric bricks resolve their testids against HBS's own base (its
    // TestIdProvider), and MetricValue applies the family's locale formatting. Delta
    // direction/format behaviour is owned by MetricDelta and covered in the Metric suite.
    expect(screen.getByTestId('hb--header')).toBeInTheDocument();
    expect(screen.getByTestId('hb--value')).toHaveTextContent('12,345');
    expect(screen.getByTestId('hb--delta')).toBeInTheDocument();
  });

  it('renders no header slot when no children are composed', () => {
    const { container } = render(
      <HorizontalBarStack data-testid='hb' data={[{ name: 'A', value: 1 }]} />,
    );
    expect(screen.queryByTestId('hb--header')).toBeNull();
    expect(container.querySelector('[data-slot="horizontal-bar-stack-header"]')).toBeNull();
  });
});

describe('HorizontalBarStack — bar rendering', () => {
  it('renders one segment per datum with matching data-name and resolved color', () => {
    render(
      <HorizontalBarStack
        data-testid='hb'
        data={[
          { name: 'Critical', value: 5, color: 'red' },
          { name: 'High', value: 3, color: 'amber' },
        ]}
      />,
    );
    const segs = screen.getAllByTestId('hb--segment');
    expect(segs).toHaveLength(2);
    expect(segs[0]).toHaveAttribute('data-name', 'Critical');
    expect(segs[0].style.backgroundColor).toBe('var(--color-red-500)');
    expect(segs[0].style.flexGrow).toBe('5');
  });

  it('renders a remainder segment (no data-name) with the token class, not an inline color', () => {
    render(<HorizontalBarStack data-testid='hb' data={[{ name: 'A', value: 3 }]} total={10} />);
    const segs = screen.getAllByTestId('hb--segment');
    const remainder = segs.find(s => s.dataset.remainder === 'true');
    expect(remainder).toBeDefined();
    expect(remainder).toHaveClass('bg-bg-strong-primary');
    expect((remainder as HTMLElement).style.backgroundColor).toBe('');
    expect(remainder).not.toHaveAttribute('data-name');
  });

  it('lets a datum className win over the inline color', () => {
    render(
      <HorizontalBarStack
        data-testid='hb'
        data={[{ name: 'A', value: 1, className: 'bg-sky-500' }]}
      />,
    );
    const seg = screen.getByTestId('hb--segment');
    expect(seg).toHaveClass('bg-sky-500');
    expect(seg.style.backgroundColor).toBe('');
  });

  it('renders header-only (no bar, no legend) when data is empty but a header is composed', () => {
    render(
      <HorizontalBarStack data-testid='hb' data={[]}>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricDelta value={10} trend='up' />
        </MetricHeader>
      </HorizontalBarStack>,
    );
    expect(screen.queryByTestId('hb--bar')).toBeNull();
    expect(screen.queryByTestId('hb--legend')).toBeNull();
    expect(screen.getByTestId('hb--value')).toHaveTextContent('91');
    expect(screen.getByRole('img', { name: 'up 10' })).toBeInTheDocument();
  });

  it('renders no bar when data is empty even if total is set (no labels → no bar)', () => {
    render(<HorizontalBarStack data-testid='hb' data={[]} total={120} />);
    expect(screen.queryByTestId('hb--bar')).toBeNull();
    expect(screen.queryByTestId('hb--segment')).toBeNull();
  });

  it('renders only the root wrapper when data is empty and no header is composed', () => {
    render(<HorizontalBarStack data-testid='hb' data={[]} />);
    expect(screen.queryByTestId('hb--header')).toBeNull();
    expect(screen.queryByTestId('hb--bar')).toBeNull();
    expect(screen.queryByTestId('hb--legend')).toBeNull();
  });
});

describe('HorizontalBarStack — legend', () => {
  const data = [
    { name: 'Critical', value: 5, color: 'red' as const },
    { name: 'High', value: 3, color: 'amber' as const },
  ];

  it('renders one legend item per datum with a color-matched dot', () => {
    render(<HorizontalBarStack data-testid='hb' data={data} total={10} />);
    const items = screen.getAllByTestId('hb--legend-item');
    expect(items).toHaveLength(2); // remainder excluded
    expect(items[0]).toHaveTextContent('Critical');
    const dots = screen.getAllByTestId('hb--legend-dot');
    expect(dots[0].style.backgroundColor).toBe('var(--color-red-500)');
  });

  it('hides the legend when legend={false} and exposes the bar as a named image', () => {
    render(<HorizontalBarStack data-testid='hb' data={data} legend={false} />);
    expect(screen.queryByTestId('hb--legend')).toBeNull();
    const bar = screen.getByRole('img', { name: 'Critical 5, High 3' });
    expect(bar).toBe(screen.getByTestId('hb--bar'));
  });

  it('locale-formats segment values in the bar summary', () => {
    render(<HorizontalBarStack data={[{ name: 'Requests', value: 12345 }]} legend={false} />);
    expect(screen.getByRole('img', { name: 'Requests 12,345' })).toBeInTheDocument();
  });

  it('renders no bar at all when data is empty (even with legend={false})', () => {
    render(<HorizontalBarStack data-testid='hb' data={[]} legend={false} />);
    expect(screen.queryByTestId('hb--bar')).toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('is aria-hidden with no role or aria-label when the legend is shown (default)', () => {
    render(<HorizontalBarStack data-testid='hb' data={data} />);
    const bar = screen.getByTestId('hb--bar');
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    expect(bar).not.toHaveAttribute('aria-label');
    expect(bar).not.toHaveAttribute('role');
  });
});

describe('HorizontalBarStackSkeleton', () => {
  it('announces loading and renders header, bar and legend placeholders', () => {
    render(<HorizontalBarStackSkeleton data-testid='hbs' />);
    const root = screen.getByTestId('hbs');
    expect(root).toHaveAttribute('data-slot', 'horizontal-bar-stack-skeleton');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root).toHaveAttribute('aria-live', 'polite');
    expect(screen.getAllByTestId('hbs--skeleton-legend-item')).toHaveLength(3);
  });

  it('renders a custom number of legend placeholder pills', () => {
    render(<HorizontalBarStackSkeleton data-testid='hbs' legendItems={5} />);
    expect(screen.getAllByTestId('hbs--skeleton-legend-item')).toHaveLength(5);
  });

  it('keeps the DOM clean when no data-testid is passed', () => {
    const { container } = render(<HorizontalBarStackSkeleton />);
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});

describe('HorizontalBarStack — duplicate name warning', () => {
  it('warns once in dev when data contains duplicate names', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    // Duplicate `name`s also produce duplicate React keys (by design — `name` is the key),
    // which React additionally flags via console.error; that's expected noise from this
    // exact scenario, not a bug, so it is silenced here to keep the assertion focused on
    // the component's own duplicate-name warning.
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <HorizontalBarStack
        data={[
          { name: 'A', value: 1 },
          { name: 'A', value: 2 },
        ]}
      />,
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[HorizontalBarStack]'));
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('does not warn when names are unique', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <HorizontalBarStack
        data={[
          { name: 'A', value: 1 },
          { name: 'B', value: 2 },
        ]}
      />,
    );
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

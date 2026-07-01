import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HorizontalBar } from './HorizontalBar';
import { resolveSegments } from './lib/resolveSegments';

describe('HorizontalBar — root', () => {
  it('renders the root with data-slot and forwards data-testid + extra props', () => {
    render(
      <HorizontalBar
        data-testid='hb'
        data={[{ name: 'A', value: 1 }]}
        aria-label='distribution'
        className='custom-class'
      />,
    );
    const root = screen.getByTestId('hb');
    expect(root).toHaveAttribute('data-slot', 'horizontal-bar');
    expect(root).toHaveAttribute('aria-label', 'distribution');
    expect(root).toHaveClass('custom-class');
  });

  it('keeps the DOM clean when no data-testid is passed', () => {
    const { container } = render(<HorizontalBar data={[{ name: 'A', value: 1 }]} />);
    expect(container.querySelector('[data-testid]')).toBeNull();
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

describe('HorizontalBar — header', () => {
  it('renders the value with locale formatting', () => {
    render(<HorizontalBar data={[{ name: 'A', value: 1 }]} value={12345} />);
    const value = document.querySelector('[data-slot="horizontal-bar-value"]');
    expect(value).toHaveTextContent('12,345');
  });

  it('renders no header when both value and delta are absent', () => {
    render(<HorizontalBar data={[{ name: 'A', value: 1 }]} />);
    expect(document.querySelector('[data-slot="horizontal-bar-header"]')).toBeNull();
  });

  it('renders a delta badge with an up label and absolute value', () => {
    render(<HorizontalBar data={[{ name: 'A', value: 1 }]} delta={{ value: 10 }} />);
    const badge = screen.getByLabelText('up 10');
    expect(badge).toHaveTextContent('10');
  });

  it('uses trend for direction over sign; shows the absolute number', () => {
    render(<HorizontalBar data={[{ name: 'A', value: 1 }]} delta={{ value: 5, trend: 'down' }} />);
    expect(screen.getByLabelText('down 5')).toBeInTheDocument();
  });
});

describe('HorizontalBar — bar rendering', () => {
  it('renders one segment per datum with matching data-name and resolved color', () => {
    render(
      <HorizontalBar
        data-testid='hb'
        data={[
          { name: 'Critical', value: 5, color: 'red' },
          { name: 'High', value: 3, color: 'amber' },
        ]}
      />,
    );
    const segs = document.querySelectorAll('[data-slot="horizontal-bar-segment"]');
    expect(segs).toHaveLength(2);
    expect(segs[0]).toHaveAttribute('data-name', 'Critical');
    expect((segs[0] as HTMLElement).style.backgroundColor).toBe('var(--color-red-500)');
    expect((segs[0] as HTMLElement).style.flexGrow).toBe('5');
  });

  it('renders a remainder segment (no data-name) when total exceeds the sum', () => {
    render(<HorizontalBar data={[{ name: 'A', value: 3 }]} total={10} />);
    const remainder = document.querySelector(
      '[data-slot="horizontal-bar-segment"][data-remainder="true"]',
    );
    expect(remainder).not.toBeNull();
    expect((remainder as HTMLElement).style.backgroundColor).toBe('var(--color-bg-strong-primary)');
    expect(remainder).not.toHaveAttribute('data-name');
  });

  it('lets a datum className win over the inline color', () => {
    render(<HorizontalBar data={[{ name: 'A', value: 1, className: 'bg-sky-500' }]} />);
    const seg = document.querySelector('[data-slot="horizontal-bar-segment"]') as HTMLElement;
    expect(seg).toHaveClass('bg-sky-500');
    expect(seg.style.backgroundColor).toBe('');
  });
});

describe('HorizontalBar — legend', () => {
  const data = [
    { name: 'Critical', value: 5, color: 'red' as const },
    { name: 'High', value: 3, color: 'amber' as const },
  ];

  it('renders one legend item per datum with a color-matched dot', () => {
    render(<HorizontalBar data={data} total={10} />);
    const items = document.querySelectorAll('[data-slot="horizontal-bar-legend-item"]');
    expect(items).toHaveLength(2); // remainder excluded
    expect(items[0]).toHaveTextContent('Critical');
    const dot = items[0].querySelector('[data-slot="horizontal-bar-legend-dot"]') as HTMLElement;
    expect(dot.style.backgroundColor).toBe('var(--color-red-500)');
  });

  it('hides the legend when legend={false} and summarizes the bar via aria-label', () => {
    render(<HorizontalBar data={data} legend={false} />);
    expect(document.querySelector('[data-slot="horizontal-bar-legend"]')).toBeNull();
    const bar = document.querySelector('[data-slot="horizontal-bar-bar"]') as HTMLElement;
    expect(bar).toHaveAttribute('aria-label', 'Critical 5, High 3');
  });

  it('omits aria-label entirely (not empty string) when there are no non-remainder segments', () => {
    render(<HorizontalBar data={[]} legend={false} />);
    const bar = document.querySelector('[data-slot="horizontal-bar-bar"]') as HTMLElement;
    expect(bar).not.toHaveAttribute('aria-label');
  });

  it('is aria-hidden with no aria-label when the legend is shown (default)', () => {
    render(<HorizontalBar data={data} />);
    const bar = document.querySelector('[data-slot="horizontal-bar-bar"]') as HTMLElement;
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    expect(bar).not.toHaveAttribute('aria-label');
  });
});

describe('HorizontalBar — duplicate name warning', () => {
  it('warns once in dev when data contains duplicate names', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Duplicate `name`s also produce duplicate React keys (by design — `name` is the key),
    // which React additionally flags via console.error; that's expected noise from this
    // exact scenario, not a bug, so it is silenced here to keep the assertion focused on
    // the component's own duplicate-name warning.
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <HorizontalBar
        data={[
          { name: 'A', value: 1 },
          { name: 'A', value: 2 },
        ]}
      />,
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[HorizontalBar]'));
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('does not warn when names are unique', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <HorizontalBar
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

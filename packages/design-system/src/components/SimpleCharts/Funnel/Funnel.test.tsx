import { cloneElement, createRef, isValidElement, type ReactNode } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as actualRecharts from 'recharts' with { rstest: 'importActual' };
import { captureAnalyticsClicks } from '../../../testUtils/captureAnalyticsClicks';
import * as Barrel from '../index';
import { MetricDelta } from '../Metric';
import { Funnel } from './Funnel';
import { FunnelSkeleton } from './FunnelSkeleton';
import { FunnelStep } from './FunnelStep';

// jsdom has no layout, so recharts' ResponsiveContainer measures 0 and renders nothing.
// Swap it for a fixed-size passthrough (240px = two 120px columns) so the ribbon mounts.
rs.mock('recharts', () => ({
  ...actualRecharts,
  ResponsiveContainer: ({ children }: { children?: ReactNode }) =>
    isValidElement<{ width?: number; height?: number }>(children)
      ? cloneElement(children, { width: 240, height: 172 })
      : null,
}));

const fills = (testId: string) =>
  screen.getByTestId(`${testId}--ribbon`).querySelectorAll('[data-slot="funnel-ribbon-fill"]');

describe('Funnel — root', () => {
  it('renders root with data-slot="funnel", forwards className/aria/data props', () => {
    render(
      <Funnel data-testid='fp' className='custom' aria-label='False positives' data-foo='bar'>
        <FunnelStep name='A' value={2} />
        <FunnelStep name='B' value={1} />
      </Funnel>,
    );
    const root = screen.getByTestId('fp');
    expect(root).toHaveAttribute('data-slot', 'funnel');
    expect(root).toHaveClass('custom');
    expect(root).toHaveAttribute('aria-label', 'False positives');
    expect(root).toHaveAttribute('data-foo', 'bar');
  });

  it('renders steps in an <ol> in children order with name, value (1.2k for 1200) and caption', () => {
    render(
      <Funnel data-testid='fp'>
        <FunnelStep name='Detected' value={1200} caption='All flagged requests' />
        <FunnelStep name='Reviewed' value={430} />
        <FunnelStep name='Confirmed' value={310} />
      </Funnel>,
    );
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items.map(li => li.getAttribute('data-slot'))).toEqual([
      'funnel-step',
      'funnel-step',
      'funnel-step',
    ]);
    expect(items[0]).toHaveTextContent('Detected');
    expect(items[0]).toHaveTextContent('1.2k');
    expect(items[0]).toHaveTextContent('All flagged requests');
    expect(items[1]).toHaveTextContent('Reviewed');
    expect(items[1]).toHaveTextContent('430');
    expect(items[2]).toHaveTextContent('Confirmed');
    expect(items[2]).toHaveTextContent('310');
  });

  it('renders null for zero steps', () => {
    const { container } = render(<Funnel>{null}</Funnel>);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('Funnel — step interaction', () => {
  it('step with onClick is a <button type="button">; click, Enter and Space call it once each', async () => {
    const user = userEvent.setup();
    const onClick = rs.fn();
    render(
      <Funnel data-testid='fp'>
        <FunnelStep name='A' value={2} onClick={onClick} />
        <FunnelStep name='B' value={1} />
      </Funnel>,
    );
    const [cell] = screen.getAllByTestId('fp--step');
    expect(cell.tagName).toBe('BUTTON');
    expect(cell).toHaveAttribute('type', 'button');

    await user.click(cell);
    expect(onClick).toHaveBeenCalledTimes(1);
    cell.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(2);
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('step without onClick is a non-focusable <div>', () => {
    render(
      <Funnel data-testid='fp'>
        <FunnelStep name='A' value={2} />
        <FunnelStep name='B' value={1} />
      </Funnel>,
    );
    const [cell] = screen.getAllByTestId('fp--step');
    expect(cell.tagName).toBe('DIV');
    expect(cell).not.toHaveAttribute('tabindex');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('forwards data-analytics-id, aria-label and ref to the step button', async () => {
    const captured = captureAnalyticsClicks();
    const payload = '{"feature":"funnel","step":1}';
    const ref = createRef<HTMLElement>();
    render(
      <Funnel>
        <FunnelStep
          ref={ref}
          data-testid='detected'
          data-analytics-id='FP_DETECTED'
          data-analytics-props={payload}
          aria-label='Open detected'
          name='Detected'
          value={2}
          onClick={rs.fn()}
        />
        <FunnelStep name='B' value={1} />
      </Funnel>,
    );
    const button = screen.getByTestId('detected');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('data-analytics-id', 'FP_DETECTED');
    expect(button).toHaveAttribute('data-analytics-props', payload);
    expect(button).toHaveAttribute('aria-label', 'Open detected');
    expect(ref.current).toBe(button);

    await userEvent.click(button);
    expect(captured).toHaveBeenCalledWith('FP_DETECTED');
  });
});

describe('Funnel — disabled step', () => {
  it('does not call onClick and shows no tint on a disabled step and gates the cursor behind enabled:', async () => {
    const onClick = rs.fn();
    render(
      <Funnel data-testid='fp'>
        <FunnelStep name='A' value={2} onClick={onClick} disabled />
        <FunnelStep name='B' value={1} />
      </Funnel>,
    );
    const [cell] = screen.getAllByTestId('fp--step');
    expect(cell).toBeDisabled();
    await userEvent.click(cell);
    expect(onClick).not.toHaveBeenCalled();
    const classes = cell.className.split(/\s+/);
    expect(classes).toContain('enabled:cursor-pointer');
    expect(classes).toContain('data-active:not-disabled:before:bg-states-primary-hover');
    expect(classes).not.toContain('cursor-pointer');
  });
});

describe('Funnel — test ids', () => {
  it('cascades test ids: fp--step on each cell, fp--step--delta on the delta, fp--ribbon; consumer data-testid on a step wins', () => {
    render(
      <Funnel data-testid='fp'>
        <FunnelStep name='A' value={3} delta={<MetricDelta value={12} />} />
        <FunnelStep name='B' value={2} />
        <FunnelStep name='C' value={1} data-testid='custom' />
      </Funnel>,
    );
    expect(screen.getByTestId('fp')).toBeInTheDocument();
    expect(screen.getAllByTestId('fp--step')).toHaveLength(2);
    expect(screen.getByTestId('fp--step--delta')).toBeInTheDocument();
    expect(screen.getByTestId('fp--ribbon')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('draws step dividers with not-first:border-l (first step has none in CSS)', () => {
    render(
      <Funnel data-testid='fp'>
        <FunnelStep name='A' value={3} />
        <FunnelStep name='B' value={2} />
      </Funnel>,
    );
    for (const li of screen.getAllByRole('listitem')) {
      expect(li).toHaveClass('not-first:border-l', 'not-first:border-border-primary-light');
      expect(li).not.toHaveClass('border-l');
    }
  });

  it('keeps the DOM clean without data-testid', () => {
    const { container } = render(
      <Funnel>
        <FunnelStep name='A' value={3} delta={<MetricDelta value={12} />} />
        <FunnelStep name='B' value={2} />
      </Funnel>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});

describe('Funnel — ribbon', () => {
  it('draws one segment per step column with three paths each and no NaN in any d attribute', () => {
    render(
      <Funnel data-testid='fp'>
        <FunnelStep name='A' value={0} />
        <FunnelStep name='B' value={0} />
      </Funnel>,
    );
    const ribbon = screen.getByTestId('fp--ribbon');
    expect(ribbon).toHaveAttribute('data-slot', 'funnel-ribbon');
    expect(ribbon.querySelectorAll('svg.recharts-surface')).toHaveLength(1);
    const segments = fills('fp');
    expect(segments).toHaveLength(2);
    for (const g of segments) {
      const paths = g.querySelectorAll('path');
      expect(paths).toHaveLength(3);
      for (const p of paths) expect(p.getAttribute('d')).not.toContain('NaN');
    }
  });

  it('places each segment in its own recharts column, from the column x to x + width', () => {
    render(
      <Funnel data-testid='fp'>
        <FunnelStep name='A' value={2} />
        <FunnelStep name='B' value={1} />
      </Funnel>,
    );
    const bodies = [...fills('fp')].map(g => g.querySelector('path:last-child')?.getAttribute('d'));
    expect(bodies[0]).toMatch(/^M0 16C54 16 66 51 120 51V/);
    expect(bodies[1]).toMatch(/^M120 51C174 51 186 51 240 51V/);
  });

  it('fills each column from the ramp with a literal light + dark class', () => {
    render(
      <Funnel data-testid='fp' color='teal'>
        <FunnelStep name='A' value={3} />
        <FunnelStep name='B' value={2} />
        <FunnelStep name='C' value={1} />
      </Funnel>,
    );
    const segments = fills('fp');
    expect(segments).toHaveLength(3);
    expect(segments[0]).toHaveClass('fill-teal-400', 'in-data-[theme=dark]:fill-teal-600');
    expect(segments[2]).toHaveClass('fill-teal-600', 'in-data-[theme=dark]:fill-teal-400');
  });

  it('staggers the entrance by step index and turns it off under reduced motion', () => {
    render(
      <Funnel data-testid='fp'>
        <FunnelStep name='A' value={3} />
        <FunnelStep name='B' value={2} />
      </Funnel>,
    );
    const segments = fills('fp');
    expect((segments[1] as SVGElement).style.getPropertyValue('--funnel-i')).toBe('1');
    expect(segments[0]).toHaveClass('origin-left', 'motion-reduce:animate-none');
    const [, second] = screen.getAllByRole('listitem');
    expect(second?.style.getPropertyValue('--funnel-i')).toBe('1');
  });
});

// jsdom has no AnimationEvent: `fireEvent.animationEnd` drops `animationName`, and React (seeing no
// AnimationEvent) listens for the prefixed `webkitAnimationEnd`. Dispatch both, with the name set.
const animationEnd = (target: Element, animationName: string) =>
  act(() => {
    for (const type of ['animationend', 'webkitAnimationEnd']) {
      target.dispatchEvent(Object.assign(new Event(type, { bubbles: true }), { animationName }));
    }
  });

describe('Funnel — entrance', () => {
  it('turns the band animation off once the last band has grown in, not before', () => {
    render(
      <Funnel data-testid='fp'>
        <FunnelStep name='A' value={3} />
        <FunnelStep name='B' value={2} />
        <FunnelStep name='C' value={1} />
      </Funnel>,
    );
    const ribbon = screen.getByTestId('fp--ribbon');
    const [first, , last] = fills('fp');
    expect(first).toHaveClass('in-data-entered:animate-none');
    animationEnd(first as Element, 'ds-funnel-band-in');
    animationEnd(last as Element, 'ds-chart-fade-in');
    expect(ribbon).not.toHaveAttribute('data-entered');
    animationEnd(last as Element, 'ds-funnel-band-in');
    expect(ribbon).toHaveAttribute('data-entered', 'true');
  });
});

describe('Funnel — hover and focus', () => {
  const renderFunnel = (onClick?: () => void) =>
    render(
      <Funnel data-testid='fp'>
        <FunnelStep name='A' value={3} onClick={onClick} />
        <FunnelStep name='B' value={2} />
        <FunnelStep name='C' value={1} />
      </Funnel>,
    );

  const state = () => ({
    cells: screen
      .getAllByTestId('fp--step')
      .map(c =>
        c.hasAttribute('data-active') ? 'active' : c.hasAttribute('data-dimmed') ? 'dim' : '-',
      ),
    bands: [...fills('fp')].map(g => (g.hasAttribute('data-dimmed') ? 'dim' : '-')),
  });

  it('hovering any step column, with or without an action, dims the other steps and bands', () => {
    renderFunnel();
    expect(state()).toEqual({ cells: ['-', '-', '-'], bands: ['-', '-', '-'] });
    fireEvent.pointerEnter(screen.getAllByRole('listitem')[1] as HTMLElement);
    expect(state()).toEqual({ cells: ['dim', 'active', 'dim'], bands: ['dim', '-', 'dim'] });
    fireEvent.pointerEnter(screen.getAllByRole('listitem')[2] as HTMLElement);
    expect(state()).toEqual({ cells: ['dim', 'dim', 'active'], bands: ['dim', 'dim', '-'] });
  });

  it('leaving the funnel brings every step back', () => {
    renderFunnel();
    fireEvent.pointerEnter(screen.getAllByRole('listitem')[0] as HTMLElement);
    fireEvent.pointerLeave(screen.getByRole('list'));
    expect(state()).toEqual({ cells: ['-', '-', '-'], bands: ['-', '-', '-'] });
  });

  it('keyboard focus on a step dims the others; hover wins while the pointer is on another step', () => {
    renderFunnel(rs.fn());
    const [button] = screen.getAllByTestId('fp--step');
    // jsdom never matches :focus-visible; keyboard (Tab) focus does in a browser (see the e2e).
    const matches = rs.spyOn(Element.prototype, 'matches').mockReturnValue(true);
    act(() => button?.focus());
    matches.mockRestore();
    expect(state().cells).toEqual(['active', 'dim', 'dim']);
    fireEvent.pointerEnter(screen.getAllByRole('listitem')[2] as HTMLElement);
    expect(state().cells).toEqual(['dim', 'dim', 'active']);
    fireEvent.pointerLeave(screen.getByRole('list'));
    expect(state().cells).toEqual(['active', 'dim', 'dim']);
    act(() => button?.blur());
    expect(state().cells).toEqual(['-', '-', '-']);
  });

  it('ignores focus that is not focus-visible (a mouse click), so leaving restores every step', () => {
    renderFunnel(rs.fn());
    const [button] = screen.getAllByTestId('fp--step');
    const matches = rs.spyOn(Element.prototype, 'matches').mockReturnValue(false);
    act(() => button?.focus());
    matches.mockRestore();
    expect(state().cells).toEqual(['-', '-', '-']);
  });

  it('drops a highlight that no longer names a step when the steps shrink', () => {
    const { rerender } = renderFunnel();
    fireEvent.pointerEnter(screen.getAllByRole('listitem')[2] as HTMLElement);
    rerender(
      <Funnel data-testid='fp'>
        <FunnelStep name='A' value={3} />
        <FunnelStep name='B' value={2} />
      </Funnel>,
    );
    expect(state()).toEqual({ cells: ['-', '-'], bands: ['-', '-'] });
  });

  it('keeps the pointer cursor only on a step with onClick', () => {
    renderFunnel(rs.fn());
    const [withAction, without] = screen.getAllByTestId('fp--step');
    expect(withAction).toHaveClass('enabled:cursor-pointer');
    expect(without?.className).not.toContain('cursor-pointer');
  });
});

describe('Funnel — dev warnings', () => {
  it('warns in dev for 1 or 7 steps ("expects 2–6 steps")', () => {
    const warn = rs.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { unmount } = render(
      <Funnel>
        <FunnelStep name='Only' value={1} />
      </Funnel>,
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('[Funnel] expects 2–6 steps, got 1.'),
    );
    unmount();
    warn.mockClear();
    render(
      <Funnel>
        {['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(name => (
          <FunnelStep key={name} name={name} value={1} />
        ))}
      </Funnel>,
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('[Funnel] expects 2–6 steps, got 7.'),
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
    warn.mockRestore();
  });

  it('warns for negative values', () => {
    const warn = rs.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Funnel>
        <FunnelStep name='A' value={5} />
        <FunnelStep name='B' value={-3} />
      </Funnel>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('negative'));
    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('0');
    warn.mockRestore();
  });

  it('warns on non-FunnelStep children', () => {
    const warn = rs.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Funnel>
        <FunnelStep name='A' value={5} />
        <FunnelStep name='B' value={3} />
        <span>stray</span>
        {null}
        {false}
      </Funnel>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('[Funnel] only direct FunnelStep children are rendered'),
    );
    expect(screen.queryByText('stray')).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    warn.mockRestore();
  });
});

describe('Funnel bug fixes', () => {
  it('drops button-only attributes on a non-interactive step', () => {
    render(
      <Funnel>
        <FunnelStep name='A' value={10} data-testid='a' disabled type='submit' />
        <FunnelStep name='B' value={5} />
      </Funnel>,
    );
    const cell = screen.getByTestId('a');
    expect(cell.tagName).toBe('DIV');
    expect(cell).not.toHaveAttribute('disabled');
    expect(cell).not.toHaveAttribute('type');
  });

  it('shows abbreviated values without a tooltip and with a stable value test id', () => {
    render(
      <Funnel data-testid='f'>
        <FunnelStep name='A' value={1234567} />
        <FunnelStep name='B' value={5} />
      </Funnel>,
    );
    const [value] = screen.getAllByTestId('f--step--value');
    expect(value).toHaveTextContent('1.2M');
    expect(value?.querySelector('[aria-label="1,234,567"]')).not.toBeNull();
    expect(document.querySelector('[data-testid$="--trigger"]')).toBeNull();
  });

  it('sizes the scroll track by step count so narrow cards scroll', () => {
    render(
      <Funnel data-testid='f'>
        <FunnelStep name='A' value={3} />
        <FunnelStep name='B' value={2} />
        <FunnelStep name='C' value={1} />
      </Funnel>,
    );
    const root = screen.getByTestId('f');
    expect(root).toHaveClass('overflow-x-auto');
    const track = root.firstElementChild as HTMLElement;
    expect(track.style.getPropertyValue('--funnel-steps')).toBe('3');
  });
});

describe('FunnelSkeleton', () => {
  it('renders N columns, dividers via not-first:border-l, and aria-busy', () => {
    render(<FunnelSkeleton data-testid='sk' steps={4} />);
    const root = screen.getByTestId('sk');
    expect(root).toHaveAttribute('data-slot', 'funnel-skeleton');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root.firstElementChild).toHaveClass('h-288');
    const cols = root.querySelectorAll('[data-slot="funnel-skeleton-column"]');
    expect(cols).toHaveLength(4);
    expect(root.querySelectorAll('.not-first\\:border-l')).toHaveLength(4);
    expect(root.textContent).toBe('');
  });

  it('defaults to 3 columns and forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<FunnelSkeleton ref={ref} data-testid='sk' />);
    expect(ref.current).toBe(screen.getByTestId('sk'));
    expect(ref.current?.querySelectorAll('[data-slot="funnel-skeleton-column"]')).toHaveLength(3);
  });

  it('shimmers name / value / caption per column and a funnel-shaped ribbon', () => {
    render(<FunnelSkeleton data-testid='sk' steps={2} />);
    const columns = screen
      .getByTestId('sk')
      .querySelectorAll('[data-slot="funnel-skeleton-column"]');
    for (const col of columns)
      expect(col.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(3);
    const ribbon = screen.getByTestId('sk--ribbon');
    expect(ribbon).toHaveClass('animate-skeleton', '[clip-path:var(--funnel-skeleton-clip)]');
    const clip = screen.getByTestId('sk').querySelector('clipPath');
    expect(clip).toHaveAttribute('clipPathUnits', 'objectBoundingBox');
    const paths = [...(clip?.querySelectorAll('path') ?? [])].map(p => p.getAttribute('d'));
    expect(paths).toHaveLength(2);
    // Column 1 narrows 140 → 40, column 2 stays flat at 40; x runs 0..0.5 and 0.5..1.
    expect(paths[0]).toBe('M0 16C0.225 16 0.275 66 0.5 66V106C0.275 106 0.225 156 0 156Z');
    expect(paths[1]).toMatch(/^M0\.5 66C.* 1 66V106/);
    const track = screen.getByTestId('sk').firstElementChild as HTMLElement;
    expect(track.style.getPropertyValue('--funnel-skeleton-clip')).toBe(`url("#${clip?.id}")`);
  });
});

describe('SimpleCharts barrel', () => {
  it('exports Funnel, FunnelStep, FunnelSkeleton', () => {
    expect(Barrel.Funnel).toBe(Funnel);
    expect(Barrel.FunnelStep).toBe(FunnelStep);
    expect(Barrel.FunnelSkeleton).toBe(FunnelSkeleton);
  });
});

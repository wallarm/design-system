import { createRef } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { captureAnalyticsClicks } from '../../../testUtils/captureAnalyticsClicks';
import * as Barrel from '../index';
import { MetricDelta } from '../Metric';
import { Funnel } from './Funnel';
import { FunnelSkeleton } from './FunnelSkeleton';
import { FunnelStep } from './FunnelStep';

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
  it('does not call onClick and gates the hover/cursor affordance behind enabled:', async () => {
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
    expect(classes).toContain('enabled:hover:before:bg-states-primary-hover');
    expect(classes).not.toContain('cursor-pointer');
    expect(classes).not.toContain('hover:before:bg-states-primary-hover');
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
  it('draws one ribbon svg per step with three paths each and no NaN in any d attribute', () => {
    render(
      <Funnel data-testid='fp'>
        <FunnelStep name='A' value={0} />
        <FunnelStep name='B' value={0} />
      </Funnel>,
    );
    const ribbon = screen.getByTestId('fp--ribbon');
    expect(ribbon).toHaveAttribute('data-slot', 'funnel-ribbon');
    const svgs = ribbon.querySelectorAll('svg');
    expect(svgs).toHaveLength(2);
    for (const svg of svgs) {
      expect(svg).toHaveAttribute('viewBox', '0 0 1 172');
      expect(svg).toHaveAttribute('preserveAspectRatio', 'none');
      const paths = svg.querySelectorAll('path');
      expect(paths).toHaveLength(3);
      for (const p of paths) expect(p.getAttribute('d')).not.toContain('NaN');
    }
  });

  it('fills each column from the ramp with a literal light + dark class', () => {
    render(
      <Funnel data-testid='fp' color='teal'>
        <FunnelStep name='A' value={3} />
        <FunnelStep name='B' value={2} />
        <FunnelStep name='C' value={1} />
      </Funnel>,
    );
    const fills = screen.getByTestId('fp--ribbon').querySelectorAll('g');
    expect(fills).toHaveLength(3);
    expect(fills[0]).toHaveClass('fill-teal-400', 'in-data-[theme=dark]:fill-teal-600');
    expect(fills[2]).toHaveClass('fill-teal-600', 'in-data-[theme=dark]:fill-teal-400');
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
    expect(ref.current?.firstElementChild?.children).toHaveLength(3);
  });
});

describe('SimpleCharts barrel', () => {
  it('exports Funnel, FunnelStep, FunnelSkeleton', () => {
    expect(Barrel.Funnel).toBe(Funnel);
    expect(Barrel.FunnelStep).toBe(FunnelStep);
    expect(Barrel.FunnelSkeleton).toBe(FunnelSkeleton);
  });
});

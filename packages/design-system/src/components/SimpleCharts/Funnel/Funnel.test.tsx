import { describe, expect, it, rs } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Funnel } from './Funnel';
import { FunnelSkeleton } from './FunnelSkeleton';
import { FunnelStep } from './FunnelStep';

describe('Funnel — root', () => {
  it('renders a list with data-slot and forwards data-testid + extra props', () => {
    render(
      <Funnel data-testid='f' aria-label='False positives' className='custom'>
        <FunnelStep name='Detected' value={100} />
        <FunnelStep name='Reviewed' value={50} />
      </Funnel>,
    );
    const root = screen.getByTestId('f');
    expect(root).toHaveAttribute('data-slot', 'funnel');
    expect(root).toHaveAttribute('aria-label', 'False positives');
    expect(root).toHaveClass('custom');
    expect(screen.getByRole('list')).toBe(root);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('keeps the DOM clean when no data-testid is passed', () => {
    const { container } = render(
      <Funnel>
        <FunnelStep name='Detected' value={100} />
        <FunnelStep name='Reviewed' value={50} />
      </Funnel>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });

  it('shows the empty frame when there are no steps', () => {
    render(<Funnel data-testid='f' />);
    expect(screen.getByTestId('f--empty')).toHaveTextContent('No data');
    expect(screen.queryByRole('list')).toBeNull();
  });
});

describe('Funnel — steps', () => {
  it('cascades the testid to every step and its ribbon', () => {
    render(
      <Funnel data-testid='f'>
        <FunnelStep name='Detected' value={100} />
        <FunnelStep name='Reviewed' value={50} />
        <FunnelStep name='Marked false' value={10} />
      </Funnel>,
    );
    expect(screen.getAllByTestId('f--step')).toHaveLength(3);
    expect(screen.getAllByTestId('f--ribbon')).toHaveLength(3);
  });

  it('shows name, value, caption and delta in the title cell', () => {
    render(
      <Funnel data-testid='f'>
        <FunnelStep name='Detected' value={842} caption='Last 7 days' delta={<i>delta</i>} />
        <FunnelStep name='Reviewed' value={0} />
      </Funnel>,
    );
    const [first, second] = screen.getAllByTestId('f--step');
    expect(first).toHaveTextContent('Detected');
    expect(first).toHaveTextContent('842');
    expect(first).toHaveTextContent('Last 7 days');
    expect(first).toHaveTextContent('delta');
    expect(second).toHaveTextContent('0');
  });

  it('abbreviates values from 1,000 up, with no underline or tooltip', () => {
    render(
      <Funnel data-testid='f'>
        <FunnelStep name='Requests' value={59614283} />
        <FunnelStep name='Blocked' value={999} />
      </Funnel>,
    );
    const [first, second] = screen.getAllByTestId('f--step');
    expect(first).toHaveTextContent('59.6M');
    expect(second).toHaveTextContent('999');
  });

  it('draws each column from its own thickness to the next one; the last is flat', () => {
    render(
      <Funnel data-testid='f'>
        <FunnelStep name='A' value={1000} />
        <FunnelStep name='B' value={500} />
      </Funnel>,
    );
    const [first, last] = screen.getAllByTestId('f--ribbon');
    // Body is the last path; the two before it are the halos.
    expect(first?.querySelectorAll('path')).toHaveLength(3);
    expect(first?.querySelector('path:last-of-type')).toHaveAttribute(
      'd',
      'M0 16 C45 16 55 51 100 51 L100 121 C55 121 45 156 0 156 Z',
    );
    expect(last?.querySelector('path:last-of-type')).toHaveAttribute(
      'd',
      'M0 51 C45 51 55 51 100 51 L100 121 C55 121 45 121 0 121 Z',
    );
  });

  it('fills each step from the palette, for both themes', () => {
    render(
      <Funnel data-testid='f' color='red' start='gray'>
        <FunnelStep name='A' value={10} />
        <FunnelStep name='B' value={5} />
      </Funnel>,
    );
    const [first, second] = screen.getAllByTestId('f--ribbon');
    expect(first?.querySelector('g')).toHaveClass('fill-slate-300');
    expect(second?.querySelector('g')).toHaveClass('fill-red-600');
  });

  it('hides the ribbon from assistive tech', () => {
    render(
      <Funnel data-testid='f'>
        <FunnelStep name='A' value={10} />
        <FunnelStep name='B' value={5} />
      </Funnel>,
    );
    for (const ribbon of screen.getAllByTestId('f--ribbon')) {
      expect(ribbon).toHaveAttribute('aria-hidden', 'true');
    }
  });
});

describe('Funnel — interaction and analytics', () => {
  it('renders a real button only for a step with an action', () => {
    const onClick = rs.fn();
    render(
      <Funnel data-testid='f'>
        <FunnelStep name='Detected' value={100} onClick={onClick} />
        <FunnelStep name='Reviewed' value={50} />
      </Funnel>,
    );
    const [first, second] = screen.getAllByTestId('f--step');
    expect(first?.tagName).toBe('BUTTON');
    expect(first).toHaveAttribute('type', 'button');
    expect(second?.tagName).toBe('DIV');
    expect(screen.getAllByRole('button')).toHaveLength(1);

    if (first) fireEvent.click(first);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('lands consumer attributes on the step button, payload untouched', () => {
    const payload = '{"step":"detected","n":1}';
    render(
      <Funnel data-testid='f'>
        <FunnelStep
          name='Detected'
          value={100}
          onClick={rs.fn()}
          id='step-detected'
          data-analytics-id='funnel-step'
          data-analytics-props={payload}
          aria-describedby='hint'
        />
        <FunnelStep name='Reviewed' value={50} />
      </Funnel>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('id', 'step-detected');
    expect(button).toHaveAttribute('data-analytics-id', 'funnel-step');
    expect(button).toHaveAttribute('data-analytics-props', payload);
    expect(button).toHaveAttribute('aria-describedby', 'hint');
    expect(button).toHaveAttribute('data-slot', 'funnel-step-title');
    expect(button).toHaveAttribute('data-testid', 'f--step');
  });

  it('lets a consumer data-testid win over the cascade', () => {
    render(
      <Funnel data-testid='f'>
        <FunnelStep name='Detected' value={100} data-testid='own' />
        <FunnelStep name='Reviewed' value={50} />
      </Funnel>,
    );
    expect(screen.getByTestId('own')).toHaveTextContent('Detected');
    expect(screen.getAllByTestId('f--step')).toHaveLength(1);
  });

  it('keeps analytics attributes when the data changes', () => {
    const { rerender } = render(
      <Funnel data-testid='f'>
        <FunnelStep name='Detected' value={100} onClick={rs.fn()} data-analytics-id='s' />
        <FunnelStep name='Reviewed' value={50} />
      </Funnel>,
    );
    rerender(
      <Funnel data-testid='f' color='green'>
        <FunnelStep name='Detected' value={900} onClick={rs.fn()} data-analytics-id='s' />
        <FunnelStep name='Reviewed' value={20} />
      </Funnel>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-analytics-id', 's');
  });
});

describe('FunnelSkeleton', () => {
  it('draws one column per step and marks itself busy', () => {
    render(<FunnelSkeleton data-testid='sk' steps={4} />);
    const root = screen.getByTestId('sk');
    expect(root).toHaveAttribute('data-slot', 'funnel-skeleton');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root.children).toHaveLength(4);
  });
});

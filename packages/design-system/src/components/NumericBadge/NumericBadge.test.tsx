import { createRef } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { NumericBadge } from './NumericBadge';

describe('NumericBadge', () => {
  it('renders a static count without making it focusable', () => {
    render(<NumericBadge data-testid='badge'>0</NumericBadge>);

    const badge = screen.getByTestId('badge');
    expect(badge.tagName).toBe('DIV');
    expect(badge).toHaveTextContent('0');
    expect(badge).toHaveAttribute('data-type', 'secondary');
    expect(badge).toHaveAttribute('data-color', 'neutral');
    expect(badge).not.toHaveAttribute('tabindex');
    expect(badge).not.toHaveAttribute('role');
  });

  it.each([
    ['secondary', 'neutral'],
    ['secondary', 'neutral-alt'],
    ['secondary', 'info'],
    ['secondary', 'success'],
    ['secondary', 'danger'],
    ['secondary', 'brand'],
    ['solid', 'danger'],
    ['solid', 'brand'],
    ['outline', 'neutral'],
    ['outline', 'success'],
    ['outline', 'danger'],
    ['outline', 'brand'],
  ] as const)('exposes the %s/%s appearance on the badge', (type, color) => {
    render(
      <NumericBadge data-testid='badge' type={type} color={color}>
        99+
      </NumericBadge>,
    );

    expect(screen.getByTestId('badge')).toHaveAttribute('data-type', type);
    expect(screen.getByTestId('badge')).toHaveAttribute('data-color', color);
    expect(screen.getByTestId('badge')).toHaveTextContent('99+');
  });

  it.each([
    ['solid', 'brand'],
    ['secondary', 'neutral'],
    ['outline', 'neutral'],
  ] as const)('defaults %s to the %s color when color is omitted', (type, color) => {
    render(
      <NumericBadge type={type} data-testid='badge'>
        1
      </NumericBadge>,
    );

    expect(screen.getByTestId('badge')).toHaveAttribute('data-color', color);
  });

  it('renders glyph and icon children', () => {
    render(
      <>
        <NumericBadge>!</NumericBadge>
        <NumericBadge>?</NumericBadge>
        <NumericBadge aria-label='Completed'>
          <svg aria-hidden='true' data-testid='check-icon' viewBox='0 0 16 16'>
            <path d='M3 8l3 3 7-7' />
          </svg>
        </NumericBadge>
      </>,
    );

    expect(screen.getByText('!')).toBeVisible();
    expect(screen.getByText('?')).toBeVisible();
    expect(screen.getByLabelText('Completed')).toContainElement(screen.getByTestId('check-icon'));
  });

  it('merges caller classes with the badge appearance and exposes its ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <NumericBadge ref={ref} data-testid='badge' className='consumer-badge'>
        1
      </NumericBadge>,
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('consumer-badge', 'inline-flex');
    expect(ref.current).toBe(badge);
  });

  it('renders an asChild span without adding a wrapper', () => {
    const { container } = render(
      <NumericBadge asChild className='consumer-badge'>
        <span className='child-badge'>!</span>
      </NumericBadge>,
    );

    const badge = screen.getByText('!');
    expect(badge.tagName).toBe('SPAN');
    expect(container.firstElementChild).toBe(badge);
    expect(badge).toHaveAttribute('data-slot', 'numeric-badge');
    expect(badge).toHaveClass('consumer-badge', 'child-badge');
    expect(badge).not.toHaveAttribute('tabindex');
  });

  it('defaults data-slot to "numeric-badge"', () => {
    render(<NumericBadge data-testid='badge'>1</NumericBadge>);
    expect(screen.getByTestId('badge')).toHaveAttribute('data-slot', 'numeric-badge');
  });

  it('lets a caller override data-slot', () => {
    render(
      <NumericBadge data-testid='badge' data-slot='timeline-indicator'>
        1
      </NumericBadge>,
    );
    expect(screen.getByTestId('badge')).toHaveAttribute('data-slot', 'timeline-indicator');
  });
});

describe('NumericBadge interactions', () => {
  it('activates a clickable badge with pointer, Enter and Space', async () => {
    const user = userEvent.setup();
    const onClick = rs.fn();
    const onKeyDown = rs.fn();
    render(
      <NumericBadge onClick={onClick} onKeyDown={onKeyDown}>
        5
      </NumericBadge>,
    );

    const badge = screen.getByRole('button', { name: '5' });
    await user.tab();
    expect(badge).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onKeyDown).toHaveBeenCalledTimes(2);
    await user.click(badge);
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it.each(['{Enter}', ' '])('lets the caller cancel keyboard activation for %s', async key => {
    const user = userEvent.setup();
    const onClick = rs.fn();
    render(
      <NumericBadge onClick={onClick} onKeyDown={event => event.preventDefault()}>
        5
      </NumericBadge>,
    );

    await user.tab();
    await user.keyboard(key);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('preserves caller tab order on a clickable badge', () => {
    render(
      <NumericBadge onClick={rs.fn()} tabIndex={-1}>
        5
      </NumericBadge>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '-1');
  });

  it('lets the caller cancel Space activation on keyup', async () => {
    const user = userEvent.setup();
    const onClick = rs.fn();
    render(
      <NumericBadge onClick={onClick} onKeyUp={event => event.preventDefault()}>
        5
      </NumericBadge>,
    );

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('makes an asChild span keyboard accessible when its child owns onClick', async () => {
    const user = userEvent.setup();
    const onClick = rs.fn();
    render(
      <NumericBadge asChild>
        <span onClick={onClick}>5</span>
      </NumericBadge>,
    );

    const badge = screen.getByRole('button', { name: '5' });
    await user.tab();
    expect(badge).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies interactive feedback to native children without a badge click handler', () => {
    render(
      <>
        <NumericBadge asChild>
          <a href='/hosts'>Hosts</a>
        </NumericBadge>
        <NumericBadge asChild>
          <button type='button'>Refresh</button>
        </NumericBadge>
      </>,
    );

    expect(screen.getByRole('link', { name: 'Hosts' })).toHaveClass('cursor-pointer');
    expect(screen.getByRole('button', { name: 'Refresh' })).toHaveClass('cursor-pointer');
  });

  it('does not infer interactive feedback for a disabled native button', () => {
    render(
      <NumericBadge asChild>
        <button type='button' disabled>
          Refresh
        </button>
      </NumericBadge>,
    );

    expect(screen.getByRole('button', { name: 'Refresh' })).not.toHaveClass('cursor-pointer');
  });

  it('activates an asChild button once per key and composes child handlers', async () => {
    const user = userEvent.setup();
    const onClick = rs.fn();
    const onChildClick = rs.fn();
    render(
      <NumericBadge asChild onClick={onClick}>
        <button type='button' onClick={onChildClick}>
          5
        </button>
      </NumericBadge>,
    );

    const badge = screen.getByRole('button', { name: '5' });
    expect(badge.tagName).toBe('BUTTON');
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onChildClick).toHaveBeenCalledTimes(1);
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onChildClick).toHaveBeenCalledTimes(2);
  });

  it('lets an asChild button cancel the badge click handler', async () => {
    const user = userEvent.setup();
    const onClick = rs.fn();
    render(
      <NumericBadge asChild onClick={onClick}>
        <button type='button' onClick={event => event.preventDefault()}>
          5
        </button>
      </NumericBadge>,
    );

    await user.click(screen.getByRole('button', { name: '5' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('NumericBadge analytics pass-through', () => {
  it('forwards analytics and accessibility attributes to the clickable div', async () => {
    const user = userEvent.setup();
    const onClick = rs.fn();
    const captured = captureAnalyticsClicks();
    const payload = '{ "feature": "hosts", "count": 3 }';
    const { rerender } = render(
      <NumericBadge
        id='host-count'
        aria-label='Hosts'
        data-analytics-id='HOST_COUNT'
        data-analytics-props={payload}
        onClick={onClick}
      >
        3
      </NumericBadge>,
    );

    const badge = screen.getByRole('button', { name: 'Hosts' });
    expect(badge.tagName).toBe('DIV');
    expect(badge).toHaveAttribute('id', 'host-count');
    expect(badge).toHaveAttribute('data-analytics-id', 'HOST_COUNT');
    expect(badge).toHaveAttribute('data-analytics-props', payload);
    await user.click(badge);
    expect(onClick).toHaveBeenCalledOnce();
    expect(captured).toHaveBeenCalledWith('HOST_COUNT');

    rerender(
      <NumericBadge
        id='host-count'
        aria-label='Hosts'
        data-analytics-id='HOST_COUNT'
        data-analytics-props={payload}
        onClick={onClick}
        type='outline'
        color='success'
      >
        4
      </NumericBadge>,
    );

    expect(badge).toHaveTextContent('4');
    expect(badge).toHaveAttribute('data-analytics-id', 'HOST_COUNT');
    expect(badge).toHaveAttribute('data-analytics-props', payload);
  });

  it('forwards analytics onto the final rendered asChild button', async () => {
    const user = userEvent.setup();
    const captured = captureAnalyticsClicks();
    const { container } = render(
      <NumericBadge
        asChild
        id='host-count'
        aria-label='Hosts'
        data-analytics-id='HOST_COUNT'
        data-analytics-props='{"count":3}'
        onClick={rs.fn()}
      >
        <button type='button'>
          <span>3</span>
        </button>
      </NumericBadge>,
    );

    const badge = screen.getByRole('button', { name: 'Hosts' });
    expect(badge.tagName).toBe('BUTTON');
    expect(container.firstElementChild).toBe(badge);
    expect(badge).toHaveAttribute('id', 'host-count');
    expect(badge).toHaveAttribute('data-analytics-id', 'HOST_COUNT');
    expect(badge).toHaveAttribute('data-analytics-props', '{"count":3}');
    expect(screen.getByText('3')).not.toHaveAttribute('data-analytics-id');
    await user.click(screen.getByText('3'));
    expect(captured).toHaveBeenCalledWith('HOST_COUNT');
  });
});

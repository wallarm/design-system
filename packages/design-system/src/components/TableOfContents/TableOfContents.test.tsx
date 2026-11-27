import type { MouseEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableOfContents, TableOfContentsItem, type TableOfContentsProps } from '.';

const renderToc = (props: Partial<TableOfContentsProps> = {}) =>
  render(
    <TableOfContents data-testid='toc' {...props}>
      <TableOfContentsItem value='tldr'>TL;DR</TableOfContentsItem>
      <TableOfContentsItem value='findings' number='1'>
        Findings
      </TableOfContentsItem>
      <TableOfContentsItem value='critical' number='1.1' level={2}>
        Critical
      </TableOfContentsItem>
    </TableOfContents>,
  );

const link = (name: string) => screen.getByRole('link', { name: new RegExp(name) });

describe('TableOfContents', () => {
  it('renders a nav named by title', () => {
    renderToc();
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument();
  });

  it('consumer aria-label wins over title', () => {
    renderToc({ 'aria-label': 'Report sections' });
    expect(screen.getByRole('navigation', { name: 'Report sections' })).toHaveTextContent(
      'On this page',
    );
    expect(screen.getByTestId('toc--toggle')).toHaveAccessibleName('Report sections');
  });

  it('uses a custom title', () => {
    renderToc({ title: 'Contents' });
    expect(screen.getByRole('navigation', { name: 'Contents' })).toHaveTextContent('Contents');
  });

  it('calls onValueChange with the item value on click', async () => {
    const onValueChange = rs.fn();
    renderToc({ onValueChange });
    await userEvent.click(link('Findings'));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('findings');
  });

  it('defaults href to the value fragment', () => {
    renderToc();
    expect(link('Findings')).toHaveAttribute('href', '#findings');
  });

  it('respects consumer preventDefault', () => {
    const onValueChange = rs.fn();
    const onClick = rs.fn((event: MouseEvent) => event.preventDefault());
    render(
      <TableOfContents onValueChange={onValueChange}>
        <TableOfContentsItem value='a' onClick={onClick}>
          A
        </TableOfContentsItem>
      </TableOfContents>,
    );
    fireEvent.click(link('A'));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps browser navigation on ctrl/meta click', () => {
    const onValueChange = rs.fn();
    renderToc({ onValueChange });
    for (const modifier of [
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { altKey: true },
    ]) {
      const notPrevented = fireEvent.click(link('Findings'), modifier);
      expect(notPrevented).toBe(true);
    }
    expect(fireEvent.click(link('Findings'), { button: 1 })).toBe(true);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('does not intercept when href is not a fragment', () => {
    const onValueChange = rs.fn();
    render(
      <TableOfContents onValueChange={onValueChange}>
        <TableOfContentsItem value='other' href='/other'>
          Other
        </TableOfContentsItem>
      </TableOfContents>,
    );
    // Read the outcome at the document, then cancel there: jsdom cannot navigate to another document.
    let prevented: boolean | undefined;
    const capture = (event: Event) => {
      prevented = event.defaultPrevented;
      event.preventDefault();
    };
    document.addEventListener('click', capture);
    fireEvent.click(link('Other'));
    document.removeEventListener('click', capture);
    expect(prevented).toBe(false);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('does not intercept without onValueChange', () => {
    renderToc();
    expect(fireEvent.click(link('Findings'))).toBe(true);
  });

  it('prevents default when it handles the click', () => {
    renderToc({ onValueChange: rs.fn() });
    expect(fireEvent.click(link('Findings'))).toBe(false);
  });

  it('marks only the active item with aria-current="location"', () => {
    renderToc({ value: 'findings' });
    expect(link('Findings')).toHaveAttribute('aria-current', 'location');
    expect(link('Findings')).toHaveAttribute('data-active');
    expect(link('TL;DR')).not.toHaveAttribute('aria-current');
    expect(link('TL;DR')).not.toHaveAttribute('data-active');
    expect(link('Critical')).not.toHaveAttribute('aria-current');
  });

  it('unknown value activates nothing', () => {
    expect(() => renderToc({ value: 'missing' })).not.toThrow();
    for (const item of screen.getAllByRole('link')) {
      expect(item).not.toHaveAttribute('aria-current');
      expect(item).not.toHaveAttribute('data-active');
    }
  });

  it('level 2 item carries data-level="2"', () => {
    renderToc();
    expect(link('Critical')).toHaveAttribute('data-level', '2');
    expect(link('Findings')).toHaveAttribute('data-level', '1');
  });

  it('renders number before the label', () => {
    renderToc();
    expect(link('Critical')).toHaveTextContent(/^1\.1\s*Critical$/);
    expect(screen.getByText('1.1').compareDocumentPosition(screen.getByText('Critical'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('label is clamped to two lines', () => {
    renderToc();
    expect(screen.getByText('Findings')).toHaveClass('line-clamp-2');
  });

  it('toggle switches to minimized (uncontrolled) and calls onViewChange', async () => {
    const onViewChange = rs.fn();
    renderToc({ onViewChange });
    expect(screen.getByTestId('toc--list')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('toc--toggle'));
    expect(onViewChange).toHaveBeenCalledExactlyOnceWith('minimized');
    expect(screen.queryByTestId('toc--list')).toBeNull();
    expect(screen.getByTestId('toc')).toHaveAttribute('data-view', 'minimized');
    await userEvent.click(screen.getByTestId('toc--toggle'));
    expect(onViewChange).toHaveBeenLastCalledWith('full');
    expect(screen.getByTestId('toc--list')).toBeInTheDocument();
  });

  it('starts from defaultView', () => {
    renderToc({ defaultView: 'minimized' });
    expect(screen.getByTestId('toc')).toHaveAttribute('data-view', 'minimized');
  });

  it('controlled view follows the prop', async () => {
    const onViewChange = rs.fn();
    const { rerender } = render(
      <TableOfContents data-testid='toc' view='full' onViewChange={onViewChange}>
        <TableOfContentsItem value='a'>A</TableOfContentsItem>
      </TableOfContents>,
    );
    await userEvent.click(screen.getByTestId('toc--toggle'));
    expect(onViewChange).toHaveBeenCalledExactlyOnceWith('minimized');
    expect(screen.getByTestId('toc')).toHaveAttribute('data-view', 'full');
    rerender(
      <TableOfContents data-testid='toc' view='minimized' onViewChange={onViewChange}>
        <TableOfContentsItem value='a'>A</TableOfContentsItem>
      </TableOfContents>,
    );
    expect(screen.getByTestId('toc')).toHaveAttribute('data-view', 'minimized');
  });

  it('forwards ref to the nav and item anchor', () => {
    const navRef = rs.fn();
    const itemRef = rs.fn();
    render(
      <TableOfContents ref={navRef}>
        <TableOfContentsItem value='a' ref={itemRef}>
          A
        </TableOfContentsItem>
      </TableOfContents>,
    );
    expect(navRef).toHaveBeenCalledWith(expect.any(HTMLElement));
    expect((navRef.mock.calls[0]?.[0] as HTMLElement).tagName).toBe('NAV');
    expect((itemRef.mock.calls[0]?.[0] as HTMLElement).tagName).toBe('A');
  });
});

// zag flushes state a microtask after the event; Presence unmounts on the next animation frame.
const flushMicrotasks = () => act(() => Promise.resolve());
const advance = async (ms: number) => {
  await flushMicrotasks();
  await act(async () => {
    rs.advanceTimersByTime(ms);
  });
};
const nextFrame = () =>
  act(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));

// The dismissable layer attaches and dispatches its listeners a frame or two after the event.
const settle = async () => {
  for (let frame = 0; frame < 3; frame++) {
    await advance(0);
    await nextFrame();
  }
};

const renderMinimized = (props: Partial<TableOfContentsProps> = {}) =>
  renderToc({ defaultView: 'minimized', value: 'findings', ...props });
const dashes = () => screen.getByTestId('toc--dashes');
const popover = () => screen.queryByTestId('toc--popover');
const hover = (el: Element) => fireEvent.pointerEnter(el, { pointerType: 'mouse' });
const unhover = (el: Element) => fireEvent.pointerLeave(el, { pointerType: 'mouse' });
const tap = (el: Element) => {
  fireEvent.pointerDown(el, { pointerType: 'touch' });
  fireEvent.click(el);
};
const openByTap = async () => {
  tap(dashes());
  await settle();
};

describe('TableOfContents — minimized', () => {
  beforeEach(() => {
    // Only the delay timers: faking queueMicrotask stalls zag's state flush.
    rs.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    rs.useRealTimers();
  });

  it('minimized renders one aria-hidden dash per item, none focusable', () => {
    renderMinimized();
    expect(dashes()).toHaveAttribute('aria-hidden', 'true');
    expect(dashes().children).toHaveLength(3);
    expect(within(dashes()).queryAllByRole('link', { hidden: true })).toHaveLength(0);
    expect(dashes().querySelector('a, button, [tabindex]')).toBeNull();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('active dash has data-active', () => {
    renderMinimized();
    const [tldr, findings, critical] = Array.from(dashes().children);
    expect(findings).toHaveAttribute('data-active');
    expect(tldr).not.toHaveAttribute('data-active');
    expect(critical).not.toHaveAttribute('data-active');
  });

  it('dash level from item level', () => {
    renderMinimized();
    const levels = Array.from(dashes().children, dash => dash.getAttribute('data-level'));
    expect(levels).toEqual(['1', '1', '2']);
  });

  it('hover on dashes opens the popover after the open delay', async () => {
    renderMinimized();
    hover(dashes());
    await advance(99);
    expect(popover()).toBeNull();
    await advance(1);
    expect(popover()).toBeInTheDocument();
  });

  it('pointer leaving dashes and popover closes it', async () => {
    renderMinimized();
    hover(dashes());
    await advance(100);
    unhover(dashes());
    hover(popover() as HTMLElement);
    await advance(1000);
    expect(popover()).toBeInTheDocument();
    unhover(popover() as HTMLElement);
    await advance(299);
    expect(popover()).toBeInTheDocument();
    await advance(1);
    await nextFrame();
    expect(popover()).toBeNull();
  });

  it('touch pointer does not open on enter', async () => {
    renderMinimized();
    fireEvent.pointerEnter(dashes(), { pointerType: 'touch' });
    await advance(1000);
    expect(popover()).toBeNull();
  });

  it('tap on dashes toggles the popover', async () => {
    renderMinimized();
    await openByTap();
    expect(popover()).toBeInTheDocument();
    tap(dashes());
    await advance(0);
    await nextFrame();
    expect(popover()).toBeNull();
  });

  it('tap outside closes', async () => {
    renderMinimized();
    await openByTap();
    fireEvent.pointerDown(document.body, { pointerType: 'mouse' });
    await settle();
    expect(popover()).toBeNull();
  });

  it('Escape closes', async () => {
    renderMinimized();
    await openByTap();
    fireEvent.keyDown(document, { key: 'Escape' });
    await advance(0);
    await nextFrame();
    expect(popover()).toBeNull();
  });

  it('popover shows the same items as rows, no header', async () => {
    renderMinimized();
    await openByTap();
    const content = popover() as HTMLElement;
    const rows = within(content).getAllByRole('link');
    expect(rows.map(row => row.textContent)).toEqual(['TL;DR', '1Findings', '1.1Critical']);
    expect(within(content).getByRole('link', { current: 'location' })).toHaveTextContent(
      'Findings',
    );
    expect(within(content).queryByText('On this page')).toBeNull();
    expect(within(content).queryByRole('button')).toBeNull();
  });

  it('item click in popover closes it', async () => {
    const onValueChange = rs.fn();
    renderMinimized({ onValueChange });
    await openByTap();
    fireEvent.click(within(popover() as HTMLElement).getByRole('link', { name: /Critical/ }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('critical');
    await advance(0);
    await nextFrame();
    expect(popover()).toBeNull();
    expect(onValueChange).toHaveBeenCalledOnce();
  });

  it('item click in popover closes it without onValueChange (browser follows the link)', async () => {
    renderMinimized();
    await openByTap();
    const critical = within(popover() as HTMLElement).getByRole('link', { name: /Critical/ });
    expect(fireEvent.click(critical)).toBe(true);
    await advance(0);
    await nextFrame();
    expect(popover()).toBeNull();
  });

  it('item click in popover keeps it open when the consumer prevents default', async () => {
    render(
      <TableOfContents data-testid='toc' defaultView='minimized'>
        <TableOfContentsItem value='a' onClick={event => event.preventDefault()}>
          A
        </TableOfContentsItem>
      </TableOfContents>,
    );
    await openByTap();
    fireEvent.click(within(popover() as HTMLElement).getByRole('link', { name: 'A' }));
    await advance(0);
    await nextFrame();
    expect(popover()).toBeInTheDocument();
  });

  it('toggle from minimized back to full keeps aria-current on the same item', () => {
    renderMinimized();
    fireEvent.click(screen.getByTestId('toc--toggle'));
    expect(screen.getByRole('link', { current: 'location' })).toHaveTextContent('Findings');
  });
});

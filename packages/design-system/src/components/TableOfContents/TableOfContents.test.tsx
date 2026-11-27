import type { MouseEvent } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
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

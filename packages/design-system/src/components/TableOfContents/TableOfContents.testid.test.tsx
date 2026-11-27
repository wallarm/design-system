import { describe, expect, it } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { TableOfContents, TableOfContentsItem } from '.';

describe('TableOfContents — test ids', () => {
  it('cascades toc--toggle, toc--list and toc--item', () => {
    render(
      <TableOfContents data-testid='toc'>
        <TableOfContentsItem value='a'>A</TableOfContentsItem>
        <TableOfContentsItem value='b'>B</TableOfContentsItem>
      </TableOfContents>,
    );
    expect(screen.getByTestId('toc').tagName).toBe('NAV');
    expect(screen.getByTestId('toc--toggle').tagName).toBe('BUTTON');
    expect(screen.getByTestId('toc--list').tagName).toBe('UL');
    const items = screen.getAllByTestId('toc--item');
    expect(items).toHaveLength(2);
    for (const item of items) expect(item.tagName).toBe('A');
  });

  it('renders no test ids when the root has none', () => {
    const { container } = render(
      <TableOfContents>
        <TableOfContentsItem value='a'>A</TableOfContentsItem>
      </TableOfContents>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });

  it('lets an item override its own id', () => {
    render(
      <TableOfContents data-testid='toc'>
        <TableOfContentsItem value='a' data-testid='section-a'>
          A
        </TableOfContentsItem>
        <TableOfContentsItem value='b'>B</TableOfContentsItem>
      </TableOfContents>,
    );
    expect(screen.getByTestId('section-a').tagName).toBe('A');
    expect(screen.getAllByTestId('toc--item')).toHaveLength(1);
  });

  it('cascades toc--dashes and toc--popover in the minimized view', async () => {
    render(
      <TableOfContents data-testid='toc' defaultView='minimized'>
        <TableOfContentsItem value='a'>A</TableOfContentsItem>
      </TableOfContents>,
    );
    const dashes = screen.getByTestId('toc--dashes');
    expect(dashes).toHaveAttribute('aria-hidden', 'true');
    fireEvent.pointerDown(dashes, { pointerType: 'touch' });
    fireEvent.click(dashes);
    await act(() => Promise.resolve());
    expect(screen.getByTestId('toc--popover')).toBeInTheDocument();
    expect(screen.getByTestId('toc--item')).toHaveAttribute('href', '#a');
  });
});

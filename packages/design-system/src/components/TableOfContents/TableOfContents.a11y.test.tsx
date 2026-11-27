import { describe, expect, it } from '@rstest/core';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableOfContents, TableOfContentsItem } from '.';

const renderToc = () =>
  render(
    <TableOfContents data-testid='toc' value='b'>
      <TableOfContentsItem value='a'>A</TableOfContentsItem>
      <TableOfContentsItem value='b'>B</TableOfContentsItem>
    </TableOfContents>,
  );

describe('TableOfContents — accessibility', () => {
  it('is a nav landmark named by its title', () => {
    renderToc();
    expect(screen.getByRole('navigation', { name: 'On this page' }).tagName).toBe('NAV');
  });

  it('list semantics', () => {
    renderToc();
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('UL');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    for (const item of items) {
      expect(within(item).getByRole('link')).toBeInTheDocument();
    }
  });

  it('exposes the active section through aria-current', () => {
    renderToc();
    expect(screen.getByRole('link', { current: 'location' })).toHaveTextContent('B');
  });

  it('toggle has an accessible name and aria-expanded', async () => {
    renderToc();
    const toggle = screen.getByRole('button', { name: 'Collapse table of contents' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(toggle);
    const expand = screen.getByRole('button', { name: 'Expand table of contents' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
  });
});

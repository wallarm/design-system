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

  it('toggle keeps a stable name, aria-expanded reflects Full, aria-controls points at the list', async () => {
    renderToc();
    const toggle = screen.getByRole('button', { name: 'On this page' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute('aria-controls', screen.getByRole('list').id);
    expect(screen.getByRole('list').id).not.toBe('');
    await userEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'On this page' })).toBe(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    // The list is unmounted in Minimized: no dangling IDREF.
    expect(toggle).not.toHaveAttribute('aria-controls');
  });
});

import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { TableOfContents, TableOfContentsItem } from '.';

describe('TableOfContents — test ids', () => {
  it('cascades toc--toggle, toc--list and toc--item', () => {
    render(
      <TableOfContents data-testid='toc'>
        <TableOfContentsItem value='a'>A</TableOfContentsItem>
        <TableOfContentsItem value='b'>B</TableOfContentsItem>
      </TableOfContents>,
    );
    const slots: [string, string][] = [
      ['toc', 'table-of-contents'],
      ['toc--toggle', 'table-of-contents-toggle'],
      ['toc--list', 'table-of-contents-list'],
    ];
    for (const [testId, slot] of slots) {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-slot', slot);
    }
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
});

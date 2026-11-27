import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { TableOfContents, TableOfContentsItem } from '.';

const PROPS = '{"report": "attack", "section": "Находки — findings", "n": 2}';

describe('TableOfContents — analytics (docs/metrics/contract.md)', () => {
  it('lands item data-analytics-* byte-for-byte on the real <a>', () => {
    render(
      <TableOfContents>
        <TableOfContentsItem
          value='findings'
          data-testid='findings'
          data-analytics-id='TOC_FINDINGS'
          data-analytics-props={PROPS}
        >
          Findings
        </TableOfContentsItem>
      </TableOfContents>,
    );
    const item = screen.getByTestId('findings');
    expect(item.tagName).toBe('A');
    expect(item).toHaveAttribute('data-analytics-id', 'TOC_FINDINGS');
    expect(item).toHaveAttribute('data-analytics-props', PROPS);
  });

  it('lands root attributes on the <nav>', () => {
    render(
      <TableOfContents
        data-testid='toc'
        data-analytics-id='REPORT_TOC'
        data-analytics-props={PROPS}
        id='toc'
      >
        <TableOfContentsItem value='a'>A</TableOfContentsItem>
      </TableOfContents>,
    );
    const root = screen.getByTestId('toc');
    expect(root.tagName).toBe('NAV');
    expect(root).toHaveAttribute('data-analytics-id', 'REPORT_TOC');
    expect(root).toHaveAttribute('data-analytics-props', PROPS);
    expect(root).toHaveAttribute('id', 'toc');
  });

  it('resolves item clicks via closest() and still fires consumer onClick', async () => {
    const captured = captureAnalyticsClicks();
    const onClick = rs.fn();
    const onValueChange = rs.fn();
    render(
      <TableOfContents onValueChange={onValueChange}>
        <TableOfContentsItem value='a' data-testid='a' data-analytics-id='TOC_A' onClick={onClick}>
          A
        </TableOfContentsItem>
      </TableOfContents>,
    );
    await userEvent.click(screen.getByText('A'));
    expect(captured).toHaveBeenCalledWith('TOC_A');
    expect(onClick).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('a');
  });

  it('keeps data-analytics-id across a view toggle', async () => {
    render(
      <TableOfContents data-testid='toc' data-analytics-id='REPORT_TOC'>
        <TableOfContentsItem value='a'>A</TableOfContentsItem>
      </TableOfContents>,
    );
    await userEvent.click(screen.getByTestId('toc--toggle'));
    await userEvent.click(screen.getByTestId('toc--toggle'));
    expect(screen.getByTestId('toc')).toHaveAttribute('data-analytics-id', 'REPORT_TOC');
  });
});

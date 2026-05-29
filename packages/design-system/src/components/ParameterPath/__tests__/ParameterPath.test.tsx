import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ParameterPath } from '../ParameterPath';

vi.mock('../useParameterPathTruncation', async importOriginal => {
  const mod = await importOriginal<typeof import('../useParameterPathTruncation')>();
  return {
    ...mod,
    useParameterPathTruncation: vi.fn(() => ({ isTruncated: false, visibleSegmentIndices: [] })),
  };
});

import { useParameterPathTruncation } from '../useParameterPathTruncation';

const visible = (testId: string): HTMLElement => {
  const root = screen.getByTestId(testId);
  const v = root.querySelector('[data-row="visible"]');
  if (!(v instanceof HTMLElement)) throw new Error('visible row not found');
  return v;
};

describe('ParameterPath', () => {
  it('renders method, all segments and encoding in order', () => {
    const { container } = render(
      <ParameterPath
        method='POST'
        segments={['JSON', 'nginx_config']}
        encoding='BASE64'
        data-testid='pp'
      />,
    );

    expect(screen.getByTestId('pp')).toBeInTheDocument();
    expect(container.textContent).toContain('POST');
    expect(container.textContent).toContain('JSON');
    expect(container.textContent).toContain('nginx_config');
    expect(container.textContent).toContain('BASE64');
  });

  it('does not render method section when method is omitted (SOAP/MCP case)', () => {
    render(<ParameterPath segments={['cookie', 'session_id']} data-testid='pp' />);
    const v = visible('pp');
    expect(within(v).queryByText('POST')).not.toBeInTheDocument();
    expect(within(v).queryByText('GET')).not.toBeInTheDocument();
    expect(within(v).getByText('session_id')).toBeInTheDocument();
  });

  it('marks the last segment as highlighted', () => {
    render(<ParameterPath segments={['JSON', 'nginx_config']} data-testid='pp' />);
    const v = visible('pp');
    const segments = within(v).getAllByTestId(/pp--segment-/);
    expect(segments).toHaveLength(2);
    expect(segments.at(-1)).toHaveAttribute('data-variant', 'highlighted');
    expect(segments[0]).toHaveAttribute('data-variant', 'default');
  });

  it('shows zap icon on highlighted segment when attack=true', () => {
    const { container } = render(
      <ParameterPath segments={['JSON', 'nginx_config']} attack data-testid='pp' />,
    );
    expect(
      container.querySelector(
        '[data-slot="parameter-path-segment"][data-variant="highlighted"] svg',
      ),
    ).toBeTruthy();
  });

  it('skips encoding when not provided', () => {
    render(<ParameterPath method='GET' segments={['query', 'filter']} data-testid='pp' />);
    expect(screen.queryByText('BASE64')).not.toBeInTheDocument();
  });
});

describe('ParameterPath truncation rendering', () => {
  it('renders ellipsis between first and last segment when isTruncated', () => {
    vi.mocked(useParameterPathTruncation).mockReturnValue({
      isTruncated: true,
      visibleSegmentIndices: [0, 5],
    });
    render(
      <ParameterPath
        method='POST'
        segments={['multipart', 'a', 'b', 'c', 'd', 'get']}
        attack
        data-testid='pp'
      />,
    );
    const v = visible('pp');
    expect(within(v).getByLabelText('Collapsed segments')).toBeInTheDocument();
    expect(within(v).getByText('multipart')).toBeInTheDocument();
    expect(within(v).getByText('get')).toBeInTheDocument();
    // 'a', 'b', 'c', 'd' should NOT appear in the visible row
    expect(within(v).queryByText('a')).not.toBeInTheDocument();
    expect(within(v).queryByText('b')).not.toBeInTheDocument();
  });

  it('renders all segments inline when not truncated', () => {
    vi.mocked(useParameterPathTruncation).mockReturnValue({
      isTruncated: false,
      visibleSegmentIndices: [0, 1, 2],
    });
    render(<ParameterPath segments={['alpha', 'beta', 'gamma']} data-testid='pp' />);
    const v = visible('pp');
    expect(within(v).queryByLabelText('Collapsed segments')).not.toBeInTheDocument();
    expect(within(v).getByText('alpha')).toBeInTheDocument();
    expect(within(v).getByText('beta')).toBeInTheDocument();
    expect(within(v).getByText('gamma')).toBeInTheDocument();
  });
});

describe('ParameterPath expandable', () => {
  const longSegments = ['multipart', 'a', 'b', 'c', 'd', 'get'];

  const mockTruncated = () =>
    vi.mocked(useParameterPathTruncation).mockReturnValue({
      isTruncated: true,
      visibleSegmentIndices: [0, 5],
    });

  it('is not interactive when expandable is omitted, even while truncated', () => {
    mockTruncated();
    render(<ParameterPath method='POST' segments={longSegments} data-testid='pp' />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    const v = visible('pp');
    expect(within(v).getByLabelText('Collapsed segments')).toBeInTheDocument();
    expect(within(v).queryByText('b')).not.toBeInTheDocument();
  });

  it('is not interactive when the path fits (not truncated)', () => {
    vi.mocked(useParameterPathTruncation).mockReturnValue({
      isTruncated: false,
      visibleSegmentIndices: [0, 1, 2],
    });
    render(<ParameterPath segments={['alpha', 'beta', 'gamma']} expandable data-testid='pp' />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('expands to the full path on click and collapses again on a second click (uncontrolled)', () => {
    mockTruncated();
    render(<ParameterPath method='POST' segments={longSegments} expandable data-testid='pp' />);

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(within(visible('pp')).queryByText('b')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const expandedRow = visible('pp');
    expect(within(expandedRow).getByText('b')).toBeInTheDocument();
    expect(within(expandedRow).getByText('c')).toBeInTheDocument();
    expect(within(expandedRow).queryByLabelText('Collapsed segments')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const collapsedRow = visible('pp');
    expect(within(collapsedRow).queryByText('b')).not.toBeInTheDocument();
    expect(within(collapsedRow).getByLabelText('Collapsed segments')).toBeInTheDocument();
  });

  it('honours defaultExpanded for the initial uncontrolled state', () => {
    mockTruncated();
    render(
      <ParameterPath
        method='POST'
        segments={longSegments}
        expandable
        defaultExpanded
        data-testid='pp'
      />,
    );
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(visible('pp')).getByText('b')).toBeInTheDocument();
  });

  it.each(['Enter', ' '])('toggles via keyboard (%s)', key => {
    mockTruncated();
    render(<ParameterPath method='POST' segments={longSegments} expandable data-testid='pp' />);
    const trigger = screen.getByRole('button');
    fireEvent.keyDown(trigger, { key });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(visible('pp')).getByText('d')).toBeInTheDocument();
  });

  it('does not toggle when the click ends a text selection', () => {
    mockTruncated();
    const getSelection = vi
      .spyOn(window, 'getSelection')
      .mockReturnValue({ toString: () => 'multipart' } as unknown as Selection);
    render(<ParameterPath method='POST' segments={longSegments} expandable data-testid='pp' />);

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(within(visible('pp')).queryByText('b')).not.toBeInTheDocument();
    getSelection.mockRestore();
  });

  describe('controlled', () => {
    it('reflects the controlled expanded prop and does not self-manage state', () => {
      mockTruncated();
      const onExpandedChange = vi.fn();
      const { rerender } = render(
        <ParameterPath
          method='POST'
          segments={longSegments}
          expandable
          expanded={false}
          onExpandedChange={onExpandedChange}
          data-testid='pp'
        />,
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      // Click reports the requested next state but does NOT expand on its own.
      fireEvent.click(trigger);
      expect(onExpandedChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
      expect(within(visible('pp')).queryByText('b')).not.toBeInTheDocument();

      // Parent drives the state.
      rerender(
        <ParameterPath
          method='POST'
          segments={longSegments}
          expandable
          expanded
          onExpandedChange={onExpandedChange}
          data-testid='pp'
        />,
      );
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
      expect(within(visible('pp')).getByText('b')).toBeInTheDocument();
    });
  });
});

describe('ParameterPath copy', () => {
  it('overrides clipboard text with formatAsFilter on copy event', () => {
    const { container } = render(
      <ParameterPath
        method='POST'
        segments={['JSON', 'nginx_config']}
        encoding='BASE64'
        data-testid='pp'
      />,
    );

    const setData = vi.fn();
    const event = new Event('copy', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { setData }, writable: false });

    container.querySelector('[data-slot="parameter-path"]')!.dispatchEvent(event);

    expect(setData).toHaveBeenCalledWith(
      'text/plain',
      'method = "POST" AND parameter = "JSON.nginx_config" AND encoding = "BASE64"',
    );
    expect(event.defaultPrevented).toBe(true);
  });

  it('uses custom copyFormat callback when provided', () => {
    const copyFormat = vi.fn(() => 'CUSTOM');
    const { container } = render(
      <ParameterPath
        method='GET'
        segments={['query', 'filter']}
        copyFormat={copyFormat}
        data-testid='pp'
      />,
    );
    const setData = vi.fn();
    const event = new Event('copy', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { setData }, writable: false });
    container.querySelector('[data-slot="parameter-path"]')!.dispatchEvent(event);

    expect(copyFormat).toHaveBeenCalledWith({
      method: 'GET',
      segments: ['query', 'filter'],
      encoding: undefined,
    });
    expect(setData).toHaveBeenCalledWith('text/plain', 'CUSTOM');
  });

  it('falls through to native copy when copyFormat returns an empty string', () => {
    const copyFormat = vi.fn(() => '');
    const { container } = render(
      <ParameterPath segments={['a']} copyFormat={copyFormat} data-testid='pp' />,
    );
    const setData = vi.fn();
    const event = new Event('copy', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { setData }, writable: false });
    container.querySelector('[data-slot="parameter-path"]')!.dispatchEvent(event);

    expect(copyFormat).toHaveBeenCalled();
    expect(setData).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});

describe('ParameterPath edge cases', () => {
  it('renders nothing meaningful with empty segments and no method/encoding', () => {
    const { container } = render(<ParameterPath segments={[]} data-testid='pp' />);
    const v = container.querySelector('[data-row="visible"]');
    expect(v?.children.length).toBe(0);
  });

  it('does not render zap when attack=true but there are no segments', () => {
    const { container } = render(<ParameterPath segments={[]} attack data-testid='pp' />);
    expect(container.querySelector('[data-slot="parameter-path-segment"] svg')).toBeNull();
  });

  it('renders single segment as highlighted with attack zap', () => {
    const { container } = render(
      <ParameterPath method='GET' segments={['only']} attack data-testid='pp' />,
    );
    const seg = container.querySelector('[data-slot="parameter-path-segment"]');
    expect(seg).toHaveAttribute('data-variant', 'highlighted');
    expect(seg?.querySelector('svg')).toBeTruthy();
  });

  it('cascades data-testid to method, encoding, and ellipsis sub-components', () => {
    vi.mocked(useParameterPathTruncation).mockReturnValue({
      isTruncated: true,
      visibleSegmentIndices: [0, 3],
    });
    render(
      <ParameterPath
        method='POST'
        segments={['multi', 'a', 'b', 'tail']}
        encoding='BASE64'
        data-testid='pp'
      />,
    );
    expect(screen.getByTestId('pp--method')).toBeInTheDocument();
    expect(screen.getByTestId('pp--encoding')).toBeInTheDocument();
    expect(screen.getByTestId('pp--ellipsis')).toBeInTheDocument();
    expect(screen.getByTestId('pp--segment-0')).toBeInTheDocument();
    expect(screen.getByTestId('pp--segment-3')).toBeInTheDocument();
  });
});

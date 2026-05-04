import { render, screen, within } from '@testing-library/react';
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
    const segments = screen.getAllByTestId(/pp--segment-/);
    expect(segments).toHaveLength(2);
    expect(segments.at(-1)?.firstElementChild).toHaveAttribute('data-variant', 'highlighted');
    expect(segments[0]?.firstElementChild).toHaveAttribute('data-variant', 'default');
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

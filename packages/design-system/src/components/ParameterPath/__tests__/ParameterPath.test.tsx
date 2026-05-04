import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ParameterPath } from '../ParameterPath';

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
    expect(screen.queryByText('POST')).not.toBeInTheDocument();
    expect(screen.queryByText('GET')).not.toBeInTheDocument();
    expect(screen.getByText('session_id')).toBeInTheDocument();
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

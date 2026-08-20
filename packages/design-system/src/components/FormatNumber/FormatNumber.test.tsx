import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormatNumber } from './FormatNumber';

describe('FormatNumber compact notation', () => {
  it('renders a tooltip trigger for abbreviated values', () => {
    render(<FormatNumber value={12_042} data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveAttribute('data-part', 'trigger');
  });

  it('renders no tooltip for small values', () => {
    render(<FormatNumber value={42} data-testid='num' />);
    expect(screen.getByTestId('num')).not.toHaveAttribute('data-part');
  });
});

describe('FormatNumber standard notation', () => {
  it('renders no tooltip for standard notation', () => {
    render(<FormatNumber value={12_042} notation='standard' data-testid='num' />);
    expect(screen.getByTestId('num')).not.toHaveAttribute('data-part');
  });

  it('displays the full formatted number', () => {
    render(<FormatNumber value={12_042} notation='standard' data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveTextContent('12,042');
  });
});

describe('FormatNumber null/undefined', () => {
  it('renders em dash for null', () => {
    render(<FormatNumber value={null} data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveTextContent('—');
  });

  it('renders em dash for undefined', () => {
    render(<FormatNumber value={undefined} data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveTextContent('—');
  });

  it('wraps null in a tooltip', () => {
    render(<FormatNumber value={null} data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveAttribute('data-part', 'trigger');
  });
});

describe('FormatNumber special values', () => {
  it('renders em dash for NaN', () => {
    render(<FormatNumber value={Number.NaN} data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveTextContent('—');
  });

  it('renders em dash for Infinity', () => {
    render(<FormatNumber value={Number.POSITIVE_INFINITY} data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveTextContent('—');
  });

  it('renders no tooltip for NaN', () => {
    render(<FormatNumber value={Number.NaN} data-testid='num' />);
    expect(screen.getByTestId('num')).not.toHaveAttribute('data-part');
  });
});

describe('FormatNumber aria-label', () => {
  it('sets aria-label with full value for abbreviated decimal', () => {
    render(<FormatNumber value={12_042} data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveAttribute('aria-label', '12,042');
  });

  it('sets aria-label with unit for abbreviated decimal', () => {
    render(<FormatNumber value={12_042} unit='requests' data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('requests'),
    );
  });

  it('sets aria-label for abbreviated bytes', () => {
    render(<FormatNumber value={12_700_000} type='byte' data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveAttribute('aria-label', '12,700,000 bytes');
  });
});

describe('FormatNumber data-slot', () => {
  it('has data-slot="format-number"', () => {
    render(<FormatNumber value={42} data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveAttribute('data-slot', 'format-number');
  });
});

describe('FormatNumber percent', () => {
  it('displays percentage value', () => {
    render(<FormatNumber value={50} type='percent' data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveTextContent('50%');
  });

  it('renders no tooltip for percent', () => {
    render(<FormatNumber value={50} type='percent' data-testid='num' />);
    expect(screen.getByTestId('num')).not.toHaveAttribute('data-part');
  });
});

describe('FormatNumber byte', () => {
  it('renders tooltip for abbreviated byte values', () => {
    render(<FormatNumber value={12_700_000} type='byte' data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveAttribute('data-part', 'trigger');
  });

  it('renders no tooltip for small byte values', () => {
    render(<FormatNumber value={512} type='byte' data-testid='num' />);
    expect(screen.getByTestId('num')).not.toHaveAttribute('data-part');
  });

  it('renders full bytes string in standard notation', () => {
    render(<FormatNumber value={12_700_000} type='byte' notation='standard' data-testid='num' />);
    expect(screen.getByTestId('num')).toHaveTextContent('12,700,000 bytes');
  });
});

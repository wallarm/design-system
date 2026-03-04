import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SegmentValue } from '../QueryBarChip/SegmentValue';

describe('SegmentValue', () => {
  it('renders children text', () => {
    render(<SegmentValue>192.168.1.1</SegmentValue>);
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('applies correct base styling with info text color and medium font weight', () => {
    const { container } = render(<SegmentValue>United States</SegmentValue>);
    const segment = container.querySelector('[data-slot="segment-value"]');
    expect(segment).toHaveClass('text-sm', 'font-medium', 'text-text-info');
  });

  it('applies custom className', () => {
    const { container } = render(<SegmentValue className='custom-class'>test-value</SegmentValue>);
    const segment = container.querySelector('[data-slot="segment-value"]');
    expect(segment).toHaveClass('custom-class');
  });

  it('handles text truncation with ellipsis', () => {
    const longText = 'This is a very long value that should be truncated with ellipsis';
    const { container } = render(<SegmentValue>{longText}</SegmentValue>);
    const segment = container.querySelector('[data-slot="segment-value"]');
    expect(segment).toHaveClass('overflow-hidden', 'text-ellipsis', 'whitespace-nowrap');
  });

  it('forwards HTML attributes', () => {
    const { container } = render(<SegmentValue data-testid='custom-test-id'>123</SegmentValue>);
    const segment = container.querySelector('[data-testid="custom-test-id"]');
    expect(segment).toBeInTheDocument();
  });

  it('has correct displayName', () => {
    expect(SegmentValue.displayName).toBe('SegmentValue');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SegmentOperator } from '../QueryBarChip/SegmentOperator';

describe('SegmentOperator', () => {
  it('renders children text', () => {
    render(<SegmentOperator>is</SegmentOperator>);
    expect(screen.getByText('is')).toBeInTheDocument();
  });

  it('applies correct base styling with secondary text color', () => {
    const { container } = render(<SegmentOperator>contains</SegmentOperator>);
    const segment = container.querySelector('[data-slot="segment-operator"]');
    expect(segment).toHaveClass('text-sm', 'font-normal', 'text-text-secondary');
  });

  it('applies custom className', () => {
    const { container } = render(
      <SegmentOperator className='custom-class'>is not</SegmentOperator>,
    );
    const segment = container.querySelector('[data-slot="segment-operator"]');
    expect(segment).toHaveClass('custom-class');
  });

  it('handles text truncation with ellipsis', () => {
    const longText = 'greater than or equal to';
    const { container } = render(<SegmentOperator>{longText}</SegmentOperator>);
    const segment = container.querySelector('[data-slot="segment-operator"]');
    expect(segment).toHaveClass('overflow-hidden', 'text-ellipsis', 'whitespace-nowrap');
  });

  it('forwards HTML attributes', () => {
    const { container } = render(
      <SegmentOperator data-testid='custom-test-id'>is</SegmentOperator>,
    );
    const segment = container.querySelector('[data-testid="custom-test-id"]');
    expect(segment).toBeInTheDocument();
  });

  it('has correct displayName', () => {
    expect(SegmentOperator.displayName).toBe('SegmentOperator');
  });
});

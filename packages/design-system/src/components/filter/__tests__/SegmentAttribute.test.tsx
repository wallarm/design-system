import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SegmentAttribute } from '../primitives/SegmentAttribute';

describe('SegmentAttribute', () => {
  it('renders children text', () => {
    render(<SegmentAttribute>IP Address</SegmentAttribute>);
    expect(screen.getByText('IP Address')).toBeInTheDocument();
  });

  it('applies correct base styling', () => {
    const { container } = render(<SegmentAttribute>Test</SegmentAttribute>);
    const segment = container.querySelector('[data-slot="segment-attribute"]');
    expect(segment).toHaveClass('text-sm', 'font-normal', 'text-text-primary');
  });

  it('applies custom className', () => {
    const { container } = render(
      <SegmentAttribute className='custom-class'>Test</SegmentAttribute>,
    );
    const segment = container.querySelector('[data-slot="segment-attribute"]');
    expect(segment).toHaveClass('custom-class');
  });

  it('handles text truncation with ellipsis', () => {
    const longText = 'This is a very long attribute name that should be truncated';
    const { container } = render(<SegmentAttribute>{longText}</SegmentAttribute>);
    const segment = container.querySelector('[data-slot="segment-attribute"]');
    expect(segment).toHaveClass('overflow-hidden', 'text-ellipsis', 'whitespace-nowrap');
  });

  it('forwards HTML attributes', () => {
    const { container } = render(
      <SegmentAttribute data-testid='custom-test-id'>Test</SegmentAttribute>,
    );
    const segment = container.querySelector('[data-testid="custom-test-id"]');
    expect(segment).toBeInTheDocument();
  });

  it('has correct displayName', () => {
    expect(SegmentAttribute.displayName).toBe('SegmentAttribute');
  });
});

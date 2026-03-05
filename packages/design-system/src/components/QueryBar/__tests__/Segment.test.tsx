import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Segment } from '../QueryBarInput';

describe('Segment', () => {
  describe('attribute variant', () => {
    it('renders children text', () => {
      render(<Segment variant='attribute'>IP Address</Segment>);
      expect(screen.getByText('IP Address')).toBeInTheDocument();
    });

    it('applies correct styling', () => {
      const { container } = render(<Segment variant='attribute'>Test</Segment>);
      const p = container.querySelector('[data-slot="segment-attribute"] p');
      expect(p).toHaveClass('text-sm', 'font-normal', 'text-text-primary');
    });
  });

  describe('operator variant', () => {
    it('renders children text', () => {
      render(<Segment variant='operator'>is</Segment>);
      expect(screen.getByText('is')).toBeInTheDocument();
    });

    it('applies correct styling', () => {
      const { container } = render(<Segment variant='operator'>contains</Segment>);
      const p = container.querySelector('[data-slot="segment-operator"] p');
      expect(p).toHaveClass('text-sm', 'font-normal', 'text-text-secondary');
    });
  });

  describe('value variant', () => {
    it('renders children text', () => {
      render(<Segment variant='value'>192.168.1.1</Segment>);
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    });

    it('applies correct styling', () => {
      const { container } = render(<Segment variant='value'>United States</Segment>);
      const p = container.querySelector('[data-slot="segment-value"] p');
      expect(p).toHaveClass('text-sm', 'font-medium', 'text-text-info');
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <Segment variant='attribute' className='custom-class'>Test</Segment>,
    );
    const segment = container.querySelector('[data-slot="segment-attribute"]');
    expect(segment).toHaveClass('custom-class');
  });

  it('forwards HTML attributes', () => {
    const { container } = render(
      <Segment variant='attribute' data-testid='custom-test-id'>Test</Segment>,
    );
    expect(container.querySelector('[data-testid="custom-test-id"]')).toBeInTheDocument();
  });

  it('has correct displayName', () => {
    expect(Segment.displayName).toBe('Segment');
  });
});

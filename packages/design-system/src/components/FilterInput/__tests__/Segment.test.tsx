import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Segment } from '../FilterInputField';

describe('Segment', () => {
  describe('attribute variant', () => {
    it('renders children text', () => {
      render(<Segment variant='attribute'>IP Address</Segment>);
      expect(screen.getByText('IP Address')).toBeInTheDocument();
    });

    it('applies correct styling', () => {
      render(
        <Segment data-testid='segment' variant='attribute'>
          Test
        </Segment>,
      );
      const p = screen.getByTestId('segment').querySelector('p');
      expect(p).toHaveClass('text-sm', 'font-normal', 'text-text-primary');
    });
  });

  describe('operator variant', () => {
    it('renders children text', () => {
      render(<Segment variant='operator'>is</Segment>);
      expect(screen.getByText('is')).toBeInTheDocument();
    });

    it('applies correct styling', () => {
      render(
        <Segment data-testid='segment' variant='operator'>
          contains
        </Segment>,
      );
      const p = screen.getByTestId('segment').querySelector('p');
      expect(p).toHaveClass('text-sm', 'font-normal', 'text-text-secondary');
    });
  });

  describe('value variant', () => {
    it('renders children text', () => {
      render(<Segment variant='value'>192.168.1.1</Segment>);
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    });

    it('applies correct styling', () => {
      render(
        <Segment data-testid='segment' variant='value'>
          United States
        </Segment>,
      );
      const p = screen.getByTestId('segment').querySelector('p');
      expect(p).toHaveClass('text-sm', 'font-medium', 'text-text-info');
    });
  });

  it('applies custom className', () => {
    render(
      <Segment data-testid='segment' variant='attribute' className='custom-class'>
        Test
      </Segment>,
    );
    const segment = screen.getByTestId('segment');
    expect(segment).toHaveClass('custom-class');
  });

  it('forwards HTML attributes', () => {
    const { container } = render(
      <Segment variant='attribute' data-testid='custom-test-id'>
        Test
      </Segment>,
    );
    expect(container.querySelector('[data-testid="custom-test-id"]')).toBeInTheDocument();
  });

  it('has correct displayName', () => {
    expect(Segment.displayName).toBe('Segment');
  });
});

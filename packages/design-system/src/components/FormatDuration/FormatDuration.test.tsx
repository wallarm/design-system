import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { formatDuration, toDurationMs } from '../../utils/formatDuration';
import { FormatDuration } from './FormatDuration';

describe('formatDuration', () => {
  it('writes the two largest units', () => {
    expect(formatDuration(5_400_000)).toBe('1h 30m');
    expect(formatDuration(1_823_000)).toBe('30m 23s');
    expect(formatDuration(45_000)).toBe('45s');
    expect(formatDuration(3_870_000)).toBe('1h 4m');
    expect(formatDuration(184_500_000)).toBe('2d 3h');
  });

  it('leaves out a zero second unit', () => {
    expect(formatDuration(3_600_000)).toBe('1h');
    expect(formatDuration(3_605_000)).toBe('1h');
    expect(formatDuration(180_000)).toBe('3m');
  });

  it('rounds to the second', () => {
    expect(formatDuration(41_600)).toBe('42s');
    expect(formatDuration(59_500)).toBe('1m');
  });

  it('marks zero and sub-second durations', () => {
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(300)).toBe('<1s');
  });

  it('reads ISO 8601 durations', () => {
    expect(formatDuration('PT2M13S')).toBe('2m 13s');
    expect(formatDuration('P1DT2H')).toBe('1d 2h');
    expect(toDurationMs('PT41.2S')).toBe(41_200);
  });

  it('is a dash for what is not a duration', () => {
    expect(formatDuration(null)).toBe('—');
    expect(formatDuration(-1)).toBe('—');
    expect(formatDuration(Number.NaN)).toBe('—');
    expect(formatDuration('P')).toBe('—');
    expect(formatDuration('PT')).toBe('—');
    expect(formatDuration('2 minutes')).toBe('—');
  });
});

describe('FormatDuration', () => {
  it('renders a time element with an ISO duration', () => {
    render(<FormatDuration value={1_823_000} data-testid='d' />);
    const el = screen.getByTestId('d');
    expect(el.tagName).toBe('TIME');
    expect(el).toHaveAttribute('dateTime', 'PT30M23S');
    expect(el).toHaveTextContent('30m 23s');
  });

  it('adds a tooltip only when units were dropped', () => {
    render(<FormatDuration value={3_870_000} data-testid='cut' />);
    render(<FormatDuration value={5_400_000} data-testid='whole' />);
    expect(screen.getByTestId('cut')).toHaveAttribute('data-part', 'trigger');
    expect(screen.getByTestId('whole')).not.toHaveAttribute('data-part');
  });

  it('drops the tooltip with tooltip={false}', () => {
    render(<FormatDuration value={3_870_000} tooltip={false} data-testid='d' />);
    expect(screen.getByTestId('d')).not.toHaveAttribute('data-part');
  });

  it('renders an em dash with a tooltip for null', () => {
    render(<FormatDuration value={null} data-testid='d' />);
    expect(screen.getByTestId('d')).toHaveTextContent('—');
    expect(screen.getByTestId('d')).toHaveAttribute('data-part', 'trigger');
  });

  it('renders a bare em dash for an invalid value', () => {
    render(<FormatDuration value={-5} data-testid='d' />);
    expect(screen.getByTestId('d')).toHaveTextContent('—');
    expect(screen.getByTestId('d')).not.toHaveAttribute('data-part');
    expect(screen.getByTestId('d')).not.toHaveAttribute('dateTime');
  });
});

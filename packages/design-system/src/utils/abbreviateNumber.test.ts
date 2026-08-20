import { describe, expect, it } from 'vitest';
import { abbreviateNumber, formatBytes, formatFullNumber, formatPercent } from './abbreviateNumber';

describe('abbreviateNumber', () => {
  it('returns "0" for zero', () => {
    expect(abbreviateNumber(0)).toBe('0');
  });

  it('returns raw value below 1,000', () => {
    expect(abbreviateNumber(5)).toBe('5');
    expect(abbreviateNumber(42)).toBe('42');
    expect(abbreviateNumber(999)).toBe('999');
  });

  it('abbreviates thousands with k suffix', () => {
    expect(abbreviateNumber(1_000)).toBe('1k');
    expect(abbreviateNumber(1_500)).toBe('1.5k');
    expect(abbreviateNumber(12_042)).toBe('12k');
    expect(abbreviateNumber(59_614)).toBe('59.6k');
    expect(abbreviateNumber(999_499)).toBe('999k');
  });

  it('abbreviates millions with M suffix (uppercase)', () => {
    expect(abbreviateNumber(999_500)).toBe('1M');
    expect(abbreviateNumber(1_000_000)).toBe('1M');
    expect(abbreviateNumber(59_614_283)).toBe('59.6M');
    expect(abbreviateNumber(999_499_999)).toBe('999M');
  });

  it('abbreviates billions with B suffix (uppercase)', () => {
    expect(abbreviateNumber(999_500_000)).toBe('1B');
    expect(abbreviateNumber(1_000_000_000)).toBe('1B');
    expect(abbreviateNumber(2_500_000_000)).toBe('2.5B');
  });

  it('abbreviates trillions with T suffix (uppercase)', () => {
    expect(abbreviateNumber(999_500_000_000)).toBe('1T');
    expect(abbreviateNumber(1_400_000_000_000)).toBe('1.4T');
  });

  it('drops trailing .0 for whole numbers', () => {
    expect(abbreviateNumber(10_000)).toBe('10k');
    expect(abbreviateNumber(50_000)).toBe('50k');
  });

  it('shows 0 decimals when scaled value >= 100', () => {
    expect(abbreviateNumber(100_000)).toBe('100k');
    expect(abbreviateNumber(500_000)).toBe('500k');
  });

  it('handles negative numbers', () => {
    expect(abbreviateNumber(-1_500)).toBe('-1.5k');
    expect(abbreviateNumber(-59_614_283)).toBe('-59.6M');
    expect(abbreviateNumber(-42)).toBe('-42');
  });
});

describe('formatFullNumber', () => {
  it('formats with thousand separators', () => {
    expect(formatFullNumber(0)).toBe('0');
    expect(formatFullNumber(999)).toBe('999');
    expect(formatFullNumber(1_000)).toBe('1,000');
    expect(formatFullNumber(12_042)).toBe('12,042');
    expect(formatFullNumber(59_614_283)).toBe('59,614,283');
    expect(formatFullNumber(1_400_000_000_000)).toBe('1,400,000,000,000');
  });

  it('handles negative numbers', () => {
    expect(formatFullNumber(-12_042)).toBe('-12,042');
  });
});

describe('formatPercent', () => {
  it('returns "0%" for zero', () => {
    expect(formatPercent(0)).toBe('0%');
  });

  it('returns "100%" for exactly 100', () => {
    expect(formatPercent(100)).toBe('100%');
  });

  it('formats standard percentages', () => {
    expect(formatPercent(50)).toBe('50%');
    expect(formatPercent(25)).toBe('25%');
    expect(formatPercent(75)).toBe('75%');
  });

  it('applies boundary safety: never shows 0% for positive values', () => {
    expect(formatPercent(0.02)).toBe('<1%');
    expect(formatPercent(0.4)).toBe('<1%');
  });

  it('applies boundary safety: never shows 100% for values < 100', () => {
    expect(formatPercent(99.97)).toBe('>99%');
    expect(formatPercent(99.6)).toBe('>99%');
  });

  it('respects decimal precision', () => {
    expect(formatPercent(25.5, 1)).toBe('25.5%');
    expect(formatPercent(0.02, 1)).toBe('<0.1%');
    expect(formatPercent(99.97, 1)).toBe('>99.9%');
  });

  it('handles exact boundary values with decimals', () => {
    expect(formatPercent(0.1, 1)).toBe('0.1%');
    expect(formatPercent(99.9, 1)).toBe('99.9%');
  });
});

describe('formatBytes', () => {
  it('formats bytes below 1000 as B', () => {
    expect(formatBytes(0)).toEqual({ display: '0 B', full: '0 bytes' });
    expect(formatBytes(512)).toEqual({ display: '512 B', full: '512 bytes' });
    expect(formatBytes(999)).toEqual({ display: '999 B', full: '999 bytes' });
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1_000)).toEqual({ display: '1 KB', full: '1,000 bytes' });
    expect(formatBytes(3_400)).toEqual({ display: '3.4 KB', full: '3,400 bytes' });
  });

  it('formats megabytes', () => {
    expect(formatBytes(12_700_000)).toEqual({ display: '12.7 MB', full: '12,700,000 bytes' });
  });

  it('formats gigabytes', () => {
    expect(formatBytes(2_345_678_901)).toEqual({
      display: '2.3 GB',
      full: '2,345,678,901 bytes',
    });
  });

  it('formats terabytes', () => {
    expect(formatBytes(1_100_000_000_000)).toEqual({
      display: '1.1 TB',
      full: '1,100,000,000,000 bytes',
    });
  });

  it('drops trailing .0 for whole units', () => {
    expect(formatBytes(1_000_000)).toEqual({ display: '1 MB', full: '1,000,000 bytes' });
  });
});

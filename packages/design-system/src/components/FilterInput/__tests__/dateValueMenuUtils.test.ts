import { describe, expect, it } from 'vitest';
import {
  dateValueToIso,
  tryParseDateValue,
} from '../FilterInputMenu/FilterInputDateValueMenu/utils';

describe('FilterInputDateValueMenu utils', () => {
  describe('tryParseDateValue', () => {
    it('returns undefined for undefined', () => {
      expect(tryParseDateValue(undefined)).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(tryParseDateValue('')).toBeUndefined();
    });

    it('returns undefined for short string (preset-like)', () => {
      expect(tryParseDateValue('7d')).toBeUndefined();
    });

    it('parses ISO date string', () => {
      const result = tryParseDateValue('2026-03-15');
      expect(result).toBeDefined();
      expect(result!.year).toBe(2026);
      expect(result!.month).toBe(3);
      expect(result!.day).toBe(15);
    });

    it('parses locale date string', () => {
      const result = tryParseDateValue('Mar 15, 2026');
      expect(result).toBeDefined();
      expect(result!.year).toBe(2026);
      expect(result!.month).toBe(3);
      expect(result!.day).toBe(15);
    });

    it('returns undefined for invalid date', () => {
      expect(tryParseDateValue('not a date at all')).toBeUndefined();
    });
  });

  describe('dateValueToIso', () => {
    it('converts DateValue to ISO string', () => {
      const dv = tryParseDateValue('2026-03-05');
      expect(dv).toBeDefined();
      expect(dateValueToIso(dv!)).toBe('2026-03-05');
    });

    it('pads single-digit month and day', () => {
      const dv = tryParseDateValue('2026-01-03');
      expect(dv).toBeDefined();
      expect(dateValueToIso(dv!)).toBe('2026-01-03');
    });
  });
});

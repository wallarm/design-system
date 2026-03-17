import { describe, expect, it } from 'vitest';
import {
  DATE_PRESETS,
  formatDateForChip,
  getDateDisplayLabel,
  isDatePreset,
  MIN_DATE_STRING_LENGTH,
} from '../FilterInputMenu/FilterInputDateValueMenu/constants';

describe('FilterInputDateValueMenu constants', () => {
  describe('MIN_DATE_STRING_LENGTH', () => {
    it('is 6', () => {
      expect(MIN_DATE_STRING_LENGTH).toBe(6);
    });
  });

  describe('isDatePreset', () => {
    it('recognizes valid presets', () => {
      expect(isDatePreset('30m')).toBe(true);
      expect(isDatePreset('1h')).toBe(true);
      expect(isDatePreset('7d')).toBe(true);
      expect(isDatePreset('14d')).toBe(true);
    });

    it('rejects non-preset strings', () => {
      expect(isDatePreset('2026-03-15')).toBe(false);
      expect(isDatePreset('abc')).toBe(false);
      expect(isDatePreset('')).toBe(false);
    });
  });

  describe('formatDateForChip', () => {
    it('formats ISO date', () => {
      expect(formatDateForChip('2026-03-15')).toBe('Mar 15, 2026');
    });

    it('formats locale date', () => {
      expect(formatDateForChip('Mar 5, 2026')).toBe('Mar 5, 2026');
    });

    it('returns original string for invalid date', () => {
      expect(formatDateForChip('not-a-date')).toBe('not-a-date');
    });
  });

  describe('getDateDisplayLabel', () => {
    it('returns preset label for known preset', () => {
      expect(getDateDisplayLabel('30m')).toBe('30 min ago');
      expect(getDateDisplayLabel('7d')).toBe('7 days ago');
    });

    it('returns value as-is for unknown preset pattern', () => {
      expect(getDateDisplayLabel('99h')).toBe('99h');
    });

    it('formats absolute date', () => {
      expect(getDateDisplayLabel('2026-03-15')).toBe('Mar 15, 2026');
    });
  });

  describe('DATE_PRESETS', () => {
    it('contains expected number of presets', () => {
      expect(DATE_PRESETS.length).toBe(7);
    });

    it('each preset has value and label', () => {
      for (const preset of DATE_PRESETS) {
        expect(preset.value).toBeTruthy();
        expect(preset.label).toBeTruthy();
      }
    });
  });
});

import { describe, expect, it } from 'vitest';
import { getCurrentValueTokenText, getValueFilterText } from '../lib/menuFilterText';
import type { FieldValueOption } from '../types';

describe('getCurrentValueTokenText', () => {
  describe('single-value operators', () => {
    it('returns raw input for building mode', () => {
      expect(getCurrentValueTokenText(null, '4', '', '=')).toBe('4');
    });

    it('returns segment filter text for inline value editing', () => {
      expect(getCurrentValueTokenText('value', 'ignored', '4', '=')).toBe('4');
    });

    it('passes through comma-separated text as-is for single-value operators', () => {
      expect(getCurrentValueTokenText(null, '2, 3, 4', '', '=')).toBe('2, 3, 4');
    });
  });

  describe('multi-select operators', () => {
    it('extracts the last comma-separated token from building input', () => {
      expect(getCurrentValueTokenText(null, '2XX, 3XX, 4', '', 'in')).toBe('4');
    });

    it('trims whitespace around the last token', () => {
      expect(getCurrentValueTokenText(null, '2XX,   4  ', '', 'in')).toBe('4');
    });

    it('returns empty when input ends with comma', () => {
      expect(getCurrentValueTokenText(null, '2XX, 3XX, ', '', 'in')).toBe('');
    });

    it('returns empty for blank input', () => {
      expect(getCurrentValueTokenText(null, '', '', 'in')).toBe('');
    });

    it('reads from segment filter text in inline editing mode', () => {
      expect(getCurrentValueTokenText('value', 'ignored', '2XX, 4', 'in')).toBe('4');
    });
  });
});

describe('getValueFilterText', () => {
  const fieldValues: FieldValueOption[] = [
    { value: '2XX', label: '2XX' },
    { value: '3XX', label: '3XX' },
    { value: '4XX', label: '4XX' },
  ];

  it('returns raw token for single-value operators', () => {
    expect(getValueFilterText('4', '=', fieldValues)).toBe('4');
  });

  it('returns the token for multi-select operators when not a known value', () => {
    expect(getValueFilterText('4', 'in', fieldValues)).toBe('4');
  });

  it('returns empty for multi-select operators when the token matches a known label', () => {
    expect(getValueFilterText('4XX', 'in', fieldValues)).toBe('');
  });

  it('returns empty for multi-select operators when the token matches a known value', () => {
    expect(getValueFilterText('2XX', 'in', fieldValues)).toBe('');
  });

  it('returns empty for multi-select operators when token is blank', () => {
    expect(getValueFilterText('', 'in', fieldValues)).toBe('');
  });

  it('returns the token when field values list is empty', () => {
    expect(getValueFilterText('4', 'in', [])).toBe('4');
  });
});

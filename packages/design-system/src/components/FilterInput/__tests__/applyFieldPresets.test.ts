import { describe, expect, it, vi } from 'vitest';
import { applyFieldPresets } from '../lib/applyFieldPresets';
import type { FieldMetadata } from '../types';

describe('applyFieldPresets', () => {
  it('leaves fields without a preset untouched', () => {
    const fields: FieldMetadata[] = [
      { name: 'country', label: 'Country', type: 'string' },
      { name: 'priority', label: 'Priority', type: 'integer' },
    ];
    expect(applyFieldPresets(fields)).toBe(fields);
  });

  it('wires all four helpers when preset is status_code', () => {
    const [field] = applyFieldPresets([
      { name: 'response_code', label: 'Status', type: 'integer', preset: 'status_code' },
    ]);
    expect(typeof field.acceptChar).toBe('function');
    expect(typeof field.normalize).toBe('function');
    expect(typeof field.getSuggestions).toBe('function');
    expect(typeof field.validate).toBe('function');
  });

  it('produces status-code suggestions on empty input', () => {
    const [field] = applyFieldPresets([
      { name: 'response_code', label: 'Status', type: 'integer', preset: 'status_code' },
    ]);
    expect(field.getSuggestions?.('').map(o => o.value)).toEqual([
      '1XX',
      '2XX',
      '3XX',
      '4XX',
      '5XX',
    ]);
  });

  it('lets a consumer-supplied callback win over the preset', () => {
    const customValidate = vi.fn(() => false);
    const [field] = applyFieldPresets([
      {
        name: 'response_code',
        label: 'Status',
        type: 'integer',
        preset: 'status_code',
        validate: customValidate,
      },
    ]);
    expect(field.validate).toBe(customValidate);
    // The remaining helpers are still filled in by the preset.
    expect(typeof field.acceptChar).toBe('function');
    expect(typeof field.normalize).toBe('function');
    expect(typeof field.getSuggestions).toBe('function');
  });

  it('returns the same array reference when no preset applies', () => {
    const fields: FieldMetadata[] = [{ name: 'country', label: 'Country', type: 'string' }];
    expect(applyFieldPresets(fields)).toBe(fields);
  });
});

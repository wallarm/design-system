import { describe, expect, it } from 'vitest';
import { OPERATOR_LABELS_BY_TYPE } from '../lib/constants';

describe('OPERATOR_LABELS_BY_TYPE', () => {
  it('enum operator labels do not contain WIP markers', () => {
    const enumLabels = OPERATOR_LABELS_BY_TYPE.enum;
    for (const [key, label] of Object.entries(enumLabels)) {
      expect(label, `enum.${key} should not contain WIP text`).not.toMatch(/wip/i);
      expect(label, `enum.${key} should not contain emoji`).not.toMatch(/[\u{1F600}-\u{1F9FF}]/u);
    }
  });

  it('enum.in label is "is any of"', () => {
    expect(OPERATOR_LABELS_BY_TYPE.enum.in).toBe('is any of');
  });

  it('enum.not_in label is "is not any of"', () => {
    expect(OPERATOR_LABELS_BY_TYPE.enum.not_in).toBe('is not any of');
  });
});

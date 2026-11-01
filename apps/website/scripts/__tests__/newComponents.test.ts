import { describe, expect, it } from '@rstest/core';
import { isShallowOutput, isWithinWindow } from '../newComponents';

const ref = new Date('2026-10-22T00:00:00Z');
const daysBefore = (n: number) => new Date(ref.getTime() - n * 86_400_000);

describe('isWithinWindow', () => {
  it('29 days before is within', () => expect(isWithinWindow(daysBefore(29), ref, 30)).toBe(true));
  it('exactly 30 days is within', () => expect(isWithinWindow(daysBefore(30), ref, 30)).toBe(true));
  it('31 days is outside', () => expect(isWithinWindow(daysBefore(31), ref, 30)).toBe(false));
  it('after the reference is within', () =>
    expect(isWithinWindow(new Date(ref.getTime() + 86_400_000), ref, 30)).toBe(true));
});

describe('isShallowOutput', () => {
  it('detects a shallow repo', () => expect(isShallowOutput('true\n')).toBe(true));
  it('detects a full repo', () => expect(isShallowOutput('false\n')).toBe(false));
});

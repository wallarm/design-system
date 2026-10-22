import { describe, expect, it } from '@rstest/core';
import { resolveTheme, THEME_SCRIPT } from '../themeScript';

describe('resolveTheme', () => {
  it('honours an explicit stored theme', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('follows the system preference for auto or nothing stored', () => {
    expect(resolveTheme('auto', true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });
});

describe('THEME_SCRIPT', () => {
  it('reads the Rspress appearance key and sets data-theme', () => {
    expect(THEME_SCRIPT).toContain('rspress-theme-appearance');
    expect(THEME_SCRIPT).toContain('dataset.theme');
  });
});

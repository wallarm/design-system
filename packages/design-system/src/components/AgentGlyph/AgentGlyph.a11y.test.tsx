import { describe, expect, it } from '@rstest/core';
import { render } from '@testing-library/react';
import { AgentGlyph } from './AgentGlyph';

describe('AgentGlyph a11y', () => {
  it('is always aria-hidden, with no role or label', () => {
    const { container } = render(
      <AgentGlyph agent='wally' size={20} aria-label='Wally' role='img' />,
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.hasAttribute('role')).toBe(false);
    expect(svg?.hasAttribute('aria-label')).toBe(false);
  });
});

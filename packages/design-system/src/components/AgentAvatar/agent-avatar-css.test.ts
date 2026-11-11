import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from '@rstest/core';

// The six engine rules of the reference page (03 §7.10, lines 325–332) as attribute selectors.
const css = readFileSync(
  path.resolve(__dirname, '../../theme/components/agent-avatar.css'),
  'utf8',
).replace(/\s+/g, ' ');
const index = readFileSync(path.resolve(__dirname, '../../theme/index.css'), 'utf8');

describe('agent-avatar.css', () => {
  it('is imported by the theme', () => {
    expect(index).toContain("@import './components/agent-avatar.css';");
  });
  it('carries the page rules', () => {
    expect(css).toContain(
      "[data-slot='agent-avatar'] { display: block; overflow: visible; transition: filter 0.5s; }",
    );
    expect(css).toContain(
      "[data-slot='agent-avatar'][data-state='off'] { filter: saturate(0.3) brightness(1.04); }",
    );
    expect(css).toContain("[data-part~='ly'] > [data-part~='li'] { display: none; }");
    expect(css).toContain("[data-part~='ly'][data-ready] > [data-part~='li'] { display: inline; }");
    expect(css).toContain("[data-part~='ly'][data-ready] > [data-part~='lg'] { display: none; }");
    expect(css).toContain(
      "[data-slot='agent-avatar'][data-ghosting] [data-part~='veil'] { display: inline; }",
    );
    expect(css).toMatch(
      /\[data-veiled\] \[data-part~='fig'\] > :is\(\[data-part~='bodyly'\], \[data-part~='back'\], \[data-part~='front'\], g\[clip-path\]:not\(\[data-part~='veil'\]\)\) \{ visibility: hidden; \}/,
    );
  });
  it('sits in the components layer, so consumer utilities override it', () => {
    expect(css.trim()).toMatch(/@layer components \{/);
  });
  it('snaps under reduced motion', () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{ \[data-slot='agent-avatar'\] \{ transition: none; \} \}/,
    );
  });
});

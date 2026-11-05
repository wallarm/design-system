import { describe, expect, it } from '@rstest/core';
import { PLACES, rendererFor } from '../places';

// Handoff 05 §2.1 (D1, D2, D3, D9, D26): size picks only the renderer; liveness and the shadow are set per place.
describe('places', () => {
  it('match the handoff table', () => {
    expect(PLACES).toEqual({
      inline: { size: 20, renderer: 'glyph', live: false, shadow: false },
      inlineXs: { size: 16, renderer: 'glyph', live: false, shadow: false },
      tableRow: { size: 20, renderer: 'glyph', live: false, shadow: false },
      overviewRow: { size: 40, renderer: '3d', live: true, shadow: false },
      overviewSetup: { size: 40, renderer: '3d', live: false, shadow: false },
      header: { size: 48, renderer: '3d', live: false, shadow: false },
      peopleRow: { size: 56, renderer: '3d', live: false, shadow: false },
      teamCard: { size: 72, renderer: '3d', live: true, shadow: false },
      drawerHeader: { size: 72, renderer: '3d', live: true, shadow: true },
      emptyChat: { size: 120, renderer: '3d', live: true, shadow: true },
    });
  });

  it('keep every renderer consistent with its size', () => {
    for (const p of Object.values(PLACES)) expect(rendererFor(p.size)).toBe(p.renderer);
    expect(rendererFor(32)).toBe('glyph');
    expect(rendererFor(40)).toBe('3d');
  });
});

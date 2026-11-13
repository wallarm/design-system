import { describe, expect, it } from '@rstest/core';
import { shade, solveField } from '../bake';
import cases from './__fixtures__/bake-demo-v5.json';

const fromB64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));

// The page's own coverage masks go in, its own pixels must come out: the shading math is checked without a canvas.
// The page's pixels went through putImageData → PNG, which stores premultiplied alpha: on the soft rim (alpha < 255)
// a channel can round by up to 255 / alpha. Opaque pixels must match exactly.
describe('bake port (Look Demo v5)', () => {
  for (const c of cases as {
    name: string;
    d: string;
    col: string;
    P: number;
    mat: 'felt' | 'vinyl';
    region: [number, number, number];
    masks: Record<string, string>;
    rgba: string;
  }[]) {
    it(`matches the page for ${c.name}`, () => {
      const [, y0, R] = c.region;
      const masks = (N: number) => fromB64(c.masks[N] as string);
      const u = solveField(masks, R);
      const got = shade(u, masks(c.P), c.col, c.P, c.mat, y0, R);
      const want = fromB64(c.rgba);
      expect(got.length).toBe(want.length);
      let opaque = 0;
      for (let i = 0; i < want.length; i += 4) {
        const a = want[i + 3] as number;
        expect(got[i + 3], `alpha @${i / 4}`).toBe(a);
        if (!a) continue;
        const tol = a === 255 ? 0 : Math.ceil(255 / a);
        if (a === 255) opaque++;
        for (let ch = 0; ch < 3; ch++) {
          const diff = Math.abs((got[i + ch] as number) - (want[i + ch] as number));
          if (diff > tol)
            expect(
              `${c.name} px ${i / 4} ch ${ch}: ${got[i + ch]} vs ${want[i + ch]} (alpha ${a})`,
            ).toBe('within tolerance');
        }
      }
      expect(opaque).toBeGreaterThan(100);
    });
  }
});

describe('bake cache', () => {
  it('bakes one key once when calls overlap, and revokes nothing in use', async () => {
    const { bake } = await import('../bake');
    const proto = SVGElement.prototype as unknown as { getBBox?: () => DOMRect };
    proto.getBBox = () => ({ x: 0, y: 0, width: 10, height: 10 }) as DOMRect;
    const created: string[] = [];
    const revoked: string[] = [];
    URL.createObjectURL = () => {
      const u = `blob:test/${created.length}`;
      created.push(u);
      return u;
    };
    URL.revokeObjectURL = u => void revoked.push(u);
    let runs = 0;
    const run = async () => {
      runs++;
      await new Promise(r => setTimeout(r, 5));
      return new Blob(['x']);
    };
    const [a, b] = await Promise.all([
      bake('M0 0H9V9Z', '#fff', 8, 'felt', run),
      bake('M0 0H9V9Z', '#fff', 8, 'felt', run),
    ]);
    expect(runs).toBe(1);
    expect(a.url).toBe(b.url);
    expect(created).toHaveLength(1);
    expect(revoked).toHaveLength(0);
  });

  it('forgets a failed bake so the next call retries', async () => {
    const { bake } = await import('../bake');
    let runs = 0;
    const flaky = async () => {
      runs++;
      if (runs === 1) throw new Error('worker died');
      return new Blob(['x']);
    };
    await expect(bake('M1 1H9V9Z', '#fff', 8, 'felt', flaky)).rejects.toThrow('worker died');
    await expect(bake('M1 1H9V9Z', '#fff', 8, 'felt', flaky)).resolves.toMatchObject({
      x0: expect.any(Number),
    });
    expect(runs).toBe(2);
  });
});

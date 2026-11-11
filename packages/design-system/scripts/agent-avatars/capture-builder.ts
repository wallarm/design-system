/**
 * Captures the reference builder's output (look v17) for the AgentLookBuilder parity test (WDS-204):
 * 20 looks from the builder's own Random (Math.random seeded) and the «needs care» cases of handoff 02,
 * each as a static 3D character and glyphs.
 *
 *   REF=<path to agent-characters.html> pnpm tsx scripts/agent-avatars/capture-builder.ts
 *
 * Needs Google Chrome stable (as the handoff's scripts do).
 */

import type { BrowserType } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = createRequire(
  path.resolve(here, '../../../configs/playwright-config/package.json'),
)('@playwright/test') as { chromium: BrowserType };
const REF = process.env.REF;
if (!REF)
  throw new Error('Set REF to the reference page (handoff reference/agent-characters.html)');
const OUT = path.resolve(
  here,
  '../../src/lib/agent-characters/__tests__/__fixtures__/builder-v17.json',
);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const errors: string[] = [];
page.on('pageerror', e => errors.push(String(e)));
await page.goto(`file://${path.resolve(REF)}`);
await page.waitForTimeout(1500);

// Sent as source text: tsx would inject helpers (__name) into a serialised function.
const CAPTURE = `(() => {
  const G = name => (0, eval)(name);
  const B = G('B'), randomize = G('randomize'), makeChar = G('makeChar'), glyph = G('glyph');
  // the page's PRNG, seeded, in place of Math.random for the builder's Random
  let a = 204;
  const real = Math.random;
  Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const random = [];
  for (let i = 0; i < 20; i++) { randomize(); random.push({ shape: B.shape, color: B.color, eyes: B.eyes, prop: B.prop }); }
  Math.random = real;
  const needsCare = [
    { shape: 'mochi', color: 'plum', eyes: 'round', prop: 'beanie' },
    { shape: 'egg', color: 'sky', eyes: 'oval', prop: 'headlamp' },
    { shape: 'padlock', color: 'lilac', eyes: 'tall', prop: 'none' },
    { shape: 'safe', color: 'stone', eyes: 'sleepy', prop: 'none' },
    { shape: 'padlock', color: 'heather', eyes: 'round', prop: 'plaster' },
    { shape: 'capsule', color: 'pink', eyes: 'oval', prop: 'badge' },
    { shape: 'kettle', color: 'sand', eyes: 'round', prop: 'periscope' },
  ];
  const ch = (c, o) => {
    const x = makeChar(c, { live: false, ghostable: true, ...o });
    const jobs = [...x.svg.querySelectorAll('[data-j]')].map(g => { const j = g.__job; return { d: j.d, col: j.col, mat: j.mat || 'felt', veil: !!j.veil }; });
    const svg = x.svg.cloneNode(true);
    for (const im of svg.querySelectorAll('image')) for (const k of ['href', 'x', 'y', 'width', 'height']) im.removeAttribute(k);
    return { svg: svg.outerHTML, jobs };
  };
  const cases = [];
  for (const c of random) {
    cases.push({ kind: 'random', look: c, size: 72, state: 'idle', shadow: false, cover: false, ...ch(c, { size: 72, state: 'idle', shadow: false }) });
    cases.push({ kind: 'random', look: c, size: 120, state: 'idle', shadow: true, cover: false, ...ch(c, { size: 120, state: 'idle', shadow: true }) });
  }
  for (const c of needsCare)
    for (const size of [72, 120])
      cases.push({ kind: 'needs-care', look: c, size, state: 'idle', shadow: true, cover: true, ...ch(c, { size, state: 'idle', shadow: true, cover: true }) });
  const glyphs = [];
  for (const c of random) for (const size of [20, 24]) glyphs.push({ look: c, size, state: 'idle', svg: glyph(c, size, 'idle') });
  for (const c of needsCare) for (const st of ['idle', 'partly']) glyphs.push({ look: c, size: 24, state: st, svg: glyph(c, 24, st) });
  return { cases, glyphs };
})()`;
const data = await page.evaluate(CAPTURE);
await browser.close();
if (errors.length) throw new Error(`page errors: ${errors.join('\n')}`);
writeFileSync(OUT, `${JSON.stringify(data)}\n`);
// biome-ignore lint/suspicious/noConsole: CLI output
console.log(`${path.relative(process.cwd(), OUT)} written`);

/**
 * Captures the reference page's own output (Look Demo v5) for the port's unit tests:
 * geom/optY per shape, eyesPath, propDef and glyph.
 *
 *   REF=<path to agent-characters.html> pnpm tsx scripts/agent-avatars/capture-fixtures.ts
 *
 * Needs Google Chrome stable (as the handoff's scripts do).
 */

import type { BrowserType } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// Playwright is a dependency of the workspace's playwright-config, not of this package: borrow it from there.
const { chromium } = createRequire(
  path.resolve(here, '../../../configs/playwright-config/package.json'),
)('@playwright/test') as { chromium: BrowserType };
const REF = process.env.REF;
if (!REF)
  throw new Error('Set REF to the reference page (handoff reference/agent-characters.html)');
const OUT = path.resolve(
  here,
  '../../src/lib/agent-characters/__tests__/__fixtures__/demo-v5.json',
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
  // Top-level consts of the page's classic script are global lexical bindings: reach them by name.
  const G = name => (0, eval)(name);
  const SHAPES = G('SHAPES');
  const SHAPE = G('SHAPE');
  const geom = G('geom');
  const optY = G('optY');
  const eyeTargets = G('eyeTargets');
  const helloPop = G('helloPop');
  const eyesPath = G('eyesPath');
  const propDef = G('propDef');
  const glyph = G('glyph');
  const PROPS = G('PROPS');
  const CAST_A = G('CAST_A');
  const hexOf = G('hexOf');

  const geoms = Object.fromEntries(
    SHAPES.map(S => {
      const g = geom(S);
      return [S.id, { top: g.top, HW: Array.from({ length: 240 }, (_, i) => g.hw(i / 2)), foot: g.foot, optY: optY({ shape: S.id }) }];
    }),
  );

  const styles = ['round', 'oval', 'tall', 'sleepy'];
  const states = ['idle', 'hello', 'working', 'needs', 'done', 'failed', 'off', 'box', 'power', 'invite'];
  const eyeShapes = ['gumdrop', 'mug', 'kettle'];
  const eyes = {};
  for (const sh of eyeShapes)
    for (const style of styles) {
      for (const st of states) {
        const t = eyeTargets(style, st);
        eyes[\`\${sh}|\${style}|\${st}\`] = eyesPath(SHAPE[sh], t, 1, 0, t.gy);
      }
      const pop = helloPop(eyeTargets(style, 'idle'));
      eyes[\`\${sh}|\${style}|pop\`] = eyesPath(SHAPE[sh], pop, 1, 0, pop.gy);
      eyes[\`\${sh}|\${style}|idle|open.3,gx.4,gy-.2\`] = eyesPath(SHAPE[sh], eyeTargets(style, 'idle'), 0.3, 0.4, -0.2);
    }

  const props = {};
  for (const S of SHAPES) for (const [kind] of PROPS) if (kind !== 'none') props[\`\${kind}|\${S.id}\`] = propDef(kind, S, '#9A7FE0');

  const glyphs = {};
  const gStates = ['idle', 'hello', 'working', 'needs', 'done', 'failed', 'off', 'box', 'invite', 'partly'];
  for (const c of CAST_A) for (const st of gStates) for (const size of [16, 20, 24, 32, 17.5]) glyphs[\`\${c.id}|\${st}|\${size}\`] = glyph(c, size, st);
  // looks outside the cast: object shapes with parts and every glyph prop
  const extra = [
    { shape: 'kettle', color: 'butter', eyes: 'oval', prop: 'beanie' },
    { shape: 'padlock', color: 'lilac', eyes: 'tall', prop: 'periscope' },
    { shape: 'safe', color: 'graphite', eyes: 'sleepy', prop: 'sprout' },
    { shape: 'mug', color: 'petrol', eyes: 'round', prop: 'pennant' },
    { shape: 'cloud', color: 'oat', eyes: 'round', prop: 'dish' },
  ];
  for (const c of extra) for (const st of gStates) glyphs[\`\${c.shape}+\${c.prop}|\${st}|24\`] = glyph(c, 24, st);

  return { geoms, eyes, props, glyphs, extraLooks: extra, castColors: CAST_A.map(c => hexOf(c.color)) };
})()`;

const data = (await page.evaluate(CAPTURE)) as {
  geoms: Record<string, unknown>;
  eyes: Record<string, string>;
  props: Record<string, unknown>;
  glyphs: Record<string, string>;
};

// The bake: the page's own masks (alpha only) and its output pixels, so the shading math is checked without a canvas.
const BAKE_CAPTURE = `(async () => {
  const G = name => (0, eval)(name);
  const SHAPE = G('SHAPE'), HC = G('HC'), REG = G('REG'), BC = G('BC'), bkey = G('bkey'), orig = G('rmask');
  const b64 = a => { let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); };
  const cases = [
    { name: 'dome-coral-felt-96', d: SHAPE.dome.d, col: '#FF4D2E', P: 96, mat: 'felt' },
    { name: 'mug-petrol-felt-72', d: SHAPE.mug.d, col: '#2D6E8E', P: 72, mat: 'felt' },
    { name: 'kettle-handle-ink-vinyl-40', d: SHAPE.kettle.parts[0].d, col: '#262A36', P: 40, mat: 'vinyl' },
  ];
  const out = [];
  for (const c of cases) {
    HC.delete(c.d); REG.delete(c.d); BC.delete(bkey(c));
    const masks = {};
    rmask = (d, x0, y0, R, N) => { const a = orig(d, x0, y0, R, N); const al = new Uint8Array(N * N); for (let i = 0; i < N * N; i++) al[i] = a[i * 4 + 3]; masks[N] = b64(al); return a; };
    const r = G('bake')(c.d, c.col, c.P, c.mat);
    rmask = orig;
    const img = new Image(); img.src = r.url; await img.decode();
    const cv = document.createElement('canvas'); cv.width = cv.height = c.P; const x = cv.getContext('2d'); x.drawImage(img, 0, 0);
    out.push({ ...c, region: [r.x0, r.y0, r.R], masks, rgba: b64(new Uint8Array(x.getImageData(0, 0, c.P, c.P).data.buffer)) });
  }
  return out;
})()`;
const bakes = await page.evaluate(BAKE_CAPTURE);
writeFileSync(path.resolve(path.dirname(OUT), 'bake-demo-v5.json'), `${JSON.stringify(bakes)}\n`);

// Static 3D characters (WDS-199): makeChar's markup with live off, its bake jobs, and region() per layer outline.
const CHAR_CAPTURE = `(() => {
  const G = name => (0, eval)(name);
  const CAST_A = G('CAST_A'), makeChar = G('makeChar'), region = G('region'), DPR = G('DPR');
  const cases = [];
  const STATES = ['idle', 'needs', 'working', 'failed', 'off', 'box', 'invite', 'hello', 'done'];
  for (const c of CAST_A) {
    for (const state of STATES) cases.push({ c, size: 72, state, shadow: true, cover: false });
    for (const state of ['idle', 'needs', 'working', 'failed', 'off']) cases.push({ c, size: 72, state, shadow: true, cover: true });
    for (const state of ['idle', 'box', 'off']) {
      cases.push({ c, size: 40, state, shadow: false, cover: false });
      cases.push({ c, size: 120, state, shadow: true, cover: false });
    }
  }
  const regions = {};
  const out = cases.map(({ c, size, state, shadow, cover }) => {
    const ch = makeChar(c, { size, state, shadow, live: false, ghostable: true, cover });
    const jobs = [...ch.svg.querySelectorAll('[data-j]')].map(g => {
      const j = g.__job;
      regions[j.d] = region(j.d);
      return { d: j.d, col: j.col, mat: j.mat || 'felt', P: j.P, veil: !!j.veil };
    });
    // the bake's <image> attributes are not markup (a cached bake lands synchronously): keep the fixture small
    const svg = ch.svg.cloneNode(true);
    for (const im of svg.querySelectorAll('image')) for (const a of ['href', 'x', 'y', 'width', 'height']) im.removeAttribute(a);
    return { id: c.id, size, state, shadow, cover, svg: svg.outerHTML, jobs };
  });
  return { dpr: DPR, cases: out, regions };
})()`;
const chars = await page.evaluate(CHAR_CAPTURE);
writeFileSync(path.resolve(path.dirname(OUT), 'char-demo-v5.json'), `${JSON.stringify(chars)}\n`);

await browser.close();
if (errors.length) throw new Error(`page errors: ${errors.join('\n')}`);
writeFileSync(OUT, `${JSON.stringify(data)}\n`);
// The page's measured geometry ships as data (WDS-197), so the glyph path needs no canvas.
const geomOut = path.resolve(here, 'data/geom.json');
// Each entry carries the outline it was measured on, so the generator can refuse stale geometry.
const outlines = Object.fromEntries(
  (
    JSON.parse(readFileSync(path.resolve(here, 'data/shapes.json'), 'utf8')).shapes as {
      id: string;
      d: string;
    }[]
  ).map(x => [x.id, x.d]),
);
writeFileSync(
  geomOut,
  `${JSON.stringify(
    {
      $about: {
        source: 'reference/agent-characters.html',
        what: 'geom() per shape as the page computes it: top anchor, half-width per row (240 rows, y = i / 2), footprint at y 104',
        exported: `${new Date().toISOString().slice(0, 10)}, scripts/agent-avatars/capture-fixtures.ts, Chrome stable, deviceScaleFactor 2`,
      },
      byShape: Object.fromEntries(
        Object.entries(
          data.geoms as Record<string, { top: number[]; HW: number[]; foot: number[] }>,
        ).map(([id, g]) => [id, { d: outlines[id], top: g.top, HW: g.HW, foot: g.foot }]),
      ),
    },
    null,
    1,
  )}\n`,
);
// biome-ignore lint/suspicious/noConsole: CLI output
console.log(`fixtures and ${path.relative(process.cwd(), geomOut)} written`);

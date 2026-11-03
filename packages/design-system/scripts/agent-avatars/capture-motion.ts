/**
 * Captures the reference page's motion (look v17) for the engine's parity test: every attribute the engine writes,
 * frame by frame at 60 fps, on a virtual clock (performance.now, requestAnimationFrame, setTimeout) installed
 * before the page script runs. The scenarios and the clock are the shared harness in
 * src/lib/agent-characters/__tests__/__fixtures__/motion-harness.js, which the jsdom test runs against the port.
 *
 *   REF=<path to agent-characters.html> pnpm exec tsx scripts/agent-avatars/capture-motion.ts
 *
 * Needs Google Chrome stable.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import type { BrowserType } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = createRequire(
  path.resolve(here, '../../../configs/playwright-config/package.json'),
)('@playwright/test') as { chromium: BrowserType };
const REF = process.env.REF;
if (!REF) {
  throw new Error('Set REF to the reference page (handoff reference/agent-characters.html)');
}
const FIX = path.resolve(here, '../../src/lib/agent-characters/__tests__/__fixtures__');
const HARNESS = readFileSync(path.join(FIX, 'motion-harness.js'), 'utf8');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const errors: string[] = [];
page.on('pageerror', e => errors.push(String(e)));
// The clock goes in before the page script runs, so every timer and frame of the page is ours.
await page.addInitScript(`window.__H = ${HARNESS};\nwindow.__C = window.__H.installClock(window);`);
await page.goto(`file://${path.resolve(REF)}`);
await page.waitForLoadState('load');

// Sent as source text: tsx would inject helpers (__name) into a serialised function.
const SETUP = `(() => {
  const G = name => (0, eval)(name);
  const makeChar = G('makeChar'), PRESETS = G('PRESETS'), LIVE = G('LIVE'), ACT = G('ACT'), INV = G('INV');
  const stage = document.createElement('div');
  document.body.replaceChildren(stage);
  scrollTo(0, 0);
  const box = (el, x, y, w, h) => { el.style.cssText = 'position:fixed;margin:0;padding:0;left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px'; return el; };
  window.__A = {
    reset() {
      LIVE.clear(); ACT.last = 0; INV.last = -1e9; INV.owner = null;
      (0, eval)('looping = false; lastT = 0; lastBeat = 0; rectEpoch = 0;');
      stage.replaceChildren();
    },
    make(s, sc) {
      let cue = null;
      if (s.cue) {
        cue = stage.querySelector('[data-cue]');
        if (!cue) { cue = box(document.createElement('button'), sc.cue.x, sc.cue.y, sc.cue.w, sc.cue.h); cue.dataset.cue = ''; stage.appendChild(cue); }
      }
      const c = { ...PRESETS[s.id], name: '' };
      const ch = makeChar(c, { size: s.size, state: s.state, live: s.live, shadow: s.shadow, ghostable: true, cover: !!s.cover, autoReturn: !!s.autoReturn, salt: s.salt, cue });
      const wrap = box(document.createElement('div'), s.x, s.y, s.size, Math.round(s.size * 128 / 136));
      ch.svg.style.display = 'block';
      wrap.appendChild(ch.svg);
      stage.appendChild(wrap);
      return ch;
    },
    svgOf: c => c.svg,
    q: (svg, part) => svg.querySelector('.' + part),
    flags: svg => ({ st: [...svg.classList].find(k => k.startsWith('st-')).slice(3), ghosting: svg.classList.contains('ghosting'), veiled: svg.classList.contains('veiled') }),
  };
  return __H.SCENARIOS.map(s => s.name);
})()`;
const names = (await page.evaluate(SETUP)) as string[];

const out: Record<string, unknown> = {};
for (const name of names) {
  out[name] = await page.evaluate(`(() => {
    const sc = __H.SCENARIOS.find(s => s.name === ${JSON.stringify(name)});
    const rows = __H.run(sc, __C, __A);
    const rects = [...document.querySelectorAll('svg.ch, [data-cue]')].map(e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
    return { rows, rects };
  })()`);
}
await browser.close();
if (errors.length) throw new Error(`page errors: ${errors.join('\n')}`);

const json = JSON.stringify({
  $about: {
    source: 'reference/agent-characters.html (look v17)',
    exported: `${new Date().toISOString().slice(0, 10)}, scripts/agent-avatars/capture-motion.ts, Chrome stable`,
  },
  scenarios: out,
});
writeFileSync(path.join(FIX, 'motion-v17.json.gz'), gzipSync(json, { level: 9 }));
console.log(
  `motion-v17.json.gz: ${names.length} scenarios, ${(json.length / 1e6).toFixed(1)} MB of JSON`,
);

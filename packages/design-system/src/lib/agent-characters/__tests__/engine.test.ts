import { afterAll, beforeAll, describe, expect, it, rs } from '@rstest/core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { runInThisContext } from 'node:vm';
import { gunzipSync } from 'node:zlib';
import { charTree } from '../char';
import { CAST } from '../data.gen';
import { type Character, createCharacter } from '../engine';
import type { StateId } from '../eyes';
import { RUNTIME_KEY } from '../runtime';
import type { SvgNode } from '../svg';

// Motion parity with the reference page (look v14): the shared harness runs every scenario on the same virtual
// clock against the port, on the charTree markup, and every frame's attributes must equal the page's.
type Spec = {
  id: string;
  state: StateId;
  size: number;
  live: boolean;
  shadow: boolean;
  cover?: boolean;
  autoReturn?: boolean;
  cue?: boolean;
  salt: string;
  x: number;
  y: number;
};
type Scenario = { name: string; cue?: { x: number; y: number; w: number; h: number } };
type Row = [number, number, Record<string, unknown>];
type Clock = { uninstall(): void };
type Harness = {
  installClock(g: typeof globalThis): Clock;
  SCENARIOS: Scenario[];
  run(sc: Scenario, C: Clock, A: unknown): Row[];
};

const FIX = path.resolve(__dirname, '__fixtures__');
// the harness is one expression; the page evaluates the very same text
const H = runInThisContext(readFileSync(path.join(FIX, 'motion-harness.js'), 'utf8')) as Harness;
const page = JSON.parse(
  gunzipSync(readFileSync(path.join(FIX, 'motion-v14.json.gz'))).toString(),
) as {
  scenarios: Record<string, { rows: Row[]; rects: number[][] }>;
};

const NS = 'http://www.w3.org/2000/svg';
const build = (n: SvgNode): Element => {
  const e = document.createElementNS(NS, n.tag);
  for (const [k, v] of Object.entries(n.attrs))
    e.setAttribute(k === 'class' ? 'data-part' : k, String(v));
  for (const c of n.children ?? []) e.appendChild(build(c));
  return e;
};
/** the rects stubbed in the current scenario, to check against the page's measured ones */
let stubbed: number[][] = [];
const rectAt = (el: Element, x: number, y: number, w: number, h: number) => {
  stubbed.push([x, y, w, h]);
  el.getBoundingClientRect = () =>
    ({ left: x, top: y, width: w, height: h, x, y, right: x + w, bottom: y + h }) as DOMRect;
};

const stage = document.createElement('div');
const adapter = {
  reset() {
    delete (globalThis as Record<symbol, unknown>)[RUNTIME_KEY];
    stage.replaceChildren();
  },
  make(s: Spec, sc: Scenario) {
    let cue: Element | null = null;
    if (s.cue && sc.cue) {
      cue = stage.querySelector('[data-cue]');
      if (!cue) {
        cue = stage.appendChild(document.createElement('button'));
        cue.setAttribute('data-cue', '');
        rectAt(cue, sc.cue.x, sc.cue.y, sc.cue.w, sc.cue.h);
      }
    }
    const look = CAST.find(p => p.id === s.id);
    if (!look) throw new Error(s.id);
    const t = charTree(look, {
      size: s.size,
      state: s.state,
      shadow: s.shadow,
      cover: !!s.cover,
      ids: 'k',
    });
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('data-state', t.state);
    svg.toggleAttribute('data-ghosting', t.ghosting);
    svg.toggleAttribute('data-veiled', t.veiled);
    for (const n of t.children) svg.appendChild(build(n));
    stage.appendChild(svg);
    rectAt(svg, s.x, s.y, s.size, Math.round((s.size * 128) / 136));
    return createCharacter(svg, look, {
      size: s.size,
      state: s.state,
      live: s.live,
      cover: !!s.cover,
      autoReturn: !!s.autoReturn,
      salt: s.salt,
      cue,
    });
  },
  svgOf: (c: Character) => c.svg,
  q: (svg: Element, part: string) => svg.querySelector(`[data-part~="${part}"]`),
  flags: (svg: Element) => ({
    st: svg.getAttribute('data-state'),
    ghosting: svg.hasAttribute('data-ghosting'),
    veiled: svg.hasAttribute('data-veiled'),
  }),
};

/** first differing frame, for a readable failure */
const firstDiff = (mine: Row[], ref: Row[]) => {
  for (let i = 0; i < Math.max(mine.length, ref.length); i++)
    if (JSON.stringify(mine[i]) !== JSON.stringify(ref[i]))
      return { row: i, mine: mine[i], page: ref[i] };
  return null;
};

describe('engine motion parity with the reference page (look v14)', () => {
  let C: Clock;
  beforeAll(() => {
    document.body.appendChild(stage);
    C = H.installClock(globalThis);
  });
  afterAll(() => {
    C.uninstall();
    stage.remove();
    delete (globalThis as Record<symbol, unknown>)[RUNTIME_KEY];
  });

  it('captures every harness scenario', () => {
    expect(Object.keys(page.scenarios)).toEqual(H.SCENARIOS.map(s => s.name));
  });

  for (const sc of H.SCENARIOS) {
    it(`matches the page frame for frame: ${sc.name}`, () => {
      const ref = page.scenarios[sc.name];
      if (!ref) throw new Error(`no capture for ${sc.name}`);
      stubbed = [];
      const mine = H.run(sc, C, adapter);
      // the geometry the port sees (cue, neighbours) is the geometry the page measured
      const sorted = (r: number[][]) => r.map(x => x.join(',')).sort();
      expect(sorted(stubbed)).toEqual(sorted(ref.rects));
      expect(firstDiff(mine, ref.rows)).toBe(null);
      expect(mine.length).toBe(ref.rows.length);
    });
  }
});

describe('engine lifecycle', () => {
  const mount = (state: StateId, extra: { cover?: boolean } = {}) => {
    delete (globalThis as Record<symbol, unknown>)[RUNTIME_KEY];
    stage.replaceChildren();
    document.body.appendChild(stage);
    return adapter.make(
      {
        id: 'wally',
        state,
        size: 120,
        live: true,
        shadow: true,
        autoReturn: true,
        salt: 'life',
        x: 0,
        y: 0,
        ...extra,
      },
      { name: 'life' },
    );
  };
  afterAll(() => {
    rs.useRealTimers();
    stage.remove();
    delete (globalThis as Record<symbol, unknown>)[RUNTIME_KEY];
  });

  for (const [beat, go] of [
    ['hello', (c: Character) => c.greet()],
    ['done', (c: Character) => c.setState('done')],
    ['landing', (c: Character) => c.setState('power')],
    ['mask blink', (c: Character) => c.setState('working')],
    ['cover all', (c: Character) => c.coverAll()],
  ] as const) {
    it(`leaves nothing running when disposed mid-beat: ${beat}`, () => {
      rs.useFakeTimers({
        toFake: [
          'setTimeout',
          'clearTimeout',
          'requestAnimationFrame',
          'cancelAnimationFrame',
          'performance',
        ],
      });
      const errors: unknown[] = [];
      const onError = (e: ErrorEvent) => errors.push(e.error);
      window.addEventListener('error', onError);
      const ch = mount(beat === 'landing' ? 'box' : 'idle', { cover: beat === 'cover all' });
      rs.advanceTimersByTime(200);
      go(ch);
      rs.advanceTimersByTime(60);
      const before = ch.svg.outerHTML;
      ch.dispose();
      expect(rs.getTimerCount()).toBe(0);
      rs.advanceTimersByTime(5000);
      expect(ch.svg.outerHTML).toBe(before);
      expect(errors).toEqual([]);
      window.removeEventListener('error', onError);
      rs.useRealTimers();
    });
  }
});

describe('two bundled copies on one page', () => {
  afterAll(() => {
    rs.useRealTimers();
    stage.remove();
    delete (globalThis as Record<symbol, unknown>)[RUNTIME_KEY];
  });

  it('share one loop and one behaviour budget for the document', async () => {
    rs.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'performance',
      ],
    });
    delete (globalThis as Record<symbol, unknown>)[RUNTIME_KEY];
    stage.replaceChildren();
    document.body.appendChild(stage);
    rs.resetModules();
    const a = await import('../engine');
    rs.resetModules();
    const b = await import('../engine');
    const rt = (await import('../runtime')).getRuntime();
    expect(a.createCharacter).not.toBe(b.createCharacter);
    const ids = ['radar', 'wally', 'trim', 'sift', 'probe', 'mend'];
    const raf = window.requestAnimationFrame;
    let requested = 0;
    window.requestAnimationFrame = cb => {
      requested++;
      return raf(cb);
    };
    ids.forEach((id, i) => {
      const look = CAST.find(p => p.id === id);
      if (!look) throw new Error(id);
      const t = charTree(look, {
        size: 120,
        state: 'idle',
        shadow: true,
        cover: false,
        ids: `c${i}`,
      });
      const svg = document.createElementNS(NS, 'svg');
      for (const n of t.children) svg.appendChild(build(n));
      stage.appendChild(svg);
      (i % 2 ? b : a).createCharacter(svg, look, {
        size: 120,
        state: 'idle',
        live: true,
        salt: `copy-${i}`,
      });
    });
    expect(rt.live.size).toBe(6);
    let most = 0;
    const starts: number[] = [];
    const seen = new Set<unknown>();
    let frames = 0;
    rt.onFrame = () => {
      frames++;
      let running = 0;
      for (const c of rt.live)
        for (const k of c.clips as readonly { act?: number; rel?: number; t0: number }[])
          if (k.act && !k.rel) {
            running++;
            if (!seen.has(k)) {
              seen.add(k);
              starts.push(k.t0);
            }
          }
      most = Math.max(most, running);
    };
    rs.advanceTimersByTime(60_000);
    rt.onFrame = undefined;
    window.requestAnimationFrame = raf;
    expect(requested).toBe(frames + 1); // one loop: one frame request per frame
    expect(most).toBeLessThanOrEqual(2);
    expect(starts.length).toBeGreaterThan(10);
    starts.sort((x, y) => x - y);
    for (let i = 1; i < starts.length; i++)
      expect((starts[i] as number) - (starts[i - 1] as number)).toBeGreaterThanOrEqual(700);
    for (const c of [...rt.live]) (c as Character).dispose();
    expect(rs.getTimerCount()).toBe(0);
  });
});

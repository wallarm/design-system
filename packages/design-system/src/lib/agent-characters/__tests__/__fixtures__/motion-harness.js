// Motion parity harness, shared verbatim by the reference page (scripts/agent-avatars/capture-motion.ts, in Chrome)
// and the port (engine.test.ts, in jsdom). It is one expression: both sides evaluate its source text, so the clock,
// the scenarios and the recording are byte-identical. An adapter supplies the side-specific parts: making a
// character, finding a part, the root flags.
(() => {
  const T0 = 1000;
  const FRAME = 1000 / 60;

  /** A virtual clock: performance.now, requestAnimationFrame and setTimeout under our control, stepped at 60 fps.
   *  Timers fire in (due, id) order with the clock at their due time; then the frame's rAF callbacks run. */
  function installClock(g) {
    const C = { now: T0, f: 0, seq: 0, timers: [], rafs: [] };
    const saved = {};
    const set = (k, v) => {
      saved[k] = g[k];
      g[k] = v;
    };
    const perf = g.performance;
    const savedNow = perf.now;
    perf.now = () => C.now;
    set('requestAnimationFrame', cb => {
      const id = ++C.seq;
      C.rafs.push({ id, cb });
      return id;
    });
    set('cancelAnimationFrame', id => {
      C.rafs = C.rafs.filter(r => r.id !== id);
    });
    set('setTimeout', (cb, ms) => {
      const id = ++C.seq;
      C.timers.push({ id, due: C.now + Math.max(0, Number(ms) || 0), cb });
      return id;
    });
    set('clearTimeout', id => {
      C.timers = C.timers.filter(t => t.id !== id);
    });
    C.reset = () => {
      C.now = T0;
      C.f = 0;
      C.timers = [];
      C.rafs = [];
    };
    C.step = () => {
      const t = T0 + ++C.f * FRAME;
      for (;;) {
        let next = null;
        for (const x of C.timers)
          if (x.due <= t && (!next || x.due < next.due || (x.due === next.due && x.id < next.id))) next = x;
        if (!next) break;
        C.timers = C.timers.filter(x => x !== next);
        C.now = next.due;
        next.cb();
      }
      C.now = t;
      const rs = C.rafs;
      C.rafs = [];
      for (const r of rs) r.cb(t);
    };
    C.uninstall = () => {
      perf.now = savedNow;
      for (const k in saved) g[k] = saved[k];
    };
    return C;
  }

  // Looks that left the cast in Look Demo v5 (Probe's, Mend's), kept for the props only they showed in motion.
  const HEADLAMP = { shape: 'egg', color: 'olive', eyes: 'round', prop: 'headlamp' };
  const SEAM = { shape: 'pebble', color: 'sand', eyes: 'sleepy', prop: 'seam' };

  // Each scenario: characters (preset id, an optional look over it, start state, options, page position), timed calls
  // on them, length in ms. Positions are fixed so pointer-free geometry (peers, the Set up cue) reads the same rects
  // on both sides.
  const SCENARIOS = [
    { name: 'idle', chars: [{ id: 'radar' }], ms: 10000 },
    { name: 'idle-wally', chars: [{ id: 'wally' }], ms: 10000 },
    { name: 'idle-headlamp', chars: [{ id: 'seek', look: HEADLAMP }], ms: 10000 },
    {
      name: 'peers',
      chars: [{ id: 'trim' }, { id: 'sift' }, { id: 'patch', look: SEAM }],
      peers: true,
      ms: 16000,
    },
    {
      name: 'working',
      chars: [{ id: 'sift' }],
      ms: 6000,
      at: [
        [1000, 0, 'setState', 'working'],
        [4000, 0, 'setState', 'idle'],
      ],
    },
    {
      name: 'working-props',
      chars: [
        { id: 'trim', state: 'working' },
        { id: 'patch', look: SEAM, state: 'working' },
        { id: 'seek', look: HEADLAMP, state: 'working' },
      ],
      ms: 4000,
    },
    // look v17: the periscope on the mochi and the quill's sway
    { name: 'working-props-v17', chars: [{ id: 'lens', state: 'working' }, { id: 'bard', state: 'working' }], ms: 4000 },
    // Look Demo v5: the bolt's crackle and the flag's wave, at work, on Hello and as the idle fiddle
    {
      name: 'working-props-demo-v5',
      chars: [{ id: 'replay', state: 'working' }, { id: 'seek', state: 'working' }, { id: 'tune', state: 'working' }],
      ms: 4000,
    },
    { name: 'hello-replay', chars: [{ id: 'replay', autoReturn: true }], ms: 3500, at: [[300, 0, 'greet']] },
    { name: 'hello-seek', chars: [{ id: 'seek', autoReturn: true }], ms: 3500, at: [[300, 0, 'greet']] },
    { name: 'fiddle-bolt', chars: [{ id: 'replay' }], ms: 7000, at: [[500, 0, 'preview', 'prop']] },
    { name: 'needs', chars: [{ id: 'wally', state: 'needs' }], ms: 6000, at: [[4500, 0, 'setState', 'working']] },
    { name: 'failed', chars: [{ id: 'radar', state: 'failed' }], ms: 6000 },
    { name: 'idle-failed', chars: [{ id: 'trim' }], ms: 4000, at: [[800, 0, 'setState', 'failed']] },
    { name: 'off', chars: [{ id: 'seek' }], ms: 4000, at: [[1000, 0, 'setState', 'off']] },
    { name: 'done', chars: [{ id: 'patch', autoReturn: true }], ms: 4000, at: [[500, 0, 'setState', 'done']] },
    { name: 'hello', chars: [{ id: 'wally', autoReturn: true }], ms: 4000, at: [[500, 0, 'greet']] },
    { name: 'hello-radar', chars: [{ id: 'radar', autoReturn: true }], ms: 3500, at: [[300, 0, 'greet']] },
    { name: 'hello-trim', chars: [{ id: 'trim', autoReturn: true }], ms: 3500, at: [[300, 0, 'greet']] },
    { name: 'hello-headlamp', chars: [{ id: 'seek', look: HEADLAMP, autoReturn: true }], ms: 3500, at: [[300, 0, 'greet']] },
    { name: 'hello-bard', chars: [{ id: 'bard', autoReturn: true }], ms: 3500, at: [[300, 0, 'greet']] },
    { name: 'box', chars: [{ id: 'sift', state: 'box' }], ms: 2500 },
    {
      name: 'activation',
      chars: [{ id: 'radar', state: 'box' }],
      ms: 4000,
      at: [[1000, 0, 'setState', 'power']],
    },
    {
      name: 'activation-queued',
      chars: [{ id: 'wally', state: 'box' }],
      ms: 4000,
      at: [
        [1000, 0, 'setState', 'power'],
        [1300, 0, 'setState', 'working'],
      ],
    },
    {
      name: 'invite',
      chars: [{ id: 'trim', state: 'invite', cue: true }],
      cue: { x: 340, y: 150, w: 96, h: 32 },
      ms: 22000,
      at: [
        [17000, 0, 'cueHover', true],
        [19000, 0, 'cueHover', false],
      ],
    },
    {
      name: 'invite-activation',
      chars: [{ id: 'replay', state: 'invite', cue: true }],
      cue: { x: 40, y: 200, w: 96, h: 32 },
      ms: 6000,
      at: [[3500, 0, 'setState', 'power']],
    },
    {
      name: 'two-inviters',
      chars: [
        { id: 'patch', state: 'invite', cue: true },
        { id: 'sift', state: 'invite', cue: true },
      ],
      cue: { x: 200, y: 220, w: 96, h: 32 },
      ms: 14000,
    },
    {
      name: 'coverage',
      chars: [{ id: 'wally', cover: true }],
      ms: 6000,
      at: [
        [1500, 0, 'cueHover', true],
        [2500, 0, 'cueHover', false],
        [3500, 0, 'coverAll'],
      ],
    },
    {
      name: 'coverage-reach',
      chars: [{ id: 'radar', cover: true }],
      ms: 20000,
    },
    {
      // the builder's preview loops one behaviour: Reaches up, which a 20 s idle run may never pick
      name: 'reach-preview',
      chars: [{ id: 'sift', cover: true }],
      ms: 7000,
      at: [[500, 0, 'preview', 'stretch']],
    },
    {
      name: 'coverage-seam',
      chars: [{ id: 'patch', look: SEAM, cover: true, autoReturn: true }],
      ms: 5000,
      at: [[1000, 0, 'coverAll']],
    },
    {
      name: 'flips',
      chars: [{ id: 'sift' }],
      ms: 3000,
      at: [
        [1000, 0, 'setState', 'working'],
        [1050, 0, 'setState', 'idle'],
        [1500, 0, 'setState', 'needs'],
        [1530, 0, 'setState', 'working'],
      ],
    },
    { name: 'small', chars: [{ id: 'radar', size: 48 }], ms: 12000 },
  ];

  const PARTS = [
    ['fig', ['transform', 'opacity']],
    ['ef', ['d']],
    ['eg', ['d']],
    ['eyes', ['opacity']],
    ['vglow', ['opacity']],
    ['veilr', ['height']],
    ['sha', ['transform', 'opacity']],
    ['shc', ['transform', 'opacity']],
    ['props', ['opacity', 'transform']],
    ['pa', ['transform']],
    ['beam', ['opacity']],
    ['glint', ['opacity']],
    ['stitch', ['stroke-dashoffset']],
  ];

  function read(A, svg) {
    const out = {};
    for (const [part, attrs] of PARTS) {
      const el = A.q(svg, part);
      if (!el) continue;
      for (const a of attrs) {
        const v = el.getAttribute(a);
        out[`${part}.${a}`] = v;
      }
    }
    // the eye glow follows the eye path; recorded only when it does not
    if (out['eg.d'] === out['ef.d']) out['eg.d'] = '=';
    const fig = A.q(svg, 'fig');
    const veil = A.q(svg, 'veil');
    out.veilAt = veil ? [...fig.children].indexOf(veil) : -1;
    const f = A.flags(svg);
    out.st = f.st;
    out.ghosting = f.ghosting;
    out.veiled = f.veiled;
    return out;
  }

  /** Runs a scenario; returns [frame, char, {changed attributes}] rows (frame 0 holds everything). */
  function run(sc, C, A) {
    C.reset();
    A.reset();
    const chars = sc.chars.map((s, i) =>
      A.make({
        size: 120,
        live: true,
        shadow: true,
        salt: `fixture-${i}`,
        state: 'idle',
        ...s,
        x: 40 + i * 160,
        y: 40,
      }, sc),
    );
    if (sc.peers) for (const c of chars) c.peers = chars;
    for (const [ms, i, m, arg] of sc.at || []) C.timers.push({ id: ++C.seq, due: T0 + ms, cb: () => chars[i][m](arg) });
    const rows = [];
    const prev = chars.map(() => ({}));
    const record = f =>
      chars.forEach((c, i) => {
        const r = read(A, A.svgOf(c));
        const ch = {};
        let any = false;
        for (const k in r)
          if (r[k] !== prev[i][k]) {
            ch[k] = r[k];
            any = true;
          }
        prev[i] = r;
        if (any) rows.push([f, i, ch]);
      });
    record(0);
    const n = Math.round((sc.ms * 60) / 1000);
    for (let f = 1; f <= n; f++) {
      C.step();
      record(f);
    }
    return rows;
  }

  return { T0, installClock, SCENARIOS, run };
})()

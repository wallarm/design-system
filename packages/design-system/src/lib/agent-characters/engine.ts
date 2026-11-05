// The reference page's character engine (look v14, `makeChar` tail and `class Char`, lines 1658–2002), ported line
// for line onto the SVG React rendered from charTree(): the page's `.class` lookups are `[data-part~=…]`, its root
// classes are data attributes (st-* → data-state, ghosting, veiled), and its page globals (LIVE, ACT, INV, PTR,
// rectEpoch, RM, FINE) live on the document runtime. Same constants, easings, springs, RNG streams and draw order,
// same attribute strings. Additions, none of which the page's own flows reach: explicit dispose(), tracked timers,
// `returnTo` for the one-shots (D27) and `requestVeil` as a callback.
import { hexOf } from './color';
import type { AgentLook } from './data.gen';
import { type EyePose, eyesPath, eyeTargets, helloPop, type StateId } from './eyes';
import { geom, shapeOf } from './geom';
import { hash32, rng } from './look';
import {
  ACT_W,
  ACTS,
  BEAT,
  blinkOpen,
  type Channels,
  E_FILL,
  E_GRAV,
  E_INOUT,
  E_OUT,
  E_RISE,
  type Ease,
  FAST,
  FIDDLE,
  HELLO_PROP,
  HELLO_TILT,
  INVITE,
  type Key,
  lerp,
  logn,
  NOX,
  P_BRIGHT,
  P_DART,
  P_LAND,
  P_POP,
  P_PURSUIT,
  P_SHAPE,
  P_SQ,
  P_W,
  propTr,
  type Spring,
  spring,
  stepS,
} from './motion';
import { clamp, r2 } from './paths';
import { propDef } from './props';
import { getRuntime, type LiveChar } from './runtime';

type Look = Pick<AgentLook, 'shape' | 'color' | 'eyes' | 'prop'>;
type Cue = Element | (() => Element | null | undefined) | null | undefined;

export interface CharacterOptions {
  size: number;
  state: StateId;
  live: boolean;
  /** Partial coverage: the crown from the first frame */
  cover?: boolean;
  /** the seed salt (the agent uid); the name part of the page's seed is empty */
  salt: string;
  /** Done and Hello return on their timers; required for greet() */
  autoReturn?: boolean;
  follow?: boolean;
  /** false disables the idle repertoire */
  rep?: boolean;
  /** the Set up control: an element or a function returning one */
  cue?: Cue;
  /** a state change the character made on its own (a one-shot returning, the landing ending, Cover all) */
  onState?: (st: StateId, from: StateId) => void;
  /** the state a one-shot returns to; the page always returns to On duty (D27: the data's state) */
  returnTo?: () => StateId;
  /** the grey veil layers are needed (Not set up, Inviting, the landing, the crown) */
  requestVeil?: () => void;
}

interface Clip {
  keys: readonly Key[];
  t0: number;
  act?: 1;
  inv?: 1;
  perk?: 1;
  beat?: 1;
  hw?: 1;
  tilt?: 1;
  hop?: 1;
  wob?: 1;
  cvt?: 1;
  kind?: string;
  gaze?: boolean;
  slow?: boolean;
  rel?: number;
  relMs?: number;
  ease?: Ease;
  onEnd?: (now: number) => void;
}
type EyeKey = 'w' | 'ht' | 'hb' | 'kt' | 'kb' | 'lid' | 'rot' | 'bright';
const EYE_KEYS: EyeKey[] = ['w', 'ht', 'hb', 'kt', 'kb', 'lid', 'rot', 'bright'];
type WKey = 'breathe' | 'bob' | 'float' | 'work';

const invOk = (o: LiveChar | null): o is LiveChar => !!(o?.svg.isConnected && o.st === 'invite');

export class Character implements LiveChar {
  readonly svg: SVGSVGElement;
  readonly c: Look;
  readonly S: ReturnType<typeof shapeOf>;
  readonly o: CharacterOptions;
  st: StateId;
  visible = true;
  rectDirty = false;
  clips: Clip[] = [];
  /** the other characters of its row or list, for the look-around */
  peers: Character[] | null = null;
  fid: { k: string; px: number; py: number } | null = null;
  cover = false;
  private readonly rt = getRuntime();
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  private disposed = false;
  private readonly fig: SVGGElement;
  private readonly ef: Element;
  private readonly eg: Element;
  private readonly eyes: Element;
  private readonly vglow: Element;
  private readonly sha: Element | null;
  private readonly shc: Element | null;
  private readonly props: Element | null;
  private readonly pa: SVGGElement | null;
  private readonly beam: Element | null;
  private readonly glint: Element | null;
  private readonly stitch: Element | null;
  private readonly veilr: Element | null;
  private readonly E: Record<EyeKey, Spring>;
  private readonly gx: Spring;
  private readonly gy: Spring;
  private readonly sq: Spring;
  private readonly wt: Record<WKey, Spring>;
  private blink: { t0: number; dur: number } | null = null;
  private flicker: number | null = null;
  private land: {
    t0: number;
    fy: number;
    op0: number;
    sk0: number;
    next?: StateId | null;
    hit?: boolean;
    fill?: boolean;
    eyes?: boolean;
    props?: boolean;
  } | null = null;
  private readonly r: () => number;
  private readonly rate: number;
  private readonly bias: number;
  private readonly phase: number;
  private nextBlink: number;
  private nextGlance: number;
  private nextHop = 0;
  private read: { step: number; steps: number; line: number; next: number } | null = null;
  private ghostT = 1;
  private figOp = 1;
  private readonly propScale: Spring;
  private rect: DOMRect | null = null;
  private rectE = -1;
  private readonly r2: () => number;
  private nextBeat = 0;
  private nextAct: number;
  private lastAct = '';
  private pv: string | null = null;
  private lastPg = '';
  private hl: { t0: number; arc?: boolean } | null = null;
  private inv: { n: number; next: number; done: boolean } | null = null;
  private doneT: ReturnType<typeof setTimeout> | undefined;
  private covHT: ReturnType<typeof setTimeout> | undefined;
  private covT = 0;
  private covY = 0;
  private cov: Spring | null = null;
  private topping = false;
  private reachN = 0;
  private lastReach = 0;
  private cueK: { e: number; t: number; v: { gx: number; gy: number } | null } | null = null;
  private dbl = 0;
  private lt = 0;
  private lastD?: string;
  private lastB?: number;
  private lastT?: string;
  private lastFo?: number;
  private lastV?: number | null;
  private lastSa?: string;
  private lastSc?: string;
  private lastPs?: number;
  private lastPa?: string;
  private lastBeam?: number;
  private lastGl?: number;
  private lastSo?: number;

  constructor(svg: SVGSVGElement, c: Look, o: CharacterOptions) {
    const st = o.state;
    const e0 = eyeTargets(c.eyes, st);
    const q = <T extends Element = Element>(part: string) =>
      svg.querySelector<T>(`[data-part~="${part}"]`);
    this.svg = svg;
    this.c = c;
    this.S = shapeOf(c.shape);
    this.o = o;
    this.st = st;
    this.fig = q<SVGGElement>('fig')!;
    this.ef = q('ef')!;
    this.eg = q('eg')!;
    this.eyes = q('eyes')!;
    this.vglow = q('vglow')!;
    this.sha = q('sha');
    this.shc = q('shc');
    this.props = q('props');
    this.pa = q<SVGGElement>('pa');
    this.beam = q('beam');
    this.glint = q('glint');
    this.stitch = q('stitch');
    this.veilr = q('veilr');
    this.E = Object.fromEntries(
      EYE_KEYS.map(k => [k, spring(e0[k], k === 'bright' ? P_BRIGHT : P_SHAPE)]),
    ) as Record<EyeKey, Spring>;
    this.gx = spring(0, P_DART);
    this.gy = spring(e0.gy, P_DART);
    this.sq = spring(1, P_SQ);
    this.wt = {
      breathe: spring(1, P_W),
      bob: spring(0, P_W),
      float: spring(0, P_W),
      work: spring(0, P_W),
    };
    const seed = hash32(`x${c.shape}${o.salt}`);
    this.r = rng(seed);
    this.rate = 0.8 + this.r() * 0.45;
    this.bias = (this.r() - 0.5) * 0.2;
    this.phase = this.r() * 1000;
    const now = performance.now();
    this.nextBlink = now + 400 + this.r() * 2500;
    this.nextGlance = now + 600 + this.r() * 1800;
    this.propScale = spring(1, P_POP);
    // new motion draws from r2, so the blink and glance sequences stay as they were
    this.r2 = rng(seed ^ 0x5bd1e995);
    this.nextAct = now + this.actGap() * (0.3 + 0.7 * this.r2());
    // a fresh character owns no prop-group transform (a StrictMode remount may find the last one's)
    this.props?.removeAttribute('transform');
    this.applyState(st, now, true);
  }

  /** setTimeout that dispose() clears */
  private later(fn: () => void, ms: number) {
    const id = setTimeout(() => {
      this.timers.delete(id);
      if (!this.disposed) fn();
    }, ms);
    this.timers.add(id);
    return id;
  }
  private clear(id: ReturnType<typeof setTimeout> | undefined) {
    clearTimeout(id);
    if (id !== undefined) this.timers.delete(id);
  }
  private isLive() {
    return this.rt.live.has(this);
  }

  targets(st: StateId) {
    return eyeTargets(this.c.eyes, st);
  }
  private setTargets(t: EyePose, pop?: boolean) {
    for (const k of EYE_KEYS) {
      this.E[k].t = t[k];
      this.E[k].p = k === 'bright' ? P_BRIGHT : pop ? P_POP : P_SHAPE;
    }
    this.gy.t = t.gy;
    if (!this.isFollow()) this.gx.t = 0;
  }
  private snap() {
    for (const k of EYE_KEYS) {
      this.E[k].x = this.E[k].t;
      this.E[k].v = 0;
    }
    this.gx.x = this.gx.t;
    this.gy.x = this.gy.t;
    this.gx.v = this.gy.v = 0;
  }
  private isFollow() {
    const P = this.rt.ptr;
    return !!(this.o.follow && this.rt.motion.fine && P.t && performance.now() - P.t < 2500);
  }
  private startBlink(now: number, dur?: number) {
    this.blink = { t0: now, dur: dur || 170 + this.r() * 90 };
  }
  private returnTo() {
    return this.o.returnTo ? this.o.returnTo() : 'idle';
  }
  private emit(st: StateId, from: StateId) {
    this.o.onState?.(st, from);
  }

  private applyState(st: StateId, now: number, first = false) {
    const prev = this.st;
    this.st = st;
    const svg = this.svg;
    this.hl = null;
    if (st !== 'power') {
      this.land = null;
      this.flicker = null;
    }
    svg.setAttribute('data-state', st);
    this.ghostCls();
    // colour layers stay hidden under the grey ghost until the fill starts
    svg.toggleAttribute('data-veiled', st === 'box' || st === 'power' || st === 'invite');
    // from "Inviting" the eyes stay lit until the flicker
    const t = this.targets(st === 'power' && prev === 'invite' ? 'invite' : st);
    const live = this.isLive() || (this.o.live && this.rt.motionOn());
    const mask =
      !first &&
      live &&
      (((prev === 'done' || prev === 'hello') && st === 'idle') ||
        (prev === 'idle' && (st === 'failed' || st === 'working')) ||
        (prev === 'working' && st === 'idle') ||
        (prev === 'needs' && st === 'working'));
    if (!live || first) {
      this.setTargets(t);
      this.snap();
    } else if (mask) {
      this.startBlink(now, 200);
      this.later(() => {
        if (this.st === st) this.setTargets(t);
      }, 80);
    } else if (st === 'off') {
      this.E.ht.t = t.ht;
      this.E.hb.t = t.hb;
      this.E.lid.t = 0;
      this.E.rot.t = 0;
      this.later(() => {
        if (this.st === 'off') this.E.w.t = t.w;
      }, 120);
      this.later(() => {
        if (this.st === 'off') this.E.bright.t = t.bright;
      }, 150);
      this.gx.t = 0;
      this.gy.t = 0;
    } else if (st === 'hello') {
      // pop open now, the arcs at +260 ms (life)
      this.setTargets(helloPop(this.targets('idle')), true);
      this.hl = { t0: now };
    } else this.setTargets(t, st === 'done');
    this.wt.bob.t = st === 'working' ? 1 : 0;
    this.wt.work.t = st === 'working' ? 1 : 0;
    this.wt.breathe.t = st === 'off' || st === 'box' || st === 'power' ? 0 : 1;
    this.wt.float.t = st === 'box' ? 1 : 0;
    if (first || !live) {
      for (const k in this.wt) this.wt[k as WKey].x = this.wt[k as WKey].t;
    }
    this.read = null;
    if (st === 'box') {
      this.ghostT = 0;
      this.figOp = 0.5;
      this.propScale.x = this.propScale.t = 0;
      if (first || !live) this.wt.float.x = 1;
      this.requestVeil();
    } else if (st === 'invite') {
      // "Inviting": solid primer grey on the floor; the first live one owns the document's invites
      this.ghostT = 0;
      this.figOp = 1;
      this.propScale.x = this.propScale.t = 0;
      this.requestVeil();
      this.inv = { n: 0, next: now + 2000 + 1000 * this.r2(), done: false };
      if (live && !invOk(this.rt.inv.owner)) this.rt.inv.owner = this;
    } else if (st !== 'power') {
      this.ghostT = 1;
      this.figOp = 1;
      this.propScale.t = 1;
      if (prev === 'box' || prev === 'invite' || first || !live) this.propScale.x = 1;
    }
    if (st !== 'invite') this.inv = null;
    if (st === 'hello' && this.o.autoReturn) {
      // like 'done': back to "On duty" (D27: to the data's state)
      const ms = live ? 1900 + this.r2() * 400 : 1200;
      this.clear(this.doneT);
      this.doneT = this.later(() => {
        if (this.st === 'hello' && this.svg.isConnected) {
          const to = this.returnTo();
          this.setState(to);
          this.emit(to, 'hello');
        }
      }, ms);
    }
    if (st === 'done' && this.o.autoReturn) {
      const ms = 1600 + this.r() * 600;
      this.clear(this.doneT);
      this.doneT = this.later(() => {
        if (this.st === 'done' && this.svg.isConnected) {
          const to = this.returnTo();
          this.setState(to);
          this.emit(to, 'done');
        }
      }, ms);
    }
    if (!live) return;
    this.releaseClips(now); // behaviour, beat and greeting clips fade out in 180 ms; the hop and the wobble finish
    if (st === 'hello' && !first) this.helloClips(now);
    if (st === 'failed') this.nextBeat = now + 1700 + this.r2() * 1000;
    if (st === 'idle') this.nextAct = Math.max(this.nextAct, now + this.actGap() * 0.5);
    if (st === 'done') this.hop(now, 7);
    if (st === 'failed' && !this.clipBusy('wob', now))
      this.clips.push({
        wob: 1,
        t0: now,
        keys: [
          [0, 0, 1, 0],
          [150, 0, 1, -4],
          [300, 0, 1, 2.5],
          [450, 0, 1, -1],
          [600, 0, 1, 0],
        ],
        ease: E_INOUT,
      });
    if (st === 'needs') this.nextHop = now + 500;
    if (st === 'power') this.startLanding(now, prev);
  }
  private requestVeil() {
    this.o.requestVeil?.();
  }
  /** the grey felt shows for the ghost, "Inviting" and the crown */
  private ghostCls() {
    const st = this.st;
    this.svg.toggleAttribute(
      'data-ghosting',
      st === 'box' || st === 'power' || st === 'invite' || (!!this.cover && st !== 'off'),
    );
  }
  /** "Partial coverage": the top of the head stays in the ghost's grey felt down to a crisp line */
  setCover(onIn: boolean) {
    const on = !!onIn;
    const now = performance.now();
    if (on && this.topping) {
      // picked again while it fills: it stays partly covered
      this.clips = this.clips.filter(c => !c.cvt);
      this.topping = false;
      const cov = this.cov as Spring;
      cov.x = cov.t = cov.v = 0;
      this.lastV = null;
      return;
    }
    if (on === !!this.cover) return;
    this.cover = on;
    if (on) {
      // the crown: ~30% of the head, never on the visor; the first reach comes 10 s later at the earliest
      this.covT = geom(this.S).top[1];
      this.covY = Math.min(this.covT + 0.3 * (108 - this.covT), this.S.v[1] - 4);
      this.cov = spring(0, P_W);
      this.reachN = 0;
      this.lastReach = now - 35000;
      this.requestVeil();
    } else {
      this.clear(this.covHT);
      this.topping = false;
      this.cov = null;
    }
    const veil = this.svg.querySelector('[data-part~="veil"]');
    // clipped prop deco (Mend's seam) sits over the crown; off, the ghost's order is back
    if (veil)
      this.fig.insertBefore(
        veil,
        on
          ? this.fig.querySelector(':scope > g[clip-path]:not([data-part~="veil"])')
          : this.fig.querySelector(':scope > [data-part~="visor"]'),
      );
    this.ghostCls();
    this.lastV = null;
    if (!this.isLive()) this.render(now);
  }
  /** "Cover all applications": the line rises to the top in 480 ms; Done at 360 ms, no grey after 480 ms */
  coverAll() {
    if (!this.cover || this.topping) return;
    const now = performance.now();
    if (!this.isLive()) {
      this.setCover(false);
      if (this.st === 'idle') {
        this.setState('done');
        this.emit('done', 'idle');
      }
      return;
    }
    this.topping = true;
    this.clear(this.covHT);
    const cov = this.cov as Spring;
    const y0 = cov.x;
    cov.x = cov.t = cov.v = 0;
    for (const c of this.clips) if (c.kind === 'reach' && !c.rel) c.rel = now;
    // no act tag: it survives the change to Done
    this.clips.push({
      cvt: 1,
      t0: now,
      keys: [
        [0, 0, 1, 0, null, { cv: y0 }],
        [480, 0, 1, 0, E_INOUT, { cv: -(this.covY - this.covT + 3) }],
      ],
      onEnd: () => this.setCover(false),
    });
    this.later(() => {
      if (this.topping && this.svg.isConnected && this.st === 'idle') {
        this.setState('done');
        this.emit('done', 'idle');
      }
    }, 360);
  }
  /** toward the centre of the Set up control; null when it is missing or hidden */
  private cueDir(now = performance.now()) {
    const K = this.cueK;
    if (K && K.e === this.rt.rectEpoch && now - K.t < 1000) return K.v;
    let el = this.o.cue;
    if (typeof el === 'function') el = el();
    let v: { gx: number; gy: number } | null = null;
    if (el?.isConnected) {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) {
        const me = this.box();
        const dx = r.left + r.width / 2 - me.x;
        const dy = r.top + r.height / 2 - me.y;
        const d = Math.hypot(dx, dy) || 1;
        v = { gx: (0.8 * dx) / d, gy: clamp((0.7 * dy) / d, -0.4, 0.6) };
      }
    }
    this.cueK = { e: this.rt.rectEpoch, t: now, v };
    return v;
  }
  /** hover or focus on the fix. "Inviting": turns to Set up and ends the timed invites. "Partial coverage": the
   *  line rises 35% after 150 ms */
  cueHover(on: boolean) {
    if (!this.isLive()) return;
    const now = performance.now();
    if (this.st === 'invite') {
      if (on && !this.clips.some(c => c.perk && !c.rel)) {
        for (const c of this.clips) if (c.inv && !c.rel) c.rel = now;
        if (this.inv) this.inv.done = true;
        const c = this.cueDir(now) || { gx: 0, gy: 0 };
        const s = Math.abs(c.gx) >= 0.15 ? Math.sign(c.gx) : 0;
        const x = { gx: c.gx, gy: 1.25 * c.gy, br: 0.18 };
        this.clips.push({
          perk: 1,
          gaze: true,
          slow: false,
          relMs: 400,
          t0: now,
          keys: [
            [0, 0, 1, 0, null, { gx: 0, gy: 0, br: 0 }],
            [220, 0, 1.01, 2 * s, E_OUT, x],
            [1e7, 0, 1.01, 2 * s, null, x],
          ],
        });
      } else if (!on) for (const c of this.clips) if (c.perk && !c.rel) c.rel = now;
    }
    if (this.cover && this.cov) {
      this.clear(this.covHT);
      if (on)
        this.covHT = this.later(() => {
          if (this.cover && !this.topping && this.cov) this.cov.t = -0.35 * (this.covY - this.covT);
        }, 150);
      else if (!this.topping) this.cov.t = 0;
    }
  }
  /** "Inviting": three invites per view at most, one inviter per document, news first; true while an invite or a
   *  hover owns the gaze */
  private invTick(now: number) {
    if (this.clips.some(c => (c.inv || c.perk) && !c.rel)) return true;
    const I = this.inv;
    if (!I || I.done || I.n >= 3 || now < I.next || !this.repOn() || this.isFollow() || this.blink)
      return false;
    const c = this.cueDir(now);
    // only from a settled rest gaze
    if (!c || Math.abs(this.gx.x) > 0.05 || Math.abs(this.gy.x) > 0.05) return false;
    const INV = this.rt.inv;
    if (!invOk(INV.owner)) INV.owner = this;
    else if (INV.owner !== this) return false;
    let n = 0;
    for (const k of this.rt.live) {
      if (k === this || !k.visible || !k.svg.isConnected) continue;
      if (k.st === 'needs' || k.st === 'failed' || k.st === 'hello' || k.st === 'done') {
        I.next = now + 1500; // news first
        return false;
      }
      if (k.clips.some(x => x.act && !x.rel)) n++;
    }
    const ACT = this.rt.act;
    if (n >= ACT.cap || now - ACT.last < 700 || now - INV.last < 6000) {
      I.next = now + 600 + 900 * this.r2();
      return false;
    }
    this.clips.push({
      act: 1,
      inv: 1,
      kind: 'invite',
      gaze: true,
      slow: false,
      t0: now,
      keys: INVITE(c),
    });
    I.n++;
    I.next = now + 2300 + (I.n === 1 ? 12000 : 24000) * (0.85 + 0.3 * this.r2());
    INV.last = ACT.last = now;
    this.nextBlink = Math.max(this.nextBlink, now + 3100);
    return true;
  }
  /** one hop and one wobble at a time */
  private clipBusy(tag: 'hop' | 'wob', now: number) {
    return this.clips.some(c => c[tag] && now - c.t0 < (c.keys[c.keys.length - 1] as Key)[0]);
  }
  hop(now: number, hgt = 10) {
    if (this.clipBusy('hop', now)) return;
    this.clips.push({
      hop: 1,
      t0: now,
      keys: [
        [0, 0, 1],
        [90, 0, 0.9, 0, E_OUT],
        [250, -hgt, 1.08, 0, E_RISE],
        [290, -hgt, 1, 0],
        [430, 0, 1, 0, E_GRAV],
      ],
      onEnd: n => {
        this.sq.x = 0.86;
        this.sq.v = 0;
        this.sq.p = P_SQ;
        if (this.st === 'needs') this.startBlink(n);
      },
    });
  }
  private releaseClips(now: number, all = true) {
    for (const c of this.clips)
      if ((c.act || c.perk || (all && (c.beat || c.hw || c.tilt))) && !c.rel) c.rel = now;
  }
  private helloClips(now: number) {
    this.hop(now, 6);
    if (!this.clips.some(c => c.tilt && !c.rel))
      this.clips.push({ tilt: 1, t0: now, keys: HELLO_TILT });
    const k = this.fid ? this.fid.k : null;
    const hp = k ? HELLO_PROP[k] : undefined;
    if (hp && !this.clips.some(c => c.hw && !c.rel)) this.clips.push({ hw: 1, t0: now, keys: hp });
  }
  /** product hook: an avatar says hello when its panel opens */
  greet() {
    if (this.st === 'idle' && !this.land && this.o.autoReturn) this.setState('hello');
  }
  private beat(now: number) {
    if (!this.clips.some(c => c.beat && !c.rel)) this.clips.push({ beat: 1, t0: now, keys: BEAT });
  }
  /** quieter when small */
  private actGap() {
    const s = this.o.size || 120;
    return (
      logn(this.r2, 6000 * this.rate, 0.45, 3000, 15000) * (s <= 48 ? 1.6 : s <= 72 ? 1.25 : 1)
    );
  }
  private repOn() {
    return this.o.rep !== false && (this.o.size || 120) > 32 && !this.land;
  }
  /** builder: loop one behaviour, or back to "Auto" */
  preview(k: string | null) {
    const now = performance.now();
    this.pv = k || null;
    this.releaseClips(now, false);
    this.nextAct = k ? now + 250 : now + this.actGap() * 0.5;
  }
  box() {
    if (!this.rect || this.rectE !== this.rt.rectEpoch || this.rectDirty) {
      this.rect = this.svg.getBoundingClientRect();
      this.rectE = this.rt.rectEpoch;
      this.rectDirty = false;
    }
    const r = this.rect;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  /** toward one of the two nearest neighbours (peers), else a random side */
  private lookDir() {
    const ps = (this.peers || []).filter(p => p !== this && p.svg.isConnected);
    if (ps.length) {
      const me = this.box();
      const near = ps
        .map(p => {
          const b = p.box();
          return { dx: b.x - me.x, dy: b.y - me.y };
        })
        .sort((a, b) => Math.hypot(a.dx, a.dy) - Math.hypot(b.dx, b.dy))
        .slice(0, 2);
      const q = near[(this.r2() * near.length) | 0]!;
      const d = Math.hypot(q.dx, q.dy) || 1;
      return { gx: (0.78 * q.dx) / d, gy: (0.45 * q.dy) / d };
    }
    const s = this.r2() < 0.5 ? -1 : 1;
    return { gx: s * (0.6 + 0.2 * this.r2()), gy: (this.r2() - 0.5) * 0.2 };
  }
  private pick(now: number) {
    const W: Record<string, number> = { ...ACT_W };
    if (!this.fid || !FIDDLE[this.fid.k]) W.prop = 0;
    delete W[this.lastAct];
    // a partly covered agent reaches within its caps and never yawns
    if (
      this.cover &&
      'stretch' in W &&
      (this.reachN >= 3 ||
        now - this.lastReach < 45000 ||
        [...this.rt.live].some(
          c => c !== this && c.visible && c.clips.some(k => k.kind === 'reach' && !k.rel),
        ))
    )
      W.stretch = 0;
    let sum = 0;
    for (const k in W) sum += W[k] as number;
    let x = this.r2() * sum;
    for (const k in W) {
      x -= W[k] as number;
      if (x <= 0) return k;
    }
    return 'look';
  }
  /** push one behaviour clip; returns its length in ms */
  play(kind: string, now: number) {
    let keys: readonly Key[];
    let gaze = false;
    let fast = false;
    const s = this.r2() < 0.5 ? -1 : 1;
    if (kind === 'bored') keys = ACTS.bored();
    else if (kind === 'fidget') {
      fast = this.r2() >= 0.6;
      keys = fast ? ACTS.shuffle(s) : ACTS.lean(s);
    } else if (kind === 'stretch' && this.cover) {
      keys = ACTS.reach(0.7 * (this.covY - this.covT));
      gaze = true;
      fast = true;
      if (!this.pv) {
        this.reachN++;
        this.lastReach = now;
      }
    } else if (kind === 'stretch') keys = ACTS.stretch();
    else if (kind === 'prop') {
      const f = this.fid && FIDDLE[this.fid.k];
      if (!f || !this.fid) return 0;
      keys = f;
      gaze = keys.some(k => k[5] && ('gx' in k[5] || 'gy' in k[5]));
      fast = FAST.has(this.fid.k);
    } else {
      const g = this.lookDir();
      const L = 1.2 * g.gx;
      keys = this.r2() < 0.35 ? ACTS.take(g, L) : ACTS.look(g, L);
      gaze = true;
      if (this.r2() < 0.5 && !this.blink) this.startBlink(now);
    }
    if (gaze) {
      this.gx.p = this.gy.p = P_DART;
      this.gx.t = 0;
      this.gy.t = this.targets(this.st).gy;
    }
    const dur = (keys[keys.length - 1] as Key)[0];
    // slow behaviours redraw on the shared 40 ms beat, like breathing
    this.clips.push({
      act: 1,
      kind: kind === 'stretch' && this.cover ? 'reach' : kind,
      gaze,
      slow: !fast,
      t0: now,
      keys,
    });
    this.lastAct = kind;
    this.rt.act.last = now;
    this.nextGlance = Math.max(this.nextGlance, now + dur + 300);
    return dur;
  }
  /** the idle scheduler; true while a behaviour owns the gaze */
  private actTick(now: number) {
    const cur = this.clips.find(c => c.act && !c.rel);
    if (cur) return !!cur.gaze;
    if (!this.repOn() || now < this.nextAct) return false;
    if (!this.pv) {
      if (this.isFollow()) return false;
      let n = 0;
      for (const c of this.rt.live)
        if (c !== this && c.visible && c.clips.some(k => k.act && !k.rel)) n++;
      if (n >= this.rt.act.cap || now - this.rt.act.last < 700) {
        this.nextAct = now + 500 + this.r2() * 900;
        return false;
      }
    }
    const dur = this.play(this.pv || this.pick(now), now);
    this.nextAct = now + dur + (this.pv ? 900 : this.actGap());
    return false;
  }
  /** from "Inviting" it starts grounded and solid, with its full shadow */
  private startLanding(now: number, prev: StateId) {
    this.requestVeil();
    const fy = prev === 'invite' ? 0 : this.floatY(now);
    this.land = { t0: now, fy, op0: this.figOp, sk0: prev === 'invite' ? 1 : 0.35 };
    this.wt.float.t = 0;
    this.wt.float.x = 0;
  }
  private floatY(now: number) {
    return -8 + 4 * Math.sin(((now + this.phase) / 3600) * 2 * Math.PI);
  }
  /** a landing always finishes; the last pick applies at its end */
  setState(st: StateId) {
    if (this.land) {
      this.land.next = st === 'power' ? null : st;
      return;
    }
    const now = performance.now();
    if (st === this.st && st !== 'power') return;
    this.clear(this.doneT);
    this.applyState(st, now);
    if (!this.isLive()) this.render(now);
  }
  private life(now: number) {
    if (this.hl && !this.hl.arc && now - this.hl.t0 >= 260) {
      this.hl.arc = true;
      this.setTargets(this.targets('hello'), true);
    }
    if (this.st === 'failed' && this.nextBeat && now >= this.nextBeat) {
      this.beat(now);
      this.nextBeat = now + 2500 + this.r2() * 1500;
    }
    // a look or a gaze fiddle owns the gaze while it plays; so do an invite and a hover on Set up
    const owns =
      this.st === 'idle' ? this.actTick(now) : this.st === 'invite' ? this.invTick(now) : false;
    const st = this.st;
    if (st === 'off' || st === 'box' || st === 'power') {
      if (st === 'off') {
        const b = 0.11 + 0.03 * Math.sin(now / 1000);
        this.E.bright.t = b;
      }
      return;
    }
    const med = st === 'working' ? 7000 : st === 'needs' ? 2400 : st === 'invite' ? 4000 : 3200;
    const ip = st === 'invite' && this.clips.some(c => c.inv && !c.rel); // an invite carries its own slow blink
    if (now >= this.nextBlink && !this.blink && !ip && st !== 'working' && st !== 'hello') {
      this.startBlink(now);
      this.nextBlink = now + logn(this.r, med * this.rate, 0.5, 700, 10000);
      if (this.r() < 0.12) this.dbl = now + 90 + this.r() * 60 + 250;
    }
    if (this.dbl && now >= this.dbl && !this.blink && !ip) {
      this.startBlink(now);
      this.dbl = 0;
    }
    if (
      !owns &&
      this.isFollow() &&
      (st === 'idle' || st === 'needs' || st === 'done' || st === 'hello' || st === 'invite')
    ) {
      if (!this.rect || this.rectE !== this.rt.rectEpoch || this.rectDirty) {
        this.rect = this.svg.getBoundingClientRect();
        this.rectE = this.rt.rectEpoch;
        this.rectDirty = false;
      }
      const r = this.rect;
      const ex = r.left + (r.width * (this.S.v[0] + this.S.v[2] / 2 + 8)) / 136;
      const ey = r.top + (r.height * (this.S.v[1] + this.S.v[3] / 2 + 14)) / 128;
      const dx = this.rt.ptr.x - ex;
      const dy = this.rt.ptr.y - ey;
      const d = Math.hypot(dx, dy) || 1;
      const g = d / (d + 250);
      let tx = (0.85 * g * dx) / d;
      let ty = (0.6 * g * dy) / d;
      if (d < r.width * 0.35) {
        tx = 0;
        ty = 0;
      }
      const jump = Math.abs(tx - this.gx.t) + Math.abs(ty - this.gy.t) > 0.35;
      this.gx.p = this.gy.p = jump ? P_DART : P_PURSUIT;
      this.gx.t = tx;
      this.gy.t = ty + this.targets(st).gy;
      if (jump && this.r() < 0.25 && !this.blink) this.startBlink(now);
      return;
    }
    if (st === 'invite') {
      // at rest it looks straight ahead; no glances, no acts
      if (!owns) {
        this.cueDir(now);
        this.gx.p = this.gy.p = P_PURSUIT;
        this.gx.t = 0;
        this.gy.t = 0;
      }
      return;
    }
    if (st === 'working') {
      if (!this.read)
        this.read = { step: 0, steps: 3 + ((this.r() * 3) | 0), line: 0, next: now + 200 };
      const R = this.read;
      if (now >= R.next) {
        if (R.step < R.steps) {
          this.gx.p = this.gy.p = P_DART;
          this.gx.t = -0.5 + R.step * 0.32;
          this.gy.t = -0.12 + R.line * 0.09;
          R.step++;
          R.next = now + 180 + this.r() * 140;
        } else {
          this.gx.t = -0.5;
          R.line = (R.line + 1) % 3;
          this.gy.t = -0.12 + R.line * 0.09;
          R.step = 0;
          R.steps = 3 + ((this.r() * 3) | 0);
          R.next = now + 260;
          this.startBlink(now, 170);
        }
      }
      return;
    }
    if (st === 'needs') {
      this.gx.p = this.gy.p = P_PURSUIT;
      this.gx.t = 0;
      this.gy.t = 0;
      if (this.nextHop && now >= this.nextHop) {
        this.hop(now, 10);
        this.nextHop = now + logn(this.r, 4500, 0.3, 2800, 8000);
      }
      return;
    }
    if (st === 'idle' && now >= this.nextGlance) {
      const p = this.r();
      this.gx.p = this.gy.p = P_DART;
      if (p < 0.55) {
        this.gx.t = this.bias * 0.5;
        this.gy.t = 0;
        this.nextGlance = now + logn(this.r, 1800, 0.6, 400, 6000);
      } else {
        const far = p > 0.85;
        const A = far ? 0.5 + this.r() * 0.4 : 0.1 + this.r() * 0.25;
        const ang = this.r() * Math.PI * 2;
        this.gx.t = clamp(Math.cos(ang) * A + this.bias, -0.9, 0.9);
        this.gy.t = clamp(Math.sin(ang) * A * 0.6, -0.5, 0.5);
        if (A > 0.4 && this.r() < 0.25 && !this.blink) this.startBlink(now);
        this.nextGlance = now + (far ? 600 + this.r() * 800 : logn(this.r, 1800, 0.6, 400, 6000));
      }
    }
  }
  tick(now: number, dt: number, beat = true) {
    // back on screen or tab: no behaviour on the first frame
    if (this.lt && now - this.lt > 500) {
      this.nextAct = Math.max(this.nextAct, now + 1500 + this.r2() * 2500);
      if (this.inv) this.inv.next = Math.max(this.inv.next, now + 1500 + 1000 * this.r2());
    }
    this.lt = now;
    this.life(now);
    for (const k of EYE_KEYS) stepS(this.E[k], dt);
    stepS(this.gx, dt);
    stepS(this.gy, dt);
    stepS(this.sq, dt);
    stepS(this.propScale, dt);
    for (const k in this.wt) stepS(this.wt[k as WKey], dt);
    if (this.cov) stepS(this.cov, dt);
    if (beat || this.busy()) this.render(now); // settled breathing and drift redraw on the shared beat only
  }
  /** anything that must stay at full frame rate */
  private busy() {
    const st = this.st;
    if (this.blink || this.land || this.flicker || this.clips.some(c => !c.slow)) return true;
    if (st === 'working' || st === 'box' || st === 'power') return true;
    if (this.pa && (st === 'needs' || this.wt.work.x > 0.001)) return true;
    const m = (s: Spring) => Math.abs(s.v) > 1e-3 || Math.abs(s.x - s.t) > 1e-3;
    for (const k of EYE_KEYS) if (m(this.E[k])) return true;
    if (m(this.gx) || m(this.gy) || m(this.sq) || m(this.propScale)) return true;
    for (const k in this.wt) if (m(this.wt[k as WKey])) return true;
    if (this.cov && m(this.cov)) return true;
    return false;
  }
  render(now: number) {
    const live = this.isLive();
    const E = {} as Record<EyeKey, number>;
    for (const k of EYE_KEYS) E[k] = this.E[k].x;
    let open = 1;
    if (this.blink) {
      const u = (now - this.blink.t0) / this.blink.dur;
      open = blinkOpen(u);
      if (u > 1) this.blink = null;
    }
    let bright = E.bright;
    let ty = 0;
    let sy = 1;
    let rot = 0;
    let shadowK = 1;
    let X: Channels | null = null; // eye and prop channels of the clips
    if (live) {
      const t = (now + this.phase) / 1000;
      sy *= 1 + 0.012 * this.wt.breathe.x * Math.sin((t * 2 * Math.PI) / 3.2);
      ty += -1.2 * this.wt.bob.x * (0.5 + 0.5 * Math.sin((t * 2 * Math.PI) / 2.4));
      const fl = this.wt.float.x;
      if (fl > 0.001) {
        ty += fl * this.floatY(now);
        rot += fl * 1.5 * Math.sin((t * 2 * Math.PI) / 5.1);
        shadowK = lerp(1, 0.35, fl);
      }
      for (let i = this.clips.length - 1; i >= 0; i--) {
        const cl = this.clips[i] as Clip;
        const el = now - cl.t0;
        const ks = cl.keys;
        const last = (ks[ks.length - 1] as Key)[0];
        if (el >= last) {
          this.clips.splice(i, 1);
          cl.onEnd?.(now);
          continue;
        }
        let w = 1;
        if (cl.rel) {
          // a released clip fades out
          const u = (now - cl.rel) / (cl.relMs || 180);
          if (u >= 1) {
            this.clips.splice(i, 1);
            continue;
          }
          w = 1 - E_INOUT(u);
        }
        let a = ks[0] as Key;
        let b = ks[1] as Key;
        for (let k = 1; k < ks.length; k++) {
          if (el <= (ks[k] as Key)[0]) {
            a = ks[k - 1] as Key;
            b = ks[k] as Key;
            break;
          }
        }
        const e = (b[4] || cl.ease || E_INOUT)(clamp((el - a[0]) / Math.max(1, b[0] - a[0]), 0, 1));
        if (w === 1) {
          ty += lerp(a[1], b[1], e);
          sy *= lerp(a[2], b[2], e);
          rot += lerp(a[3] || 0, b[3] || 0, e);
        } else {
          ty += w * lerp(a[1], b[1], e);
          sy *= 1 + w * (lerp(a[2], b[2], e) - 1);
          rot += w * lerp(a[3] || 0, b[3] || 0, e);
        }
        if (a[5] || b[5]) {
          X = X || {};
          const xa = a[5] || NOX;
          const xb = b[5] || NOX;
          for (const k in b[5] || a[5]) {
            const key = k as keyof Channels;
            X[key] = (X[key] || 0) + w * lerp(xa[key] || 0, xb[key] || 0, e);
          }
        }
      }
      if (this.land) {
        const L = this.land;
        const el = now - L.t0;
        if (el < 180) ty += lerp(L.fy, L.fy - 6, E_INOUT(el / 180));
        else if (el < 400) {
          const u = E_GRAV((el - 180) / 220);
          ty += lerp(L.fy - 6, 0, u);
          sy *= lerp(1, 1.06, u);
        }
        if (el >= 400 && !L.hit) {
          L.hit = true;
          this.sq.x = 0.82;
          this.sq.v = 0;
          this.sq.p = P_LAND;
        }
        shadowK = el < 400 ? L.sk0 : lerp(L.sk0, 1, clamp((el - 400) / 120, 0, 1));
        this.ghostT = E_FILL(clamp((el - 420) / 480, 0, 1));
        if (el >= 420 && !L.fill) {
          L.fill = true;
          this.svg.removeAttribute('data-veiled');
        }
        this.figOp = lerp(L.op0, 1, clamp((el - 400) / 300, 0, 1));
        if (el >= 800 && !L.eyes) {
          L.eyes = true;
          this.flicker = now;
          this.setTargets(this.targets('idle'), true);
        }
        if (el >= 950 && !L.props) {
          L.props = true;
          this.propScale.t = 1;
          this.propScale.p = P_POP;
        }
        if (el >= 1150) {
          const nx = L.next || 'idle';
          this.land = null;
          this.st = 'power';
          this.applyState(nx, now);
          this.startBlink(now);
          this.emit(nx, 'power');
        }
      }
      if (this.flicker) {
        const el = now - this.flicker;
        const seq = [
          [0, 0],
          [40, 0.8],
          [100, 0.1],
          [140, 1],
          [190, 0.3],
          [240, 1],
        ] as const;
        if (el > 240) {
          this.flicker = null;
        } else {
          let v = 1;
          for (let k = 1; k < seq.length; k++) {
            const [t1, v1] = seq[k]!;
            const [t0, v0] = seq[k - 1]!;
            if (el <= t1) {
              v = lerp(v0, v1, (el - t0) / (t1 - t0));
              break;
            }
          }
          bright = v * E.bright;
        }
      }
      sy *= this.sq.x;
    } else if (this.st === 'box') {
      ty = -8;
      shadowK = 0.35;
    }
    const tt = (now + this.phase) / 1000;
    const dw = this.st === 'off' ? this.wt.breathe.x : 1; // 'off' fades the drift out with the breathe spring
    let gx = this.gx.x + (live ? dw * (0.02 * Math.sin(tt * 2.1) + 0.012 * Math.sin(tt * 3.7)) : 0);
    let gy = this.gy.x + (live ? dw * 0.015 * Math.sin(tt * 1.7) : 0);
    if (X) {
      gx = clamp(gx + (X.gx || 0), -0.95, 0.95);
      gy = clamp(gy + (X.gy || 0), -0.6, 0.7);
      if (X.lid) E.lid = clamp(E.lid + X.lid, 0, 0.85);
      if (X.op) open = clamp(open + X.op, 0.04, 1.04);
      if (X.br) bright += X.br;
    }
    const d = eyesPath(this.S, E as unknown as EyePose, open, gx, gy);
    if (d !== this.lastD) {
      this.ef.setAttribute('d', d);
      this.eg.setAttribute('d', d);
      this.lastD = d;
    }
    const bo = r2(clamp(bright, 0, 1.2));
    if (bo !== this.lastB) {
      this.eyes.setAttribute('opacity', String(bo));
      this.vglow.setAttribute('opacity', String(r2(bo * 0.8)));
      this.lastB = bo;
    }
    const sx = 1 + (1 - sy) * 0.7;
    const tr = `translate(60 ${r2(108 + ty)}) rotate(${r2(rot)}) scale(${r2(sx * 1000) / 1000} ${r2(sy * 1000) / 1000}) translate(-60 -108)`;
    if (tr !== this.lastT) {
      this.fig.setAttribute('transform', tr);
      this.lastT = tr;
    }
    const fo = r2(this.figOp);
    if (fo !== this.lastFo) {
      this.fig.setAttribute('opacity', String(fo));
      this.lastFo = fo;
    }
    if (this.veilr) {
      let h: number;
      if (this.cover && !this.land && this.st !== 'off') {
        let y = this.covY + (this.cov as Spring).x + (X?.cv || 0);
        // the crown ends at a crisp line; at least 20% of it stays grey until the fix
        if (!this.topping) y = Math.max(y, this.covT + 0.2 * (this.covY - this.covT));
        h = r2(y + 30);
      } else h = r2(140 * (1 - this.ghostT));
      if (h !== this.lastV) {
        this.veilr.setAttribute('height', String(Math.max(0, h)));
        this.lastV = h;
      }
    }
    if (this.sha && this.shc) {
      const hgt = clamp(-ty / 12, 0, 1);
      const cx = this.sha.getAttribute('cx');
      const kA = (1 - 0.2 * hgt) * shadowK;
      const kC = (1 - 0.45 * hgt) * shadowK;
      const ta = `translate(${cx} 108) scale(${r2(kA)} ${r2(kA)}) translate(${-Number(cx)} -108)`;
      const tc = `translate(${cx} 108) scale(${r2(kC)} 1) translate(${-Number(cx)} -108)`;
      if (ta !== this.lastSa) {
        this.sha.setAttribute('transform', ta);
        this.sha.setAttribute('opacity', String(r2(0.16 * (1 - 0.4 * hgt) * shadowK)));
        this.lastSa = ta;
      }
      if (tc !== this.lastSc) {
        this.shc.setAttribute('transform', tc);
        this.shc.setAttribute('opacity', String(r2(0.36 * (1 - 0.8 * hgt) * shadowK)));
        this.lastSc = tc;
      }
    }
    if (this.props) {
      const ps = r2(this.propScale.x);
      if (ps !== this.lastPs) {
        this.props.setAttribute('opacity', String(clamp(ps, 0, 1)));
        this.lastPs = ps;
      }
    }
    if (this.pa && live) {
      const w = this.wt.work.x + (this.st === 'needs' ? 0.3 : 0);
      const t = (now + this.phase) / 1000;
      const a = this.pa.dataset.a;
      const px = this.pa.dataset.px;
      const py = this.pa.dataset.py;
      let ang = 0;
      if (a === 'dish') ang = w * 14 * Math.sin((t * 2 * Math.PI) / 1.5);
      else if (a === 'sway') ang = w * 7 * Math.sin((t * 2 * Math.PI) / 1.2);
      else if (a === 'twitch') ang = w * 5 * Math.sin((t * 2 * Math.PI) / 0.45);
      else if (a === 'wave') ang = w * 9 * Math.sin((t * 2 * Math.PI) / 0.8);
      else if (a === 'wind') ang = 0;
      else if (a === 'rock') ang = w * 2.5 * Math.sin((t * 2 * Math.PI) / 2.4);
      let sxk = 1;
      let sk = 1;
      if (a === 'wind' && w > 0.001) {
        // the key turns about its shaft; the flat bow never goes to zero width
        const c = Math.cos((t * 2 * Math.PI) / 1.6);
        sxk = 1 + w * ((c < 0 ? -1 : 1) * Math.max(0.14, Math.abs(c)) - 1);
      } else if (a === 'focus' && w > 0.001)
        sk = 1 + w * 0.06 * (0.5 - 0.5 * Math.cos((t * 2 * Math.PI) / 1.5)); // the monocle focuses
      const k3 = (v: number) => Math.round(v * 1000) / 1000;
      const tr2 =
        sxk !== 1
          ? `translate(${px} 0) scale(${k3(sxk)} 1) translate(${-Number(px)} 0)`
          : sk !== 1
            ? `translate(${px} ${py}) scale(${k3(sk)}) translate(${-Number(px)} ${-Number(py)})`
            : `rotate(${r2(ang)} ${px} ${py})`;
      if (tr2 !== this.lastPa) {
        this.pa.setAttribute('transform', tr2);
        this.lastPa = tr2;
      }
    }
    if (this.props) {
      // composes with the work motion on .pa inside
      const pg = X ? propTr(X, this.fid) : '';
      if (pg !== this.lastPg) {
        if (pg) this.props.setAttribute('transform', pg);
        else this.props.removeAttribute('transform');
        this.lastPg = pg;
      }
    }
    if (this.beam) {
      const b = r2(0.55 * this.wt.work.x + (X?.bm ? X.bm : 0));
      if (b !== this.lastBeam) {
        this.beam.setAttribute('opacity', String(b));
        this.lastBeam = b;
      }
    }
    if (this.glint && live) {
      const g = r2(
        0.25 + 0.7 * this.wt.work.x * (0.5 + 0.5 * Math.sin(((now / 1000) * 2 * Math.PI) / 1.5)),
      );
      if (g !== this.lastGl) {
        this.glint.setAttribute('opacity', String(g));
        this.lastGl = g;
      }
    }
    if (this.stitch && live) {
      const so = r2(-12 * this.wt.work.x * ((now / 1000 / 1.6) % 1));
      if (so !== this.lastSo) {
        this.stitch.setAttribute('stroke-dashoffset', String(so));
        this.lastSo = so;
      }
    }
  }

  /** Explicit unmount: every timer, the runtime registration and the inviter slot. */
  dispose() {
    this.disposed = true;
    for (const id of this.timers) clearTimeout(id);
    this.timers.clear();
    this.rt.unregister(this);
  }
}

/** The page's makeChar tail: the character on an SVG rendered from charTree(), live when asked and motion is on. */
export function createCharacter(svg: SVGSVGElement, c: Look, o: CharacterOptions) {
  const ch = new Character(svg, c, o);
  const P = c.prop && c.prop !== 'none' ? propDef(c.prop, ch.S, hexOf(c.color)) : null;
  ch.fid = P ? P.fid : null;
  if (o.cover)
    ch.setCover(true); // "Partial coverage": the crown is there from the first frame
  else {
    // the ghost's order, as the page's markup has it (a remount may find the crown's)
    const veil = svg.querySelector('[data-part~="veil"]');
    const visor = svg.querySelector('[data-part~="visor"]');
    if (veil && visor && veil.nextElementSibling !== visor) visor.before(veil);
  }
  const rt = getRuntime();
  if (o.live && rt.motionOn()) rt.register(ch);
  ch.render(performance.now());
  return ch;
}

/** Adds a character to a row of neighbours (the page sets `peers` per row); returns how to leave it. */
export function joinPeers(row: Set<Character>, ch: Character) {
  const sync = () => {
    const all = [...row];
    for (const o of row) o.peers = all;
  };
  row.add(ch);
  sync();
  return () => {
    row.delete(ch);
    ch.peers = null;
    sync();
  };
}

// propDef() of the reference page (look v14), ported line for line. Prop geometry depends on the shape
// (its top anchor and half-widths), so it is code, not data.
import { mix } from './color';
import {
  type AgentShapeDef,
  HARD,
  type PropDeco,
  type PropDef,
  type PropLayer,
  TONE,
} from './data.gen';
import { geom } from './geom';
import { ell, type Pt, polar, qpts, r2, rotRect, rr, tube } from './paths';

const PROP_FID: Record<string, string> = {
  antennae: 'twitch',
  dish: 'scan',
  periscope: 'turn',
  magnifier: 'sweep',
  pennant: 'flutter',
  sprout: 'sway',
  headlamp: 'flicker',
  windkey: 'spin',
  monocle: 'slip',
  seam: 'none',
  plaster: 'none',
};
/** Any other prop: 'bob' (a greeting lift, no idle fiddle). */
export const fidKind = (p: string) => PROP_FID[p] || 'bob';

export function propDef(kind: string, S: AgentShapeDef, col: string): PropDef {
  const G = geom(S);
  const [tx, ty] = G.top;
  const [vx, vy, vw, vh] = S.v;
  const cy = vy + vh / 2;
  const ex: Pt = [vx + vw * 0.3, vx + vw * 0.7];
  const hwT = (y: number) => Math.max(8, G.hw(y));
  const L: PropLayer[] = [];
  const deco: PropDeco[] = [];
  let anim: PropDef['anim'] = null;
  const add = (d: string, tone: string, mat?: 'vinyl') =>
    L.push({
      d,
      col: (TONE as Partial<Record<string, string>>)[tone] ?? tone,
      mat: mat || (HARD.has(tone) ? 'vinyl' : null),
    });
  const ax = vx + vw / 2;
  switch (kind) {
    case 'antennae':
      add(
        tube(qpts([tx - 9, ty + 5], [tx - 15, ty - 6], [tx - 22, ty - 14]), 3) +
          ell(tx - 22.5, ty - 15.5, 4.4) +
          tube(qpts([tx + 9, ty + 5], [tx + 15, ty - 6], [tx + 22, ty - 14]), 3) +
          ell(tx + 22.5, ty - 15.5, 4.4),
        'ink',
      );
      anim = { type: 'twitch', px: tx, py: ty + 4 };
      break;
    case 'dish':
      add(
        tube(
          [
            [tx + 2, ty + 4],
            [tx + 5, ty - 9],
          ],
          2.6,
        ),
        'ink',
      );
      add(
        `M${tx - 8} ${ty - 16}Q${tx + 5} ${ty - 1} ${tx + 19} ${ty - 14}Z`,
        mix(col, '#ffffff', 0.55),
      );
      add(
        tube(
          [
            [tx + 5, ty - 12],
            [tx + 8, ty - 23],
          ],
          1.8,
        ) + ell(tx + 8, ty - 24, 2.4),
        'ink',
      );
      anim = { type: 'dish', px: tx + 3, py: ty + 2 };
      break;
    case 'glasses':
      add(
        ell(ex[0], cy, 10.5) +
          ell(ex[0], cy, 8.4, 8.4, true) +
          ell(ex[1], cy, 10.5) +
          ell(ex[1], cy, 8.4, 8.4, true) +
          tube(
            qpts([ex[0] + 9.5, cy - 1.5], [(ex[0] + ex[1]) / 2, cy - 5], [ex[1] - 9.5, cy - 1.5]),
            1.8,
          ),
        'oat',
        'vinyl',
      );
      deco.push({
        s: `<path class="glint" d="M${ex[1] + 2.5} ${cy - 6.5}l3.2 3.2M${ex[0] + 2.5} ${cy - 6.5}l3.2 3.2" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>`,
      });
      break;
    case 'seam': {
      const s = Math.min(G.hw(ty + 16) - 4, 34);
      deco.push({
        clip: true,
        s: `<path d="M${tx - s} ${ty + 17}Q${tx} ${ty + 7} ${tx + s} ${ty + 17}" stroke="${mix(col, '#0d0b0c', 0.4)}" stroke-width="1.3" fill="none"/><path class="stitch" d="M${tx - s} ${ty + 17}Q${tx} ${ty + 7} ${tx + s} ${ty + 17}" stroke="#F4EEE4" stroke-width="3.4" stroke-dasharray="1.6 4.4" stroke-linecap="round" fill="none"/>`,
      });
      break;
    }
    case 'beanie': {
      const b = Math.max(hwT(ty + 12) + 2, 16);
      add(
        `M${tx - b} ${ty + 13}Q${tx - b} ${ty - 9} ${tx} ${ty - 9}Q${tx + b} ${ty - 9} ${tx + b} ${ty + 13}Z`,
        mix(col, '#0d0b0c', 0.5),
      );
      add(
        rr(tx - b - 2, ty + 8, 2 * b + 4, 8, 4) + ell(tx, ty - 12, 4.8),
        mix(mix(col, '#0d0b0c', 0.5), '#ffffff', 0.22),
      );
      break;
    }
    case 'headlamp': {
      const b = hwT(ty + 13) + 1.5;
      add(tube(qpts([tx - b, ty + 15], [tx, ty + 8], [tx + b, ty + 15]), 3), 'ink');
      add(rr(tx - 7, ty + 5, 14, 11, 4), 'metal');
      add(ell(tx, ty + 10.5, 4.6, 3.8), 'oat', 'vinyl');
      deco.push({
        s: `<path class="beam" d="M${tx - 4} ${ty + 8}L${tx - 16} ${ty - 26}L${tx + 16} ${ty - 26}L${tx + 4} ${ty + 8}Z" fill="#FFF6D6" opacity="0"/>`,
      });
      break;
    }
    case 'periscope':
      add(
        tube(
          [
            [tx + 2, ty + 4],
            [tx + 2, ty - 17],
          ],
          6,
        ),
        'metal',
      );
      add(rr(tx - 1, ty - 27, 14, 10, 3.5), 'metal');
      add(ell(tx + 10, ty - 22, 2.2, 3.2), 'ink');
      anim = { type: 'sway', px: tx + 2, py: ty + 4 };
      break;
    case 'magnifier': {
      const x = vx + vw - 3;
      const y = cy + 3;
      add(ell(x, y, 11.5) + ell(x, y, 8.6, 8.6, true), 'metal');
      add(ell(x, y, 8.7), 'glass', 'vinyl');
      add(
        tube(
          [
            [x + 8, y + 8],
            [x + 16, y + 17],
          ],
          4.6,
        ),
        'wood',
      );
      break;
    }
    case 'pennant':
      add(
        tube(
          [
            [tx + 3, ty + 5],
            [tx + 6, ty - 21],
          ],
          2,
        ),
        'ink',
      );
      add(`M${tx + 6} ${ty - 21}L${tx + 23} ${ty - 16}L${tx + 6} ${ty - 10}Z`, 'oat');
      anim = { type: 'wave', px: tx + 6, py: ty - 15 };
      break;
    case 'flowerclip': {
      // On the kettle it is clipped to the handle; it never covers the visor (the safe).
      const seat: Pt | null = S.id === 'kettle' ? [77, 38] : null;
      const x = seat ? seat[0] : ax + Math.min(hwT(ty + 11) * 0.55, 17);
      const y = seat ? seat[1] : Math.min(ty + 8, vy - 11);
      const k = 1.5;
      add(
        polar(x, y, a => k * (4 + 2.6 * Math.abs(Math.cos(2.5 * a))), 40),
        'oat',
      );
      add(ell(x, y, 2.4 * k), 'honey');
      break;
    }
    case 'plaster': {
      const x = tx - Math.min(hwT(ty + 14) * 0.45, 16);
      const y = ty + 15;
      add(rotRect(x, y, 20, 6, -35) + rotRect(x, y, 20, 6, 35), 'beige');
      deco.push({
        s: `<g fill="#B79C7D" opacity=".7"><circle cx="${x - 1.5}" cy="${y}" r=".7"/><circle cx="${x + 1.5}" cy="${y}" r=".7"/><circle cx="${x}" cy="${y - 1.5}" r=".7"/><circle cx="${x}" cy="${y + 1.5}" r=".7"/></g>`,
      });
      break;
    }
    case 'sprout':
      add(
        tube(
          [
            [tx, ty + 3],
            [tx, ty - 8],
          ],
          2.2,
        ),
        'leaf',
      );
      add(
        `M${tx} ${ty - 7}C${tx - 4} ${ty - 16} ${tx - 14} ${ty - 18} ${tx - 18} ${ty - 14}C${tx - 14} ${ty - 8} ${tx - 6} ${ty - 5} ${tx} ${ty - 7}Z M${tx} ${ty - 8}C${tx + 3} ${ty - 19} ${tx + 14} ${ty - 23} ${tx + 21} ${ty - 19}C${tx + 17} ${ty - 10} ${tx + 7} ${ty - 6} ${tx} ${ty - 8}Z`,
        'leaf',
      );
      anim = { type: 'sway', px: tx, py: ty + 3 };
      break;
    case 'badge': {
      const x = vx + vw + 2;
      const y = cy + 6;
      add(rr(x + 3, y - 5, 6, 7, 2), 'metal');
      add(rr(x, y + 1, 13, 17, 2.5), 'oat');
      deco.push({
        s: `<rect x="${x + 2.5}" y="${y + 4}" width="5" height="6" rx="1" fill="#A9B1BC"/><rect x="${x + 2.5}" y="${y + 12}" width="8" height="1.6" rx=".8" fill="#2D6E8E"/>`,
      });
      break;
    }
    case 'windkey':
      add(rr(tx - 2, ty - 9, 4, 12, 1.5), 'brass');
      add(
        ell(tx - 6.5, ty - 14, 6.5, 5.5) +
          ell(tx - 6.5, ty - 14, 2.6, 2.2, true) +
          ell(tx + 6.5, ty - 14, 6.5, 5.5) +
          ell(tx + 6.5, ty - 14, 2.6, 2.2, true),
        'brass',
      );
      anim = { type: 'wind', px: tx, py: ty - 10 };
      break;
    case 'monocle': {
      // Brass ring on the right eye, bead chain to a pin on the cheek; on the safe the pin sits clear of the handle.
      const x = ex[1];
      const r = Math.min(10.6, vh * 0.4);
      const sx = x + r * 0.72;
      const sy = cy + r * 0.7;
      const qx = vx + vw - (S.id === 'safe' ? 16 : 2);
      let qy = Math.min(vy + vh + 9, 103);
      while (qy > vy + vh + 4 && (G.hw(qy + 4) < qx - tx + 4 || G.hw(qy + 5) < qx - tx)) qy -= 0.5;
      add(ell(x, cy, r) + ell(x, cy, r - 3, r - 3, true), 'brass');
      add(ell(qx, qy, 2.6), 'brass');
      deco.push({
        s: `<path d="M${r2(sx)} ${r2(sy)}C${r2(sx + 3)} ${r2(sy + 7)} ${r2(qx + 4)} ${r2(qy - 7)} ${r2(qx)} ${r2(qy - 2)}" fill="none" stroke="#B08D4C" stroke-width="2.1" stroke-dasharray="0 2.9" stroke-linecap="round"/><path class="glint" d="M${r2(x + 1.5)} ${r2(cy - r + 4.4)}l3 3" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>`,
      });
      anim = { type: 'focus', px: r2(x), py: r2(cy) };
      break;
    }
    default: // 'none' and unknown props draw nothing
      break;
  }
  // The pivot of the greeting and fiddle moves: the stalk foot, the pole foot, the handle end, the hat band, the monocle ring.
  const fk = fidKind(kind);
  const FP: Record<string, Pt> = {
    twitch: [tx, ty + 4],
    scan: [tx + 3, ty + 2],
    turn: [tx + 2, ty + 4],
    sweep: [vx + vw + 13, cy + 20],
    flutter: [tx + 3, ty + 5],
    sway: [tx, ty + 3],
    flicker: [tx, ty + 10],
    spin: [tx, ty - 10],
  };
  const fp: Pt = FP[fk] || (anim && fk === 'slip' ? [anim.px, anim.py] : [tx, ty]);
  return { layers: L, deco, anim, fid: { k: fk, px: r2(fp[0]), py: r2(fp[1]) } };
}

import { useEffect, useState } from 'react';

import {
  type Baked,
  type BakeRunner,
  bake,
  region,
  release,
  retain,
} from '../../lib/agent-characters/bake';
import { bakeSize, type CharLayer } from '../../lib/agent-characters/char';
import { bakeInWorker } from '../../lib/agent-characters/worker';

export const layerKey = (l: Pick<CharLayer, 'd' | 'col' | 'mat'>) => `${l.mat}|${l.col}|${l.d}`;

/**
 * Bakes the character's layers in the browser (a worker when available) and returns each one once its image is
 * decoded, so the flat fill is never swapped for an undecoded bitmap. A layer keeps its previous bake until the new
 * one (a new size) is decoded; a failed bake leaves the flat fill. Results after unmount are dropped.
 */
export function useBakedLayers(
  layers: readonly CharLayer[],
  size: number,
  run: BakeRunner = bakeInWorker,
) {
  const [baked, setBaked] = useState<Record<string, Baked>>({});
  // The layers are rebuilt on every render; their content is what decides a re-bake.
  const signature = `${size}#${layers.map(layerKey).join('\n')}`;

  useEffect(() => {
    let alive = true;
    const held = new Set<string>();
    const dpr = window.devicePixelRatio || 1;
    const keys = new Set(layers.map(layerKey));
    for (const l of layers) {
      let R: number;
      try {
        R = region(l.d)[2]; // SVG getBBox: browser only, so it runs here and never in render
      } catch {
        continue;
      }
      const key = layerKey(l);
      bake(l.d, l.col, bakeSize(R, size, dpr), l.mat, run)
        .then(async b => {
          const img = new Image();
          img.src = b.url;
          await img.decode();
          if (!alive) return;
          // shown from now on: the cache may not revoke its url while this character is mounted
          retain(b.key);
          held.add(b.key);
          setBaked(prev => {
            const next: Record<string, Baked> = {};
            for (const [k, v] of Object.entries(prev)) if (keys.has(k)) next[k] = v; // drop layers no longer drawn
            next[key] = b;
            return next;
          });
        })
        .catch(() => undefined); // the flat fill stays
    }
    return () => {
      alive = false;
      for (const k of held) release(k);
    };
  }, [signature]);

  return baked;
}

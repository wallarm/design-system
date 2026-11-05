// The page's bake queue (enqueue/pump): jobs run in 14 ms slices, 16 ms apart, so a cold view never blocks a frame
// for long. Jobs whose node left the document are dropped.

export interface Job {
  alive: () => boolean;
  run: () => void;
}

export function createQueue() {
  const queue: Job[] = [];
  let busy = false;
  const pump = () => {
    const t0 = performance.now();
    while (queue.length && performance.now() - t0 < 14) {
      const j = queue.shift() as Job;
      if (!j.alive()) continue;
      try {
        j.run();
      } catch (e) {
        console.error(e);
      }
    }
    if (queue.length) setTimeout(pump, 16);
    else busy = false;
  };
  return {
    enqueue(job: Job, front = false) {
      if (front) queue.unshift(job);
      else queue.push(job);
      if (!busy) {
        busy = true;
        setTimeout(pump, 0);
      }
    },
  };
}

/** A Map in insertion order, refreshed on read: the first key is the least recently used. */
export class Lru<V> {
  private readonly map = new Map<string, V>();
  constructor(
    private readonly cap: number,
    private readonly onEvict: (v: V) => void = () => undefined,
    /** a pinned entry is never evicted (a mounted character still shows it) */
    private readonly isPinned: (k: string) => boolean = () => false,
  ) {}
  has(k: string) {
    return this.map.has(k);
  }
  get(k: string) {
    const v = this.map.get(k);
    if (v !== undefined) {
      this.map.delete(k);
      this.map.set(k, v);
    }
    return v;
  }
  set(k: string, v: V) {
    const prev = this.map.get(k);
    if (prev !== undefined && prev !== v) this.onEvict(prev); // a replaced value is gone too
    this.map.delete(k);
    this.map.set(k, v);
    if (this.map.size <= this.cap) return;
    // oldest first, skipping pinned entries; past the cap only while everything left is pinned
    for (const [key, value] of [...this.map]) {
      if (this.map.size <= this.cap) break;
      if (key === k || this.isPinned(key)) continue; // never the entry just set
      this.map.delete(key);
      this.onEvict(value);
    }
  }
}

/** Runs a runner's jobs through the queue, so main-thread bakes come in 14 ms slices instead of one long task. */
export const queuedRunner =
  <J, R>(run: (job: J) => Promise<R>, q: ReturnType<typeof createQueue>) =>
  (job: J): Promise<R> =>
    new Promise((ok, fail) =>
      q.enqueue({
        alive: () => true,
        run: () => {
          run(job).then(ok, fail); // the synchronous part (mask, solve, shade) runs inside the slice
        },
      }),
    );

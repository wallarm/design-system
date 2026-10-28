import { describe, expect, it } from '@rstest/core';

import { createQueue, Lru, queuedRunner } from '../queue';

const tick = (ms: number) => new Promise(r => setTimeout(r, ms));

describe('bake queue (page pump: 14 ms slices, 16 ms apart)', () => {
  it('runs jobs in order, front jobs first, and skips jobs whose node is gone', async () => {
    const ran: string[] = [];
    const q = createQueue();
    const job = (id: string, alive = true) => ({
      alive: () => alive,
      run: () => void ran.push(id),
    });
    q.enqueue(job('a'));
    q.enqueue(job('b', false));
    q.enqueue(job('c'));
    q.enqueue(job('first'), true);
    await tick(30);
    expect(ran).toEqual(['first', 'a', 'c']);
  });

  it('yields between slices when jobs are slow', async () => {
    const q = createQueue();
    const starts: number[] = [];
    const slow = {
      alive: () => true,
      run: () => {
        starts.push(performance.now());
        const t = performance.now();
        while (performance.now() - t < 10) {
          /* busy */
        }
      },
    };
    for (let i = 0; i < 4; i++) q.enqueue(slow);
    await tick(120);
    expect(starts).toHaveLength(4);
    // two jobs fit in a 14 ms slice; the third starts after a 16 ms pause
    expect((starts[2] as number) - (starts[1] as number)).toBeGreaterThanOrEqual(15);
  });

  it('keeps a job error from stopping the queue', async () => {
    const ran: string[] = [];
    const q = createQueue();
    q.enqueue({
      alive: () => true,
      run: () => {
        throw new Error('bad layer');
      },
    });
    q.enqueue({ alive: () => true, run: () => void ran.push('next') });
    const err = console.error;
    console.error = () => {};
    await tick(30);
    console.error = err;
    expect(ran).toEqual(['next']);
  });
});

describe('Lru', () => {
  it('evicts the least recently used entry and reports it', () => {
    const evicted: string[] = [];
    const c = new Lru<string>(2, v => evicted.push(v));
    c.set('a', 'A');
    c.set('b', 'B');
    expect(c.get('a')).toBe('A'); // a is now the most recent
    c.set('c', 'C');
    expect(evicted).toEqual(['B']);
    expect(c.get('b')).toBeUndefined();
    expect(c.has('a') && c.has('c')).toBe(true);
  });

  it('never evicts a pinned entry, even past its cap', () => {
    const evicted: string[] = [];
    const pinned = new Set(['a']);
    const c = new Lru<string>(
      1,
      v => evicted.push(v),
      k => pinned.has(k),
    );
    c.set('a', 'A');
    c.set('b', 'B');
    expect(evicted).toEqual([]);
    expect(c.has('a') && c.has('b')).toBe(true);
    pinned.delete('a');
    c.set('c', 'C');
    expect(evicted).toEqual(['A', 'B']);
  });
});

describe('queuedRunner', () => {
  it('runs main-thread jobs in queue slices instead of all at once', async () => {
    const starts: number[] = [];
    const heavy = async () => {
      starts.push(performance.now());
      const t = performance.now();
      while (performance.now() - t < 10) {
        /* busy */
      }
      return new Blob(['x']);
    };
    const run = queuedRunner(heavy, createQueue());
    const job = {
      d: 'M0 0Z',
      col: '#000',
      P: 1,
      mat: 'felt' as const,
      region: [0, 0, 1] as [number, number, number],
    };
    await Promise.all([run(job), run(job), run(job), run(job)]);
    expect(starts).toHaveLength(4);
    expect((starts[2] as number) - (starts[1] as number)).toBeGreaterThanOrEqual(15);
  });
});

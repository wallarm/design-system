import { describe, expect, it } from '@rstest/core';
import type { BakeRunner } from '../bake';
import { createWorkerRunner, WORKER_SRC } from '../worker';

const job = {
  d: 'M0 0H4V4Z',
  col: '#3F63DB',
  P: 8,
  mat: 'felt' as const,
  region: [0, 0, 4] as [number, number, number],
};
const mainBlob = new Blob(['main']);
const fallback: BakeRunner = async () => mainBlob;

// A worker that reports an async `error` (CSP-blocked blob worker, parse error, crash) instead of throwing.
class DeadWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  postMessage() {
    setTimeout(() => this.onerror?.(new Event('error')), 0);
  }
  terminate() {}
}

describe('worker runner', () => {
  it('settles pending jobs on the main thread when the worker fails', async () => {
    const run = createWorkerRunner(fallback, () => new DeadWorker() as unknown as Worker);
    await expect(Promise.all([run(job), run(job)])).resolves.toEqual([mainBlob, mainBlob]);
  });

  it('sends later jobs straight to the main thread after a failure', async () => {
    let made = 0;
    const run = createWorkerRunner(fallback, () => {
      made++;
      return new DeadWorker() as unknown as Worker;
    });
    await run(job);
    await run(job);
    expect(made).toBe(1);
  });

  it('falls back when the worker cannot be created', async () => {
    const run = createWorkerRunner(fallback, () => null);
    await expect(run(job)).resolves.toBe(mainBlob);
  });

  it('builds a worker source that parses and needs no outside helpers', () => {
    expect(() => new Function(WORKER_SRC)).not.toThrow();
    expect(WORKER_SRC).not.toMatch(/_to_consumable_array|_sliced_to_array|__name|_object_spread/);
    expect(WORKER_SRC).not.toMatch(/\.\.\.\w/); // no spread in the shared functions
  });
});

// The bake off the main thread: one blob-URL worker per document, running the very same solveField() and shade()
// from their source text, with OffscreenCanvas for the masks and the PNG. Region stays on the main thread (getBBox).
// Any failure — no Worker/OffscreenCanvas, a CSP that blocks blob: workers (reported as an async `error`), a crash —
// moves the pending jobs and every later job to the main thread.
import { type BakeRunner, bakeOnMain, shade, solveField } from './bake';
import { queuedRunner } from './queue';

export const WORKER_SRC = `
const solveField = ${solveField.toString()};
const shade = ${shade.toString()};
const HC = new Map();
const mask = (d, x0, y0, R, N) => {
  const cv = new OffscreenCanvas(N, N), x = cv.getContext('2d');
  x.scale(N / R, N / R); x.translate(-x0, -y0); x.fill(new Path2D(d));
  const rgba = x.getImageData(0, 0, N, N).data, a = new Uint8ClampedArray(N * N);
  for (let i = 0; i < N * N; i++) a[i] = rgba[i * 4 + 3];
  return a;
};
self.onmessage = async ({ data: { id, d, col, P, mat, region } }) => {
  try {
    const x0 = region[0], y0 = region[1], R = region[2];
    let u = HC.get(d);
    if (!u) { u = solveField(N => mask(d, x0, y0, R, N), R); HC.set(d, u); if (HC.size > 64) HC.delete(HC.keys().next().value); }
    const px = shade(u, mask(d, x0, y0, R, P), col, P, mat, y0, R);
    const cv = new OffscreenCanvas(P, P);
    cv.getContext('2d').putImageData(new ImageData(px, P, P), 0, 0);
    self.postMessage({ id, blob: await cv.convertToBlob({ type: 'image/png' }) });
  } catch (e) { self.postMessage({ id, error: String(e) }); }
};`;

type Job = Parameters<BakeRunner>[0];

function makeBlobWorker(): Worker | null {
  if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return null;
  const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
  try {
    return new Worker(url);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url); // the worker has fetched its script
  }
}

export function createWorkerRunner(
  fallback: BakeRunner,
  make: () => Worker | null = makeBlobWorker,
): BakeRunner {
  let worker: Worker | null = null;
  let broken = false;
  let seq = 0;
  const pending = new Map<
    number,
    { job: Job; ok: (b: Blob) => void; fail: (e: unknown) => void }
  >();
  const toMain = (p: { job: Job; ok: (b: Blob) => void; fail: (e: unknown) => void }) =>
    fallback(p.job).then(p.ok, p.fail);
  const breakDown = () => {
    broken = true;
    worker?.terminate();
    worker = null;
    for (const p of pending.values()) void toMain(p);
    pending.clear();
  };
  const get = () => {
    if (worker || broken) return worker;
    worker = make();
    if (!worker) {
      broken = true;
      return null;
    }
    worker.onerror = breakDown;
    worker.onmessageerror = breakDown;
    worker.onmessage = ({ data }: MessageEvent<{ id: number; blob?: Blob; error?: string }>) => {
      const p = pending.get(data.id);
      if (!p) return;
      pending.delete(data.id);
      if (data.blob) p.ok(data.blob);
      else void toMain(p); // a job that failed in the worker gets one try on the main thread
    };
    return worker;
  };
  return job => {
    const w = get();
    if (!w) return fallback(job);
    return new Promise((ok, fail) => {
      const id = ++seq;
      pending.set(id, { job, ok, fail });
      w.postMessage({ id, ...job });
    });
  };
}

/** Bakes in the worker; falls back to the main thread when it is unavailable or fails. */
export const bakeInWorker: BakeRunner = createWorkerRunner(queuedRunner(bakeOnMain));

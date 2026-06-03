/**
 * Shared read/write batch for overflow measurements.
 *
 * Many `useOverflowItems` instances mount in a single React commit (e.g. a
 * virtualized table renders a chunk of rows, each with several overflow
 * cells). Measuring inside each instance's layout effect forces a reflow per
 * instance: the effect's `setState` flushes synchronously, mutating the DOM
 * before the next instance reads `offsetWidth`. Batching defers every read
 * into one pre-paint microtask: reads run back-to-back against clean layout
 * (a single reflow at most), then all state updates apply together — React
 * batches them, so no DOM mutation interleaves with the reads.
 */

type WritePhase = () => void;
type ReadPhase = () => WritePhase;

const queue = new Set<ReadPhase>();
let flushScheduled = false;

function flush(): void {
  flushScheduled = false;
  const reads = Array.from(queue);
  queue.clear();
  // Phase 1: all DOM reads against clean layout — nothing writes in between.
  // Isolated per instance: one read throwing must not drop the rest of the
  // batch (they've already been dequeued and won't be retried).
  const writes: WritePhase[] = [];
  for (const read of reads) {
    try {
      writes.push(read());
    } catch {
      // Skip this instance's write; a stale/detached read shouldn't starve
      // the others. Its next render re-schedules a fresh measurement.
    }
  }
  // Phase 2: state updates. React 18+ flushes them in its own later
  // microtask, so the DOM stays untouched throughout phase 1.
  for (const write of writes) {
    try {
      write();
    } catch {
      // A single failing setState must not block the remaining instances.
    }
  }
}

/**
 * Queue a measurement for the next pre-paint flush. Returns a cancel
 * function — call it on effect cleanup so unmounted or re-rendered
 * instances never measure stale refs.
 */
export function scheduleOverflowMeasurement(read: ReadPhase): () => void {
  queue.add(read);
  if (!flushScheduled) {
    flushScheduled = true;
    queueMicrotask(flush);
  }
  return () => {
    queue.delete(read);
  };
}

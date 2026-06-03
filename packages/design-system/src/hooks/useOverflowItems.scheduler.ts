/**
 * Shared read/write batch for overflow measurements. Many instances mount in
 * one commit (a virtualized row chunk × several overflow cells); measuring in
 * each layout effect reflows per instance, since its setState flushes before
 * the next reads `offsetWidth`. One pre-paint microtask runs all reads against
 * clean layout, then all writes — React batches them, no interleaving.
 */

type WritePhase = () => void;
type ReadPhase = () => WritePhase;

const queue = new Set<ReadPhase>();
let flushScheduled = false;

const flush = (): void => {
  flushScheduled = false;
  const reads = Array.from(queue);
  queue.clear();
  // Phase 1: DOM reads. Per-instance try so one throwing read (stale/detached)
  // doesn't drop the already-dequeued rest — they re-schedule on next render.
  const writes: WritePhase[] = [];
  for (const read of reads) {
    try {
      writes.push(read());
    } catch {
      // skip; re-scheduled on next render
    }
  }
  // Phase 2: state updates, batched by React. One failing setState mustn't
  // block the others.
  for (const write of writes) {
    try {
      write();
    } catch {
      // skip
    }
  }
};

/**
 * Queue a measurement for the next pre-paint flush. Returns a cancel
 * function — call it on effect cleanup so unmounted or re-rendered
 * instances never measure stale refs.
 */
export const scheduleOverflowMeasurement = (read: ReadPhase): (() => void) => {
  queue.add(read);
  if (!flushScheduled) {
    flushScheduled = true;
    queueMicrotask(flush);
  }
  return () => {
    queue.delete(read);
  };
};

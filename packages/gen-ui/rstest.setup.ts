// jsdom has no ResizeObserver or IntersectionObserver; the DS Table and charts use both.
class NoopResizeObserver {
  observe() {
    // nothing to measure in jsdom
  }
  unobserve() {
    // nothing to release
  }
  disconnect() {
    // nothing to release
  }
}
globalThis.ResizeObserver ??= NoopResizeObserver;

class NoopIntersectionObserver extends NoopResizeObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly scrollMargin = '';
  readonly thresholds: readonly number[] = [];
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
globalThis.IntersectionObserver ??= NoopIntersectionObserver;

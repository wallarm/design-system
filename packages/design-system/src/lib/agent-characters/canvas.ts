type Canvas2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** A square 2D canvas: OffscreenCanvas where it exists (workers), else a DOM canvas. */
export function createCanvas(n: number): { ctx: Canvas2D; toBlob: () => Promise<Blob> } {
  if (typeof OffscreenCanvas !== 'undefined') {
    const cv = new OffscreenCanvas(n, n);
    const ctx = cv.getContext('2d');
    if (!ctx) throw new Error('2D canvas unavailable');
    return { ctx, toBlob: () => cv.convertToBlob({ type: 'image/png' }) };
  }
  const cv = document.createElement('canvas');
  cv.width = cv.height = n;
  const ctx = cv.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return {
    ctx,
    toBlob: () =>
      new Promise((ok, fail) =>
        cv.toBlob(b => (b ? ok(b) : fail(new Error('toBlob failed'))), 'image/png'),
      ),
  };
}

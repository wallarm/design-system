import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { exportCrop } from './exportCrop';

const loadedImage = () => {
  const image = document.createElement('img');
  Object.defineProperties(image, {
    complete: { value: true },
    naturalWidth: { value: 400 },
    naturalHeight: { value: 200 },
  });
  return image;
};

afterEach(() => rs.restoreAllMocks());

describe('ImageCropper export', () => {
  it.each([
    { width: 64, height: 64 },
    { width: 512, height: 512 },
  ])(
    'exports the exact requested dimensions %j without rounding source coordinates',
    async outputSize => {
      const drawImage = rs.fn();
      const context = { drawImage, imageSmoothingEnabled: false, imageSmoothingQuality: 'low' };
      rs.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
        context as unknown as CanvasRenderingContext2D,
      );
      const blob = new Blob(['cropped'], { type: 'image/jpeg' });
      let dimensions: number[] = [];
      rs.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
        function (callback, type, quality) {
          dimensions = [this.width, this.height];
          expect(type).toBe('image/jpeg');
          expect(quality).toBe(0.8);
          callback(blob);
        },
      );
      const image = loadedImage();
      const result = await exportCrop(
        image,
        { x: 100.25, y: 0.5, width: 199.5, height: 199.5 },
        outputSize,
        { type: 'image/jpeg', quality: 0.8 },
      );
      expect(result).toBe(blob);
      expect(dimensions).toEqual([outputSize.width, outputSize.height]);
      expect(drawImage).toHaveBeenCalledWith(
        image,
        100.25,
        0.5,
        199.5,
        199.5,
        0,
        0,
        outputSize.width,
        outputSize.height,
      );
      expect(context.imageSmoothingQuality).toBe('high');
    },
  );

  it('returns null if the source is not loaded', async () => {
    expect(
      await exportCrop(
        document.createElement('img'),
        { x: 0, y: 0, width: 10, height: 10 },
        { width: 100, height: 100 },
      ),
    ).toBeNull();
  });

  it('returns null when canvas access is blocked by a cross-origin source', async () => {
    rs.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: rs.fn(),
    } as unknown as CanvasRenderingContext2D);
    rs.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(() => {
      throw new DOMException('Tainted canvas', 'SecurityError');
    });
    expect(
      await exportCrop(
        loadedImage(),
        { x: 0, y: 0, width: 100, height: 100 },
        { width: 100, height: 100 },
      ),
    ).toBeNull();
  });

  it('returns null when canvas creation or encoding fails', async () => {
    rs.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(
      await exportCrop(
        loadedImage(),
        { x: 0, y: 0, width: 100, height: 100 },
        { width: 100, height: 100 },
      ),
    ).toBeNull();
  });
});

import { createRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  ImageCropper,
  ImageCropperContext,
  ImageCropperGrid,
  ImageCropperImage,
  ImageCropperSelection,
  ImageCropperViewport,
} from '.';

beforeEach(() => {
  rs.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    return new DOMRect(
      0,
      0,
      Number.parseFloat(this.style.width) || 100,
      Number.parseFloat(this.style.height) || 100,
    );
  });
});
afterEach(async () => {
  await act(async () => {
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  });
  rs.restoreAllMocks();
});

const completeImage = (image: HTMLElement, width = 400, height = 200) => {
  Object.defineProperties(image, {
    complete: { configurable: true, value: true },
    naturalWidth: { configurable: true, value: width },
    naturalHeight: { configurable: true, value: height },
  });
  fireEvent.load(image);
};

const Cropper = ({ src = '/landscape.png', onLoad }: { src?: string; onLoad?: () => void }) => (
  <ImageCropper outputSize={{ width: 256, height: 256 }} data-testid='cropper'>
    <ImageCropperViewport>
      <ImageCropperImage src={src} onLoad={onLoad} />
      <ImageCropperSelection>
        <ImageCropperGrid />
      </ImageCropperSelection>
    </ImageCropperViewport>
    <ImageCropperContext>
      {api => (
        <>
          <output data-testid='ready'>{String(api.ready)}</output>
          <output data-testid='zoom'>{api.zoom}</output>
          <button type='button' data-testid='zoom-in' onClick={() => api.setZoom(2)}>
            Zoom
          </button>
        </>
      )}
    </ImageCropperContext>
  </ImageCropper>
);

describe('ImageCropper', () => {
  it('cascades test IDs and starts unavailable for export until the image is measured', async () => {
    render(<Cropper />);
    for (const slot of ['frame', 'viewport', 'image', 'selection', 'grid'])
      expect(screen.getByTestId(`cropper--${slot}`)).toBeInTheDocument();
    expect(screen.getByTestId('ready')).toHaveTextContent('false');
    completeImage(screen.getByTestId('cropper--image'));
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'));
    expect(screen.getByTestId('cropper--viewport').style.width).toBe('200px');
    expect(screen.getByTestId('cropper--viewport').style.height).toBe('100px');
    expect(screen.getByTestId('cropper').style.getPropertyValue('--crop-x')).toBe('50px');
  });

  it('resets transforms and disables export when the source changes or fails', async () => {
    const view = render(<Cropper />);
    completeImage(screen.getByTestId('cropper--image'));
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'));
    fireEvent.click(screen.getByTestId('zoom-in'));
    await waitFor(() => expect(screen.getByTestId('zoom')).toHaveTextContent('2'));
    view.rerender(<Cropper src='/portrait.png' />);
    expect(screen.getByTestId('ready')).toHaveTextContent('false');
    await waitFor(() => expect(screen.getByTestId('zoom')).toHaveTextContent('1'));
    fireEvent.error(screen.getByTestId('cropper--image'));
    expect(screen.getByTestId('ready')).toHaveTextContent('false');
  });

  it('composes image loading handlers with internal state', async () => {
    const onLoad = rs.fn();
    render(<Cropper onLoad={onLoad} />);
    completeImage(screen.getByTestId('cropper--image'));
    expect(onLoad).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'));
  });

  it('forwards attributes and refs to the interactive selection and viewport', async () => {
    const selectionRef = createRef<HTMLDivElement>();
    const viewportRef = createRef<HTMLDivElement>();
    const onKeyDown = rs.fn();
    render(
      <ImageCropper outputSize={{ width: 256, height: 256 }} data-testid='c'>
        <ImageCropperViewport ref={viewportRef} data-analytics-id='viewport' id='custom-viewport'>
          <ImageCropperImage src='/image.png' id='custom-image' />
          <ImageCropperSelection
            ref={selectionRef}
            id='custom-selection'
            data-analytics-id='selection'
            aria-label='Position photo'
            onKeyDown={onKeyDown}
            data-testid='selection-override'
          />
        </ImageCropperViewport>
      </ImageCropper>,
    );
    expect(selectionRef.current).toBe(screen.getByTestId('selection-override'));
    expect(viewportRef.current).toBe(screen.getByTestId('c--viewport'));
    expect(selectionRef.current).toHaveAttribute('data-analytics-id', 'selection');
    expect(selectionRef.current).toHaveAttribute('id', 'custom-selection');
    expect(viewportRef.current).toHaveAttribute('id', 'custom-viewport');
    expect(screen.getByTestId('c--image')).toHaveAttribute('id', 'custom-image');
    fireEvent.keyDown(selectionRef.current!, { key: 'ArrowRight' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    await act(async () => {
      // Flush Ark's queued state updates before Testing Library unmounts the tree.
    });
  });

  it('supports a controlled zoom and reports bare numeric changes', async () => {
    const onZoomChange = rs.fn();
    const Controlled = () => {
      const [zoom, setZoom] = useState(1);
      return (
        <ImageCropper
          outputSize={{ width: 256, height: 256 }}
          zoom={zoom}
          onZoomChange={next => {
            onZoomChange(next);
            setZoom(next);
          }}
        >
          <ImageCropperViewport>
            <ImageCropperImage src='/image.png' />
            <ImageCropperSelection />
          </ImageCropperViewport>
          <ImageCropperContext>
            {api => (
              <button type='button' data-testid='controlled' onClick={() => api.setZoom(2)}>
                {api.zoom}
              </button>
            )}
          </ImageCropperContext>
        </ImageCropper>
      );
    };
    render(<Controlled />);
    fireEvent.click(screen.getByTestId('controlled'));
    await waitFor(() => expect(screen.getByTestId('controlled')).toHaveTextContent('2'));
    expect(onZoomChange).toHaveBeenCalledWith(2);
  });

  it('omits derived test IDs without a root test ID', async () => {
    const { container } = render(
      <ImageCropper outputSize={{ width: 256, height: 256 }}>
        <ImageCropperViewport>
          <ImageCropperImage src='/image.png' />
          <ImageCropperSelection>
            <ImageCropperGrid />
          </ImageCropperSelection>
        </ImageCropperViewport>
      </ImageCropper>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
    await act(async () => {
      // Flush Ark's queued state updates before Testing Library unmounts the tree.
    });
  });

  it('keeps a rejected controlled zoom and pan position authoritative for API, keyboard and wheel', async () => {
    const onZoomChange = rs.fn();
    render(
      <ImageCropper
        outputSize={{ width: 256, height: 256 }}
        zoom={1}
        onZoomChange={onZoomChange}
        data-testid='locked'
      >
        <ImageCropperViewport>
          <ImageCropperImage src='/image.png' />
          <ImageCropperSelection />
        </ImageCropperViewport>
        <ImageCropperContext>
          {api => (
            <button type='button' data-testid='request-zoom' onClick={() => api.setZoom(2)}>
              {api.zoom}
            </button>
          )}
        </ImageCropperContext>
      </ImageCropper>,
    );
    completeImage(screen.getByTestId('locked--image'));
    const root = screen.getByTestId('locked');
    await waitFor(() => expect(root).not.toHaveAttribute('aria-busy'));
    fireEvent.click(screen.getByTestId('request-zoom'));
    await act(async () => {
      /* Flush the native state machine. */
    });
    expect(screen.getByTestId('request-zoom')).toHaveTextContent('1');
    expect(onZoomChange).toHaveBeenCalledTimes(1);
    expect(onZoomChange).toHaveBeenLastCalledWith(2);
    onZoomChange.mockClear();
    fireEvent.keyDown(screen.getByTestId('locked--selection'), { key: '+' });
    await act(async () => {
      /* Flush the native state machine. */
    });
    expect(root.style.getPropertyValue('--image-zoom')).toBe('1');
    expect(onZoomChange).toHaveBeenCalledTimes(1);
    expect(onZoomChange).toHaveBeenLastCalledWith(1.1);
    onZoomChange.mockClear();
    const offset = root.style.getPropertyValue('--image-offset-x');
    fireEvent.wheel(screen.getByTestId('locked--viewport'), {
      deltaY: -100,
      clientX: 25,
      clientY: 25,
    });
    await act(async () => {
      /* Flush the native state machine. */
    });
    expect(root.style.getPropertyValue('--image-zoom')).toBe('1');
    expect(root.style.getPropertyValue('--image-offset-x')).toBe(offset);
    expect(onZoomChange).toHaveBeenCalledTimes(1);
    expect(onZoomChange).toHaveBeenLastCalledWith(1.1);
  });

  it('focuses a pressed selection and announces changing source coordinates', async () => {
    render(<Cropper />);
    completeImage(screen.getByTestId('cropper--image'));
    const selection = screen.getByTestId('cropper--selection');
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'));
    fireEvent.pointerDown(selection, { button: 0, pointerType: 'mouse', isPrimary: true });
    expect(selection).toHaveFocus();
    await act(async () => {
      /* Attach the native pointer tracking effect. */
    });
    fireEvent.pointerUp(document);
    await act(async () => {
      /* Finish the native pointer interaction. */
    });
    const before = selection.getAttribute('aria-valuetext');
    fireEvent.keyDown(selection, { key: 'ArrowRight' });
    await waitFor(() => expect(selection.getAttribute('aria-valuetext')).not.toBe(before));
  });
});

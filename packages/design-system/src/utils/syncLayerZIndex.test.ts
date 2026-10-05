import { afterEach, describe, expect, it } from '@rstest/core';
import { syncLayerZIndex } from './syncLayerZIndex';

const flushMutations = () => new Promise<void>(resolve => queueMicrotask(resolve));

const mount = () => {
  const positioner = document.createElement('div');
  const content = document.createElement('div');
  positioner.appendChild(content);
  document.body.appendChild(positioner);
  return { positioner, content };
};

describe('syncLayerZIndex', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('copies the content z-index to the positioner --z-index immediately', () => {
    const { positioner, content } = mount();
    content.style.zIndex = '50';

    const stop = syncLayerZIndex(content);

    expect(positioner.style.getPropertyValue('--z-index')).toBe('50');
    stop();
  });

  it('re-syncs when the content z-index changes after the first read (late layer registration)', async () => {
    const { positioner, content } = mount();
    content.style.zIndex = '50';
    const stop = syncLayerZIndex(content);
    // A stale value written by the popper before the layer registered.
    positioner.style.setProperty('--z-index', '50');

    content.style.zIndex = '90';
    await flushMutations();

    expect(positioner.style.getPropertyValue('--z-index')).toBe('90');
    stop();
  });

  it('stops syncing after cleanup', async () => {
    const { positioner, content } = mount();
    content.style.zIndex = '50';
    const stop = syncLayerZIndex(content);
    stop();

    content.style.zIndex = '90';
    await flushMutations();

    expect(positioner.style.getPropertyValue('--z-index')).toBe('50');
  });

  it('leaves the positioner alone while the content has no z-index', () => {
    const { positioner, content } = mount();

    const stop = syncLayerZIndex(content);

    expect(positioner.style.getPropertyValue('--z-index')).toBe('');
    stop();
  });
});

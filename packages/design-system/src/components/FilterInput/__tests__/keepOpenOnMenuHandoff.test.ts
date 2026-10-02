import { describe, expect, it } from 'vitest';
import { keepOpenOnMenuHandoff } from '../lib';

const dismissRequest = (targetLayer: HTMLElement | undefined) => {
  const originalLayer = document.createElement('div');
  return new CustomEvent('layer:request-dismiss', {
    cancelable: true,
    detail: { originalLayer, targetLayer, originalIndex: 1, targetIndex: 0 },
  });
};

describe('keepOpenOnMenuHandoff', () => {
  it('keeps the menu open when the closing layer is another FilterInput menu', () => {
    const closingMenu = document.createElement('div');
    closingMenu.setAttribute('data-filter-input-menu', 'true');
    const event = dismissRequest(closingMenu);

    keepOpenOnMenuHandoff(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('lets the dismiss through when the closing layer is not a FilterInput menu', () => {
    const event = dismissRequest(document.createElement('div'));

    keepOpenOnMenuHandoff(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('lets the dismiss through when no layer below requested it', () => {
    const event = dismissRequest(undefined);

    keepOpenOnMenuHandoff(event);

    expect(event.defaultPrevented).toBe(false);
  });
});

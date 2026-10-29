import { createRef } from 'react';
import { describe, expect, it } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { Portal } from './Portal';
import { PortalContainerContext } from './PortalContainerContext';

describe('optional portal container', () => {
  it('defaults to document.body', () => {
    render(
      <Portal>
        <div data-testid='content'>Content</div>
      </Portal>,
    );
    expect(screen.getByTestId('content').parentElement).toBe(document.body);
  });
  it('renders inside the context container after refs attach', async () => {
    const host = createRef<HTMLDivElement>();
    render(
      <PortalContainerContext.Provider value={host}>
        <div ref={host} data-testid='host' />
        <Portal>
          <div data-testid='content'>Content</div>
        </Portal>
      </PortalContainerContext.Provider>,
    );
    await waitFor(() => expect(host.current).toContainElement(screen.getByTestId('content')));
  });
  it('gives explicit container precedence over context', async () => {
    const context = createRef<HTMLDivElement>();
    const explicit = createRef<HTMLDivElement>();
    render(
      <PortalContainerContext.Provider value={context}>
        <div ref={context} />
        <div ref={explicit} />
        <Portal container={explicit}>
          <div data-testid='content'>Content</div>
        </Portal>
      </PortalContainerContext.Provider>,
    );
    await waitFor(() => expect(explicit.current).toContainElement(screen.getByTestId('content')));
    expect(context.current).not.toContainElement(screen.getByTestId('content'));
  });
});

import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CodeSnippetFrame } from './CodeSnippetFrame';

const noop = () => {
  // fullscreen toggling is not exercised here
};

const Frame = () => (
  <CodeSnippetFrame data-testid='frame' id='ssr-root' isFullscreen={false} setIsFullscreen={noop}>
    <span data-testid='child'>code</span>
  </CodeSnippetFrame>
);

describe('CodeSnippetFrame SSR', () => {
  it('renders the root inline on the server', () => {
    const html = renderToString(<Frame />);

    expect(html).toContain('id="ssr-root"');
    expect(html).toContain('data-testid="child"');
  });

  it('hydrates without errors and then hosts the root in the persistent host', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Frame />);
    document.body.appendChild(container);
    const onRecoverableError = vi.fn();

    const root = await act(async () => hydrateRoot(container, <Frame />, { onRecoverableError }));

    expect(onRecoverableError).not.toHaveBeenCalled();
    const frames = container.querySelectorAll('[data-testid="frame"]');
    expect(frames).toHaveLength(1);
    expect(
      container.querySelector('[data-testid="frame"]')?.parentElement?.parentElement?.parentElement,
    ).toBe(container);

    act(() => root.unmount());
    container.remove();
  });
});

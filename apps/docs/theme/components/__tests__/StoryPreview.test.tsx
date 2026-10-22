import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { act, render, waitFor } from '@testing-library/react';
import { StoryPreview } from '../StoryPreview';

rs.mock('@rspress/core/runtime', () => ({
  BrowserOnly: ({ children }: { children: () => ReactNode }) => children(),
}));

rs.mock('storybook-react-rsbuild', () => ({
  composeStories: (module: Record<string, unknown>) => module,
}));

afterEach(() => {
  rs.unstubAllEnvs();
  rs.unstubAllGlobals();
});

/** Captures the observer callback so a test can fire it. */
function mockIntersectionObserver() {
  let fire: (isIntersecting: boolean) => void = () => undefined;
  class MockObserver {
    constructor(callback: IntersectionObserverCallback) {
      fire = isIntersecting =>
        callback(
          [{ isIntersecting } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
    }
    observe() {
      // the test fires the callback by hand
    }
    disconnect() {
      // nothing to release
    }
  }
  rs.stubGlobal('IntersectionObserver', MockObserver);
  return (isIntersecting: boolean) => act(() => fire(isIntersecting));
}

describe('StoryPreview', () => {
  it('StoryPreview renders only code in markdown output', () => {
    rs.stubEnv('SSG_MD', 'true');
    const load = () =>
      new Promise<Record<string, unknown>>(() => {
        // never resolves: the story must not be needed for markdown output
      });
    const { container } = render(
      <StoryPreview load={load} name='Basic'>
        <pre>CODE</pre>
      </StoryPreview>,
    );
    expect(container.textContent).toBe('CODE');
  });

  it('does not load the story until in view', async () => {
    const fire = mockIntersectionObserver();
    const load = rs.fn(() => Promise.resolve({ Basic: () => <p>STORY</p> }));
    const { findByText } = render(
      <StoryPreview load={load} name='Basic' hideCode>
        <pre>CODE</pre>
      </StoryPreview>,
    );
    expect(load).not.toHaveBeenCalled();
    fire(false);
    expect(load).not.toHaveBeenCalled();
    fire(true);
    await findByText('STORY');
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
  });
});

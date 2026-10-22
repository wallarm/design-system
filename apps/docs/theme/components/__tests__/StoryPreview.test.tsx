import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render } from '@testing-library/react';
import { StoryPreview } from '../StoryPreview';

rs.mock('@rspress/core/runtime', () => ({
  BrowserOnly: ({ children }: { children: () => ReactNode }) => children(),
}));

afterEach(() => {
  rs.unstubAllEnvs();
});

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
});

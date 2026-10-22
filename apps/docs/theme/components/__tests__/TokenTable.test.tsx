import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render } from '@testing-library/react';
import { isColorToken, TokenTable } from '../TokenTable';

rs.mock('@rspress/core/runtime', () => ({
  BrowserOnly: ({ children }: { children: () => ReactNode }) => children(),
}));

afterEach(() => {
  rs.unstubAllEnvs();
});

describe('isColorToken', () => {
  it.each([
    ['--color-bg-page-bg', '#fff', true],
    ['--spacing-8', '8px', false],
    ['--shadow-sm', '0 1px 2px rgb(0 0 0 / 5%)', false],
    ['--x', 'oklch(0.7 0.1 200)', true],
  ])('isColorToken(%s, %s) is %s', (name, value, expected) => {
    expect(isColorToken(name, value)).toBe(expected);
  });
});

describe('TokenTable', () => {
  it('TokenTable renders only markdown in md output', () => {
    rs.stubEnv('SSG_MD', 'true');
    const { container } = render(
      <TokenTable tokens={[{ name: '--a', value: '1' }]}>
        <p>MD TABLE</p>
      </TokenTable>,
    );
    expect(container.textContent).toBe('MD TABLE');
  });

  it('TokenTable renders swatch for color tokens', () => {
    const { container } = render(
      <TokenTable
        tokens={[
          { name: '--color-a', value: '#000' },
          { name: '--spacing-8', value: '8px' },
        ]}
      >
        <p>MD TABLE</p>
      </TokenTable>,
    );
    const swatches = container.querySelectorAll<HTMLElement>('[data-slot="token-swatch"]');
    expect(swatches).toHaveLength(1);
    expect(swatches[0]?.style.background).toBe('var(--color-a)');
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';

/**
 * Node ships a built-in global `localStorage` that is active by default
 * without a `--localstorage-file`, and it shadows jsdom's own working
 * implementation in this environment. That global exists (`typeof
 * localStorage === 'object'`) but every method throws
 * `TypeError: ... is not a function`, so a real Storage stub is needed for
 * the ThemeProvider persistence assertions below. Scoped here via
 * `vi.stubGlobal` rather than in the shared `vitest.setup.ts`, since this
 * suite is the only one that reads/writes `localStorage`.
 */
const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
};

const FrameStyleProbe = () => {
  const { frameStyle, setFrameStyle } = useTheme();
  return (
    <button type='button' onClick={() => setFrameStyle('branded')}>
      {frameStyle}
    </button>
  );
};

describe('ThemeProvider frame style', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    document.documentElement.removeAttribute('data-frame-style');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to neutral and writes it on <html>', () => {
    render(
      <ThemeProvider>
        <FrameStyleProbe />
      </ThemeProvider>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('neutral');
    expect(document.documentElement).toHaveAttribute('data-frame-style', 'neutral');
  });

  it('switches to branded and remembers the choice', () => {
    render(
      <ThemeProvider>
        <FrameStyleProbe />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('branded');
    expect(document.documentElement).toHaveAttribute('data-frame-style', 'branded');
    expect(localStorage.getItem('wasd-frame-style')).toBe('branded');
  });

  it('restores a stored choice on mount', () => {
    localStorage.setItem('wasd-frame-style', 'branded');

    render(
      <ThemeProvider>
        <FrameStyleProbe />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveAttribute('data-frame-style', 'branded');
  });

  it('uses defaultFrameStyle until the user picks one', () => {
    render(
      <ThemeProvider defaultFrameStyle='branded'>
        <FrameStyleProbe />
      </ThemeProvider>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('branded');
  });

  it('persists under a custom storage key', () => {
    render(
      <ThemeProvider frameStyleStorageKey='custom-frame-style'>
        <FrameStyleProbe />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(localStorage.getItem('custom-frame-style')).toBe('branded');
    expect(localStorage.getItem('wasd-frame-style')).toBeNull();
  });
});

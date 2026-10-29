import type { ReactNode } from 'react';

import { Copyable } from '@wallarm-org/design-system/Copyable';

export interface Token {
  name: string;
  value: string;
}

export interface TokenTableProps {
  /** Token category from the metadata (`semantic`, `semantic-dark`, `colors-primary`, …). */
  category: string;
  tokens: Token[];
  /** The Markdown table the generator emits; it is all the .md / llms output gets. */
  children: ReactNode;
}

const COLOR_VALUE = /^(#|rgb|hsl|oklch|oklab|lab|lch|color-mix\()/i;

export const isColorToken = (name: string, value: string): boolean =>
  name.startsWith('--color-') || COLOR_VALUE.test(value);

const THEMED_CATEGORIES = new Set(['semantic', 'semantic-dark']);
const TW_ALPHA = /^--alpha\((.+?)\s*\/\s*([\d.]+%?)\)$/;

/**
 * Swatch color. Semantic tokens are redefined per theme, so `var(name)` would paint both the
 * light and dark sections in the active theme; paint their own value instead (a hex or palette
 * `var(--color-*)`, the same in both themes). Tailwind's build-time `--alpha()` is not valid at
 * runtime, so it becomes the `color-mix()` Tailwind compiles it to.
 */
export const swatchColor = (category: string, { name, value }: Token): string => {
  if (!THEMED_CATEGORIES.has(category)) return `var(${name})`;
  const alpha = TW_ALPHA.exec(value);
  return alpha ? `color-mix(in oklab, ${alpha[1]} ${alpha[2]}, transparent)` : value;
};

function CopyCell({ text }: { text: string }) {
  return (
    <Copyable text={text} tooltip>
      <button
        type='button'
        className='cursor-pointer rounded-4 bg-transparent px-4 py-2 text-left font-mono text-xs text-text-primary hover:bg-states-primary-hover'
      >
        {text}
      </button>
    </Copyable>
  );
}

function Table({ category, tokens }: Omit<TokenTableProps, 'children'>) {
  return (
    <div className='rp-not-doc my-16 overflow-x-auto'>
      <table className='w-full border-collapse text-sm'>
        <thead>
          <tr className='border-b border-border-primary-light text-left text-text-secondary'>
            <th className='p-8'>Token</th>
            <th className='p-8'>Value</th>
            <th className='p-8'>Preview</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map(t => (
            <tr key={t.name} className='border-b border-border-primary-light'>
              <td className='p-8'>
                <CopyCell text={t.name} />
              </td>
              <td className='p-8'>
                <CopyCell text={t.value} />
              </td>
              <td className='p-8'>
                {isColorToken(t.name, t.value) && (
                  <span
                    data-slot='token-swatch'
                    className='inline-block size-24 rounded-4 border border-border-primary-light'
                    style={{ background: swatchColor(category, t) }}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Copyable token table with color swatches; the markdown (llms.txt) output keeps the plain table. */
export function TokenTable({ category, tokens, children }: TokenTableProps) {
  // Truthy check: a boolean define in builds, a string env var under Rstest.
  if (import.meta.env.SSG_MD) return <>{children}</>;
  return <Table category={category} tokens={tokens} />;
}

// Rspress injects markdown.globalComponents as default imports.
export default TokenTable;

import type { FC } from 'react';
import { useOf } from '@storybook/addon-docs/blocks';
import { resolveSourceUrl } from './sourceUrl';

// Placeholder on purpose: every component points at the Figma library for now, and the real
// per-component deep links get filled in later in one bulk pass.
const FIGMA_URL = 'https://www.figma.com/';

const linkClassName = 'text-text-link no-underline hover:underline';

/**
 * The row of links that sits directly under the page title, so the source of truth for the code and
 * the design is one click away from every component page.
 */
export const DocsHeaderLinks: FC = () => {
  const meta = useOf('meta', ['meta']);
  const fileName = meta.preparedMeta.parameters?.fileName as string | undefined;
  const sourceUrl = resolveSourceUrl(fileName);

  return (
    <div className='mb-6 flex items-center gap-2 text-sm'>
      {sourceUrl && (
        <>
          <a className={linkClassName} href={sourceUrl} rel='noreferrer' target='_blank'>
            Source code
          </a>
          <span aria-hidden className='text-text-tertiary'>
            |
          </span>
        </>
      )}
      <a className={linkClassName} href={FIGMA_URL} rel='noreferrer' target='_blank'>
        Figma
      </a>
    </div>
  );
};

DocsHeaderLinks.displayName = 'DocsHeaderLinks';

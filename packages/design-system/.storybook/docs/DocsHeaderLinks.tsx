import type { FC } from 'react';
import { useOf } from '@storybook/addon-docs/blocks';
import { resolveSourceUrl } from './sourceUrl';
import { DOCS_LINK_CLASS_NAME } from './styles';

// Placeholder on purpose: every component points at the Figma library for now, and the real
// per-component deep links get filled in later in one bulk pass.
const FIGMA_URL = 'https://www.figma.com/';

/**
 * The row of links that sits directly under the page title, so the source of truth for the code and
 * the design is one click away from every component page.
 *
 * `sb-unstyled` is Storybook's opt-out from its own docs typography, which would otherwise force
 * this row to body size — it reads as metadata, a step below the prose.
 */
export const DocsHeaderLinks: FC = () => {
  const meta = useOf('meta', ['meta']);
  const fileName = meta.preparedMeta.parameters?.fileName as string | undefined;
  const sourceUrl = resolveSourceUrl(fileName);

  return (
    <div className='sb-unstyled mb-24 flex items-center gap-8 text-sm/20'>
      {sourceUrl && (
        <>
          <a className={DOCS_LINK_CLASS_NAME} href={sourceUrl} rel='noreferrer' target='_blank'>
            Source code
          </a>
          <span aria-hidden className='docs-frame-muted text-text-tertiary'>
            |
          </span>
        </>
      )}
      <a className={DOCS_LINK_CLASS_NAME} href={FIGMA_URL} rel='noreferrer' target='_blank'>
        Figma
      </a>
    </div>
  );
};

DocsHeaderLinks.displayName = 'DocsHeaderLinks';

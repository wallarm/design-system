import type { FC } from 'react';

import { useOf } from '@storybook/addon-docs/blocks';

import { resolveSourceUrl } from './sourceUrl';
import { DOCS_LINK_CLASS_NAME } from './styles';

/**
 * The link that sits directly under the page title, so the source code is one click away from
 * every component page. No Figma link: the design file is not public.
 *
 * `sb-unstyled` is Storybook's opt-out from its own docs typography, which would otherwise force
 * this row to body size — it reads as metadata, a step below the prose.
 */
export const DocsHeaderLinks: FC = () => {
  const meta = useOf('meta', ['meta']);
  const fileName = meta.preparedMeta.parameters?.fileName as string | undefined;
  const sourceUrl = resolveSourceUrl(fileName);
  if (!sourceUrl) return null;

  return (
    <div className='sb-unstyled mb-24 flex items-center gap-8 text-sm/20'>
      <a className={DOCS_LINK_CLASS_NAME} href={sourceUrl} rel='noreferrer' target='_blank'>
        Source code
      </a>
    </div>
  );
};

DocsHeaderLinks.displayName = 'DocsHeaderLinks';

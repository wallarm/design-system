import type { FC } from 'react';
import { useOf } from '@storybook/addon-docs/blocks';
import { DocsSection } from './DocsSection';
import { ISSUE_URL, resolveStoryFileUrl } from './sourceUrl';
import { DOCS_LINK_CLASS_NAME } from './styles';

/**
 * The same closing section on every component page: one obvious way to tell us the docs are wrong,
 * and one obvious way to fix them yourself. The repository is public, so both are open to anyone.
 */
export const DocsFeedback: FC = () => {
  const meta = useOf('meta', ['meta']);
  const fileName = meta.preparedMeta.parameters?.fileName as string | undefined;
  const storyFileUrl = resolveStoryFileUrl(fileName);

  return (
    <DocsSection title='Feedback'>
      <p className='text-sm'>
        Help us improve this component by{' '}
        <a className={DOCS_LINK_CLASS_NAME} href={ISSUE_URL} rel='noreferrer' target='_blank'>
          opening an issue
        </a>
        {storyFileUrl ? (
          <>
            {' or '}
            <a
              className={DOCS_LINK_CLASS_NAME}
              href={storyFileUrl}
              rel='noreferrer'
              target='_blank'
            >
              updating this page on GitHub
            </a>
          </>
        ) : null}
        .
      </p>
    </DocsSection>
  );
};

DocsFeedback.displayName = 'DocsFeedback';

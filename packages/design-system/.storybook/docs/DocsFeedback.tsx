import type { FC } from 'react';
import { useOf } from '@storybook/addon-docs/blocks';
import { ISSUE_URL, resolveStoryFileUrl } from './sourceUrl';

const linkClassName = 'text-text-link no-underline hover:underline';

/**
 * The same closing section on every component page: one obvious way to tell us the docs are wrong,
 * and one obvious way to fix them yourself. The repository is public, so both are open to anyone.
 */
export const DocsFeedback: FC = () => {
  const meta = useOf('meta', ['meta']);
  const fileName = meta.preparedMeta.parameters?.fileName as string | undefined;
  const storyFileUrl = resolveStoryFileUrl(fileName);

  return (
    <section className='mt-12'>
      <h2 className='mb-2 border-b border-border-primary pb-2 text-xl'>Feedback</h2>
      <p className='text-sm'>
        Help us improve this component by{' '}
        <a className={linkClassName} href={ISSUE_URL} rel='noreferrer' target='_blank'>
          opening an issue
        </a>
        {storyFileUrl ? (
          <>
            {' or '}
            <a className={linkClassName} href={storyFileUrl} rel='noreferrer' target='_blank'>
              updating this page on GitHub
            </a>
          </>
        ) : null}
        .
      </p>
    </section>
  );
};

DocsFeedback.displayName = 'DocsFeedback';

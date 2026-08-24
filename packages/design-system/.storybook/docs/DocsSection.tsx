import type { FC, PropsWithChildren } from 'react';

/** Matches the ids Storybook gives story headings, so the table of contents can link to ours too. */
const toAnchorId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** A titled section on the Overview page, so every page breaks in the same places. */
export const DocsSection: FC<PropsWithChildren<{ title: string }>> = ({ children, title }) => (
  <section className='mt-12'>
    <h2 className='mb-4 border-b border-border-primary pb-2 text-xl' id={toAnchorId(title)}>
      {title}
    </h2>
    {children}
  </section>
);

DocsSection.displayName = 'DocsSection';

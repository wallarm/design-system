import type { FC, PropsWithChildren } from 'react';

/** A titled section on the Overview page, so every page breaks in the same places. */
export const DocsSection: FC<PropsWithChildren<{ title: string }>> = ({ children, title }) => (
  <section className='mt-12'>
    <h2 className='mb-4 border-b border-border-primary pb-2 text-xl'>{title}</h2>
    {children}
  </section>
);

DocsSection.displayName = 'DocsSection';

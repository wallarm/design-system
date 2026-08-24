import type { FC } from 'react';
import { Controls, Description, Stories, Subtitle, Title } from '@storybook/addon-docs/blocks';
import { DocsFeedback } from './DocsFeedback';
import { DocsHeaderLinks } from './DocsHeaderLinks';
import { DocsSection } from './DocsSection';

/**
 * The shared shape of every component's Overview page: what it is, then every example with the
 * sentence that explains it, then the API, then how to tell us the page is wrong.
 *
 * `includePrimary` keeps the first story inside the same list as the rest, so no example loses the
 * heading and description the others get. The `title` element hands the section heading to
 * `DocsSection`, so all three sections on the page look the same.
 */
export const DocsPage: FC = () => (
  <>
    <Title />
    <DocsHeaderLinks />
    <Subtitle />
    <Description />
    <DocsSection title='Examples'>
      {/* An element rather than a string suppresses the block's own heading. */}
      <Stories includePrimary title={<span />} />
    </DocsSection>
    <DocsSection title='Component API'>
      <Controls />
    </DocsSection>
    <DocsFeedback />
  </>
);

DocsPage.displayName = 'DocsPage';

import type { FC } from 'react';
import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from '@storybook/addon-docs/blocks';
import { DocsFeedback } from './DocsFeedback';
import { DocsHeaderLinks } from './DocsHeaderLinks';

/**
 * The shared shape of every component's Overview page. Storybook's default autodocs page with a
 * links row under the title and a feedback section at the end, so all pages read the same way.
 */
export const DocsPage: FC = () => (
  <>
    <Title />
    <DocsHeaderLinks />
    <Subtitle />
    <Description />
    <Primary />
    <Controls />
    <Stories />
    <DocsFeedback />
  </>
);

DocsPage.displayName = 'DocsPage';

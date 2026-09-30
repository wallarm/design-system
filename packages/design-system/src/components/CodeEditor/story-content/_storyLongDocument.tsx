import type { FC } from 'react';
import { CodeEditorContent } from '../CodeEditorContent';
import { CodeEditorRoot } from '../CodeEditorRoot';
import { LONG_DOCUMENT } from './_storyFixtures';

export const LongDocumentDemo: FC = () => (
  <div className='w-640'>
    <CodeEditorRoot
      defaultValue={LONG_DOCUMENT}
      readOnly
      language='json'
      maxLines={12}
      data-testid='long-document'
    >
      <CodeEditorContent lineNumbers aria-label='Access log' />
    </CodeEditorRoot>
  </div>
);

LongDocumentDemo.displayName = 'LongDocumentDemo';

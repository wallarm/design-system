import { type FC, useState } from 'react';
import { CodeSnippetActions } from '../../CodeSnippet/CodeSnippetActions';
import { CodeSnippetCopyButton } from '../../CodeSnippet/CodeSnippetCopyButton';
import { CodeSnippetFullscreenButton } from '../../CodeSnippet/CodeSnippetFullscreenButton';
import { CodeSnippetHeader } from '../../CodeSnippet/CodeSnippetHeader';
import { CodeSnippetTitle } from '../../CodeSnippet/CodeSnippetTitle';
import { CodeSnippetWrapButton } from '../../CodeSnippet/CodeSnippetWrapButton';
import { CodeEditorContent } from '../CodeEditorContent';
import { CodeEditorRoot } from '../CodeEditorRoot';
import { CODE_EDITOR_KEYBOARD_HINT } from '../lib/keyboardHint';
import { EDITING_REQUEST, httpFolds, RULE_SCHEMA } from './_storyFixtures';

const HINT_ID = 'code-editor-editing-workflow-hint';

export const EditingWorkflowDemo: FC = () => {
  const [value, setValue] = useState(EDITING_REQUEST);

  return (
    <div className='w-640'>
      <CodeEditorRoot
        value={value}
        onChange={setValue}
        language='http'
        folds={httpFolds}
        schema={RULE_SCHEMA}
        data-testid='editing'
      >
        <CodeSnippetHeader>
          <CodeSnippetTitle>Request</CodeSnippetTitle>
          <CodeSnippetActions>
            <CodeSnippetFullscreenButton />
            <CodeSnippetWrapButton />
            <CodeSnippetCopyButton />
          </CodeSnippetActions>
        </CodeSnippetHeader>
        <CodeEditorContent lineNumbers aria-label='HTTP request' aria-describedby={HINT_ID} />
      </CodeEditorRoot>
      <span id={HINT_ID} className='sr-only'>
        {CODE_EDITOR_KEYBOARD_HINT}
      </span>
    </div>
  );
};

EditingWorkflowDemo.displayName = 'EditingWorkflowDemo';

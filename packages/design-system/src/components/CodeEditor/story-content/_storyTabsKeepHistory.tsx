import { type FC, useState } from 'react';
import { CodeSnippetHeader } from '../../CodeSnippet/CodeSnippetHeader';
import { CodeSnippetTab } from '../../CodeSnippet/CodeSnippetTab';
import { CodeSnippetTabs } from '../../CodeSnippet/CodeSnippetTabs';
import { CodeEditorContent } from '../CodeEditorContent';
import { CodeEditorRoot } from '../CodeEditorRoot';
import { isTabId, TAB_DOCUMENTS, type TabId } from './_storyFixtures';

export const TabsKeepHistoryDemo: FC = () => {
  const [tab, setTab] = useState<TabId>('request');
  const [documents, setDocuments] = useState<Record<TabId, string>>(TAB_DOCUMENTS);

  return (
    <div className='w-480'>
      <CodeEditorRoot
        documentId={tab}
        value={documents[tab]}
        onChange={value => setDocuments(previous => ({ ...previous, [tab]: value }))}
        language='json'
        data-testid='tabs-editor'
      >
        <CodeSnippetHeader>
          <CodeSnippetTabs
            value={tab}
            onValueChange={next => {
              if (isTabId(next)) setTab(next);
            }}
          >
            <CodeSnippetTab value='request' data-testid='tabs-editor--tab-request'>
              Request
            </CodeSnippetTab>
            <CodeSnippetTab value='response' data-testid='tabs-editor--tab-response'>
              Response
            </CodeSnippetTab>
          </CodeSnippetTabs>
        </CodeSnippetHeader>
        <CodeEditorContent lineNumbers aria-label='Rule check payload' />
      </CodeEditorRoot>
    </div>
  );
};

TabsKeepHistoryDemo.displayName = 'TabsKeepHistoryDemo';

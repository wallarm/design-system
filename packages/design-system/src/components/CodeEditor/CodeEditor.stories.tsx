import { type ReactNode, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Info, Skull, TriangleAlert } from '../../icons';
import {
  CodeSnippetActions,
  CodeSnippetAdapterProvider,
  CodeSnippetCode,
  CodeSnippetContent,
  CodeSnippetCopyButton,
  CodeSnippetFullscreenButton,
  CodeSnippetHeader,
  CodeSnippetLineNumbers,
  CodeSnippetRoot,
  CodeSnippetShowMoreButton,
  CodeSnippetTab,
  CodeSnippetTabs,
  CodeSnippetTitle,
  CodeSnippetWrapButton,
  type FoldRegion,
  getHttpFolds,
  type LineConfig,
  loadPrismAdapter,
  loadShikiAdapter,
} from '../CodeSnippet';
import { VStack } from '../Stack';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { CodeEditorContent } from './CodeEditorContent';
import { CodeEditorRoot } from './CodeEditorRoot';
import type { CodeEditorLanguage } from './types';

const DESCRIPTION = [
  'An editable code surface that looks exactly like `CodeSnippet` and reuses its chrome — header, title, tabs, copy, wrap, fullscreen and show more — with undo, find, folds and line colours on CodeMirror 6, loaded lazily on first mount.',
  'Reach for `CodeSnippet` when the code is only read; reach for `CodeEditor` when the value changes. Colours come from the same `CodeSnippetAdapterProvider`, so an editor under Prism looks like a snippet under Prism.',
].join(' ');

const meta = {
  title: 'Data display/CodeEditor/CodeEditor',
  component: CodeEditorRoot,
  parameters: {
    layout: 'padded',
    docs: { description: { component: DESCRIPTION } },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=3087-29516&m=dev',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CodeEditorRoot>;

export default meta;

// --- Sample documents ---

const jsonCode = `{
    "name": "@wallarm-org/sdk",
    "version": "1.0.0",
    "dependencies": {
        "react": "^19.0.0",
        "typescript": "^5.0.0"
    }
}`;

const sampleCode = `const greeting = "Hello, World!";
console.log(greeting);

function add(a, b) {
    return a + b;
}

export default add;`;

const colorsCode = `Line 1: Default (no color)
Line 2: Danger color
Line 3: Warning color
Line 4: Info color
Line 5: Success color
Line 6: Brand color
Line 7: AI color
Line 8: Neutral color`;

const diffCode = `const greeting = "Hello";
console.log("old message");
console.log("new message");
console.log("another new line");

export default greeting;`;

const annotatedHeadersCode = `Host: inventory.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
AppleWebKit/537.36
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Cache-Control: no-cache`;

const rangesCode = `GET /api/v2/users HTTP/1.1
Host: inventory.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
X-Forwarded-For: 192.168.1.100
Cache-Control: no-cache`;

const httpRequestCode = `POST /api/v2/rules HTTP/1.1
Host: api.wallarm.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
Content-Type: application/json
Accept: application/json

{
  "action": "block",
  "point": ["header", "X-Forwarded-For"],
  "enabled": true
}`;

const httpResponseCode = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-Request-Id: abc-123-def-456
Cache-Control: no-store

{
    "users": [
        { "id": 1, "name": "Alice" },
        { "id": 2, "name": "Bob" }
    ],
    "total": 42
}`;

const foldableRequestCode = `GET /api/v2/users HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9
X-Request-ID: abc-123
Content-Type: application/json
Cache-Control: no-cache

{
  "filter": {
    "status": "active",
    "role": "admin"
  },
  "pagination": {
    "page": 1,
    "limit": 50
  }
}`;

const foldableResponseCode = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-Request-ID: abc-123
X-RateLimit-Remaining: 98
Cache-Control: private, max-age=0

{
  "data": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob", "role": "admin" }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 50
  }
}`;

const showMoreCode = `Host: inventory.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Referer: https://app.example.com/dashboard
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Cache-Control: no-cache
Referer: https://app.example.com/dashboard
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Cache-Control: no-cache`;

const showMoreThresholdCode = `Host: inventory.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Referer: https://app.example.com/dashboard
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Cache-Control: no-cache
Authorization: Bearer token123
X-Request-ID: abc-def-ghi`;

const longCode = `const veryLongVariableName = "This is a very long string that will demonstrate line wrapping behavior when the content exceeds the container width";
console.log(veryLongVariableName);`;

const bashCode = `npm install @wallarm-org/sdk
npm run build
npm run test`;

const tabDocuments = {
  request: httpRequestCode,
  response: `HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v2/rules/42

{
  "id": 42,
  "action": "block"
}`,
} satisfies Record<string, string>;

type TabId = keyof typeof tabDocuments;

const isTabId = (value: string): value is TabId => value === 'request' || value === 'response';

// --- Shared line configs and fold functions ---

const tooltipPrefix = (icon: ReactNode, text: string): ReactNode => (
  <Tooltip>
    <TooltipTrigger>{icon}</TooltipTrigger>
    <TooltipContent>{text}</TooltipContent>
  </Tooltip>
);

const colorLines: Record<number, LineConfig> = {
  2: { color: 'danger' },
  3: { color: 'warning' },
  4: { color: 'info' },
  5: { color: 'success' },
  6: { color: 'brand' },
  7: { color: 'ai' },
  8: { color: 'neutral' },
};

const diffLines: Record<number, LineConfig> = {
  2: { color: 'danger', prefix: '-' },
  3: { color: 'success', prefix: '+' },
  4: { color: 'success', prefix: '+' },
};

const iconLines: Record<number, LineConfig> = {
  3: { color: 'danger', prefix: tooltipPrefix(<Skull />, 'Malicious user agent') },
  5: { color: 'warning', prefix: tooltipPrefix(<TriangleAlert />, 'Unusual language list') },
  7: { color: 'info', prefix: tooltipPrefix(<Info />, 'Caching disabled') },
};

const rangeLines: Record<number, LineConfig> = {
  4: { color: 'danger', ranges: [{ start: 8, end: 24 }] },
  7: { color: 'info', ranges: [{ start: 17, end: 30 }] },
};

const wrapDiffLines: Record<number, LineConfig> = {
  1: { color: 'danger', prefix: '-' },
  2: { color: 'success', prefix: '+' },
};

const parityColorLines: Record<number, LineConfig> = {
  ...colorLines,
  1: { prefix: tooltipPrefix(<Info />, 'Untouched line') },
  2: { color: 'danger', prefix: '-' },
  5: { color: 'success', prefix: '+' },
};

/** Module-level so the function identity is stable across renders. */
const foldRequestHeadersCollapsed = (
  value: string,
  { startingLineNumber }: { startingLineNumber: number },
): FoldRegion[] => getHttpFolds(value, { startingLineNumber, headers: { defaultCollapsed: true } });

const foldHttp = (
  value: string,
  { startingLineNumber }: { startingLineNumber: number },
): FoldRegion[] => getHttpFolds(value, { startingLineNumber });

const parityCollapsedFolds = getHttpFolds(foldableRequestCode, {
  headers: { defaultCollapsed: true },
});

// --- Core stories ---

/**
 * A controlled editor: `value` plus `onChange`, like any input. With no adapter in scope the
 * text is plain, exactly as `CodeSnippet` renders it without a provider.
 */
export const Default: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState(jsonCode);

  return (
    <div style={{ width: '600px' }}>
      <CodeEditorRoot
        value={value}
        onChange={setValue}
        language='json'
        data-testid='code-editor-default'
      >
        <CodeEditorContent lineNumbers aria-label='Package manifest' />
      </CodeEditorRoot>
    </div>
  );
};

/**
 * The `CodeSnippet` header works unchanged: a title and the copy, wrap and fullscreen buttons.
 * Copy puts the edited value on the clipboard, and fullscreen keeps the undo history.
 */
export const WithHeader: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState(jsonCode);

  return (
    <div style={{ width: '600px' }}>
      <CodeEditorRoot
        value={value}
        onChange={setValue}
        language='json'
        data-testid='code-editor-with-header'
      >
        <CodeSnippetHeader>
          <CodeSnippetTitle>rule.json</CodeSnippetTitle>
          <CodeSnippetActions>
            <CodeSnippetCopyButton />
            <CodeSnippetWrapButton />
            <CodeSnippetFullscreenButton />
          </CodeSnippetActions>
        </CodeSnippetHeader>
        <CodeEditorContent lineNumbers aria-label='Rule JSON' />
      </CodeEditorRoot>
    </div>
  );
};

/**
 * Without a header, `CodeSnippetActions` as a direct child floats over the top-right of the
 * editor, as it does over a snippet.
 */
export const FloatingActions: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState(sampleCode);

  return (
    <div style={{ width: '320px' }}>
      <CodeEditorRoot
        value={value}
        onChange={setValue}
        language='text'
        data-testid='code-editor-floating-actions'
      >
        <CodeSnippetActions>
          <CodeSnippetWrapButton />
          <CodeSnippetCopyButton />
        </CodeSnippetActions>
        <CodeEditorContent lineNumbers aria-label='Sample code' />
      </CodeEditorRoot>
    </div>
  );
};

/**
 * `lineNumbers` on `CodeEditorContent` is the equivalent of `CodeSnippetLineNumbers`, and
 * `startingLineNumber` renumbers the gutter for a fragment taken from a longer file.
 */
export const LineNumbersAndStartingLine: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>lineNumbers</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={sampleCode}
          language='text'
          data-testid='code-editor-line-numbers'
        >
          <CodeEditorContent lineNumbers aria-label='Sample code' />
        </CodeEditorRoot>
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>startingLineNumber = 97</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={sampleCode}
          language='text'
          startingLineNumber={97}
          data-testid='code-editor-starting-line'
        >
          <CodeEditorContent lineNumbers aria-label='Sample code from line 97' />
        </CodeEditorRoot>
      </div>
    </VStack>
  </VStack>
);

/**
 * `lines` uses the same `LineConfig` as CodeSnippet: seven semantic colours, text prefixes for a
 * hand-made diff, and ReactNode prefixes such as a tooltipped icon. Lines are static and tied
 * to line numbers, so they stay on their number while you type.
 */
export const LineColorsAndPrefixes: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>colours</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={colorsCode}
          language='text'
          lines={colorLines}
          data-testid='code-editor-line-colors'
        >
          <CodeEditorContent lineNumbers aria-label='Line colours' />
        </CodeEditorRoot>
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>text prefixes</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={diffCode}
          language='text'
          lines={diffLines}
          data-testid='code-editor-line-diff'
        >
          <CodeEditorContent lineNumbers aria-label='Diff prefixes' />
        </CodeEditorRoot>
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>ReactNode prefixes with tooltips</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={annotatedHeadersCode}
          language='text'
          lines={iconLines}
          data-testid='code-editor-line-icons'
        >
          <CodeEditorContent lineNumbers aria-label='Annotated headers' />
        </CodeEditorRoot>
      </div>
    </VStack>
  </VStack>
);

/**
 * `ranges` colours character offsets inside a line (start inclusive, end exclusive). The line
 * keeps its background, and only the range gets the colour.
 */
export const Ranges: StoryFn<typeof meta> = () => (
  <div style={{ width: '600px' }}>
    <CodeEditorRoot
      defaultValue={rangesCode}
      language='text'
      lines={rangeLines}
      data-testid='code-editor-ranges'
    >
      <CodeEditorContent lineNumbers aria-label='Request with ranges' />
    </CodeEditorRoot>
  </div>
);

/**
 * `language='http'` under Prism. The colours come from the adapter and the structure (start
 * line, headers, JSON body) comes from the editor's own HTTP grammar.
 */
export const HttpRequestWithPrism: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState(httpRequestCode);

  return (
    <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          value={value}
          onChange={setValue}
          language='http'
          data-testid='code-editor-http-request'
        >
          <CodeEditorContent lineNumbers aria-label='HTTP request' />
        </CodeEditorRoot>
      </div>
    </CodeSnippetAdapterProvider>
  );
};

/**
 * The response side under Shiki. After an edit, highlighting is repainted in the background,
 * so for a moment you may see the previous colours mapped through your change.
 */
export const HttpResponseWithShiki: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState(httpResponseCode);

  return (
    <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          value={value}
          onChange={setValue}
          language='http'
          data-testid='code-editor-http-response'
        >
          <CodeEditorContent lineNumbers aria-label='HTTP response' />
        </CodeEditorRoot>
      </div>
    </CodeSnippetAdapterProvider>
  );
};

/**
 * `folds` as a function of the value: `getHttpFolds` runs again after edits, so adding a header
 * grows the headers fold. Collapsed state is kept by fold `id`. The second editor starts at
 * line 100, and the fold function gets the same offset.
 */
export const HttpFolds: StoryFn<typeof meta> = () => {
  const [request, setRequest] = useState(foldableRequestCode);
  const [response, setResponse] = useState(foldableResponseCode);

  return (
    <VStack gap={16}>
      <VStack align='start' gap={4}>
        <span className='sb-annotation'>headers collapsed by default</span>
        <div style={{ width: '600px' }}>
          <CodeEditorRoot
            value={request}
            onChange={setRequest}
            language='http'
            folds={foldRequestHeadersCollapsed}
            data-testid='code-editor-http-folds-request'
          >
            <CodeEditorContent lineNumbers aria-label='Foldable HTTP request' />
          </CodeEditorRoot>
        </div>
      </VStack>
      <VStack align='start' gap={4}>
        <span className='sb-annotation'>startingLineNumber = 100</span>
        <div style={{ width: '600px' }}>
          <CodeEditorRoot
            value={response}
            onChange={setResponse}
            language='http'
            startingLineNumber={100}
            folds={foldHttp}
            data-testid='code-editor-http-folds-response'
          >
            <CodeEditorContent lineNumbers aria-label='Foldable HTTP response' />
          </CodeEditorRoot>
        </div>
      </VStack>
    </VStack>
  );
};

/**
 * `maxLines` limits the height, and the editor scrolls inside it (no rows are removed). The
 * button appears on its own when at least three lines are hidden. Render
 * `CodeSnippetShowMoreButton` yourself only to pass props to the real button.
 */
export const ShowMore: StoryFn<typeof meta> = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '500px' }}>
    <div>
      <p className='sb-annotation mb-8'>12 lines, clamped at 7 — 5 hidden</p>
      <CodeEditorRoot
        defaultValue={showMoreCode}
        language='text'
        maxLines={7}
        data-testid='code-editor-show-more'
      >
        <CodeEditorContent aria-label='Request headers' />
      </CodeEditorRoot>
    </div>
    <div>
      <p className='sb-annotation mb-8'>9 lines, clamped at 7 — 2 hidden, no button</p>
      <CodeEditorRoot
        defaultValue={showMoreThresholdCode}
        language='text'
        maxLines={7}
        data-testid='code-editor-show-more-threshold'
      >
        <CodeEditorContent aria-label='Request headers' />
      </CodeEditorRoot>
    </div>
    <div>
      <p className='sb-annotation mb-8'>the button rendered by hand</p>
      <CodeEditorRoot
        defaultValue={showMoreCode}
        language='text'
        maxLines={7}
        data-testid='code-editor-show-more-manual'
      >
        <CodeEditorContent aria-label='Request headers' />
        <CodeSnippetShowMoreButton data-analytics-id='CODE_EDITOR_SHOW_MORE' />
      </CodeEditorRoot>
    </div>
  </div>
);

/**
 * Wrapping can be uncontrolled (`defaultWrapLines`, driven by the wrap button) or controlled
 * (`wrapLines` plus `onWrapLinesChange`). Colour sticks and prefixes stay on the first visual row.
 */
export const Wrap: StoryFn<typeof meta> = () => {
  const [wrap, setWrap] = useState(true);

  return (
    <VStack gap={16}>
      <VStack align='start' gap={4}>
        <span className='sb-annotation'>no wrapping</span>
        <div style={{ width: '600px' }}>
          <CodeEditorRoot
            defaultValue={longCode}
            language='text'
            lines={wrapDiffLines}
            data-testid='code-editor-wrap-off'
          >
            <CodeEditorContent lineNumbers aria-label='Long lines' />
          </CodeEditorRoot>
        </div>
      </VStack>
      <VStack align='start' gap={4}>
        <span className='sb-annotation'>defaultWrapLines + wrap button</span>
        <div style={{ width: '600px' }}>
          <CodeEditorRoot
            defaultValue={longCode}
            language='text'
            defaultWrapLines
            lines={wrapDiffLines}
            data-testid='code-editor-wrap-uncontrolled'
          >
            <CodeSnippetActions>
              <CodeSnippetWrapButton />
            </CodeSnippetActions>
            <CodeEditorContent lineNumbers aria-label='Long lines, wrapped' />
          </CodeEditorRoot>
        </div>
      </VStack>
      <VStack align='start' gap={4}>
        <span className='sb-annotation'>controlled — wrapLines = {String(wrap)}</span>
        <div style={{ width: '600px' }}>
          <CodeEditorRoot
            defaultValue={longCode}
            language='text'
            wrapLines={wrap}
            onWrapLinesChange={setWrap}
            data-testid='code-editor-wrap-controlled'
          >
            <CodeSnippetActions>
              <CodeSnippetWrapButton />
            </CodeSnippetActions>
            <CodeEditorContent lineNumbers aria-label='Long lines, controlled wrap' />
          </CodeEditorRoot>
        </div>
      </VStack>
    </VStack>
  );
};

/**
 * The same three sizes as CodeSnippet: `sm` (12px, default), `md` (14px) and `lg` (16px), each
 * on 20px rows.
 */
export const Sizes: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>sm (default)</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={bashCode}
          language='bash'
          size='sm'
          data-testid='code-editor-size-sm'
        >
          <CodeEditorContent lineNumbers aria-label='Install commands, small' />
        </CodeEditorRoot>
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>md</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={bashCode}
          language='bash'
          size='md'
          data-testid='code-editor-size-md'
        >
          <CodeEditorContent lineNumbers aria-label='Install commands, medium' />
        </CodeEditorRoot>
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>lg</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={bashCode}
          language='bash'
          size='lg'
          data-testid='code-editor-size-lg'
        >
          <CodeEditorContent lineNumbers aria-label='Install commands, large' />
        </CodeEditorRoot>
      </div>
    </VStack>
  </VStack>
);

/**
 * `readOnly` still lets you focus, select, search and copy, but not type. Use it when the value
 * can change elsewhere but not here. If it never changes, use `CodeSnippet`.
 */
export const ReadOnly: StoryFn<typeof meta> = () => (
  <div style={{ width: '600px' }}>
    <CodeEditorRoot
      value={httpResponseCode}
      language='http'
      readOnly
      data-testid='code-editor-read-only'
    >
      <CodeSnippetHeader>
        <CodeSnippetTitle>Response</CodeSnippetTitle>
        <CodeSnippetActions>
          <CodeSnippetCopyButton />
        </CodeSnippetActions>
      </CodeSnippetHeader>
      <CodeEditorContent lineNumbers aria-label='HTTP response, read only' />
    </CodeEditorRoot>
  </div>
);

/**
 * Tabs swap `value`, and `documentId` swaps the editor's whole state with it, so each tab keeps
 * its own undo history, selection and collapsed folds.
 */
export const Tabs: StoryFn<typeof meta> = () => {
  const [tab, setTab] = useState<TabId>('request');
  const [docs, setDocs] = useState<Record<TabId, string>>(tabDocuments);

  return (
    <div style={{ width: '600px' }}>
      <CodeEditorRoot
        documentId={tab}
        value={docs[tab]}
        onChange={value => setDocs(prev => ({ ...prev, [tab]: value }))}
        language='http'
        data-testid='code-editor-tabs'
      >
        <CodeSnippetHeader>
          <CodeSnippetTabs
            value={tab}
            onValueChange={value => {
              if (isTabId(value)) setTab(value);
            }}
          >
            <CodeSnippetTab value='request' data-testid='code-editor-tabs--tab-request'>
              Request
            </CodeSnippetTab>
            <CodeSnippetTab value='response' data-testid='code-editor-tabs--tab-response'>
              Response
            </CodeSnippetTab>
          </CodeSnippetTabs>
          <CodeSnippetActions>
            <CodeSnippetCopyButton />
          </CodeSnippetActions>
        </CodeSnippetHeader>
        <CodeEditorContent lineNumbers aria-label='HTTP message' />
      </CodeEditorRoot>
    </div>
  );
};

// --- Parity stories: CodeSnippet above, read-only CodeEditor below, identical props ---

interface ParityPairProps {
  testId: string;
  code: string;
  language: CodeEditorLanguage;
  lines?: Record<number, LineConfig>;
  folds?: FoldRegion[];
}

const ParityPair = ({ testId, code, language, lines, folds }: ParityPairProps) => (
  <VStack gap={16}>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>CodeSnippet</span>
      <div style={{ width: '600px' }}>
        <CodeSnippetRoot
          code={code}
          language={language}
          lines={lines}
          folds={folds}
          data-testid={`${testId}-snippet`}
        >
          <CodeSnippetContent>
            <CodeSnippetLineNumbers />
            <CodeSnippetCode />
          </CodeSnippetContent>
        </CodeSnippetRoot>
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>CodeEditor (readOnly)</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          value={code}
          language={language}
          lines={lines}
          folds={folds}
          readOnly
          data-testid={`${testId}-editor`}
        >
          <CodeEditorContent lineNumbers aria-label='Parity editor' />
        </CodeEditorRoot>
      </div>
    </VStack>
  </VStack>
);

/**
 * Parity check: the same code and props in CodeSnippet and in a read-only CodeEditor should look
 * identical. Accepted differences: a native thin scrollbar, and CodeMirror's caret and selection
 * layer (shown only while focused).
 */
export const ParityDefault: StoryFn<typeof meta> = () => (
  <ParityPair testId='parity-default' code={sampleCode} language='text' />
);

/**
 * Parity check with line colours, text prefixes and a tooltipped icon prefix: same stick, same
 * tint, same prefix column.
 */
export const ParityLineColors: StoryFn<typeof meta> = () => (
  <ParityPair
    testId='parity-line-colors'
    code={colorsCode}
    language='text'
    lines={parityColorLines}
  />
);

/**
 * Parity check with the headers fold collapsed: same chevrons and the same summary row in place
 * of the hidden lines.
 */
export const ParityFoldsCollapsed: StoryFn<typeof meta> = () => (
  <ParityPair
    testId='parity-folds-collapsed'
    code={foldableRequestCode}
    language='text'
    folds={parityCollapsedFolds}
  />
);

/**
 * Parity check for an HTTP request with a JSON body, both under the same Prism provider: token
 * colours come from the same adapter.
 */
export const ParityHttpPrism: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
    <ParityPair testId='parity-http-prism' code={httpRequestCode} language='http' />
  </CodeSnippetAdapterProvider>
);

// --- Languages ---

const PYTHON_SAMPLE = `from dataclasses import dataclass


@dataclass
class Rule:
    action: str
    point: list[str]
    enabled: bool = True


def active(rules: list[Rule]) -> list[Rule]:
    return [r for r in rules if r.enabled]
`;
const JSON_SAMPLE = `{
  "action": "block",
  "point": ["header", "X-Forwarded-For"],
  "enabled": true,
  "threshold": 42
}
`;
const JAVASCRIPT_SAMPLE = `export async function fetchRules(client, { limit = 50 } = {}) {
  const res = await client.get('/api/v2/rules', { params: { limit } });
  return res.data.filter(rule => rule.enabled);
}
`;
const TYPESCRIPT_SAMPLE = `interface Rule {
  action: 'block' | 'monitor';
  point: string[];
  enabled: boolean;
}

export const activeRules = (rules: readonly Rule[]): Rule[] =>
  rules.filter((rule): rule is Rule => rule.enabled);
`;
const YAML_SAMPLE = `rules:
  - action: block
    point: [header, X-Forwarded-For]
    enabled: true
  - action: monitor
    point: [query, id]
    enabled: false
`;

interface LanguageSample {
  id: string;
  label: string;
  language: CodeEditorLanguage;
  value: string;
}

const LANGUAGE_SAMPLES = [
  { id: 'python', label: 'Python', language: 'python', value: PYTHON_SAMPLE },
  { id: 'json', label: 'JSON', language: 'json', value: JSON_SAMPLE },
  { id: 'javascript', label: 'JavaScript', language: 'javascript', value: JAVASCRIPT_SAMPLE },
  { id: 'typescript', label: 'TypeScript', language: 'typescript', value: TYPESCRIPT_SAMPLE },
  { id: 'yaml', label: 'YAML', language: 'yaml', value: YAML_SAMPLE },
] as const satisfies readonly LanguageSample[];

const LanguageExample = ({ sample }: { sample: LanguageSample }) => {
  const [value, setValue] = useState(sample.value);

  return (
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>{sample.label}</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          value={value}
          onChange={setValue}
          language={sample.language}
          data-testid={`lang-${sample.id}`}
        >
          <CodeSnippetHeader>
            <CodeSnippetTitle>{sample.label}</CodeSnippetTitle>
            <CodeSnippetActions>
              <CodeSnippetCopyButton />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <CodeEditorContent lineNumbers aria-label={`${sample.label} example`} />
        </CodeEditorRoot>
      </div>
    </VStack>
  );
};

/**
 * Colours come from the adapter (Shiki here); JavaScript, TypeScript and Python parsers load on
 * first use.
 */
export const Languages: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
    <VStack gap={16}>
      {LANGUAGE_SAMPLES.map(sample => (
        <LanguageExample key={sample.id} sample={sample} />
      ))}
    </VStack>
  </CodeSnippetAdapterProvider>
);

import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { composeStories } from 'storybook-react-rsbuild';
import * as plain from '../CodeSnippet/adapters/plain' with { rstest: 'importActual' };
import * as stories from './CodeEditor.stories';

// Highlighting is covered by the adapter painter tests (T6). Here the heavy
// adapters are swapped for the plain one, so Shiki's WASM never loads in jsdom.
// Rstest mock factories are synchronous, so the plain adapter comes from the
// `importActual` import above.
rs.mock('../CodeSnippet/adapters/shiki', () => ({ shikiAdapter: plain.plainAdapter }));
rs.mock('../CodeSnippet/adapters/prism', () => ({ prismAdapter: plain.plainAdapter }));

const composed = composeStories(stories);
type StoryName = keyof typeof composed;

interface StoryRoots {
  /** CodeEditorRoot data-testid values rendered by the story */
  editors: readonly string[];
  /** CodeSnippetRoot data-testid values rendered by the story (parity stories) */
  snippets?: readonly string[];
}

const STORY_ROOTS: Record<StoryName, StoryRoots> = {
  Default: { editors: ['code-editor-default'] },
  WithHeader: { editors: ['code-editor-with-header'] },
  FloatingActions: { editors: ['code-editor-floating-actions'] },
  LineNumbersAndStartingLine: {
    editors: ['code-editor-line-numbers', 'code-editor-starting-line'],
  },
  LineColorsAndPrefixes: {
    editors: ['code-editor-line-colors', 'code-editor-line-diff', 'code-editor-line-icons'],
  },
  AnalyticsAttributes: { editors: ['analytics-editor'] },
  Ranges: { editors: ['code-editor-ranges'] },
  HttpRequestWithPrism: { editors: ['code-editor-http-request'] },
  HttpResponseWithShiki: { editors: ['code-editor-http-response'] },
  HttpFolds: { editors: ['code-editor-http-folds-request', 'code-editor-http-folds-response'] },
  ShowMore: {
    editors: [
      'code-editor-show-more',
      'code-editor-show-more-threshold',
      'code-editor-show-more-manual',
    ],
  },
  Wrap: {
    editors: [
      'code-editor-wrap-off',
      'code-editor-wrap-uncontrolled',
      'code-editor-wrap-controlled',
    ],
  },
  Sizes: { editors: ['code-editor-size-sm', 'code-editor-size-md', 'code-editor-size-lg'] },
  ReadOnly: { editors: ['code-editor-read-only'] },
  Tabs: { editors: ['code-editor-tabs'] },
  Languages: {
    editors: [
      'lang-python',
      'lang-json',
      'lang-javascript',
      'lang-typescript',
      'lang-yaml',
      'lang-lua',
    ],
  },
  SyntaxErrors: {
    editors: [
      'syntax-json',
      'syntax-yaml',
      'syntax-javascript',
      'syntax-typescript',
      'syntax-python',
      'syntax-lua',
      'syntax-http',
    ],
  },
  ParityDefault: { editors: ['parity-default-editor'], snippets: ['parity-default-snippet'] },
  ParityLineColors: {
    editors: ['parity-line-colors-editor'],
    snippets: ['parity-line-colors-snippet'],
  },
  ParityFoldsCollapsed: {
    editors: ['parity-folds-collapsed-editor'],
    snippets: ['parity-folds-collapsed-snippet'],
  },
  ParityHttpPrism: {
    editors: ['parity-http-prism-editor'],
    snippets: ['parity-http-prism-snippet'],
  },
  ParityRanges: { editors: ['parity-ranges-editor'], snippets: ['parity-ranges-snippet'] },
  ParityWrap: { editors: ['parity-wrap-editor'], snippets: ['parity-wrap-snippet'] },
  ParitySizes: {
    editors: ['parity-size-sm-editor', 'parity-size-md-editor', 'parity-size-lg-editor'],
    snippets: ['parity-size-sm-snippet', 'parity-size-md-snippet', 'parity-size-lg-snippet'],
  },
  ParityChrome: {
    editors: ['parity-chrome-header-editor', 'parity-chrome-floating-editor'],
    snippets: ['parity-chrome-header-snippet', 'parity-chrome-floating-snippet'],
  },
  ParityShowMore: {
    editors: ['parity-show-more-editor'],
    snippets: ['parity-show-more-snippet'],
  },
  Diff: { editors: ['code-editor-diff'] },
  DiffWrapLines: { editors: ['code-editor-diff-wrap'] },
  EditingWorkflow: { editors: ['editing'] },
  TabsKeepHistory: { editors: ['tabs-editor'] },
  LongDocument: { editors: ['long-document'] },
};

/** The engine chunk is a dynamic import; the first load in a worker can take a few seconds. */
const ENGINE = { timeout: 5000 };
/** Engine load + lazy parser load + the 300 ms lint delay. */
const LINT = { timeout: 8000 };

describe('CodeEditor stories', () => {
  it('lists every exported story in STORY_ROOTS', () => {
    expect(Object.keys(composed).sort()).toEqual(Object.keys(STORY_ROOTS).sort());
  });

  it.each(Object.keys(STORY_ROOTS) as StoryName[])(
    '%s mounts the engine in every editor root',
    async name => {
      const Story = composed[name];
      render(<Story />);
      const roots = STORY_ROOTS[name];

      for (const id of roots.editors) {
        expect(screen.getByTestId(id)).toBeInTheDocument();
        expect(await screen.findByTestId(`${id}--editor`, {}, ENGINE)).toBeInTheDocument();
      }
      for (const id of roots.snippets ?? []) {
        expect(screen.getByTestId(`${id}--content`)).toBeInTheDocument();
      }
    },
  );

  it('Default renders the controlled JSON value', async () => {
    const { Default } = composed;
    render(<Default />);

    const editor = await screen.findByTestId('code-editor-default--editor', {}, ENGINE);
    expect(editor).toHaveTextContent('"name": "@wallarm-org/sdk"');
    expect(editor).not.toHaveAttribute('aria-readonly');
  });

  it('ReadOnly marks the typing surface read-only', async () => {
    const { ReadOnly } = composed;
    render(<ReadOnly />);

    const editor = await screen.findByTestId('code-editor-read-only--editor', {}, ENGINE);
    expect(editor).toHaveAttribute('aria-readonly', 'true');
  });

  it('WithHeader renders the shared chrome buttons', async () => {
    const { WithHeader } = composed;
    render(<WithHeader />);

    await screen.findByTestId('code-editor-with-header--editor', {}, ENGINE);
    expect(screen.getByTestId('code-editor-with-header--title')).toHaveTextContent('rule.json');
    expect(screen.getByTestId('code-editor-with-header--copy-button')).toBeInTheDocument();
    expect(screen.getByTestId('code-editor-with-header--wrap-button')).toBeInTheDocument();
    expect(screen.getByTestId('code-editor-with-header--fullscreen-button')).toBeInTheDocument();
  });

  it('LineNumbersAndStartingLine renders a gutter', async () => {
    const { LineNumbersAndStartingLine } = composed;
    render(<LineNumbersAndStartingLine />);

    await screen.findByTestId('code-editor-starting-line--editor', {}, ENGINE);
    expect(screen.getByTestId('code-editor-starting-line--gutter')).toHaveTextContent('97');
  });

  it('HttpFolds starts with the request headers collapsed', async () => {
    const { HttpFolds } = composed;
    render(<HttpFolds />);

    await screen.findByTestId('code-editor-http-folds-request--editor', {}, ENGINE);
    const summaries = await screen.findAllByTestId(
      'code-editor-http-folds-request--fold-summary',
      {},
      ENGINE,
    );
    expect(summaries.length).toBeGreaterThan(0);
  });

  it('ShowMore auto-renders the show-more button when 5 lines are hidden', async () => {
    const { ShowMore } = composed;
    render(<ShowMore />);

    expect(
      await screen.findByTestId('code-editor-show-more--show-more-button', {}, ENGINE),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId('code-editor-show-more-manual--show-more-button', {}, ENGINE),
    ).toHaveAttribute('data-analytics-id', 'CODE_EDITOR_SHOW_MORE');
  });

  it('Tabs swaps the document when a tab is selected', async () => {
    const { Tabs } = composed;
    render(<Tabs />);

    const editor = await screen.findByTestId('code-editor-tabs--editor', {}, ENGINE);
    expect(editor).toHaveTextContent('POST /api/v2/rules HTTP/1.1');

    await userEvent.click(screen.getByTestId('code-editor-tabs--tab-response'));
    expect(await screen.findByText(/HTTP\/1\.1 201 Created/, {}, ENGINE)).toBeInTheDocument();
    expect(screen.getByTestId('code-editor-tabs--editor')).toHaveTextContent(
      'HTTP/1.1 201 Created',
    );

    await userEvent.click(screen.getByTestId('code-editor-tabs--tab-request'));
    expect(screen.getByTestId('code-editor-tabs--editor')).toHaveTextContent(
      'POST /api/v2/rules HTTP/1.1',
    );
  });

  it('ParityDefault shows the same first line in CodeSnippet and CodeEditor', async () => {
    const { ParityDefault } = composed;
    render(<ParityDefault />);

    const editor = await screen.findByTestId('parity-default-editor--editor', {}, ENGINE);
    const snippet = screen.getByTestId('parity-default-snippet--content');
    expect(snippet).toHaveTextContent('const greeting = "Hello, World!";');
    expect(editor).toHaveTextContent('const greeting = "Hello, World!";');
    expect(editor).toHaveAttribute('aria-readonly', 'true');
  });

  it('ParityShowMore clamps both roots and shows the same Show more count', async () => {
    const { ParityShowMore } = composed;
    render(<ParityShowMore />);
    await screen.findByTestId('parity-show-more-editor--editor', {}, ENGINE);

    const snippetButton = screen.getByTestId('parity-show-more-snippet--show-more-button');
    const editorButton = screen.getByTestId('parity-show-more-editor--show-more-button');
    expect(snippetButton).toHaveTextContent('5');
    expect(editorButton.textContent).toBe(snippetButton.textContent);
  });

  it('ParityChrome renders the same header tabs and actions in both roots', async () => {
    const { ParityChrome } = composed;
    render(<ParityChrome />);
    await screen.findByTestId('parity-chrome-header-editor--editor', {}, ENGINE);

    for (const id of ['parity-chrome-header-snippet', 'parity-chrome-header-editor']) {
      expect(screen.getByTestId(`${id}--header`)).toHaveTextContent('Request');
      expect(screen.getByTestId(`${id}--copy-button`)).toBeInTheDocument();
    }
  });

  it('SyntaxErrors reports syntax diagnostics under every editor', async () => {
    const { SyntaxErrors } = composed;
    render(<SyntaxErrors />);

    for (const language of ['json', 'yaml', 'javascript', 'typescript', 'python', 'lua', 'http']) {
      const count = screen.getByTestId(`syntax-${language}--count`);
      await waitFor(() => expect(count).not.toHaveTextContent(/^0 diagnostics$/), LINT);
    }
    expect(screen.getByTestId('syntax-json--count')).toHaveTextContent('1 diagnostic');
    expect(screen.getByTestId('syntax-http--count')).toHaveTextContent('1 diagnostic');
  });
});

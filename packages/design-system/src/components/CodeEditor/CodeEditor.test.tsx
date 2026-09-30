import { act, createRef, StrictMode } from 'react';
import { EditorView } from '@codemirror/view';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from '../../utils/copyText';
import {
  CodeSnippetActions,
  CodeSnippetCopyButton,
  CodeSnippetFullscreenButton,
  CodeSnippetHeader,
  CodeSnippetTitle,
  CodeSnippetWrapButton,
  useCodeSnippetChrome,
} from '../CodeSnippet';
import { type CodeEditorApi, CodeEditorContent, CodeEditorRoot, useCodeEditor } from './index';
import { loadEngine } from './lib/loadEngine';

vi.mock('../../utils/copyText', () => ({
  copyText: vi.fn(() => Promise.resolve()),
}));

const makeValue = (lineCount: number) =>
  Array.from({ length: lineCount }, (_, index) => `line ${index + 1}`).join('\n');

const FOLDS_FOR_ROLE_TEST = [{ id: 'middle', startLine: 2, endLine: 3, label: 'Middle' }];

const WrapProbe = () => {
  const { wrapLines } = useCodeSnippetChrome();
  return <output data-testid='wrap-probe'>{String(wrapLines)}</output>;
};

afterEach(() => {
  vi.mocked(copyText).mockClear();
  vi.restoreAllMocks();
});

describe('CodeEditor', () => {
  describe('loading', () => {
    it('renders the static fallback first, then the editor', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue={'GET / HTTP/1.1\nHost: a'}>
          <CodeEditorContent aria-label='Request' />
        </CodeEditorRoot>,
      );

      const fallback = screen.getByTestId('ed--fallback');
      expect(fallback).toHaveAttribute('aria-busy', 'true');
      expect(fallback).toHaveTextContent('GET / HTTP/1.1');
      expect(fallback).toHaveTextContent('Host: a');

      const editor = await screen.findByTestId('ed--editor');
      expect(editor).toHaveTextContent('Host: a');
      expect(screen.queryByTestId('ed--fallback')).not.toBeInTheDocument();
    });

    it('numbers fallback rows from startingLineNumber when lineNumbers is set', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue={'a\nb'} startingLineNumber={41}>
          <CodeEditorContent aria-label='Code' lineNumbers />
        </CodeEditorRoot>,
      );

      expect(screen.getByTestId('ed--fallback')).toHaveTextContent('41');
      expect(screen.getByTestId('ed--fallback')).toHaveTextContent('42');
      await screen.findByTestId('ed--editor');
    });

    it('creates exactly one editor under StrictMode', async () => {
      render(
        <StrictMode>
          <CodeEditorRoot data-testid='ed' defaultValue='x'>
            <CodeEditorContent aria-label='Code' />
          </CodeEditorRoot>
        </StrictMode>,
      );

      await screen.findByTestId('ed--editor');
      expect(screen.getAllByTestId('ed--editor')).toHaveLength(1);
    });

    it('leaves exactly one editor under StrictMode, logs no errors and cleans up on unmount', async () => {
      const consoleError = vi.spyOn(console, 'error');
      const { unmount } = render(
        <StrictMode>
          <CodeEditorRoot data-testid='s' defaultValue='x'>
            <CodeEditorContent aria-label='e' data-testid='se' />
          </CodeEditorRoot>
        </StrictMode>,
      );

      await screen.findByTestId('s--editor');
      expect(document.querySelectorAll('.cm-editor')).toHaveLength(1);
      expect(consoleError).not.toHaveBeenCalled();

      unmount();
      expect(document.querySelectorAll('.cm-editor')).toHaveLength(0);
    });

    it('does not throw or warn when unmounted before the engine resolves', async () => {
      const consoleError = vi.spyOn(console, 'error');
      const consoleWarn = vi.spyOn(console, 'warn');
      const { unmount } = render(
        <CodeEditorRoot data-testid='ed' defaultValue='x'>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      unmount();
      await act(async () => {
        await loadEngine();
      });

      expect(screen.queryByTestId('ed--editor')).not.toBeInTheDocument();
      expect(consoleError).not.toHaveBeenCalled();
      expect(consoleWarn).not.toHaveBeenCalled();
    });

    it('warns in development when the editor has no accessible name', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x'>
          <CodeEditorContent />
        </CodeEditorRoot>,
      );

      expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
      await screen.findByTestId('ed--editor');
    });

    it('throws when CodeEditorContent is rendered outside CodeEditorRoot', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(() => render(<CodeEditorContent aria-label='Code' />)).toThrow(
        'CodeEditor components must be used within CodeEditorRoot',
      );
    });
  });

  describe('value', () => {
    it('fires onChange for edits made through apiRef and keeps the uncontrolled value', async () => {
      const onChange = vi.fn();
      const apiRef = createRef<CodeEditorApi>();
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='abc' onChange={onChange} apiRef={apiRef}>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      await screen.findByTestId('ed--editor');

      act(() => apiRef.current?.insertText('X'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('Xabc');
      expect(apiRef.current?.getValue()).toBe('Xabc');
      expect(screen.getByTestId('ed--editor')).toHaveTextContent('Xabc');
    });

    it('syncs a new controlled value into the document without firing onChange', async () => {
      const onChange = vi.fn();
      const apiRef = createRef<CodeEditorApi>();
      const { rerender } = render(
        <CodeEditorRoot data-testid='ed' value='first' onChange={onChange} apiRef={apiRef}>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      await screen.findByTestId('ed--editor');

      rerender(
        <CodeEditorRoot data-testid='ed' value='second' onChange={onChange} apiRef={apiRef}>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      expect(apiRef.current?.getValue()).toBe('second');
      expect(screen.getByTestId('ed--editor')).toHaveTextContent('second');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('returns the current value from the api before the engine loads', async () => {
      const apiRef = createRef<CodeEditorApi>();
      render(
        <CodeEditorRoot data-testid='ed' value='early' apiRef={apiRef}>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      expect(screen.getByTestId('ed--fallback')).toBeInTheDocument();
      expect(apiRef.current?.getValue()).toBe('early');
      await screen.findByTestId('ed--editor');
    });

    it('useCodeEditor returns the same api object as apiRef', async () => {
      const apiRef = createRef<CodeEditorApi>();
      let fromHook: CodeEditorApi | null = null;
      const Probe = () => {
        fromHook = useCodeEditor();
        return null;
      };
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x' apiRef={apiRef}>
          <Probe />
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      await screen.findByTestId('ed--editor');

      expect(fromHook).not.toBeNull();
      expect(fromHook).toBe(apiRef.current);
    });
  });

  describe('chrome', () => {
    it('copies the edited document and calls onCopy with it', async () => {
      const onCopy = vi.fn();
      const apiRef = createRef<CodeEditorApi>();
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='abc' onCopy={onCopy} apiRef={apiRef}>
          <CodeSnippetHeader>
            <CodeSnippetActions>
              <CodeSnippetCopyButton />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      await screen.findByTestId('ed--editor');
      act(() => apiRef.current?.insertText('edited '));

      await userEvent.click(screen.getByTestId('ed--copy-button'));

      expect(copyText).toHaveBeenCalledWith('edited abc');
      expect(onCopy).toHaveBeenCalledWith('edited abc');
    });

    it('toggles uncontrolled wrapping and reports it through onWrapLinesChange', async () => {
      const onWrapLinesChange = vi.fn();
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x' onWrapLinesChange={onWrapLinesChange}>
          <CodeSnippetHeader>
            <CodeSnippetActions>
              <CodeSnippetWrapButton />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <WrapProbe />
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      await userEvent.click(screen.getByTestId('ed--wrap-button'));

      expect(onWrapLinesChange).toHaveBeenCalledWith(true);
      expect(screen.getByTestId('wrap-probe')).toHaveTextContent('true');
    });

    it('respects controlled wrapLines', async () => {
      const onWrapLinesChange = vi.fn();
      render(
        <CodeEditorRoot
          data-testid='ed'
          defaultValue='x'
          wrapLines={false}
          onWrapLinesChange={onWrapLinesChange}
        >
          <CodeSnippetHeader>
            <CodeSnippetActions>
              <CodeSnippetWrapButton />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <WrapProbe />
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      await userEvent.click(screen.getByTestId('ed--wrap-button'));

      expect(onWrapLinesChange).toHaveBeenCalledWith(true);
      expect(screen.getByTestId('wrap-probe')).toHaveTextContent('false');
    });

    it('keeps the same editor instance when entering and leaving fullscreen', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x'>
          <CodeSnippetHeader>
            <CodeSnippetActions>
              <CodeSnippetFullscreenButton />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      const before = await screen.findByTestId('ed--editor');

      await userEvent.click(screen.getByTestId('ed--fullscreen-button'));
      expect(screen.getByTestId('ed--fullscreen-button')).toHaveAccessibleName('Exit full screen');
      expect(screen.getByTestId('ed--editor')).toBe(before);

      await userEvent.click(screen.getByTestId('ed--fullscreen-button'));
      expect(screen.getByTestId('ed--fullscreen-button')).toHaveAccessibleName('Enter full screen');
      expect(screen.getByTestId('ed--editor')).toBe(before);
    });

    it('re-measures the editor when fullscreen toggles', async () => {
      const requestMeasure = vi.spyOn(EditorView.prototype, 'requestMeasure');
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x'>
          <CodeSnippetHeader>
            <CodeSnippetActions>
              <CodeSnippetFullscreenButton />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      await screen.findByTestId('ed--editor');
      requestMeasure.mockClear();

      await userEvent.click(screen.getByTestId('ed--fullscreen-button'));
      expect(requestMeasure).toHaveBeenCalled();

      requestMeasure.mockClear();
      await userEvent.click(screen.getByTestId('ed--fullscreen-button'));
      expect(requestMeasure).toHaveBeenCalled();
    });

    it('clamps to maxLines with an auto-rendered show-more button and unclamps on click', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue={makeValue(10)} maxLines={4}>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      const editor = await screen.findByTestId('ed--editor');
      const scroller = editor.parentElement as HTMLElement;

      const showMore = screen.getByTestId('ed--show-more-button');
      expect(showMore).toHaveTextContent('Show more (6 lines)');
      expect(getComputedStyle(scroller).maxHeight).toBe('96px');

      await userEvent.click(showMore);

      expect(screen.getByTestId('ed--show-more-button')).toHaveTextContent('Show less');
      expect(getComputedStyle(scroller).maxHeight).not.toBe('96px');
    });

    it('does not clamp when fewer than 3 rows would be hidden', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue={makeValue(6)} maxLines={4}>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      const editor = await screen.findByTestId('ed--editor');

      expect(screen.queryByTestId('ed--show-more-button')).not.toBeInTheDocument();
      expect(getComputedStyle(editor.parentElement as HTMLElement).maxHeight).not.toBe('96px');
    });

    it('cascades test ids to the reused chrome', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x'>
          <CodeSnippetHeader>
            <CodeSnippetTitle>Request</CodeSnippetTitle>
            <CodeSnippetActions>
              <CodeSnippetCopyButton />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      expect(screen.getByTestId('ed')).toBeInTheDocument();
      expect(screen.getByTestId('ed--header')).toBeInTheDocument();
      expect(screen.getByTestId('ed--title')).toHaveTextContent('Request');
      expect(screen.getByTestId('ed--actions')).toBeInTheDocument();
      expect(screen.getByTestId('ed--copy-button')).toBeInTheDocument();
      expect(screen.getByTestId('ed--content')).toHaveAttribute('data-ds-suppress-parent-click');
      await screen.findByTestId('ed--editor');
    });
  });

  describe('attributes and events', () => {
    it('lands consumer data-*/aria-* on the editor node, not on the wrapper', async () => {
      const payload = '{"rule":"r-1","nested":{"a":[1,2]}}';
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x'>
          <CodeEditorContent
            aria-label='HTTP request'
            data-analytics-id='rule-request-editor'
            data-analytics-props={payload}
            id='request-editor'
          />
        </CodeEditorRoot>,
      );
      const editor = await screen.findByTestId('ed--editor');
      const wrapper = screen.getByTestId('ed--content');

      expect(editor).toHaveAttribute('aria-label', 'HTTP request');
      expect(editor).toHaveAttribute('data-analytics-id', 'rule-request-editor');
      expect(editor).toHaveAttribute('data-analytics-props', payload);
      expect(editor).toHaveAttribute('id', 'request-editor');
      expect(wrapper).not.toHaveAttribute('data-analytics-id');
      expect(wrapper).not.toHaveAttribute('aria-label');
    });

    it('keeps className and handlers on the wrapper, which receives bubbled keydown', async () => {
      const onKeyDown = vi.fn();
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x'>
          <CodeEditorContent aria-label='Code' className='custom-wrapper' onKeyDown={onKeyDown} />
        </CodeEditorRoot>,
      );
      const editor = await screen.findByTestId('ed--editor');

      fireEvent.keyDown(editor, { key: 'a' });

      expect(screen.getByTestId('ed--content')).toHaveClass('custom-wrapper');
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyDown.mock.calls[0]?.[0].target).toBe(editor);
    });

    it('exposes fold toggles as buttons by role (not inside an aria-hidden gutter)', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue={'a\nb\nc\nd'} folds={FOLDS_FOR_ROLE_TEST}>
          <CodeEditorContent aria-label='Code' lineNumbers />
        </CodeEditorRoot>,
      );
      await screen.findByTestId('ed--editor');

      const toggle = await within(screen.getByTestId('ed')).findByRole('button', {
        name: /Collapse Middle/,
      });
      expect(toggle).toBe(screen.getByTestId('ed--fold-toggle'));
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    it('warns once when documentId is used without a controlled value', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { rerender } = render(
        <CodeEditorRoot data-testid='ed' defaultValue='a' documentId='one'>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      await screen.findByTestId('ed--editor');
      rerender(
        <CodeEditorRoot data-testid='ed' defaultValue='a' documentId='two'>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      const documentIdWarnings = warn.mock.calls.filter(([message]) =>
        String(message).includes('documentId'),
      );
      expect(documentIdWarnings).toHaveLength(1);
      expect(String(documentIdWarnings[0]?.[0])).toContain('controlled `value`');
    });

    it('does not warn about documentId with a controlled value', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      render(
        <CodeEditorRoot data-testid='ed' value='a' documentId='one'>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      await screen.findByTestId('ed--editor');
      expect(warn.mock.calls.filter(([message]) => String(message).includes('documentId'))).toEqual(
        [],
      );
    });

    it('marks the editor aria-readonly when readOnly', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x' readOnly>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      const editor = await screen.findByTestId('ed--editor');
      expect(editor).toHaveAttribute('aria-readonly', 'true');
    });

    it('keeps root consumer props and ref on the root element', async () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x' ref={ref} data-analytics-id='root'>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      await waitFor(() => expect(ref.current).toBe(screen.getByTestId('ed')));
      expect(screen.getByTestId('ed')).toHaveAttribute('data-analytics-id', 'root');
    });
  });
});

import { cva } from 'class-variance-authority';

/** `CodeEditorContent` wrapper: fills the root's flex column (fullscreen) and clips by height. */
export const codeEditorContentVariants = cva('relative flex-1 min-h-0');

/** Element CodeMirror mounts into; `.cm-editor` fills it in the fullscreen column. */
export const codeEditorHostVariants = cva('h-full [&>.cm-editor]:h-full');

/** Static text shown until the engine chunk resolves: CodeSnippet's 20px rows and `py-8`. */
export const codeEditorFallbackVariants = cva('m-0 flex overflow-hidden py-8 font-mono');

/** Gutter group of the fallback: the columns below, then the 8px gap the editor leaves. */
export const codeEditorFallbackGuttersVariants = cva('mr-8 flex shrink-0 select-none');

/**
 * Fallback gutter columns, same widths as the engine gutters so nothing shifts when the editor
 * mounts (spec §7.2): colour stick, line numbers, fold toggles (16px + 4px padding), prefixes.
 */
export const codeEditorFallbackGutterVariants = cva('flex shrink-0 flex-col', {
  variants: {
    column: {
      stick: 'border-l-2 border-transparent pl-12',
      lineNumbers: 'px-8 text-right text-text-secondary',
      folds: 'w-24',
      prefix: 'px-8 text-center',
    },
  },
  defaultVariants: {
    column: 'lineNumbers',
  },
});

export const codeEditorFallbackCodeVariants = cva('flex min-w-0 flex-1 flex-col pr-12', {
  variants: {
    hasGutter: {
      true: '',
      false: 'pl-12',
    },
  },
  defaultVariants: {
    hasGutter: false,
  },
});

export const codeEditorFallbackLineVariants = cva('block min-h-lh leading-sm', {
  variants: {
    wrapLines: {
      true: 'whitespace-pre-wrap break-all',
      false: 'whitespace-pre',
    },
  },
  defaultVariants: {
    wrapLines: false,
  },
});

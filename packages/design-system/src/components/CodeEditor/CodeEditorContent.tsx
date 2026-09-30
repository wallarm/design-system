import type { FC, HTMLAttributes, Ref } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { useCodeSnippetChrome } from '../CodeSnippet/hooks';
import { useCodeEditorContext } from './CodeEditorContext';
import {
  codeEditorContentVariants,
  codeEditorFallbackCodeVariants,
  codeEditorFallbackGutterVariants,
  codeEditorFallbackLineVariants,
  codeEditorFallbackVariants,
  codeEditorHostVariants,
} from './classes';
import type { EditorHandle, EngineOptions } from './engine/types';
import { loadEngine } from './lib/loadEngine';
import { PortalOutlet } from './lib/PortalOutlet';
import { createPortalRegistry } from './lib/portalRegistry';
import { splitContentProps } from './lib/splitContentProps';

type CodeEditorContentNativeProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'contentEditable' | 'role' | 'defaultValue'
>;

export interface CodeEditorContentProps extends CodeEditorContentNativeProps, TestableProps {
  /** Content wrapper element */
  ref?: Ref<HTMLDivElement>;
  /** Show the line-number gutter (CodeSnippet's `<CodeSnippetLineNumbers />` equivalent) */
  lineNumbers?: boolean;
}

const ROW_HEIGHT = 20;
const VERTICAL_PADDING = 16;

interface FallbackRow {
  number: number;
  text: string;
}

const buildFallbackRows = (
  value: string,
  startingLineNumber: number,
  maxHeight: number | null,
): FallbackRow[] => {
  const lines = value.split('\n');
  const visible =
    maxHeight === null
      ? lines
      : lines.slice(0, Math.max(0, Math.round((maxHeight - VERTICAL_PADDING) / ROW_HEIGHT)));
  return visible.map((text, index) => ({ number: startingLineNumber + index, text }));
};

/**
 * Editing surface of `CodeEditorRoot`. Loads the CodeMirror engine on mount and
 * shows the value as static text until it is ready. `data-*`, `aria-*`, `id`,
 * `title` and `tabIndex` land on the typing surface; `className`, `style`, `ref`
 * and event handlers stay on this wrapper (events from the editor bubble to it).
 */
export const CodeEditorContent: FC<CodeEditorContentProps> = ({
  ref,
  lineNumbers = false,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('content', testIdProp);
  const fallbackTestId = useTestId('fallback');
  const { options, callbacks, setHandle } = useCodeEditorContext();
  const { isFullscreen } = useCodeSnippetChrome();
  const [registry] = useState(createPortalRegistry);
  const [handle, setLocalHandle] = useState<EditorHandle | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  const { contentAttributes: routedAttributes, wrapperProps } = splitContentProps(props);
  // Stable identity while the attribute values are unchanged, so the engine does not reconfigure per render.
  const attributesKey = JSON.stringify(routedAttributes);
  const contentAttributes = useMemo(
    () => JSON.parse(attributesKey) as Record<string, string>,
    [attributesKey],
  );

  const engineOptions = useMemo<EngineOptions>(
    () => ({ ...options, lineNumbers, contentAttributes }),
    [options, lineNumbers, contentAttributes],
  );
  const optionsRef = useRef(engineOptions);

  useEffect(() => {
    optionsRef.current = engineOptions;
  }, [engineOptions]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let created: EditorHandle | null = null;

    loadEngine().then(
      engine => {
        if (cancelled) return;
        created = engine.createEditor(host, optionsRef.current, {
          ...callbacks,
          portals: registry,
        });
        setHandle(created);
        setLocalHandle(created);
      },
      (error: unknown) => {
        if (cancelled) return;
        // biome-ignore lint/suspicious/noConsole: engine load failures have no onError (spec D12); log and keep the fallback.
        console.error(
          '[CodeEditor] Failed to load the editor engine; showing read-only text.',
          error,
        );
        setLoadFailed(true);
      },
    );

    return () => {
      cancelled = true;
      if (created) {
        created.destroy();
        setHandle(null);
      }
      setLocalHandle(null);
    };
  }, [callbacks, registry, setHandle]);

  useEffect(() => {
    handle?.update(engineOptions);
  }, [handle, engineOptions]);

  // Re-measure after mount and after ChromeFrame moves its host in/out of fullscreen (spec §7.9).
  // A passive effect runs after ChromeFrame's layout effect has attached/moved the host, so the
  // measure (scheduled for the next frame) never reads a detached or stale geometry.
  // biome-ignore lint/correctness/useExhaustiveDependencies: isFullscreen is the trigger, not an input.
  useEffect(() => {
    handle?.view.requestMeasure();
  }, [handle, isFullscreen]);

  const hasAccessibleName =
    contentAttributes['aria-label'] !== undefined ||
    contentAttributes['aria-labelledby'] !== undefined;

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
      // biome-ignore lint/suspicious/noConsole: dev-only accessibility authoring guard.
      console.warn(
        '[CodeEditor] CodeEditorContent has no accessible name. Pass `aria-label` or `aria-labelledby`.',
      );
    }
  }, [hasAccessibleName]);

  const fallbackRows =
    handle === null
      ? buildFallbackRows(options.value, options.startingLineNumber, options.maxHeight)
      : null;

  return (
    <div
      {...wrapperProps}
      ref={ref}
      data-slot='code-editor-content'
      data-testid={testId}
      data-ds-suppress-parent-click=''
      className={cn(codeEditorContentVariants(), className)}
    >
      {fallbackRows && (
        <pre
          data-testid={fallbackTestId}
          aria-busy={loadFailed ? 'false' : 'true'}
          className={codeEditorFallbackVariants()}
        >
          {lineNumbers && (
            <span aria-hidden='true' className={codeEditorFallbackGutterVariants()}>
              {fallbackRows.map(row => (
                <span key={row.number} className={codeEditorFallbackLineVariants()}>
                  {row.number}
                </span>
              ))}
            </span>
          )}
          <code className={codeEditorFallbackCodeVariants({ hasGutter: lineNumbers })}>
            {fallbackRows.map(row => (
              <span
                key={row.number}
                className={codeEditorFallbackLineVariants({ wrapLines: options.wrapLines })}
              >
                {row.text}
              </span>
            ))}
          </code>
        </pre>
      )}
      <div ref={hostRef} className={codeEditorHostVariants()} />
      <PortalOutlet registry={registry} />
    </div>
  );
};

CodeEditorContent.displayName = 'CodeEditorContent';

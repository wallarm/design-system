import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CodeEditorContent, CodeEditorRoot } from './index';

type EngineModule = typeof import('./engine');

const deferred = vi.hoisted(() => {
  let resolve: (engine: EngineModule) => void = () => undefined;
  const promise = new Promise<EngineModule>(done => {
    resolve = done;
  });
  return { promise, resolve: (engine: EngineModule) => resolve(engine) };
});

vi.mock('./lib/loadEngine', () => ({ loadEngine: () => deferred.promise }));

describe('CodeEditor mount', () => {
  it('removes the fallback in the same task that mounts the editor (no double-height frame)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <CodeEditorRoot data-testid='ed' defaultValue={'a\nb'}>
        <CodeEditorContent aria-label='Code' />
      </CodeEditorRoot>,
    );
    expect(screen.getByTestId('ed--fallback')).toBeInTheDocument();

    deferred.resolve(await import('./engine'));
    // The component's `.then` ran before this continuation; nothing else has been flushed.
    await deferred.promise;

    expect(screen.getByTestId('ed--editor')).toBeInTheDocument();
    expect(screen.queryByTestId('ed--fallback')).not.toBeInTheDocument();
  });
});

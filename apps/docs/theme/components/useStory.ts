import { type ComponentType, useEffect, useState } from 'react';

/** A story module namespace, e.g. `() => import('…/Button.stories')`. */
export type StoryLoader = () => Promise<Record<string, unknown>>;

export interface StoryState {
  /** `null` until resolved, or when loading failed. */
  Story: ComponentType | null;
  error: Error | null;
}

/** Composes story `name` from the loaded module on mount. */
export function useStory(load: StoryLoader, name: string): StoryState {
  const [state, setState] = useState<StoryState>({ Story: null, error: null });

  useEffect(() => {
    let active = true;
    // storybook-react-rsbuild is imported here, not at the top, so SSG never evaluates it.
    Promise.all([load(), import('storybook-react-rsbuild')])
      .then(([module, { composeStories }]) => {
        const stories: Record<string, ComponentType | undefined> = composeStories(
          module as Parameters<typeof composeStories>[0],
        );
        const Story = stories[name];
        if (!Story) throw new Error(`Story "${name}" not found in module`);
        if (active) setState({ Story, error: null });
      })
      .catch((cause: unknown) => {
        // biome-ignore lint/suspicious/noConsole: keep the original error (stack) visible to developers
        console.error(cause);
        const error = cause instanceof Error ? cause : new Error(String(cause));
        if (active) setState({ Story: null, error });
      });
    return () => {
      active = false;
    };
  }, [load, name]);

  return state;
}

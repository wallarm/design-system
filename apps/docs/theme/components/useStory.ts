import { type ComponentType, useEffect, useState } from 'react';

/** A story module namespace, e.g. `() => import('…/Button.stories')`. */
export type StoryLoader = () => Promise<Record<string, unknown>>;

/** Composes story `name` from the loaded module on mount; `null` until resolved. */
export function useStory(load: StoryLoader, name: string): ComponentType | null {
  const [story, setStory] = useState<{ Story: ComponentType } | null>(null);

  useEffect(() => {
    let active = true;
    // storybook-react-rsbuild is imported here, not at the top, so SSG never evaluates it.
    Promise.all([load(), import('storybook-react-rsbuild')]).then(
      ([module, { composeStories }]) => {
        const stories: Record<string, ComponentType | undefined> = composeStories(
          module as Parameters<typeof composeStories>[0],
        );
        const Story = stories[name];
        if (active && Story) setStory({ Story });
      },
    );
    return () => {
      active = false;
    };
  }, [load, name]);

  return story?.Story ?? null;
}

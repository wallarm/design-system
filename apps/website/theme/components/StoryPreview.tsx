import { lazy, type ReactNode, Suspense, useRef, useState } from 'react';

import { BrowserOnly } from '@rspress/core/runtime';
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@wallarm-org/design-system/Alert';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@wallarm-org/design-system/SegmentedControl';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { cn } from '@wallarm-org/design-system/utils/cn';

import { useInView } from './useInView';
import { type StoryLoader, useStory } from './useStory';

export interface StoryPreviewProps {
  load: StoryLoader;
  name: string;
  hideCode?: boolean;
  /** Full-bleed frame for pattern stories: no padding; a page fills it, anything else is centred. */
  fullscreen?: boolean;
  /** The fenced code block of the story source. */
  children: ReactNode;
}

/** Shown in place of a story that failed to load. */
export function StoryError({ error }: { error: Error }) {
  return (
    <Alert color='destructive'>
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Story failed to load</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </AlertContent>
    </Alert>
  );
}

/** Fixed-height stand-in until a story mounts, so the scroll position stays put. */
export function StoryPlaceholder() {
  return <Skeleton width='100%' height='200px' transparent={false} />;
}

// Lazy: the dialog stays out of the page bundle until a full-bleed story shows its Expand button.
const ExpandStory = lazy(() =>
  import('./TemplatePreviewDialog').then(m => ({ default: m.ExpandStory })),
);

// Centre a trigger or a fixed-width block (start-aligned if wider); whole-page roots fill the frame.
export const FULLSCREEN_FRAME =
  'grid w-full grid-cols-1 [place-items:safe_center] [&>[data-slot=app-shell]]:w-full [&>[data-slot=page]]:w-full';

/**
 * For a FULLSCREEN_FRAME of fixed height (a card's design screen, the preview dialog): AppShell, an
 * h-screen root, fills the frame instead of the window. The row is pinned too, or the shell's own
 * content would size it.
 */
export const FILL_APP_SHELL =
  'has-[>[data-slot=app-shell]]:grid-rows-[100%] [&>[data-slot=app-shell]]:h-full';

export function LoadedStory({ load, name }: { load: StoryLoader; name: string }) {
  const { Story, error } = useStory(load, name);
  if (error) return <StoryError error={error} />;
  return Story ? <Story /> : <StoryPlaceholder />;
}

/** Loads and mounts the story only once it scrolls near the viewport. */
function Live({
  load,
  name,
  fullscreen,
}: {
  load: StoryLoader;
  name: string;
  fullscreen?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div
      ref={ref}
      className={fullscreen ? FULLSCREEN_FRAME : 'flex w-full items-center justify-center'}
    >
      {inView ? <LoadedStory load={load} name={name} /> : <StoryPlaceholder />}
    </div>
  );
}

function Preview({ load, name, hideCode = false, fullscreen, children }: StoryPreviewProps) {
  const [view, setView] = useState('preview');

  return (
    <div className='my-16 flex flex-col gap-8'>
      <div className='flex items-center justify-between gap-8 empty:hidden'>
        {!hideCode && (
          <SegmentedControl value={view} onChange={setView}>
            <SegmentedControlItem value='preview'>Preview</SegmentedControlItem>
            <SegmentedControlItem value='code'>Code</SegmentedControlItem>
          </SegmentedControl>
        )}
        {fullscreen && (
          <BrowserOnly fallback={null}>
            {() => (
              <Suspense fallback={null}>
                <ExpandStory load={load} name={name} />
              </Suspense>
            )}
          </BrowserOnly>
        )}
      </div>
      {view === 'code' ? (
        children
      ) : (
        <div
          className={cn(
            'rp-not-doc flex min-h-120 rounded-12 border border-border-primary-light',
            fullscreen ? 'overflow-hidden' : 'items-center justify-center p-24',
          )}
        >
          <BrowserOnly fallback={<StoryPlaceholder />}>
            {() => <Live load={load} name={name} fullscreen={fullscreen} />}
          </BrowserOnly>
        </div>
      )}
    </div>
  );
}

/** Live story with a Preview/Code toggle; the markdown (llms.txt) output gets only the code. */
export function StoryPreview(props: StoryPreviewProps) {
  // Truthy check: a boolean define in builds, a string env var under Rstest.
  if (import.meta.env.SSG_MD) return <>{props.children}</>;
  return <Preview {...props} />;
}

// Rspress injects markdown.globalComponents as default imports.
export default StoryPreview;

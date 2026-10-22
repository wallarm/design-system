import { type ReactNode, useState } from 'react';
import { BrowserOnly } from '@rspress/core/runtime';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@wallarm-org/design-system/SegmentedControl';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { type StoryLoader, useStory } from './useStory';

export interface StoryPreviewProps {
  load: StoryLoader;
  name: string;
  hideCode?: boolean;
  /** The fenced code block of the story source. */
  children: ReactNode;
}

function Live({ load, name }: { load: StoryLoader; name: string }) {
  const Story = useStory(load, name);
  return Story ? <Story /> : <Skeleton width='100%' height='80px' transparent={false} />;
}

function Preview({ load, name, hideCode = false, children }: StoryPreviewProps) {
  const [view, setView] = useState('preview');

  return (
    <div className='my-16 flex flex-col gap-8'>
      {!hideCode && (
        <SegmentedControl value={view} onChange={setView} className='self-start'>
          <SegmentedControlItem value='preview'>Preview</SegmentedControlItem>
          <SegmentedControlItem value='code'>Code</SegmentedControlItem>
        </SegmentedControl>
      )}
      {view === 'code' ? (
        children
      ) : (
        <div className='rp-not-doc flex min-h-120 items-center justify-center rounded-12 border border-border-primary-light p-24'>
          <BrowserOnly fallback={<Skeleton width='100%' height='80px' transparent={false} />}>
            {() => <Live load={load} name={name} />}
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

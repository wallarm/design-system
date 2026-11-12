import { type ComponentType, useEffect, useState } from 'react';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { cn } from '@wallarm-org/design-system/utils/cn';
import { StoryError } from './StoryPreview';

type Loaded = ComponentType;

interface GenUiPlaygroundProps {
  /** `replay`: pick a prompt, watch the page build (default). `chat`: answers in the Wally chat. */
  demo?: 'replay' | 'chat';
  /** A replay for a regular-width page: shorter, with the stream panel closed at first. */
  compact?: boolean;
}

/**
 * A gen-ui demo, embedded. Loaded on mount, not imported at the top, so SSG never evaluates A2UI's
 * renderer (Lit custom elements) or json-render. The markdown output gets a line instead.
 */
export function GenUiPlayground({ demo = 'replay', compact = false }: GenUiPlaygroundProps) {
  const [Playground, setPlayground] = useState<Loaded | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([import('@wallarm-org/gen-ui/playground'), import('@wallarm-org/gen-ui/fixtures')])
      .then(([{ GenUiChatDemo, GenUiPlayground: Replay }, { SCENARIOS }]) => {
        const Bound =
          demo === 'chat'
            ? () => <GenUiChatDemo className='h-full' />
            : () => (
                <Replay scenarios={SCENARIOS} className='h-full' defaultStreamOpen={!compact} />
              );
        if (active) setPlayground(() => Bound);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause : new Error(String(cause)));
      });
    return () => {
      active = false;
    };
  }, [demo, compact]);

  if (import.meta.env.SSG_MD) {
    return (
      <p>An interactive replay of recorded agent answers; open the page in a browser to try it.</p>
    );
  }
  return (
    <div
      data-gen-ui-demo={demo}
      className={cn(
        'rp-not-doc my-24 overflow-hidden rounded-12 border border-border-primary-light',
        demo === 'chat' || compact ? 'h-[720px]' : 'h-[860px]',
      )}
    >
      {error ? (
        <StoryError error={error} />
      ) : Playground ? (
        <Playground />
      ) : (
        <Skeleton width='100%' height='100%' rounded='none' transparent={false} />
      )}
    </div>
  );
}

// Rspress injects markdown.globalComponents as default imports.
export default GenUiPlayground;

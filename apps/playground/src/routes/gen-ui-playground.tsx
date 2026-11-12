import { createFileRoute } from '@tanstack/react-router';
import { SCENARIOS } from '@wallarm-org/gen-ui/fixtures';
import { GenUiPlayground } from '@wallarm-org/gen-ui/playground';

export const Route = createFileRoute('/gen-ui-playground')({
  component: PlaygroundPage,
});

/** Every recorded prompt, full screen: the same component the docs site embeds. */
function PlaygroundPage() {
  return <GenUiPlayground scenarios={SCENARIOS} className='h-screen w-screen' />;
}

import { createFileRoute } from '@tanstack/react-router';
import { GenUiChatDemo } from '@wallarm-org/gen-ui/playground';

export const Route = createFileRoute('/gen-ui')({
  component: ChatDemoPage,
});

/** Answers inside the Wally chat, full screen: the same component the docs site embeds. */
function ChatDemoPage() {
  return <GenUiChatDemo className='h-screen w-screen' />;
}

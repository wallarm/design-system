import type { FC, ReactNode } from 'react';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';

interface PlaceholderProps {
  /** The agent's id, or the component type: for tests and debugging, never shown. */
  id: string;
  /** Why it isn't renderable yet (schema issues), in the tooltip. */
  detail?: readonly string[];
  /** A skeleton shaped like the component; default a plain block. */
  children?: ReactNode;
}

/**
 * Stands in for a part that isn't renderable yet, so a streaming layout keeps its shape: a child
 * the agent named but hasn't sent, or a component whose props don't match its schema yet (data
 * still on its way, or a mistake).
 */
export const Placeholder: FC<PlaceholderProps> = ({ id, detail, children }) => (
  <div
    data-gen-ui-placeholder={id}
    aria-busy='true'
    title={detail?.join('\n')}
    className='h-full w-full min-w-0'
  >
    {children ?? <Skeleton width='100%' height='96px' rounded={12} transparent={false} />}
  </div>
);

import type { FC, HTMLAttributes, Ref } from 'react';
import type { AgentCharacterId, AgentLook } from '../../lib/agent-characters/data.gen';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { AgentGlyph, type AgentGlyphState } from '../AgentGlyph';
import { AvatarSizeProvider } from './AvatarContext';
import { agentItemVariants } from './classes';

type AgentItemLook = { agent: AgentCharacterId; look?: never } | { look: AgentLook; agent?: never };

export type AgentItemSize = 16 | 20 | 24;

export type AgentItemProps = HTMLAttributes<HTMLSpanElement> &
  TestableProps &
  AgentItemLook & {
    ref?: Ref<HTMLSpanElement>;
    /** 20 beside text-sm (table rows, attributes, user items), 16 beside text-xs (D3); 24 for roomier rows. */
    size?: AgentItemSize;
    state?: AgentGlyphState;
    hasApplications?: boolean;
    coverage?: 'full' | 'partial';
  };

/**
 * The agent user item: the agent's glyph, its name and an optional description, with no plate (agents stand as
 * silhouettes). Takes the same `AvatarContent` / `AvatarName` / `AvatarDescription` children as a person's
 * `Avatar`, so a place swaps a person for an agent by swapping the root.
 */
export const AgentItem: FC<AgentItemProps> = ({
  ref,
  agent,
  look,
  size = 20,
  state,
  hasApplications,
  coverage,
  className,
  children,
  'data-testid': testId,
  ...props
}) => (
  <TestIdProvider value={testId}>
    {/* The name and description keep the person item's text; 16 px drops the name to text-xs (D3). */}
    <AvatarSizeProvider value='sm'>
      <span
        {...props}
        ref={ref}
        data-slot='agent-item'
        data-testid={testId}
        className={cn(agentItemVariants({ size }), className)}
      >
        <AgentGlyph
          {...(look ? { look } : { agent: agent as AgentCharacterId })}
          size={size}
          state={state}
          hasApplications={hasApplications}
          coverage={coverage}
          data-testid={testId && `${testId}--glyph`}
          className='col-start-1 row-start-1'
        />
        {children}
      </span>
    </AvatarSizeProvider>
  </TestIdProvider>
);

AgentItem.displayName = 'AgentItem';

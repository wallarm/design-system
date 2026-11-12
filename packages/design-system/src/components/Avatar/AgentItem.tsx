import type { CSSProperties, FC, HTMLAttributes, Ref } from 'react';
import type { AgentCharacterId, AgentLook } from '../../lib/agent-characters/data.gen';
import { insetPx } from '../../lib/agent-characters/geom';
import { lookOf } from '../../lib/agent-characters/look';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { AgentAvatar } from '../AgentAvatar';
import { AgentGlyph, type AgentGlyphState } from '../AgentGlyph';
import { AvatarSizeProvider } from './AvatarContext';
import { agentItemVariants } from './classes';

type AgentItemLook = { agent: AgentCharacterId; look?: never } | { look: AgentLook; agent?: never };

/** 16–24 px draw the flat glyph, 40 px and up the 3D character (D1). */
export type AgentItemSize = 16 | 20 | 24 | 40 | 48 | 56;

export type AgentItemProps = HTMLAttributes<HTMLSpanElement> &
  TestableProps &
  AgentItemLook & {
    ref?: Ref<HTMLSpanElement>;
    /** 20 beside text-sm (table rows, attributes), 16 beside text-xs (D3); 40 and up for cards that show the agent. */
    size?: AgentItemSize;
    state?: AgentGlyphState;
    hasApplications?: boolean;
    coverage?: 'full' | 'partial';
    /** 3D sizes only: animated, as in an Overview row. */
    live?: boolean;
    /** 3D sizes only: the agent's uid, keeping its timing distinct from its neighbours. Defaults to `agent`. */
    seed?: string;
  };

/**
 * The agent user item: the agent's character, its name and an optional description, with no plate (agents stand as
 * silhouettes). Takes the same `AvatarContent` / `AvatarName` / `AvatarDescription` children as a person's
 * `Avatar`, so a place swaps a person for an agent by swapping the root. The gap is measured from the body, not
 * the character's box, so every agent sits as close to its name as a person's plate does.
 */
export const AgentItem: FC<AgentItemProps> = ({
  ref,
  agent,
  look,
  size = 20,
  state,
  hasApplications,
  coverage,
  live,
  seed,
  className,
  style,
  children,
  'data-testid': testId,
  ...props
}) => {
  const character = {
    ...(look ? { look } : { agent: agent as AgentCharacterId }),
    state,
    hasApplications,
    coverage,
    // pulled in by the empty box beside the body, which differs by shape
    className: 'col-start-1 row-start-1 -mx-(--agent-inset)',
  };

  return (
    <TestIdProvider value={testId}>
      {/* The name and description keep the person item's text; 16 px drops the name to text-xs (D3). */}
      <AvatarSizeProvider value='sm'>
        <span
          {...props}
          ref={ref}
          data-slot='agent-item'
          data-testid={testId}
          className={cn(agentItemVariants({ size }), className)}
          style={
            {
              '--agent-inset': `${insetPx(look ?? lookOf(agent), size)}px`,
              ...style,
            } as CSSProperties
          }
        >
          {size <= 24 ? (
            <AgentGlyph
              {...character}
              size={size as 16 | 20 | 24}
              data-testid={testId && `${testId}--glyph`}
            />
          ) : (
            <AgentAvatar
              {...character}
              size={size as 40 | 48 | 56}
              live={live}
              seed={seed ?? agent ?? ''}
              data-testid={testId && `${testId}--avatar`}
            />
          )}
          {children}
        </span>
      </AvatarSizeProvider>
    </TestIdProvider>
  );
};

AgentItem.displayName = 'AgentItem';

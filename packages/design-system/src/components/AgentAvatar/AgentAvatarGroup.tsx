import { createContext, type FC, type ReactNode, useState } from 'react';

import type { Character } from '../../lib/agent-characters/engine';

/** The live characters of one row or list. */
export const AgentAvatarGroupContext = createContext<Set<Character> | null>(null);

export interface AgentAvatarGroupProps {
  children?: ReactNode;
}

/**
 * Marks live avatars as neighbours (a team row, a card list): in On duty they look around at the two nearest ones
 * instead of a random side. Renders no element of its own.
 */
export const AgentAvatarGroup: FC<AgentAvatarGroupProps> = ({ children }) => {
  const [peers] = useState(() => new Set<Character>());
  return <AgentAvatarGroupContext value={peers}>{children}</AgentAvatarGroupContext>;
};

AgentAvatarGroup.displayName = 'AgentAvatarGroup';

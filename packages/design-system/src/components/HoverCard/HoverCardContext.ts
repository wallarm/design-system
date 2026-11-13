import { createContext } from 'react';

/**
 * Internal. When the pointer comes back while the exit animation still plays, HoverCard provides the
 * frame the exit reached: HoverCardContent turns its CSS enter off and the root animates it up from
 * that frame, instead of the enter restarting from opacity 0. `null` otherwise.
 */
export const HoverCardReopenContext = createContext<Keyframe | null>(null);

/**
 * Internal. `true` under a HoverCard root outside its content: the trigger side. AvatarName reads
 * it to drop its overflow tooltip there, because the card shows the full name anyway and that
 * tooltip would repeat the trigger (a second element with the trigger's id) and flash just before
 * the card replaces it.
 */
export const HoverCardTriggerSideContext = createContext(false);

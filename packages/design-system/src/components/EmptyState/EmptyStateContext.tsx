import { createContext, useContext } from 'react';
import type { EmptyStateType } from './classes';

/**
 * Exposes the root's `type` to the sub-components.
 *
 * Composition alone can't carry this: `collection-empty` and `no-results` are
 * the same tree of slots at two different scales — the medallion, the title
 * type ramp and the message gap all differ — so each slot reads the type
 * rather than the consumer restating it on every child.
 */
const EmptyStateContext = createContext<EmptyStateType>('collection-empty');

export const EmptyStateProvider = EmptyStateContext.Provider;

export const useEmptyStateType = (): EmptyStateType => useContext(EmptyStateContext);

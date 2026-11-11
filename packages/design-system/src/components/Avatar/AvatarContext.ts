import { createContext, useContext } from 'react';

import type { AvatarSize } from './classes';

const AvatarSizeContext = createContext<AvatarSize>('lg');

/** Hands the root's `size` to the plate layers and the name/description text. */
export const AvatarSizeProvider = AvatarSizeContext.Provider;

export const useAvatarSize = () => useContext(AvatarSizeContext);

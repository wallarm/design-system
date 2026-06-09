import { createContext, useContext } from 'react';
import type { BannerColor } from './classes';

const BannerColorContext = createContext<BannerColor>('primary');

/**
 * Provides the active Banner color variant to sub-components so they can
 * derive their own theme-aware tokens (text, icon, link, close) during render.
 */
export const BannerColorProvider = BannerColorContext.Provider;

/** Returns the color variant of the nearest parent Banner. */
export function useBannerColor(): BannerColor {
  return useContext(BannerColorContext);
}

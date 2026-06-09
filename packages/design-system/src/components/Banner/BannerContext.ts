import { createContext, useContext } from 'react';
import type { BannerVariant } from './classes';

const BannerVariantContext = createContext<BannerVariant>('primary');

/**
 * Provides the active Banner variant to sub-components so they can derive their
 * own theme-aware tokens (text, icon, link, close) during render.
 */
export const BannerVariantProvider = BannerVariantContext.Provider;

/** Returns the variant of the nearest parent Banner. */
export function useBannerVariant(): BannerVariant {
  return useContext(BannerVariantContext);
}

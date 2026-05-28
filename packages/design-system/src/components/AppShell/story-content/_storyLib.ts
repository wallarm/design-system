import { findFirstLinkPath, pushPathname } from '../../RemoteShell';
import {
  aiHypervisorNavConfig,
  edgeNavConfig,
  infraDiscoveryNavConfig,
  securityTestingNavConfig,
  settingsNavConfig,
} from './_storyNavConfigs';

const KNOWN_PRODUCTS = [
  'home',
  'edge',
  'ai-hypervisor',
  'infra-discovery',
  'security-testing',
  'settings',
] as const;

export type Product = (typeof KNOWN_PRODUCTS)[number];

export const PRODUCT_CONFIGS: Record<Exclude<Product, 'home'>, { config: typeof edgeNavConfig }> = {
  edge: { config: edgeNavConfig },
  'ai-hypervisor': { config: aiHypervisorNavConfig },
  'infra-discovery': { config: infraDiscoveryNavConfig },
  'security-testing': { config: securityTestingNavConfig },
  settings: { config: settingsNavConfig },
};

export function deriveProduct(pathname: string): Product {
  const segment = pathname.split('/').filter(Boolean)[0];
  if (segment && (KNOWN_PRODUCTS as readonly string[]).includes(segment)) {
    return segment as Product;
  }
  return 'home';
}

export function navigateToProduct(product: Product) {
  if (product === 'home') {
    pushPathname('/home');
    return;
  }
  const { config } = PRODUCT_CONFIGS[product];
  const firstPath = findFirstLinkPath(config.items) ?? '';
  pushPathname(`/${product}/${firstPath}`);
}

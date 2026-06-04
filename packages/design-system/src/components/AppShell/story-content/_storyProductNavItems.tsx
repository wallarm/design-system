import type { FC } from 'react';
import { CircleDashed } from '../../../icons';
import { NavRailItem } from '../../NavRail';
import { navigateToProduct, type Product } from './_storyLib';

interface ProductNavItemsProps {
  activeProduct: Product;
}

export const ProductNavItems: FC<ProductNavItemsProps> = ({ activeProduct }) => (
  <>
    <NavRailItem
      icon={CircleDashed}
      label='Edge'
      shortcut={['G', 'E']}
      active={activeProduct === 'edge'}
      onClick={() => navigateToProduct('edge')}
    />
    <NavRailItem
      icon={CircleDashed}
      label='AI Hypervisor'
      shortcut={['G', 'A']}
      active={activeProduct === 'ai-hypervisor'}
      onClick={() => navigateToProduct('ai-hypervisor')}
    />
    <NavRailItem
      icon={CircleDashed}
      label='Infra Discovery'
      shortcut={['G', 'I']}
      active={activeProduct === 'infra-discovery'}
      onClick={() => navigateToProduct('infra-discovery')}
    />
    <NavRailItem
      icon={CircleDashed}
      label='Security Testing'
      shortcut={['G', 'T']}
      active={activeProduct === 'security-testing'}
      onClick={() => navigateToProduct('security-testing')}
    />
  </>
);

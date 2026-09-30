import type { FC } from 'react';
import { CircleDashed } from '../../../icons';
import { NavRailItem } from '../../NavRail';
import type { Product } from './_storyLib';

interface ProductNavItemsProps {
  activeProduct: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductNavItems: FC<ProductNavItemsProps> = ({ activeProduct, onSelectProduct }) => (
  <>
    <NavRailItem
      icon={CircleDashed}
      label='Edge'
      shortcut={['G', 'E']}
      active={activeProduct === 'edge'}
      onClick={() => onSelectProduct('edge')}
    />
    <NavRailItem
      icon={CircleDashed}
      label='AI Hypervisor'
      shortcut={['G', 'A']}
      active={activeProduct === 'ai-hypervisor'}
      onClick={() => onSelectProduct('ai-hypervisor')}
    />
    <NavRailItem
      icon={CircleDashed}
      label='Infra Discovery'
      shortcut={['G', 'I']}
      active={activeProduct === 'infra-discovery'}
      onClick={() => onSelectProduct('infra-discovery')}
    />
    <NavRailItem
      icon={CircleDashed}
      label='Security Testing'
      shortcut={['G', 'T']}
      active={activeProduct === 'security-testing'}
      onClick={() => onSelectProduct('security-testing')}
    />
  </>
);

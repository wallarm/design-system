import { History } from '../../../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemContent,
  DropdownMenuItemText,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../DropdownMenu';
import { NavRailItem } from '../../NavRail';
import { Text } from '../../Text';

const RECENT_ITEMS = [
  { pageName: 'WAF Rules', productName: 'Edge' },
  { pageName: 'API Sessions', dataPlane: 'US Cloud', productName: 'Edge' },
  { pageName: 'Prompt Inspector', productName: 'AI Hypervisor' },
  { pageName: 'Scanner Results', dataPlane: 'EU Cloud', productName: 'Security Testing' },
  { pageName: 'Asset Inventory', productName: 'Infra Discovery' },
  { pageName: 'Pupu', productName: 'Edge' },
  { pageName: 'Pupupu', dataPlane: 'US Cloud', productName: 'Edge' },
  { pageName: 'PuPuPuuu', productName: 'AI Hypervisor' },
  { pageName: 'MeowMeow', dataPlane: 'EU Cloud', productName: 'Security Testing' },
  { pageName: '...', productName: '....' },
];

export const RecentDropdown = () => (
  <DropdownMenu positioning={{ placement: 'right-start', gutter: 8 }}>
    <DropdownMenuTrigger>
      <NavRailItem icon={History} label='Recent' />
    </DropdownMenuTrigger>

    <DropdownMenuContent className='w-304 h-290 overscroll-none'>
      <DropdownMenuLabel className='sticky top-0 z-10 bg-bg-surface-2'>Recent</DropdownMenuLabel>

      {RECENT_ITEMS.map(item => (
        <DropdownMenuItem key={`${item.pageName}-${item.productName}`}>
          <DropdownMenuItemContent>
            <DropdownMenuItemText>{item.pageName}</DropdownMenuItemText>
            <Text size='xs' color='secondary'>
              {item.dataPlane ? `${item.dataPlane} \u00b7 ${item.productName}` : item.productName}
            </Text>
          </DropdownMenuItemContent>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

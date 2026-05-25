import type { FC, ReactNode } from 'react';
import {
  NavPanel,
  NavPanelBack,
  NavPanelDivider,
  NavPanelGroup,
  NavPanelGroupContent,
  NavPanelGroupItem,
  NavPanelGroupLabel,
  NavPanelHeader,
  NavPanelItem,
  NavPanelSectionHeader,
} from '../NavPanel';
import { findDrillNode } from './navUtils';
import { useProductNavContext } from './ProductNavContext';
import type { NavConfigDrill, NavConfigNode } from './types';

function renderNavItems(
  items: NavConfigNode[],
  activeItemId: string | null,
  onNavigate: (path: string) => void,
  onDrillClick?: (drill: NavConfigDrill) => void,
  level: 'root' | 'group' = 'root',
): ReactNode {
  const result: ReactNode[] = [];

  for (const item of items) {
    if (item.type === 'link') {
      const Item = level === 'group' ? NavPanelGroupItem : NavPanelItem;
      result.push(
        <Item
          key={item.id}
          icon={item.icon}
          active={activeItemId === item.id}
          onClick={() => onNavigate(item.path)}
        >
          {item.label}
        </Item>,
      );
    } else if (item.type === 'group') {
      result.push(
        <NavPanelGroup key={item.id} defaultExpanded={item.defaultExpanded}>
          <NavPanelGroupLabel icon={item.icon}>{item.label}</NavPanelGroupLabel>
          <NavPanelGroupContent>
            {renderNavItems(item.children, activeItemId, onNavigate, onDrillClick, 'group')}
          </NavPanelGroupContent>
        </NavPanelGroup>,
      );
    } else if (item.type === 'section-header') {
      result.push(<NavPanelSectionHeader key={item.id}>{item.label}</NavPanelSectionHeader>);
    } else if (item.type === 'drill') {
      const Item = level === 'group' ? NavPanelGroupItem : NavPanelItem;
      result.push(
        <Item
          key={item.id}
          icon={item.icon}
          active={activeItemId === item.id}
          onClick={() => onDrillClick?.(item)}
        >
          {item.label}
        </Item>,
      );
    }

    if (item.dividerAfter) {
      result.push(<NavPanelDivider key={`divider-${item.id}`} />);
    }
  }

  return result;
}

type ProductNavPanelProps = { resizable?: boolean };

export const ProductNavPanel: FC<ProductNavPanelProps> = ({ resizable }) => {
  const { config, navStack, effectiveActiveItemId, navigate, drillInto, goBack, drillLevel } =
    useProductNavContext();

  const currentEntry = navStack[Math.min(drillLevel, navStack.length - 1)]!;

  if (drillLevel === 0) {
    return (
      <NavPanel resizable={resizable}>
        <NavPanelHeader>{config.productLabel}</NavPanelHeader>
        {renderNavItems(config.items, effectiveActiveItemId, navigate, drillInto)}
      </NavPanel>
    );
  }

  // Drill level: back button + entity header + drill children
  const parentEntry = navStack[drillLevel - 1]!;
  const drillNode = findDrillNode(parentEntry.items, parentEntry.activeItemId);
  const backLabel = drillNode?.label ?? 'Back';

  return (
    <NavPanel resizable={resizable}>
      <div className='sticky top-0 z-10 flex flex-col gap-2 bg-bg-surface-1'>
        <NavPanelHeader>{currentEntry.title}</NavPanelHeader>
        <NavPanelBack onClick={goBack}>{backLabel}</NavPanelBack>
        <NavPanelDivider />
      </div>
      {renderNavItems(currentEntry.items, effectiveActiveItemId, navigate, drillInto)}
    </NavPanel>
  );
};

ProductNavPanel.displayName = 'ProductNavPanel';

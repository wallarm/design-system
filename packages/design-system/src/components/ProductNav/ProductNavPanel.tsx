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
  return items.map(item => {
    if (item.type === 'link') {
      const Item = level === 'group' ? NavPanelGroupItem : NavPanelItem;
      return (
        <Item
          key={item.id}
          icon={item.icon}
          active={activeItemId === item.id}
          onClick={() => onNavigate(item.path)}
        >
          {item.label}
        </Item>
      );
    }

    if (item.type === 'group') {
      return (
        <NavPanelGroup key={item.id} defaultExpanded={item.defaultExpanded}>
          <NavPanelGroupLabel icon={item.icon}>{item.label}</NavPanelGroupLabel>
          <NavPanelGroupContent>
            {renderNavItems(item.children, activeItemId, onNavigate, onDrillClick, 'group')}
          </NavPanelGroupContent>
        </NavPanelGroup>
      );
    }

    if (item.type === 'section-header') {
      return <NavPanelSectionHeader key={item.id}>{item.label}</NavPanelSectionHeader>;
    }

    if (item.type === 'drill') {
      const Item = level === 'group' ? NavPanelGroupItem : NavPanelItem;
      return (
        <Item
          key={item.id}
          icon={item.icon}
          active={activeItemId === item.id}
          onClick={() => onDrillClick?.(item)}
        >
          {item.label}
        </Item>
      );
    }

    return null;
  });
}

type ProductNavPanelProps = { resizable?: boolean };

export const ProductNavPanel: FC<ProductNavPanelProps> = ({ resizable }) => {
  const { config, navStack, effectiveActiveItemId, navigate, drillInto, goBack, drillLevel } =
    useProductNavContext();

  const currentEntry = navStack[Math.min(drillLevel, navStack.length - 1)]!;

  if (drillLevel === 0) {
    const itemsWithDividers: ReactNode[] = [];
    for (const item of config.items) {
      itemsWithDividers.push(
        ...([renderNavItems([item], effectiveActiveItemId, navigate, drillInto)] as ReactNode[]),
      );
      if (item.dividerAfter) {
        itemsWithDividers.push(<NavPanelDivider key={`divider-${item.id}`} />);
      }
    }
    return (
      <NavPanel resizable={resizable}>
        <NavPanelHeader>{config.productLabel}</NavPanelHeader>
        {itemsWithDividers}
      </NavPanel>
    );
  }

  // Drill level: back button + entity header + drill children
  const parentEntry = navStack[drillLevel - 1]!;
  const drillNode = findDrillNode(parentEntry.items, parentEntry.activeItemId);
  const backLabel = drillNode?.label ?? 'Back';

  return (
    <NavPanel resizable={resizable}>
      <NavPanelHeader>{currentEntry.title}</NavPanelHeader>
      <NavPanelBack onClick={goBack}>{backLabel}</NavPanelBack>
      {renderNavItems(currentEntry.items, effectiveActiveItemId, navigate, drillInto)}
    </NavPanel>
  );
};

ProductNavPanel.displayName = 'ProductNavPanel';

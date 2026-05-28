import type { FC } from 'react';
import {
  NavPanelDivider,
  NavPanelGroup,
  NavPanelGroupContent,
  NavPanelGroupItem,
  NavPanelGroupLabel,
  NavPanelItem,
  NavPanelSectionHeader,
} from '../NavPanel';
import type { NavConfigDrill, NavConfigNode } from './model/types';

export type NavItemsListProps = {
  items: NavConfigNode[];
  activeItemId: string | null;
  onNavigate: (path: string) => void;
  onDrillClick?: (drill: NavConfigDrill) => void;
  level?: 'root' | 'group';
};

export const NavItemsList: FC<NavItemsListProps> = ({
  items,
  activeItemId,
  onNavigate,
  onDrillClick,
  level = 'root',
}) => (
  <>
    {items.map(item => {
      const divider = item.dividerAfter ? <NavPanelDivider key={`divider-${item.id}`} /> : null;

      if (item.type === 'link') {
        const Item = level === 'group' ? NavPanelGroupItem : NavPanelItem;
        return (
          <span key={item.id}>
            <Item
              icon={item.icon}
              active={activeItemId === item.id}
              onClick={() => onNavigate(item.path)}
            >
              {item.label}
            </Item>
            {divider}
          </span>
        );
      }

      if (item.type === 'group') {
        return (
          <span key={item.id}>
            <NavPanelGroup defaultExpanded={item.defaultExpanded}>
              <NavPanelGroupLabel icon={item.icon}>{item.label}</NavPanelGroupLabel>
              <NavPanelGroupContent>
                <NavItemsList
                  items={item.children}
                  activeItemId={activeItemId}
                  onNavigate={onNavigate}
                  onDrillClick={onDrillClick}
                  level='group'
                />
              </NavPanelGroupContent>
            </NavPanelGroup>
            {divider}
          </span>
        );
      }

      if (item.type === 'section-header') {
        return (
          <span key={item.id}>
            <NavPanelSectionHeader>{item.label}</NavPanelSectionHeader>
            {divider}
          </span>
        );
      }

      if (item.type === 'drill') {
        const Item = level === 'group' ? NavPanelGroupItem : NavPanelItem;
        return (
          <span key={item.id}>
            <Item
              icon={item.icon}
              active={activeItemId === item.id}
              onClick={() => onDrillClick?.(item)}
            >
              {item.label}
            </Item>
            {divider}
          </span>
        );
      }

      return null;
    })}
  </>
);

NavItemsList.displayName = 'NavItemsList';

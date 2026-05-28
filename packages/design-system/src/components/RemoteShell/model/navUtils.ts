import type { NavConfigDrill, NavConfigNode } from './types';

/** Find the first link path in a config tree (used as default pathname) */
export function findFirstLinkPath(items: NavConfigNode[]): string | null {
  for (const item of items) {
    if (item.type === 'link') return item.path;
    if (item.type === 'group') {
      const found = findFirstLinkPath(item.children);
      if (found) return found;
    }
    if (item.type === 'drill') {
      const found = findFirstLinkPath(item.children);
      if (found) return found;
    }
  }
  return null;
}

/** Find a drill node by ID in a potentially nested item list */
export function findDrillNode(items: NavConfigNode[], id: string | null): NavConfigDrill | null {
  if (!id) return null;
  for (const item of items) {
    if (item.type === 'drill' && item.id === id) return item;
    if (item.type === 'group') {
      const found = findDrillNode(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

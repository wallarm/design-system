import type {
  BreadcrumbSegment,
  NavConfig,
  NavConfigGroup,
  NavConfigNode,
  NavStackEntry,
} from './types';

export interface MatchNavResult {
  navStack: NavStackEntry[];
  breadcrumbSegments: BreadcrumbSegment[];
  activeItemId: string | null;
}

interface FindResult {
  node: NavConfigNode & { type: 'link' | 'drill' };
  /** Chain of groups traversed to reach this node (outermost first) */
  groupPath: NavConfigGroup[];
}

/**
 * Finds a matching node in the items list for a given URL segment.
 * Groups are transparent — their children are searched as if they were at the parent level.
 * Returns the found node along with the chain of groups traversed to reach it.
 */
const findMatchingNode = (
  items: NavConfigNode[],
  segment: string,
  groupPath: NavConfigGroup[] = [],
): FindResult | null => {
  for (const item of items) {
    if (item.type === 'section-header') continue;
    if (item.type === 'group') {
      // Groups don't consume URL segments — search their children
      const found = findMatchingNode(item.children, segment, [...groupPath, item]);
      if (found) return found;
    } else if (item.path === segment) {
      return { node: item, groupPath };
    }
  }
  return null;
};

/**
 * Pure function. Matches pathname against nav config.
 *
 * - `link` → single URL segment (`{path}`)
 * - `drill` → segment + dynamic param (`{path}/:param/...`), pushes new stack level
 * - `group` → NO URL segment, children promoted to parent level
 *
 * Called via useMemo on every pathname change.
 */
export const matchNav = (pathname: string, config: NavConfig): MatchNavResult => {
  const segments = pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);

  const navStack: NavStackEntry[] = [];
  const breadcrumbSegments: BreadcrumbSegment[] = [];
  let activeItemId: string | null = null;

  // Root stack entry
  const rootEntry: NavStackEntry = {
    title: config.productLabel,
    parentLabel: null,
    items: config.items,
    activeItemId: null,
  };

  navStack.push(rootEntry);

  // First breadcrumb segment is always a link to the product root
  breadcrumbSegments.push({
    type: 'link',
    label: config.productLabel,
    href: config.productPath,
  });

  let segmentIndex = 0;
  let currentItems = config.items;
  let currentStackEntry = rootEntry;

  while (segmentIndex < segments.length) {
    const seg = segments[segmentIndex] as string;
    const result = findMatchingNode(currentItems, seg);

    if (!result) break;

    const { node: match, groupPath } = result;

    if (match.type === 'link') {
      currentStackEntry.activeItemId = match.id;
      activeItemId = match.id;
      segmentIndex++;
      // Add static breadcrumb segments for each group in the ancestry chain
      for (const group of groupPath) {
        breadcrumbSegments.push({ type: 'static', label: group.label });
      }
      // Last segment → static breadcrumb
      breadcrumbSegments.push({
        type: 'static',
        label: match.label,
      });
      break;
    }

    if (match.type === 'drill') {
      const drillStartIndex = segmentIndex;
      currentStackEntry.activeItemId = match.id;
      segmentIndex++;

      // After drill path, next segment is the dynamic param value
      if (segmentIndex >= segments.length) {
        // Drill path matched but no param value — active on drill itself
        activeItemId = match.id;
        breadcrumbSegments.push({
          type: 'static',
          label: match.label,
        });
        break;
      }

      const paramValue = segments[segmentIndex] as string;
      segmentIndex++;

      // Resolve entity label from the drill's entities list (fall back to raw param value)
      const matchedEntity = match.entities?.find(e => e.id === paramValue);
      const entityLabel = matchedEntity?.label ?? paramValue;

      // Build scope items from drill entities (if provided)
      const prefixSegments = segments.slice(0, drillStartIndex);
      const childPath = segments.slice(segmentIndex).join('/');
      const scopeItems = match.entities?.map(e => {
        const parts = [...prefixSegments, match.path, e.id];
        if (childPath) parts.push(childPath);
        return {
          id: e.id,
          label: e.label,
          description: e.description,
          href: `/${parts.join('/')}`,
        };
      });

      // Scope-switcher breadcrumb for drill
      breadcrumbSegments.push({
        type: 'scope-switcher',
        label: entityLabel,
        href: `/${segments.slice(0, segmentIndex).join('/')}`,
        paramValue,
        scopeItems,
      });

      // Push new stack level for drill's children
      const drillEntry: NavStackEntry = {
        title: entityLabel,
        parentLabel: currentStackEntry.title,
        items: match.children,
        activeItemId: null,
      };

      navStack.push(drillEntry);
      currentItems = match.children;
      currentStackEntry = drillEntry;

      // If no more segments, we're at the drill level root
      if (segmentIndex >= segments.length) {
        activeItemId = null;
        break;
      }

      continue;
    }
  }

  // If no active item was found, try to keep the last stack entry's activeItemId
  const lastEntry = navStack[navStack.length - 1];
  if (activeItemId === null && lastEntry) {
    activeItemId = lastEntry.activeItemId;
  }

  return { navStack, breadcrumbSegments, activeItemId };
};

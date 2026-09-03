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
 * Finds a node with a literal `path` match for a given URL segment.
 * Groups are transparent — their children are searched as if they were at the parent level.
 * Returns the found node along with the chain of groups traversed to reach it.
 *
 * Does not consider pathless drills (`path === ''`) — see `findPathlessDrill` for those.
 * A literal match always takes priority, so callers must try this first.
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
 * Collects every pathless drill (`path === ''`) reachable from `items`, looking through
 * groups the same way `findMatchingNode` does — groups are transparent, so "the same nav
 * level" includes their children too.
 */
const findPathlessDrills = (
  items: NavConfigNode[],
  groupPath: NavConfigGroup[] = [],
): FindResult[] => {
  const found: FindResult[] = [];
  for (const item of items) {
    if (item.type === 'section-header') continue;
    if (item.type === 'group') {
      found.push(...findPathlessDrills(item.children, [...groupPath, item]));
    } else if (item.type === 'drill' && item.path === '') {
      found.push({ node: item, groupPath });
    }
  }
  return found;
};

/**
 * Finds the pathless drill (if any) that should claim the current URL segment as its
 * param. Only ever called after `findMatchingNode` has failed to find a literal match,
 * so a pathless drill never shadows a sibling with a real path.
 *
 * At most one pathless drill is supported per nav level. If a config declares more than
 * one, the first one found (groups searched in declaration order) is used, and in
 * development a warning is logged — see `foldUtils.validateFolds` for the same
 * dev-warn/first-wins pattern used elsewhere in this codebase for invalid config.
 */
const findPathlessDrill = (items: NavConfigNode[]): FindResult | null => {
  const candidates = findPathlessDrills(items);
  if (candidates.length === 0) return null;

  if (candidates.length > 1 && process.env.NODE_ENV !== 'production') {
    console.warn(
      `[RemoteShell] Multiple pathless drills found at the same nav level (${candidates
        .map(c => c.node.id)
        .join(', ')}). Only one pathless drill per level is supported — using "${
        candidates[0]!.node.id
      }".`,
    );
  }

  return candidates[0]!;
};

/**
 * Pure function. Matches pathname against nav config.
 *
 * - `link` → single URL segment (`{path}`)
 * - `drill` → segment + dynamic param (`{path}/:param/...`), pushes new stack level.
 *   A drill may declare `path: ''` (pathless): it consumes no segment of its own, so the
 *   param sits where the path would have been (`/:param/...`). A literal sibling `path`
 *   always matches before a pathless drill claims the segment (see `findPathlessDrill`).
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
    segmentCount: 0,
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
    // Literal matches always win; a pathless drill only claims the segment when nothing
    // at this level matched it literally.
    const result = findMatchingNode(currentItems, seg) ?? findPathlessDrill(currentItems);

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
      const isPathless = match.path === '';
      const drillStartIndex = segmentIndex;
      currentStackEntry.activeItemId = match.id;

      let paramValue: string;

      if (isPathless) {
        // Pathless drill: there is no path segment to consume — the current segment
        // (already matched by findPathlessDrill) is itself the param value.
        paramValue = seg;
        segmentIndex++;
      } else {
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

        paramValue = segments[segmentIndex] as string;
        segmentIndex++;
      }

      // Resolve entity label from the drill's entities list (fall back to raw param value)
      const matchedEntity = match.entities?.find(e => e.id === paramValue);
      const entityLabel = matchedEntity?.label ?? paramValue;

      // Build scope items from drill entities (if provided)
      const prefixSegments = segments.slice(0, drillStartIndex);
      const childPath = segments.slice(segmentIndex).join('/');
      const scopeItems = match.entities?.map(e => {
        // Pathless drills contribute no path segment — skip it so no empty segment
        // (`''`) leaks into the built href (which would render as `//`).
        const parts = isPathless
          ? [...prefixSegments, e.id]
          : [...prefixSegments, match.path, e.id];
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
        // A normal drill consumes 2 segments (path + param); a pathless drill consumes 1.
        segmentCount: currentStackEntry.segmentCount + (isPathless ? 1 : 2),
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

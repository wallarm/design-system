import type { ComponentType } from 'react';
import type { SvgIconProps } from '../../../icons/SvgIcon';

export interface NavConfigHeaderAction {
  icon: ComponentType<SvgIconProps>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface NavConfig {
  productLabel: string;
  productPath: string;
  items: NavConfigNode[];
  headerActions?: NavConfigHeaderAction[];
}

export type NavConfigNode =
  | NavConfigLink
  | NavConfigDrill
  | NavConfigGroup
  | NavConfigSectionHeader;

export interface NavConfigLink {
  type: 'link';
  id: string;
  label: string;
  path: string;
  icon?: ComponentType<SvgIconProps>;
  dividerAfter?: boolean;
}

export interface NavConfigDrill {
  type: 'drill';
  id: string;
  label: string;
  /**
   * URL segment for this drill (`{path}/:param/...`). Pass `''` for a **pathless drill**:
   * it consumes no segment of its own, so the dynamic param sits where the path would have
   * been (`/:param/...`). At most one pathless drill is supported per nav level (including
   * across transparent groups); a literal sibling path always matches before a pathless
   * drill claims the segment.
   */
  path: string;
  /** URL parameter name for the dynamic segment */
  param: string;
  children: NavConfigNode[];
  icon?: ComponentType<SvgIconProps>;
  /** Available entities for the drill scope-switcher dropdown */
  entities?: { id: string; label: string; description?: string }[];
  dividerAfter?: boolean;
}

export interface NavConfigGroup {
  type: 'group';
  id: string;
  label: string;
  children: NavConfigNode[];
  icon?: ComponentType<SvgIconProps>;
  defaultExpanded?: boolean;
  dividerAfter?: boolean;
}

export interface NavConfigSectionHeader {
  type: 'section-header';
  id: string;
  label: string;
  dividerAfter?: boolean;
}

export interface NavStackEntry {
  title: string;
  parentLabel: string | null;
  items: NavConfigNode[];
  activeItemId: string | null;
  /**
   * Number of pathname segments consumed to reach this stack level (0 for the root).
   * A normal drill consumes 2 segments (its path, then the param); a pathless drill
   * consumes 1 (just the param). Used to rebuild the URL prefix for the current level
   * without assuming a fixed 2-segments-per-level ratio.
   */
  segmentCount: number;
}

export interface BreadcrumbSegment {
  type: 'link' | 'scope-switcher' | 'static';
  label: string;
  href?: string;
  /** Present on scope-switcher segments. Current entity parameter value. */
  paramValue?: string;
  /** Present on scope-switcher segments. Built scope items with hrefs for the dropdown. */
  scopeItems?: { id: string; label: string; description?: string; href: string }[];
}

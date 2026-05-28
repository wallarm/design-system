import type { ComponentType } from 'react';
import type { SvgIconProps } from '../../icons/SvgIcon';

export interface NavConfigHeaderAction {
  icon: ComponentType<SvgIconProps>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface NavConfig {
  productLabel: string;
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
  path: string;
  /** URL parameter name for the dynamic segment */
  param: string;
  children: NavConfigNode[];
  icon?: ComponentType<SvgIconProps>;
  /** Available entities for the drill scope-switcher dropdown */
  entities?: { id: string; label: string; description?: string }[];
  /** Render a visual divider after this item */
  dividerAfter?: boolean;
}

export interface NavConfigGroup {
  type: 'group';
  id: string;
  label: string;
  children: NavConfigNode[];
  icon?: ComponentType<SvgIconProps>;
  defaultExpanded?: boolean;
  /** Render a visual divider after this item */
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

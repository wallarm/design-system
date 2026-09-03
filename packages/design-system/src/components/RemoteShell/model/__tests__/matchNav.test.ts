import { describe, expect, it, vi } from 'vitest';
import { matchNav } from '../matchNav';
import type { NavConfig, NavConfigDrill, NavConfigLink } from '../types';

const overviewLink: NavConfigLink = {
  type: 'link',
  id: 'overview',
  label: 'Overview',
  path: 'overview',
};

const settingsLink: NavConfigLink = {
  type: 'link',
  id: 'settings',
  label: 'Settings',
  path: 'settings',
};

/** A normal drill: `/deployment/:uid/...` */
const deploymentDrill: NavConfigDrill = {
  type: 'drill',
  id: 'deployment',
  label: 'Deployment',
  path: 'deployment',
  param: 'uid',
  children: [overviewLink, settingsLink],
  entities: [
    { id: 'd1', label: 'Deployment One' },
    { id: 'd2', label: 'Deployment Two' },
  ],
};

/** A pathless drill: `/:uid/...` — no literal segment of its own. */
const applicationDrill: NavConfigDrill = {
  type: 'drill',
  id: 'application',
  label: 'Application',
  path: '',
  param: 'uid',
  children: [overviewLink, settingsLink],
  entities: [
    { id: 'a1', label: 'App One' },
    { id: 'a2', label: 'App Two' },
  ],
};

const baseConfig = (items: NavConfig['items']): NavConfig => ({
  productLabel: 'Product',
  productPath: '/product',
  items,
});

describe('matchNav — existing behaviour (regression)', () => {
  it('matches a top-level link and sets the active item', () => {
    const config = baseConfig([overviewLink, settingsLink]);
    const result = matchNav('/settings', config);

    expect(result.activeItemId).toBe('settings');
    expect(result.navStack).toHaveLength(1);
    expect(result.navStack[0]).toMatchObject({ segmentCount: 0 });
    expect(result.breadcrumbSegments).toEqual([
      { type: 'link', label: 'Product', href: '/product' },
      { type: 'static', label: 'Settings' },
    ]);
  });

  it('matches a link nested inside a transparent group, without pushing a stack level', () => {
    const config = baseConfig([
      {
        type: 'group',
        id: 'group-1',
        label: 'Group One',
        children: [overviewLink],
      },
    ]);
    const result = matchNav('/overview', config);

    expect(result.activeItemId).toBe('overview');
    expect(result.navStack).toHaveLength(1);
    expect(result.breadcrumbSegments).toEqual([
      { type: 'link', label: 'Product', href: '/product' },
      { type: 'static', label: 'Group One' },
      { type: 'static', label: 'Overview' },
    ]);
  });

  it('a normal drill matches /<path>/<id>/<section> and pushes one stack level', () => {
    const config = baseConfig([deploymentDrill]);
    const result = matchNav('/deployment/d1/overview', config);

    expect(result.activeItemId).toBe('overview');
    expect(result.navStack).toHaveLength(2);
    expect(result.navStack[0]).toMatchObject({ segmentCount: 0 });
    expect(result.navStack[1]).toMatchObject({
      title: 'Deployment One',
      items: deploymentDrill.children,
      segmentCount: 2,
    });

    const scopeSegment = result.breadcrumbSegments.find(s => s.type === 'scope-switcher');
    expect(scopeSegment).toMatchObject({
      label: 'Deployment One',
      href: '/deployment/d1',
      paramValue: 'd1',
    });
    expect(scopeSegment?.scopeItems).toEqual([
      {
        id: 'd1',
        label: 'Deployment One',
        description: undefined,
        href: '/deployment/d1/overview',
      },
      {
        id: 'd2',
        label: 'Deployment Two',
        description: undefined,
        href: '/deployment/d2/overview',
      },
    ]);
  });

  it('a drill with a matched path but no param value is active on itself (no stack push)', () => {
    const config = baseConfig([deploymentDrill]);
    const result = matchNav('/deployment', config);

    expect(result.activeItemId).toBe('deployment');
    expect(result.navStack).toHaveLength(1);
    expect(result.breadcrumbSegments).toEqual([
      { type: 'link', label: 'Product', href: '/product' },
      { type: 'static', label: 'Deployment' },
    ]);
  });

  it('an unmatched segment stops matching and leaves the root active item null', () => {
    const config = baseConfig([overviewLink]);
    const result = matchNav('/does-not-exist', config);

    expect(result.activeItemId).toBeNull();
    expect(result.navStack).toHaveLength(1);
  });
});

describe('matchNav — pathless drill', () => {
  it('a pathless drill matches /<id>/<section>', () => {
    const config = baseConfig([applicationDrill]);
    const result = matchNav('/a1/overview', config);

    expect(result.activeItemId).toBe('overview');
    expect(result.navStack).toHaveLength(2);
    expect(result.navStack[0]).toMatchObject({ segmentCount: 0 });
    expect(result.navStack[1]).toMatchObject({
      title: 'App One',
      items: applicationDrill.children,
      // A pathless drill consumes only 1 segment (the param), not 2.
      segmentCount: 1,
    });

    const scopeSegment = result.breadcrumbSegments.find(s => s.type === 'scope-switcher');
    expect(scopeSegment).toMatchObject({
      label: 'App One',
      href: '/a1',
      paramValue: 'a1',
    });
  });

  it('scope-switcher hrefs contain no // for a pathless drill, and are unchanged for a normal one', () => {
    const pathlessConfig = baseConfig([applicationDrill]);
    const pathlessResult = matchNav('/a1/overview', pathlessConfig);
    const pathlessScope = pathlessResult.breadcrumbSegments.find(s => s.type === 'scope-switcher');

    expect(pathlessScope?.href).not.toContain('//');
    for (const item of pathlessScope?.scopeItems ?? []) {
      expect(item.href).not.toContain('//');
    }
    expect(pathlessScope?.scopeItems).toEqual([
      { id: 'a1', label: 'App One', description: undefined, href: '/a1/overview' },
      { id: 'a2', label: 'App Two', description: undefined, href: '/a2/overview' },
    ]);

    const normalConfig = baseConfig([deploymentDrill]);
    const normalResult = matchNav('/deployment/d1/overview', normalConfig);
    const normalScope = normalResult.breadcrumbSegments.find(s => s.type === 'scope-switcher');

    expect(normalScope?.href).not.toContain('//');
    for (const item of normalScope?.scopeItems ?? []) {
      expect(item.href).not.toContain('//');
    }
    // Unchanged from pre-pathless-drill behaviour.
    expect(normalScope?.scopeItems).toEqual([
      {
        id: 'd1',
        label: 'Deployment One',
        description: undefined,
        href: '/deployment/d1/overview',
      },
      {
        id: 'd2',
        label: 'Deployment Two',
        description: undefined,
        href: '/deployment/d2/overview',
      },
    ]);
  });

  it('a literal sibling wins over a pathless drill at the same level', () => {
    const listLink: NavConfigLink = { type: 'link', id: 'list', label: 'List', path: 'list' };
    const config = baseConfig([listLink, applicationDrill]);

    // The literal path 'list' must resolve to the link, not be swallowed as an entity id.
    const listResult = matchNav('/list', config);
    expect(listResult.activeItemId).toBe('list');
    expect(listResult.navStack).toHaveLength(1);

    // A segment that isn't any sibling's literal path still falls through to the
    // pathless drill.
    const drillResult = matchNav('/a1/overview', config);
    expect(drillResult.activeItemId).toBe('overview');
    expect(drillResult.navStack).toHaveLength(2);
  });

  it('a pathless drill inside a group is still found (groups are transparent)', () => {
    const config = baseConfig([
      {
        type: 'group',
        id: 'group-1',
        label: 'Group One',
        children: [applicationDrill],
      },
    ]);
    const result = matchNav('/a1/overview', config);

    expect(result.activeItemId).toBe('overview');
    expect(result.navStack).toHaveLength(2);
    expect(result.navStack[1]).toMatchObject({ segmentCount: 1 });
  });

  it('a pathless drill with no further segment after the id sits at its own drill-level root', () => {
    const config = baseConfig([applicationDrill]);
    const result = matchNav('/a1', config);

    expect(result.activeItemId).toBeNull();
    expect(result.navStack).toHaveLength(2);
    expect(result.navStack[1]).toMatchObject({ segmentCount: 1, activeItemId: null });

    const scopeSegment = result.breadcrumbSegments.find(s => s.type === 'scope-switcher');
    expect(scopeSegment).toMatchObject({ label: 'App One', paramValue: 'a1' });
  });

  it('a pathless drill never claims a segment when there is no segment at all (bare product root)', () => {
    const config = baseConfig([applicationDrill]);
    const result = matchNav('/', config);

    expect(result.activeItemId).toBeNull();
    expect(result.navStack).toHaveLength(1);
    expect(result.breadcrumbSegments).toEqual([
      { type: 'link', label: 'Product', href: '/product' },
    ]);
  });

  it('a normal drill nested inside a pathless drill children matches correctly', () => {
    const nestedConfig = baseConfig([
      {
        ...applicationDrill,
        children: [deploymentDrill],
      },
    ]);
    const result = matchNav('/a1/deployment/d1/overview', nestedConfig);

    expect(result.activeItemId).toBe('overview');
    expect(result.navStack).toHaveLength(3);
    expect(result.navStack[0]).toMatchObject({ segmentCount: 0 });
    expect(result.navStack[1]).toMatchObject({ title: 'App One', segmentCount: 1 });
    expect(result.navStack[2]).toMatchObject({ title: 'Deployment One', segmentCount: 3 });
  });

  it('warns and uses the first pathless drill when a config declares more than one at the same level', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const secondPathlessDrill: NavConfigDrill = {
      ...applicationDrill,
      id: 'second-pathless',
      label: 'Second Pathless',
    };
    const config = baseConfig([applicationDrill, secondPathlessDrill]);

    const result = matchNav('/a1/overview', config);

    expect(result.activeItemId).toBe('overview');
    expect(result.navStack[0]?.activeItemId).toBe('application');
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Multiple pathless drills found at the same nav level'),
    );
    warn.mockRestore();
  });

  it('warns when the two pathless drills sit inside different groups at the same level', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const secondPathlessDrill: NavConfigDrill = {
      ...applicationDrill,
      id: 'second-pathless',
      label: 'Second Pathless',
    };
    const config = baseConfig([
      { type: 'group', id: 'g1', label: 'G1', children: [applicationDrill] },
      { type: 'group', id: 'g2', label: 'G2', children: [secondPathlessDrill] },
    ]);

    const result = matchNav('/a1/overview', config);

    expect(result.activeItemId).toBe('overview');
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Multiple pathless drills found at the same nav level'),
    );
    warn.mockRestore();
  });
});

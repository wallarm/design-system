import type { RefObject } from 'react';
import { useCallback, useEffect, useReducer, useState } from 'react';
import type { AnchorBounds } from '../../lib';
import { useFilterInputPositioning } from '../useFilterInputPositioning';

interface UseMenuPositioningOptions {
  containerRef: RefObject<HTMLElement | null>;
  buildingChipRef: RefObject<HTMLElement | null>;
  inputRef?: RefObject<HTMLElement | null>;
  isBuilding: boolean;
  insertIndex: number;
}

/**
 * Manages dropdown menu positioning relative to the active chip / segment / input.
 *
 * Anchor resolution (highest priority first):
 *   1. Explicit element passed via `setMenuAnchor` — set when a chip segment is
 *      clicked or the Backspace cascade walks to a different building segment.
 *   2. Building chip ref (for operator/value menus while a chip is being built).
 *   3. Input ref (for the field menu, before a chip exists).
 *   4. Container rect (fallback).
 *
 * The active element is observed with a ResizeObserver so that when the segment
 * grows/shrinks as the user types — or other chips relayout around it — the
 * dropdown follows. The observer bumps a `tick` counter which is part of the
 * `getAnchorBounds` deps, forcing Ark UI to recompute the floating position.
 */
export const useMenuPositioning = ({
  containerRef,
  buildingChipRef,
  inputRef,
  isBuilding,
  insertIndex,
}: UseMenuPositioningOptions) => {
  const [editingEl, setEditingEl] = useState<HTMLElement | null>(null);
  // Counter bumped by ResizeObserver on the active anchor element — used as a
  // memo dep so `getAnchorBounds` reference changes and Ark recomputes the rect.
  const [tick, forceTick] = useReducer((x: number) => x + 1, 0);

  const setMenuAnchor = useCallback((el: HTMLElement | null) => {
    setEditingEl(el);
  }, []);

  const resetMenuAnchor = useCallback(() => {
    setEditingEl(null);
  }, []);

  // Track size changes of the active anchor (and the building chip / container
  // as fallbacks) so the menu keeps up with sub-segment growth from typing.
  useEffect(() => {
    const targets = new Set<HTMLElement>();
    if (editingEl) targets.add(editingEl);
    if (buildingChipRef.current) targets.add(buildingChipRef.current);
    if (containerRef.current) targets.add(containerRef.current);
    if (targets.size === 0) return;
    const observer = new ResizeObserver(() => forceTick());
    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, [editingEl, buildingChipRef, containerRef]);

  // `tick` is intentionally listed as a dep so the callback identity changes on
  // every observer firing — Ark UI uses the new identity as the cue to recompute
  // the floating position. biome flags it as unused (we don't read it in the
  // body) but removing it breaks live re-positioning.
  // biome-ignore lint/correctness/useExhaustiveDependencies: tick triggers recompute
  const getAnchorBounds = useCallback(
    (containerRect: DOMRect): AnchorBounds => {
      if (editingEl) {
        const r = editingEl.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left };
      }
      if (isBuilding && buildingChipRef.current) {
        const r = buildingChipRef.current.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left };
      }
      if (inputRef?.current) {
        const r = inputRef.current.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left };
      }
      return {
        top: containerRect.top,
        bottom: containerRect.bottom,
        left: containerRect.left,
      };
    },
    [editingEl, isBuilding, buildingChipRef, inputRef, tick],
  );

  const menuPositioning = useFilterInputPositioning(
    { containerRef, getAnchorBounds },
    // insertIndex forces recalculation when input moves between chips
    [insertIndex],
  );

  return { menuPositioning, setMenuAnchor, resetMenuAnchor };
};

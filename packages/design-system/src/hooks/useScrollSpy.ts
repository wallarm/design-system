import { useEffect, useRef, useState } from 'react';

export interface UseScrollSpyOptions {
  /** Section element ids, in document order. */
  ids: string[];
  /**
   * Scroll container. `undefined` → the window; `null` → not mounted yet, the hook stays idle
   * (callback-ref state is `null` on the first render).
   */
  root?: HTMLElement | null;
  /** Distance in px from the container top that counts as the reading line. Default `0`. */
  offset?: number;
  /** Scroll behavior for `scrollTo`. Default `'smooth'`. */
  behavior?: ScrollBehavior;
}

export interface UseScrollSpyResult {
  /** The section being read: the last one whose top is at or above the reading line. */
  activeId: string | undefined;
  /** Scrolls the section's top to the reading line and makes it active right away. */
  scrollTo: (id: string) => void;
}

/** No scroll event for this long means a `scrollTo` has settled (browsers without `scrollend`). */
const SETTLE_MS = 100;
const USER_SCROLL_EVENTS = ['wheel', 'touchstart'] as const;

const containerTop = (root: HTMLElement | undefined) => root?.getBoundingClientRect().top ?? 0;

const isAtBottom = (root: HTMLElement | undefined) => {
  const scrollHeight = root ? root.scrollHeight : document.documentElement.scrollHeight;
  const clientHeight = root ? root.clientHeight : window.innerHeight;
  const scrollTop = root ? root.scrollTop : window.scrollY;
  // A container that does not scroll is never "at the bottom".
  return scrollHeight > clientHeight && scrollTop + clientHeight >= scrollHeight - 1;
};

const measure = (ids: string[], root: HTMLElement | undefined, offset: number) => {
  const top = containerTop(root);
  const present = ids.filter(id => document.getElementById(id));
  if (present.length === 0) return undefined;
  if (isAtBottom(root)) return present[present.length - 1];
  let active = present[0];
  for (const id of present) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top - top <= offset) active = id;
  }
  return active;
};

/**
 * Tracks which section of a scrolling page is being read, and scrolls to a section.
 * Independent of any component — feed `activeId` / `scrollTo` into `TableOfContents`,
 * `Tabs` or `SegmentedTabs`.
 *
 * @example
 * const [root, setRoot] = useState<HTMLElement | null>(null);
 * const { activeId, scrollTo } = useScrollSpy({ ids: ['intro', 'usage'], root, offset: 16 });
 *
 * <div ref={setRoot} className='overflow-y-auto'>…sections with matching ids…</div>
 * <TableOfContents value={activeId} onValueChange={scrollTo}>
 *   <TableOfContentsItem value='intro'>Intro</TableOfContentsItem>
 *   <TableOfContentsItem value='usage'>Usage</TableOfContentsItem>
 * </TableOfContents>
 */
export const useScrollSpy = ({
  ids,
  root,
  offset = 0,
  behavior = 'smooth',
}: UseScrollSpyOptions): UseScrollSpyResult => {
  const [measured, setMeasured] = useState<string | undefined>(undefined);
  // While a scrollTo is in flight, measurements are ignored so passing sections don't flash.
  const lockedRef = useRef(false);
  // Set by the effect: re-arms the settle timer. Called from scrollTo (a handler).
  const settleRef = useRef<(() => void) | undefined>(undefined);

  // Never return an id that left `ids` (sections removed between renders).
  const activeId = measured !== undefined && ids.includes(measured) ? measured : ids[0];

  // Stable dependency for the effect while callers pass a fresh array each render.
  const idsKey = ids.join('\n');

  useEffect(() => {
    if (root === null) return;
    const container = root ?? undefined;
    const sectionIds = idsKey ? idsKey.split('\n') : [];
    const target: HTMLElement | Window = container ?? window;
    let frame = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      frame = 0;
      const next = measure(sectionIds, container, offset);
      if (next !== undefined) setMeasured(next);
    };
    const unlock = () => {
      clearTimeout(settleTimer);
      lockedRef.current = false;
      update();
    };
    const settle = () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(unlock, SETTLE_MS);
    };
    const onScroll = () => {
      if (lockedRef.current) {
        settle();
        return;
      }
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onScrollEnd = () => {
      if (lockedRef.current) unlock();
    };
    const onUserScroll = () => {
      clearTimeout(settleTimer);
      lockedRef.current = false;
    };

    settleRef.current = settle;
    update();

    target.addEventListener('scroll', onScroll, { passive: true });
    target.addEventListener('scrollend', onScrollEnd);
    for (const type of USER_SCROLL_EVENTS) {
      target.addEventListener(type, onUserScroll, { passive: true });
    }
    window.addEventListener('keydown', onUserScroll);
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      target.removeEventListener('scroll', onScroll);
      target.removeEventListener('scrollend', onScrollEnd);
      for (const type of USER_SCROLL_EVENTS) target.removeEventListener(type, onUserScroll);
      window.removeEventListener('keydown', onUserScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(settleTimer);
      lockedRef.current = false;
      settleRef.current = undefined;
    };
  }, [root, idsKey, offset]);

  const scrollTo = (id: string) => {
    if (root === null) return;
    const el = document.getElementById(id);
    if (!el) return;
    const container = root ?? undefined;
    const current = container ? container.scrollTop : window.scrollY;
    const top = el.getBoundingClientRect().top - containerTop(container) + current - offset;
    lockedRef.current = true;
    settleRef.current?.();
    setMeasured(id);
    (container ?? window).scrollTo({ top, behavior });
  };

  return { activeId, scrollTo };
};

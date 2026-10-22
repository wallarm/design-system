import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BrowserOnly } from '@rspress/core/runtime';
import { collectSlots } from './collectSlots';
import { StoryError, StoryPlaceholder } from './StoryPreview';
import { useInView } from './useInView';
import { type StoryLoader, useStory } from './useStory';

export interface ExplorerProps {
  load: StoryLoader;
  name: string;
}

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const RSPRESS_ROOTS = new Set(['__rspress_root', '__rspress_modal_container']);

/** Body children other than the Rspress app and our overlay — where DS portals land. */
function portalRoots(overlay: Element | null): Element[] {
  return [...document.body.children].filter(el => !RSPRESS_ROOTS.has(el.id) && el !== overlay);
}

function scanRoots(container: Element | null, overlay: Element | null): Element[] {
  return container ? [container, ...portalRoots(overlay)] : [];
}

function Anatomy({ load, name }: ExplorerProps) {
  const { Story, error } = useStory(load, name);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const active = hovered ?? pinned;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const rescan = () => setSlots(collectSlots(scanRoots(container, overlayRef.current)));
    rescan();
    const observer = new MutationObserver(records => {
      // Our own outline updates are not story changes.
      if (records.every(r => overlayRef.current?.contains(r.target))) return;
      rescan();
    });
    observer.observe(container, { childList: true, subtree: true });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Re-measure on every rescan (`slots` is a fresh array each time) so outlines follow the DOM.
  useEffect(() => {
    if (!active || !slots.includes(active)) {
      setBoxes([]);
      return;
    }
    const matches = scanRoots(containerRef.current, overlayRef.current).flatMap(root => [
      ...(root.matches(`[data-slot="${active}"]`) ? [root] : []),
      ...root.querySelectorAll(`[data-slot="${active}"]`),
    ]);
    setBoxes(
      matches.map(el => {
        const r = el.getBoundingClientRect();
        return {
          top: r.top + window.scrollY,
          left: r.left + window.scrollX,
          width: r.width,
          height: r.height,
        };
      }),
    );
  }, [active, slots]);

  const togglePin = (slot: string) => setPinned(current => (current === slot ? null : slot));

  return (
    <div className='rp-not-doc my-16 flex gap-16 rounded-12 border border-border-primary-light p-16'>
      <div ref={containerRef} className='flex min-h-120 flex-1 items-center justify-center'>
        {error ? <StoryError error={error} /> : Story && <Story />}
      </div>
      {/* Modal stories cover the page and set `pointer-events: none` on <body>: lift the list above them. */}
      <ul className='pointer-events-auto relative z-[2147483646] flex w-200 shrink-0 flex-col gap-2 border-l border-border-primary-light pl-16'>
        {slots.map(slot => (
          <li key={slot}>
            <button
              type='button'
              aria-pressed={pinned === slot}
              className={
                pinned === slot
                  ? 'w-full rounded-6 bg-bg-light-brand px-8 py-4 text-left font-mono text-sm text-text-primary'
                  : 'w-full rounded-6 px-8 py-4 text-left font-mono text-sm text-text-secondary hover:bg-bg-light-primary'
              }
              onMouseEnter={() => setHovered(slot)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(slot)}
              onBlur={() => setHovered(null)}
              onClick={() => togglePin(slot)}
            >
              {slot}
            </button>
          </li>
        ))}
      </ul>
      {createPortal(
        <div ref={overlayRef} className='pointer-events-none absolute top-0 left-0 z-[2147483647]'>
          {boxes.map(box => (
            <div
              key={`${box.top}:${box.left}:${box.width}:${box.height}`}
              className='absolute rounded-2 border-2 border-border-strong-brand'
              style={box}
            />
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

/** Mounts the anatomy view (and loads its story) only once it scrolls near the viewport. */
function LazyAnatomy(props: ExplorerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  if (inView) return <Anatomy {...props} />;
  return (
    <div ref={ref} className='my-16'>
      <StoryPlaceholder />
    </div>
  );
}

/** Client-only anatomy view: lists the story's `data-slot`s and outlines them on hover/click. */
export function Explorer(props: ExplorerProps) {
  if (import.meta.env.SSG_MD) return null;
  return <BrowserOnly fallback={null}>{() => <LazyAnatomy {...props} />}</BrowserOnly>;
}

// Rspress injects markdown.globalComponents as default imports.
export default Explorer;

import {
  type FC,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { type DismissableElementOptions, trackDismissableElement } from '@zag-js/dismissable';
import { trapFocus } from '@zag-js/focus-trap';
import { createPortal } from 'react-dom';

import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';

export interface CodeSnippetFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  children: ReactNode;
}

/**
 * Fullscreen fills the viewport inset: the sizing/margin resets make `cn` drop conflicting
 * consumer utilities (e.g. `h-[240px]`, `max-w-[600px]`, `mx-auto`) while fullscreen is on.
 *
 * z-index follows the drawer/dialog formula (overlay 40, content 50, +20 per layer): the host
 * is a zag layer while fullscreen, so `--layer-index` stacks the frame above the drawer or
 * dialog it was opened from (standalone: layer 0, i.e. 40/50).
 */
const FULLSCREEN_CLASSES = cn(
  'fixed inset-16 m-0 h-auto max-h-[none] min-h-0 w-auto max-w-[none] min-w-0',
  'z-[calc(var(--drawer-positioner-z-index)+(var(--layer-index,0)*var(--drawer-level-ratio)))]',
);
const BACKDROP_CLASSES = cn(
  'fixed inset-0 bg-component-dialog-overlay backdrop-blur-xs',
  'z-[calc(var(--drawer-overlay-z-index)+(var(--layer-index,0)*var(--drawer-level-ratio)))]',
);
const HOST_CLASSES = 'contents';

const noop = () => {
  // static store: nothing to unsubscribe
};
const subscribeNoop = () => noop;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const createHost = (): HTMLDivElement | null => {
  if (typeof document === 'undefined') return null;
  const host = document.createElement('div');
  host.className = HOST_CLASSES;
  return host;
};

/**
 * Frame shell shared by CodeSnippetRoot and CodeEditorRoot.
 *
 * The root `<div>` (with every consumer prop, `className` and `ref`) is always
 * rendered through `createPortal` into one persistent host element. Entering or
 * leaving fullscreen only moves that host between an inline placeholder and
 * `document.body`, so the subtree is never remounted (child state, focus
 * targets, editor instances survive). Fullscreen classes are merged into the
 * consumer `className`, not substituted.
 *
 * SSR: on the server (and during the hydration pass) the root renders inline
 * inside the placeholder; the client switches to the portal right after
 * hydration (a one-time remount at mount, never on fullscreen toggle).
 */
export const CodeSnippetFrame: FC<CodeSnippetFrameProps> = ({
  ref,
  isFullscreen,
  setIsFullscreen,
  className,
  children,
  ...props
}) => {
  const backdropTestId = useTestId('backdrop');
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [host] = useState(createHost);
  const canPortal = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);
  const portalReady = canPortal && host !== null;

  // Detach the host when the frame unmounts (separate effect so fullscreen
  // toggles never remove the host before moving it).
  useLayoutEffect(() => {
    if (!host) return;
    return () => host.remove();
  }, [host]);

  // Move the host between the inline placeholder and document.body.
  useLayoutEffect(() => {
    if (!portalReady || !host) return;
    const target = isFullscreen ? document.body : placeholderRef.current;
    if (!target || host.parentNode === target) return;
    const active = document.activeElement;
    const refocus = active instanceof HTMLElement && host.contains(active) ? active : null;
    target.appendChild(host);
    if (refocus && !refocus.isSameNode(document.activeElement)) {
      refocus.focus({ preventScroll: true });
    }
  }, [portalReady, host, isFullscreen]);

  // While fullscreen the host (backdrop + frame) sits on document.body, outside any open
  // modal drawer/dialog. Registering it as a nested zag dismissable layer makes the parent
  // treat it as its child: the host gets `pointer-events: auto` despite the parent's
  // `pointer-events: none` on <body>, a pointerdown here is not "outside" the parent, the
  // parent ignores Escape (it is no longer the top-most layer), and `--layer-index` lifts the
  // z-index above the parent. Outside interactions never exit (the backdrop's onClick does).
  // Focus is trapped in the frame while fullscreen (the backdrop covers everything else).
  useEffect(() => {
    if (!isFullscreen || !host) return;
    // No `onDismiss` on purpose: zag would then exit on Escape in its document capture phase,
    // before inner handlers (editor autocomplete/search) can claim the key. Escape stays with
    // the bubble listener below.
    const options = {
      onRequestDismiss: event => {
        // The parent layer closed: leave fullscreen instead of zag calling a missing onDismiss.
        event.preventDefault();
        setIsFullscreen(false);
      },
    } satisfies Omit<DismissableElementOptions, 'onDismiss'>;
    const untrack = trackDismissableElement(host, options as DismissableElementOptions);
    // A modal parent's focus trap would pull Tab back into the parent. Trapping focus in the
    // frame pauses that trap (zag keeps one trap stack) and resumes it on exit, returning
    // focus to the element focused on entry (the fullscreen button).
    const untrap = trapFocus(host);
    return () => {
      untrap();
      untrack();
    };
  }, [isFullscreen, host, setIsFullscreen]);

  // Escape exits fullscreen unless something inside already handled the key.
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) setIsFullscreen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, setIsFullscreen]);

  const frame = (
    <>
      {isFullscreen ? (
        <div
          aria-hidden='true'
          data-testid={backdropTestId}
          className={BACKDROP_CLASSES}
          onClick={() => setIsFullscreen(false)}
        />
      ) : null}
      <div {...props} ref={ref} className={cn(className, isFullscreen && FULLSCREEN_CLASSES)}>
        {children}
      </div>
    </>
  );

  return (
    <div ref={placeholderRef} data-slot='code-snippet-frame' className={HOST_CLASSES}>
      {portalReady && host ? createPortal(frame, host) : frame}
    </div>
  );
};

CodeSnippetFrame.displayName = 'CodeSnippetFrame';

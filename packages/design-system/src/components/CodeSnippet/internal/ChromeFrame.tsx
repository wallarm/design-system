import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';

export interface ChromeFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  children: ReactNode;
}

const FULLSCREEN_CLASSES = 'fixed inset-16 z-50';
const BACKDROP_CLASSES = 'fixed inset-0 z-40 backdrop-blur-xs bg-component-dialog-overlay';
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
 * Chrome shell shared by CodeSnippetRoot and CodeEditorRoot.
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
export const ChromeFrame: FC<ChromeFrameProps> = ({
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

ChromeFrame.displayName = 'ChromeFrame';

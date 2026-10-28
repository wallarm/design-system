import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface AppShellAsideProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  /**
   * Shows the panel, sliding it in from the right as the canvas narrows. Closing makes it
   * `hidden` and `inert` at once while the column slides shut, after which it takes no space.
   * The panel stays painted through that slide only where `display` can transition
   * (`transition-behavior: allow-discrete`: Chromium, WebKit); in Firefox it hides at once while
   * the column still closes smoothly. Under reduced motion both directions are instant. Its
   * children stay mounted throughout, so whatever state they hold survives a close and reopen.
   */
  open: boolean;
  children?: ReactNode;
}

/**
 * A panel docked right of the content surface, in the shell's `aside` grid area. Render it
 * after `AppShellRemote`: while it is open, the remote turns into a card beside it. Keep it
 * rendered while closed, too: the slide runs between its closed and open states, so an aside
 * that mounts already open simply appears.
 *
 * It is 480px wide. To change that, set `--app-shell-aside-width` on the `AppShell` (for example
 * `className='[--app-shell-aside-width:400px]'`) rather than a width or margin class here: the
 * shell sizes its track from that variable and the panel's spacing-8 margins.
 *
 * Closing while focus is inside the panel makes it inert, which drops focus to the document, so
 * move focus first — for example back to the toggle that opened it, as the story does.
 *
 * Desktop-first: whenever an aside is composed, the shell clips horizontal overflow instead of
 * scrolling. While the panel is open the shell needs room for the rail plus the panel, so in a
 * narrower window the right end (the panel and the header's last actions) is cut off; keep a
 * min-width on the host or close the panel on narrow viewports.
 */
export const AppShellAside: FC<AppShellAsideProps> = ({
  ref,
  open,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('aside');

  return (
    <aside
      {...props}
      ref={ref}
      hidden={!open}
      inert={!open}
      data-slot='app-shell-aside'
      data-state={open ? 'open' : 'closed'}
      data-testid={testId}
      className={cn(
        // Display only while open, so the browser's own [hidden] rule hides the closed
        // region even where Tailwind preflight is not loaded.
        'mx-8 mb-8 w-(--app-shell-aside-width) flex-col overflow-auto overscroll-none rounded-12 border border-border-primary-light bg-bg-page-bg pb-4 [grid-area:aside] data-[state=open]:flex',
        // Once closed it keeps painting while the shell's track slides shut, then display:none.
        // Needs display transitions (allow-discrete): Chromium and WebKit; Firefox hides at once.
        'transition-[display] transition-discrete duration-(--app-shell-aside-duration) ease-(--app-shell-aside-ease) motion-reduce:transition-none',
        className,
      )}
    >
      {children}
    </aside>
  );
};

AppShellAside.displayName = 'AppShellAside';

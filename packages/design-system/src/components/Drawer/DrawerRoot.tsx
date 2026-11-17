import { createContext, type FC, type ReactNode, useContext, useId, useLayoutEffect } from 'react';
import {
  Dialog,
  type DialogFocusOutsideEvent,
  type DialogInteractOutsideEvent as DrawerInteractOutsideEvent,
} from '@ark-ui/react/dialog';
import { useDrawerContext } from './DrawerContext';
import { useNonModalFocusReturn } from './useNonModalFocusReturn';

type LayerDismissRequest = Parameters<NonNullable<Dialog.RootProps['onRequestDismiss']>>[0];

/**
 * Content ids of the Drawer/Dialog contents this one is rendered inside (React tree, not DOM —
 * Ark portals every content to <body>). Provided by DrawerContent, not the root: Ark's Dialog.Root
 * renders no DOM, so a sibling of the content is not a descendant of the layer.
 */
export const DrawerAncestorIdsContext = createContext<readonly string[]>([]);

/** Adds this Drawer/Dialog's content id to the ancestry seen by layers rendered inside it. */
export const DrawerAncestorIdsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { contentId } = useDrawerContext();
  const ancestorIds = useContext(DrawerAncestorIdsContext);

  return (
    <DrawerAncestorIdsContext.Provider value={[...ancestorIds, contentId]}>
      {children}
    </DrawerAncestorIdsContext.Provider>
  );
};

/** A Drawer/Dialog content still mounted for its exit animation. */
const EXITING_DIALOG_LAYER = '[data-scope="dialog"][data-part="content"][data-state="closed"]';

/**
 * Since zag-js 1.43.1 a dialog that mounts while its content node exists registers its layer
 * synchronously. When a Dialog closes in the same commit a sibling Drawer opens (Create → Continue),
 * the new drawer lands above the closing layer, and removing that layer dismisses every layer above
 * it. Only a React-ancestor Drawer/Dialog may dismiss this one; unrelated layers can't.
 */
export const keepOpenUnlessAncestorCloses =
  (ancestorIds: readonly string[]) => (event: LayerDismissRequest) => {
    const targetId = event.detail.targetLayer?.id;
    if (!targetId || !ancestorIds.includes(targetId)) event.preventDefault();
  };

/**
 * Focus can leave a modal drawer only programmatically — e.g. a Dialog closing in the same commit
 * returns focus to its page trigger. Focus landing in a nested Dialog/Drawer that is still exiting
 * (its Cancel button) is not the user leaving a non-modal drawer either.
 */
const ignoreProgrammaticFocusOutside = (modal: boolean) => (event: DialogFocusOutsideEvent) => {
  const target = event.detail.originalEvent.target;
  if (modal || (target instanceof Element && target.closest(EXITING_DIALOG_LAYER))) {
    event.preventDefault();
  }
};

interface DrawerRootProps {
  children: ReactNode;
  closeOnEscape: boolean;
  closeOnOutsideClick: boolean;
  modal: boolean;
  onInteractOutside?: (event: DrawerInteractOutsideEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onExitComplete?: () => void;
}

export const DrawerRoot: FC<DrawerRootProps> = ({
  children,
  closeOnEscape,
  closeOnOutsideClick,
  modal,
  onInteractOutside,
  onEscapeKeyDown,
  onExitComplete,
}) => {
  const { isOpen, onOpenChange, contentId } = useDrawerContext();
  const ancestorIds = useContext(DrawerAncestorIdsContext);
  useNonModalFocusReturn(isOpen, modal, contentId);
  const backdropId = useId();

  // The backdrop (200ms) has its own presence and outlives the content (150ms); Ark's Root
  // onExitComplete covers only the content. Report once, from whichever finishes last: the first
  // to finish still finds the other's node. zag dispatches a non-bubbling `exitcomplete` on each
  // presence node, so listen in the capture phase. A layout effect: zag can finish the backdrop in
  // the microtask right after a commit, before React runs that commit's passive effects, and the
  // listener must already call the latest onExitComplete.
  useLayoutEffect(() => {
    if (!onExitComplete) return;
    const handleBackdropExitComplete = (event: Event) => {
      const { target } = event;
      if (
        target instanceof Element &&
        target.id === backdropId &&
        !document.getElementById(contentId)
      ) {
        onExitComplete();
      }
    };
    document.addEventListener('exitcomplete', handleBackdropExitComplete, true);
    return () => document.removeEventListener('exitcomplete', handleBackdropExitComplete, true);
  }, [onExitComplete, backdropId, contentId]);

  const handleContentExitComplete = () => {
    if (!document.getElementById(backdropId)) onExitComplete?.();
  };

  const handleOpenChange = ({ open }: Dialog.OpenChangeDetails) => {
    onOpenChange(open);
  };

  return (
    <Dialog.Root
      ids={{ content: contentId, backdrop: backdropId }}
      open={isOpen}
      onOpenChange={handleOpenChange}
      closeOnEscape={closeOnEscape}
      closeOnInteractOutside={closeOnOutsideClick}
      modal={modal}
      onRequestDismiss={keepOpenUnlessAncestorCloses(ancestorIds)}
      onFocusOutside={ignoreProgrammaticFocusOutside(modal)}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
      onExitComplete={handleContentExitComplete}
      lazyMount
      unmountOnExit
    >
      {children}
    </Dialog.Root>
  );
};

DrawerRoot.displayName = 'DrawerRoot';

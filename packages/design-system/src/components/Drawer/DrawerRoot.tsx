import { createContext, type FC, type ReactNode, useContext } from 'react';
import {
  Dialog,
  type DialogFocusOutsideEvent,
  type DialogInteractOutsideEvent as DrawerInteractOutsideEvent,
} from '@ark-ui/react/dialog';
import { useDrawerContext } from './DrawerContext';

type LayerDismissRequest = Parameters<NonNullable<Dialog.RootProps['onRequestDismiss']>>[0];

/**
 * Content ids of the Drawer/Dialog contents this one is rendered inside (React tree, not DOM —
 * Ark portals every content to <body>). Provided by DrawerContent, not the root: Ark's Dialog.Root
 * renders no DOM, so a sibling of the content is not a descendant of the layer.
 */
export const DrawerAncestorIdsContext = createContext<readonly string[]>([]);

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
}

export const DrawerRoot: FC<DrawerRootProps> = ({
  children,
  closeOnEscape,
  closeOnOutsideClick,
  modal,
  onInteractOutside,
  onEscapeKeyDown,
}) => {
  const { isOpen, onOpenChange, contentId } = useDrawerContext();
  const ancestorIds = useContext(DrawerAncestorIdsContext);

  const handleOpenChange = ({ open }: Dialog.OpenChangeDetails) => {
    onOpenChange(open);
  };

  return (
    <Dialog.Root
      ids={{ content: contentId }}
      open={isOpen}
      onOpenChange={handleOpenChange}
      closeOnEscape={closeOnEscape}
      closeOnInteractOutside={closeOnOutsideClick}
      modal={modal}
      onRequestDismiss={keepOpenUnlessAncestorCloses(ancestorIds)}
      onFocusOutside={ignoreProgrammaticFocusOutside(modal)}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
      lazyMount
      unmountOnExit
    >
      {children}
    </Dialog.Root>
  );
};

DrawerRoot.displayName = 'DrawerRoot';

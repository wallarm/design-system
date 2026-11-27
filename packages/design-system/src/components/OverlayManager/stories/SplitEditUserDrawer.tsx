import { type FC, useEffect, useState } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../../Drawer';
import { Skeleton } from '../../Skeleton';
import { defineOverlay } from '../defineOverlay';
import { lazyOverlayBody } from '../lazyOverlayBody';
import type { OverlayProps } from '../types';
import { useOverlay } from '../useOverlay';
import { ConfirmDeleteOverlay, UnsavedChangesOverlay } from './overlays';

/** The form behind a slow network: its first load takes 1.5 s, like a heavy chunk. */
const EditUserFormPart = lazyOverlayBody(async () => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const { EditUserForm } = await import('./EditUserForm');
  return EditUserForm;
});

/** Shaped like the form, footer included, so nothing moves when the form arrives. */
const EditUserFormSkeleton: FC = () => (
  <>
    <DrawerBody>
      <div className='flex flex-col gap-4'>
        <Skeleton width='40px' height='19px' rounded={4} />
        <Skeleton width='100%' height='36px' rounded={8} />
      </div>
    </DrawerBody>
    <DrawerFooter>
      <Skeleton width='108px' height='36px' rounded={8} className='mr-auto' />
      <Skeleton width='122px' height='36px' rounded={8} />
    </DrawerFooter>
  </>
);

EditUserFormSkeleton.displayName = 'EditUserFormSkeleton';

interface SplitEditUserDrawerProps extends OverlayProps {
  userName: string;
}

/**
 * Story-only light shell of the edit drawer: the root with its unsaved-changes guard, the content
 * and the header render at once, and the form below the header loads behind its skeleton.
 */
export const SplitEditUserDrawer: FC<SplitEditUserDrawerProps> = ({ userName, controller }) => {
  const unsavedChanges = useOverlay(UnsavedChangesOverlay);
  const [isDirty, setIsDirty] = useState(false);
  const [guarding, setGuarding] = useState(false);

  // Load both with the drawer: while an inner overlay's code loads nothing is on screen.
  useEffect(() => {
    ConfirmDeleteOverlay.preload();
    UnsavedChangesOverlay.preload();
  }, []);

  // The guard lives in the shell, with the root's onOpenChange; the form reports its dirty flag.
  const handleOpenChange = async (open: boolean) => {
    if (open || !isDirty) {
      controller.rootProps.onOpenChange(open);
      return;
    }
    if (guarding) return;
    setGuarding(true);
    const leave = await unsavedChanges.open();
    setGuarding(false);
    if (leave) controller.close();
  };

  return (
    <Drawer {...controller.rootProps} onOpenChange={handleOpenChange} data-testid='edit-user'>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit user</DrawerTitle>
          <DrawerDescription>{userName}</DrawerDescription>
        </DrawerHeader>
        <EditUserFormPart
          fallback={<EditUserFormSkeleton />}
          userName={userName}
          controller={controller}
          onDirtyChange={setIsDirty}
        />
      </DrawerContent>
    </Drawer>
  );
};

SplitEditUserDrawer.displayName = 'SplitEditUserDrawer';

/** Defined next to its shell, which it imports eagerly; open() and preload() start the form's load. */
export const SplitEditUserOverlay = defineOverlay(async () => {
  EditUserFormPart.preload();
  return SplitEditUserDrawer;
});

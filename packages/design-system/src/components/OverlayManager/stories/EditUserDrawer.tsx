import { type ChangeEvent, type FC, useEffect, useState } from 'react';
import { Button } from '../../Button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerFooterControls,
  DrawerHeader,
  DrawerTitle,
} from '../../Drawer';
import { Field, FieldLabel } from '../../Field';
import { Input } from '../../Input';
import type { OverlayProps } from '../types';
import { useOverlay } from '../useOverlay';
import { ConfirmDeleteOverlay, UnsavedChangesOverlay } from './overlays';

interface EditUserDrawerProps extends OverlayProps {
  userName: string;
}

/**
 * Story-only overlay that opens two more from inside: the delete confirm, and a guard that
 * stands between a dirty form and `onOpenChange(false)`. Both stack above it in the same provider.
 */
export const EditUserDrawer: FC<EditUserDrawerProps> = ({ userName, controller }) => {
  const confirmDelete = useOverlay(ConfirmDeleteOverlay);
  const unsavedChanges = useOverlay(UnsavedChangesOverlay);
  const [name, setName] = useState(userName);
  const [guarding, setGuarding] = useState(false);

  const isDirty = name !== userName;

  // Load both with the drawer: while an inner overlay's code loads nothing is on screen, so an
  // Escape would close the drawer and leave that overlay to appear on its own.
  useEffect(() => {
    ConfirmDeleteOverlay.preload();
    UnsavedChangesOverlay.preload();
  }, []);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  // One handler covers Escape, an outside click and the close X. `guarding` keeps a fast second
  // Escape from opening the guard twice.
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

  const handleDelete = async () => {
    if (await confirmDelete.open({ userName })) controller.close();
  };

  const handleSave = () => controller.close();

  return (
    <Drawer {...controller.rootProps} onOpenChange={handleOpenChange} data-testid='edit-user'>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit user</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input value={name} onChange={handleNameChange} data-testid='edit-user-name' />
          </Field>
        </DrawerBody>
        <DrawerFooter>
          <DrawerFooterControls placement='left'>
            <Button
              variant='outline'
              color='destructive'
              onClick={handleDelete}
              data-testid='edit-user-delete'
            >
              Delete user
            </Button>
          </DrawerFooterControls>
          <Button disabled={!isDirty} onClick={handleSave} data-testid='edit-user-save'>
            Save changes
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

EditUserDrawer.displayName = 'EditUserDrawer';

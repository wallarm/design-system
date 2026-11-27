import { type ChangeEvent, type FC, useState } from 'react';
import { Button } from '../../Button';
import { DrawerBody, DrawerFooter, DrawerFooterControls } from '../../Drawer';
import { Field, FieldLabel } from '../../Field';
import { Input } from '../../Input';
import type { OverlayController } from '../types';
import { useOverlay } from '../useOverlay';
import { ConfirmDeleteOverlay } from './overlays';

export interface EditUserFormProps {
  userName: string;
  controller: OverlayController;
  /** Lifts the dirty flag to the shell, whose `onOpenChange` guards the close. */
  onDirtyChange: (dirty: boolean) => void;
}

/** Story-only heavy part of the split edit drawer: its body, its footer and the form state. */
export const EditUserForm: FC<EditUserFormProps> = ({ userName, controller, onDirtyChange }) => {
  const confirmDelete = useOverlay(ConfirmDeleteOverlay);
  const [name, setName] = useState(userName);

  const isDirty = name !== userName;

  // Reported from the handler, not from an effect.
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    onDirtyChange(event.target.value !== userName);
  };

  const handleDelete = async () => {
    if (await confirmDelete.open({ userName })) controller.close();
  };

  const handleSave = () => controller.close();

  return (
    <>
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
    </>
  );
};

EditUserForm.displayName = 'EditUserForm';

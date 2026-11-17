import type { FC } from 'react';
import { Button } from '../../Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../Dialog';
import type { OverlayProps } from '../types';

/** Story-only overlay: `close(true)` means leave; Keep editing, Escape and an outside click dismiss. */
export const UnsavedChangesDialog: FC<OverlayProps<boolean>> = ({ controller }) => {
  const handleLeave = () => controller.close(true);

  return (
    <Dialog {...controller.rootProps} data-testid='unsaved-changes'>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unsaved changes</DialogTitle>
          <DialogDescription>Your changes to this user will be lost.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost' color='neutral' data-testid='unsaved-changes-keep'>
              Keep editing
            </Button>
          </DialogClose>
          <Button
            variant='ghost'
            color='neutral'
            onClick={handleLeave}
            data-testid='unsaved-changes-leave'
          >
            Leave without saving
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

UnsavedChangesDialog.displayName = 'UnsavedChangesDialog';
